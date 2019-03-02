import inspect
import time
from datetime import date

from flask import Flask, send_from_directory, send_file,  make_response, safe_join
from flask_restful import Api, Resource, reqparse
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import or_
import os
import io

from . import api, app, db
from .marshmallow_schemas import (ConstantsSchema, EventSchema,
                                  FantasyDraftSchema, FantasyLeagueSchema,
                                  FantasyResultSchema, FriendsSchema,
                                  PlayerSchema, TournamentSchema, UserSchema,
                                  VideoGameSchema)
from .models import (Constants, Event, FantasyDraft, FantasyLeague,
                     FantasyResult, Friends, Player, Tournament, User,
                     VideoGame)
from .smashgg import SmashGG

smashgg = SmashGG()

constants_schema = ConstantsSchema()
event_schema = EventSchema()
fantasy_draft_schema = FantasyDraftSchema()
fantasy_league_schema = FantasyLeagueSchema()
fantasy_result_schema = FantasyResultSchema()
friend_schema = FriendsSchema()
player_schema = PlayerSchema()
tournament_schema = TournamentSchema()
user_schema = UserSchema()
video_game_schema = VideoGameSchema()

events_schema = EventSchema(many=True)
fantasy_drafts_schema = FantasyDraftSchema(many=True)
fantasy_leagues_schema = FantasyLeagueSchema(many=True)
fantasy_results_schema = FantasyResultSchema(many=True)
friends_schema = FriendsSchema(many=True)
players_schema = PlayerSchema(many=True)
tournaments_schema = TournamentSchema(many=True)
users_schema = UserSchema(many=True)
video_games_schema = VideoGameSchema(many=True)

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
        print(args['page'])
        users = User.query.all()
        print([x.as_dict() for x in users])
        # users = User.query.filter(User.tag.like(f'%{args["gamertag"]}%')).paginate(
        #     page=args['page'], per_page=args['perPage']).items
        return user_schema.jsonify(users)

    def post(self):
        parser = reqparse.RequestParser()
        # for arg, datatype in User.constructor_params():
        #     parser.add_argument(arg, type=datatype)
        parser.add_argument('tag', type=str)
        parser.add_argument('email', type=str)
        parser.add_argument('pw', str)
        args = parser.parse_args(strict=True)
        # pylint: disable=no-member
        db.session.add(User(**args))
        db.session.commit()


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
        # The Friends junction table has symmetrical entries, i.e. both Friends(x,y)
        # and Friends(y,x)
        friends = User.query.filter(Friends.query.filter(
            (Friends.user_1 == args['id'] & Friends.user_2 == User.user_id)
        ).exists()).paginate(page=args['page'], per_page=args['perPage']).items
        return {'friends': [x.as_dict() for x in friends]}

    def put(self):
        args = self._parse_put_delete()
        # Create symmetrical entities
        db.session.add(Friends(args['id'], args['friendId']))
        db.session.add(Friends(args['friendId'], args['id']))
        db.session.commit()
        # Return no-content.
        # TODO: consider returning new object, probably better design
        return '', 204

    def delete(self):
        args = self._parse_put_delete()
        db.session.delete(Friends(args['id'], args['friendId']))
        db.session.delete(Friends(args['friendId'], args['id']))
        db.session.commit()
        # Return no-content.
        # TODO: consider returning deleted object, probably better design
        return '', 204

    def _parse_put_delete(self):
        parser = reqparse.RequestParser()
        parser.add_argument('id', int)
        parser.add_argument('friendId', int)
        return parser.parse_args()


class DatabaseVersionAPI(Resource):
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
            db.session.commit()
        return {'last_event_update': current_version.last_event_update}


class FeaturedTournaments(Resource):
    def get(self):
        tournaments = Tournament.query.filter(
            Tournament.is_featured & (Tournament.ends_at > time.time())).all()
        print([x.as_dict() for x in tournaments])
        return tournaments_schema.jsonify(tournaments)


class Images(Resource):
    def get(self, fname):
        with open(safe_join(app.config['IMAGE_DIR'], fname), 'rb') as img:
            return send_file(io.BytesIO(img.read()),
            mimetype='image/png', as_attachment=True, attachment_filename=os.path.split(fname)[1])


api.add_resource(DatabaseVersionAPI, '/event_version')
api.add_resource(UsersAPI, '/users')
api.add_resource(EventsAPI, '/events')
api.add_resource(FriendsAPI, '/friends')
api.add_resource(FeaturedTournaments, '/featured')
api.add_resource(Images, '/images/<path:fname>')


def make_pagination_reqparser():
    parser = reqparse.RequestParser(bundle_errors=True)
    parser.add_argument('page', type=int)
    parser.add_argument('perPage', type=int)
    return parser


@app.teardown_appcontext
def shutdown_session(exception=None):
    db.session.remove()


def main():
    app.run(debug=True)


if __name__ == '__main__':
    main()
