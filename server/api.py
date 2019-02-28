from flask import Flask
from flask_restful import Api, Resource, reqparse
from sqlalchemy import or_
import inspect
import time
from datetime import date

from smashgg import SmashGG
from database import db_session
from models import User, Friends, Player, FantasyDraft, FantasyLeague, FantasyResult, Tournament, Event, VideoGame, FantasyDraft, Constants

app = Flask(__name__)
api = Api(app)
smashgg = SmashGG()

"""
API endpoints providing support for:
Söka användare +
Skapa ny användare +
Ändra lösenord
lägg till vän

Se turneringar
Se utvalda turneringar
Söka turneringar

Se alla events i turnering

Se alla vänner till användare

Se användares drafts
Se användares ligor (både ägda och deltagande)
Skapa ligor
Skapa drafts
Redigera liga
Redigera drafts
Bjud in deltagare
"""


class UsersAPI(Resource):
    def get(self):
        parser = make_pagination_reqparser()
        parser.add_argument('gamertag', str)
        args = parser.parse_args(strict=True)
        users = User.query.filter(User.tag.like(f'%{args["gamertag"]}%')).paginate(
            page=args['page'], per_page=args['perPage']).items
        return {'users': [x.as_dict() for x in users]}

    def put(self):
        parser = reqparse.RequestParser()
        for arg, datatype in User.constructor_params():
            parser.add_argument(arg, type=datatype)
        args = parser.parse_args(strict=True)
        # pylint: disable=no-member
        db_session.add(User(**args))
        db_session.commit()


class EventsAPI(Resource):
    def get(self):
        events = Event.query.filter(Event.start_at > time.time()).limit(10)
        tournament_ids = [e.tournament_id for e in events]
        tournaments = Tournament.query.filter(
            Tournament.tournament_id.in_(tournament_ids)).all()
        return {'tournaments': [{**t.as_dict(), 'events': [
            e.as_dict() for e in events if e.tournament_id == t.tournament_id]}
            for t in tournaments]}


class FriendsAPI(Resource):
    def get(self):
        parser = make_pagination_reqparser()
        parser.add_argument('id', int)
        args = parser.parse_args()
        friends = User.query.filter(Friends.query.filter(
            (Friends.user_1 == args['id'] & Friends.user_2 == User.user_id)
            | (Friends.user_2 == args['id'] & Friends.user_1 == User.user_id)
        ).exists()).paginate(page=args['page'], per_page=args['perPage']).items
        return {'friends': [x.as_dict() for x in friends]}

    def put(self):
        pass

    def delete(self):
        pass


class DatabaseVersionAPI():
    def get(self):
        current_version = Constants.query.first()
        return {'last_event_update': current_version.last_event_update}

    def put(self):
        parser = reqparse.RequestParser()
        parser.add_argument('last_event_update', type=date)
        req_date = parser.parse_args(strict=True)['last_event_update']
        current_version = Constants.query.first()
        if req_date > current_version.last_event_update:
            smashgg.get_new_events()
            current_version.last_event_update = date.today()
            db_session.commit()
        return {'last_event_update': current_version.last_event_update}


api.add_resource(DatabaseVersionAPI, '/event_version')
api.add_resource(UsersAPI, '/users')
api.add_resource(EventsAPI, '/events')
api.add_resource(FriendsAPI, '/friends')


def make_pagination_reqparser():
    parser = reqparse.RequestParser()
    parser.add_argument('page', int)
    parser.add_argument('perPage', int)
    return parser


@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()


if __name__ == '__main__':
    app.run(debug=True)
