import os
from time import time

import requests
from sqlalchemy.dialects.mysql import insert

from . import db, app
from .models import Entrant, Event, Placement, Tournament


class SmashGG:
    """Class for providing easy access to the SmashGG GraphQL API
    """
    api_key = ""
    with open('api_server/api_key') as f:
        api_key = f.read()

    def __init__(self):
        self.session = requests.session()

    def update_standing(self, event_id):
        """Update the standings for an event

        Arguments:
            event_id {int} -- The ID of the event to update standings for
        """
        n_entrants = Event.query.filter(
            Event.event_id == event_id).num_entrants
        per_page = 200
        gql_query = '''
        query EventStandings($eventId: Int!, $page: Int!, $perPage: Int!) {
            event(id: $eventId) {
                name
                standings(query: {
                    perPage: $perPage,
                    page: $page
                }){
                    nodes {
                        placement
                        entrant {
                            participants {
                                playerId
                            }
                        }
                    }
                }
            }
        }
        '''
        gql_vars = '''
        {
            "eventId": %d,
            "page": %d,
            "perPage": %d
        }
        '''
        read = 0
        page = 1
        while read < n_entrants:
            r = self.session.post('https://api.smash.gg/gql/alpha',
                                  json={
                                      'query': gql_query,
                                      'variables': gql_vars %
                                      (event_id, per_page, page)
                                  },
                                  headers={"Authorization":
                                           f"Bearer {self.api_key}"})
            for standing in r.json()['event']['standings']['nodes']:
                insert_stmt = insert(Placement).values(
                    event_id=event_id,
                    player_id=standing['entrant']['participants'][0]['playerId'],
                    place=standing['placement']
                ).on_duplicate_key_update(place=standing['placement'],
                                          status='U')
                db.execute(insert_stmt)
            page += 1
            read += per_page
        db.session.commit()

    def get_new_tournaments(self):
        """Query SmashGG for new tournaments
        """
        gql_query = '''
        query FutureTournaments($now: Timestamp) {
		    tournaments(query: {
                filter: {
                    afterDate: $now,
                    isFeatured: %s
                }
            }) {
                nodes {
                    id
                    name
                    slug
                    endAt
                    images {
                        url
                    }
                }
			}
	    }
        '''
        gql_vars = '''
        {
            "now": %d
        }
        ''' % int(time())
        # Get featured tournaments
        r = self.session.post('https://api.smash.gg/gql/alpha',
                              json={'query': gql_query % 'true',
                                    'variables': gql_vars},
                              headers={"Authorization":
                                       f"Bearer {self.api_key}"})
        print(r.json())
        self._handle_tournament_query_result(r, is_featured=True)
        # Get non-featured tournaments
        r = self.session.post('https://api.smash.gg/gql/alpha',
                              json={'query': gql_query % 'false',
                                    'variables': gql_vars},
                              headers={"Authorization":
                                       f"Bearer {self.api_key}"})
        self._handle_tournament_query_result(r, is_featured=False)
        db.session.commit()

    def _handle_tournament_query_result(self, res, is_featured):
        for tournament in res.json()['data']['tournaments']['nodes']:
            image_dir = app.config['IMAGE_DIR'] + f"/tournaments/{tournament['id']}"
            if not os.path.exists(image_dir):
                os.makedirs(image_dir)
            images = tournament['images']
            icon_path = image_dir + '/icon.png'
            if not os.path.exists(icon_path):
                try:
                    icon = requests.get(images[0]['url'])
                    if icon.status_code == requests.codes.ok:
                        with open(icon_path, 'w+b') as file:
                            file.write(icon.content)
                    else:
                        icon_path = None
                except IndexError:
                    icon_path = None
            banner_path = image_dir + '/banner.png'
            if not os.path.exists(banner_path):
                try:
                    banner = requests.get(images[1]['url'])
                    if banner.status_code == requests.codes.ok:
                        with open(banner_path, 'w+b') as file:
                            file.write(banner.content)
                    else:
                        banner_path = None
                except IndexError:
                    banner_path = None
            t = Tournament(tournament_id=tournament['id'],
                           name=tournament['name'],
                           slug=tournament['slug'],
                           is_featured=is_featured,
                           ends_at=tournament['endAt'],
                           icon_path='/'.join(icon_path.split('/')[-3:]) if icon_path is not None else None,
                           banner_path='/'.join(banner_path.split('/')[-3:]) if banner_path is not None else None)
            db.session.add(t)

    def get_events_in_tournament(self, tournament_id):
        gql_query = '''
        query TournamentQuery($tournament_id: Int) {
            tournament(id: $tournament_id){
                events {
                    id
                    name
                    slug
                    numEntrants
                    startAt
                    videogameId
                }
            }
        }
        '''
        gql_vars = '''
        {
            "tournament_id": %d
        }
        ''' % tournament_id
        r = self.session.post('https://api.smash.gg/gql/alpha',
                              json={'query': gql_query, 'variables': gql_vars},
                              headers={"Authorization":
                                       f"Bearer {self.api_key}"})
        for event in r.json()['data']['tournament']['events']:
            e = Event(event['id'], event['name'], tournament_id,
                      event['slug'], event['numEntrants'],
                      event['videogame']['id'], event['startAt'])
            db.session.add(e)
        db.session.commit()

    def get_entrants_in_event(self, event_id):
        per_page = 200

        gql_query = '''
        query SeedsAtEvent($event_id: Int, $page: Int, $per_page:Int) {
            event(id: $event_id) {
                entrants(query: {
                    page: $page, 
                    perPage: $per_page
                }) {
                    nodes {
                        participants {
                            playerId
                        }
                    }
                }
            }
        }
        '''
        gql_vars = '''
        {
            "event_id" : %d,
            "per_page": %d,
            "page": %d
        }
        '''
        n_entrants = Event.query.filter(
            Event.event_id == event_id).num_entrants
        read = 0
        page = 1
        while read < n_entrants:
            r = self.session.post('https://api.smash.gg/gql/alpha',
                                  json={
                                      'query': gql_query,
                                      'variables': gql_vars %
                                      (event_id, per_page, page)
                                  },
                                  headers={"Authorization":
                                           f"Bearer {self.api_key}"})
            for entrant in r.json()['data']['event']['entrants']['nodes']:
                e = Entrant(event_id, entrant['playerId'], None)
                db.session.add(e)
            page += 1
            read += per_page
        db.session.commit()


if __name__ == "__main__":
    gg = SmashGG()
    gg.get_new_tournaments()
