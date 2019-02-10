import requests
from database import db_session
from models import Event
from time import time


class SmashGG:
    """Class for providing easy access to the SmashGG GraphQL API
    """
    api_key = ""
    with open('api_key') as f:
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
        current_time = time()
        cached_events = db_session.query(Event).filter(
            Event.start_at > current_time)
        gql_query = '''
        query FutureTournaments($now: Timestamp) {
		    tournaments(query: {
                filter: {
                    afterDate: $now
                    regOpen: true
                }
            }) {
                nodes {
                    id
                    name
                    events {
                        id
                        name
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
        print(gql_query + gql_vars)
        r = self.session.post('https://api.smash.gg/gql/alpha',
                              json={'query': gql_query, 'variables': gql_vars},
                              headers={"Authorization": f"Bearer {self.api_key}"})
        print(r.status_code)
        print(r.json())

