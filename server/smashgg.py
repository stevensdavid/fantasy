import requests
from database import db_session
from models import Event, Tournament
from time import time
import os
from io import open as iopen


class SmashGG:
    """Class for providing easy access to the SmashGG GraphQL API
    """
    api_key = ""
    with open('server/api_key') as f:
        api_key = f.read()

    def __init__(self):
        self.session = requests.session()

    def update_standing(self, event_id):
        """Update the standings for an event

        Arguments:
            event_id {int} -- The ID of the event to update standings for
        """
        pass

    def get_new_tournaments(self):
        """Query SmashGG for new tournaments
        """
        gql_query = '''
        query FutureTournaments($now: Timestamp) {
		    tournaments(query: {
                filter: {
                    afterDate: $now
                }
            }) {
                nodes {
                    id
                    name
                    slug
                    isFeatured
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
        r = self.session.post('https://api.smash.gg/gql/alpha',
                              json={'query': gql_query, 'variables': gql_vars},
                              headers={"Authorization": f"Bearer {self.api_key}"})
        for tournament in r.json()['data']['tournaments']['nodes']:
            image_dir = f"images/tournaments/{tournament['id']}"
            if not os.path.exists(image_dir):
                os.mkdir(image_dir)
            images = tournament['images']
            icon_path = image_dir + '/icon.png'
            if not os.path.exists(icon_path):
                icon = requests.get(images[0])
                if icon.status_code == requests.codes.ok:
                    with iopen(icon_path) as file:
                        file.write(icon.content)
                else:
                    banner_path = None
            banner_path = image_dir + '/banner.png'
            if not os.path.exists(banner_path):
                banner = requests.get(images[1])
                if banner.status_code == requests.codes.ok:
                    with iopen(banner_path) as file:
                        file.write(banner.content)
                else:
                    banner_path = None
            t = Tournament(tournament['id'],
                           tournament['name'], tournament['slug'],
                           tournament['isFeatured'],
                           icon_path=os.path.abspath(icon_path), 
                           banner_path=os.path.abspath(banner_path))
            db_session.add(t)
        db_session.commit()

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
                              headers={"Authorization": f"Bearer {self.api_key}"})
        for event in r['tournament']['events']:
                e = Event(event['id'], event['name'], tournament_id,
                          event['slug'], event['numEntrants'], event['videogame']['id'], event['startAt'])
                db_session.add(e)
        db_session.commit()

    def get_entrants_in_event(self, event_id):
        pass

if __name__ == "__main__":
    gg = SmashGG()
    gg.get_new_events()
