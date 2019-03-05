import os
from time import time

import requests
from sqlalchemy.dialects.mysql import insert
from sqlalchemy.exc import IntegrityError

from . import db, app
from .models import Entrant, Event, Placement, Tournament, VideoGame, Player


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
                    player_id=standing['entrant']['participants'][0]
                                      ['playerId'],
                    place=standing['placement']
                ).on_duplicate_key_update(place=standing['placement'],
                                          status='U')
                db.execute(insert_stmt)
            page += 1
            read += per_page
        db.session.commit()

    def get_videogames(self):
        # Sadly, the Smash.GG GraphQL API does not currently support querying
        # videogames, so we have # to fallback to their REST API
        res = self.session.get('https://api.smash.gg/videogames')
        for game in res.json()['entities']['videogame']:
            if db.session.query(VideoGame).filter(
                    VideoGame.videogame_id == game["id"]).first():
                # This game is already in the database
                continue
            print(f'Getting data for {game["name"]}')
            # Download the corresponding image
            image_dir = app.config['IMAGE_DIR'] + \
                f"/videogames/{game['id']}"
            if not os.path.exists(image_dir):
                os.makedirs(image_dir)
            image_path = image_dir + '/image.png'
            if not os.path.exists(image_path):
                try:
                    image = requests.get(game['images'][0]['url'])
                    if image.status_code == requests.codes.ok:
                        with open(image_path, 'w+b') as file:
                            file.write(image.content)
                    else:
                        image_path = None
                except IndexError:
                    image_path = None
            db.session.add(VideoGame(videogame_id=game['id'],
                                     name=game['name'],
                                     display_name=game['displayName'],
                                     photo_path=(
                                         '/'.join(image_path.split('/')[-3:])
                                         if image_path is not None else None
            )))
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
                sortBy: "startAt"
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
            image_dir = app.config['IMAGE_DIR'] + \
                f"/tournaments/{tournament['id']}"
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
                           icon_path='/'.join(icon_path.split('/')[-3:])
                           if icon_path is not None else None,
                           banner_path='/'.join(banner_path.split('/')[-3:])
                           if banner_path is not None else None,
                           ext_icon_url=None if len(
                               images) < 1 else images[0]['url'],
                           ext_banner_url=None if len(
                               images) < 2 else images[1]['url']
                           )
            db.session.merge(t)

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
            e = Event(event_id=event['id'],
                      name=event['name'],
                      tournament_id=tournament_id,
                      slug=event['slug'],
                      num_entrants=event['numEntrants']
                      if event['numEntrants'] is not None else 0,
                      videogame_id=event['videogameId'],
                      start_at=event['startAt'])
            db.session.merge(e)
            try:
                db.session.commit()
            except IntegrityError:
                db.session.rollback()
                # In all likelihood due to the videogame not being stored in the
                # database  
                self.get_videogames()
                db.session.merge(e)
                try:
                    db.session.commit()
                except IntegrityError:
                    # This event is for a custom game that isn't in
                    # the SmashGG videogame database. Skip it!
                    db.session.rollback()

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
                phases {
                    paginatedSeeds(query: {
                        page: $page,
                        perPage: $per_page
                    }) {
                        nodes {
                            seedNum
                            players {
                                id
                                gamerTag
                            }
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
            Event.event_id == event_id).first().num_entrants
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
            seeding = {}
            try:
                for seed in r.json()['data']['event']['phases'][0]['paginatedSeeds']['nodes']:
                    seeding[seed['players'][0]] = seed['seedNum']
            except (KeyError, IndexError):
                # The tournament hasn't been seeded
                pass
            for entrant in r.json()['data']['event']['entrants']['nodes']:
                player_id = entrant['participants'][0]['playerId']
                seed = seeding[player_id] if player_id in seeding else None
                e = Entrant(event_id=event_id, player_id=player_id, seed=seed)
                # Merge performs an UPDATE query if the row already exists
                db.session.merge(e)
                try:
                    db.session.commit()
                except IntegrityError:
                    # We haven't stored details about this player
                    db.session.rollback()
                    p = Player(player_id=player_id,
                               tag=entrant['participants'][0]['gamerTag'])
                    db.session.add(p)
                    db.session.commit()
            page += 1
            read += per_page


if __name__ == "__main__":
    gg = SmashGG()
    gg.get_new_tournaments()
