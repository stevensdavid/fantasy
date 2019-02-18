from flask import Flask
from flask_restful import Api, Resource, reqparse
import inspect
import time

from database import db_session
from models import User, Friends, Player, FantasyDraft, FantasyLeague, FantasyResult, Tournament, Event, VideoGame, FantasyDraft

app = Flask(__name__)
api = Api(app)


class Users(Resource):
    def get(self):
        users = User.query.limit(10).all()
        return {'users': [x.as_dict() for x in users]}

    def put(self):
        parser = reqparse.RequestParser()
        for arg, datatype in User.constructor_params():
            parser.add_argument(arg, type=datatype)
        args = parser.parse_args(strict=True)
        # pylint: disable=no-member
        db_session.add(User(**args))
        db_session.commit()


class Events(Resource):
    def get(self):
        events = Event.query.filter(Event.start_at > time.time()).limit(10)
        tournament_ids = [e.tournament_id for e in events]
        tournaments = Tournament.query.filter(
            Tournament.tournament_id.in_(tournament_ids)).all()
        print(tournaments)
        print(events)
        print({e.tournament_id for e in events})
        return {'tournaments': [{**t.as_dict(), 'events': [
            e.as_dict() for e in events if e.tournament_id == t.tournament_id]}
            for t in tournaments]}


api.add_resource(Users, '/users')
api.add_resource(Events, '/events')


@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()


if __name__ == '__main__':
    app.run(debug=True)
