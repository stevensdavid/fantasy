import requests
from database import db_session
from models import Event, Tournament
from time import time


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

    def get_new_events(self):
        """Query SmashGG for new events
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
                    events {
                        id
                        name
                        slug
                        numEntrants
                        startAt
                        videogame {
                            id
                        }
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
            t = Tournament(tournament['id'],
                           tournament['name'], tournament['slug'])
            db_session.add(t)
            for event in tournament['events']:
                e = Event(event['id'], event['name'], t.tournament_id,
                          event['slug'], event['numEntrants'], event['videogame']['id'], event['startAt'])
                db_session.add(e)
        db_session.commit()

if __name__ == "__main__":
    gg = SmashGG()
    gg.get_new_events()
