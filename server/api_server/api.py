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
Ändra lösenord +
lägg till vän

Se turneringar +
Se utvalda turneringar +
Söka turneringar +

Se alla events i turnering +

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
    def get(self, user_id=None):
        if user_id:
            user = User.query.filter(User.user_id == user_id).first()
            return user_schema.jsonify(user)
        else:
            parser = make_pagination_reqparser()
            parser.add_argument('tag', str)
            args = parser.parse_args(strict=True)
            print(args)
            # users = User.query.all()
            users = User.query.filter(User.tag.like(f'%{args["tag"]}%')).paginate(
                page=args['page'], per_page=args['perPage']).items
            return users_schema.jsonify(users)

    def post(self):
        parser = reqparse.RequestParser()
        for arg, datatype in User.constructor_params().items():
            parser.add_argument(arg, type=datatype)
        args = parser.parse_args(strict=True)
        user = User(**args)
        db.session.add(user)
        db.session.commit()
        return user_schema.jsonify(user)

    def put(self, user_id):
        parser = reqparse.RequestParser()
        for arg, datatype in User.constructor_params().items():
            parser.add_argument(arg, type=datatype)
        user = User.query.filter(User.user_id == user_id).first()
        if user is not None:
            args = parser.parse_args(strict=True)
            for key, value in args.items():
                if value is not None:
                    setattr(user, key, value)
            db.session.commit()
            return user_schema.jsonify(user)
        return {"error": "User not found"}, 404


class EventsAPI(Resource):
    def get(self, event_id):
        event = Event.query.filter(Event.event_id == event_id).first()
        return event_schema.jsonify(event)


class TournamentsAPI(Resource):
    def get(self, tournament_id=None):
        if tournament_id:
            tournament = Tournament.query.filter(
                Tournament.tournament_id == tournament_id).first()
            if not tournament.events:
                print(f'Getting events for tournament {tournament_id}')
                smashgg.get_events_in_tournament(tournament_id)
                # Rerun query, this time we will have events
                tournament = Tournament.query.filter(
                    Tournament.tournament_id == tournament_id).first()
            return tournament_schema.jsonify(tournament)
        parser = make_pagination_reqparser()
        parser.add_argument('name', type=str)
        args = parser.parse_args(strict=True)

        # tournaments = Tournament.query.all()
        tournaments = Tournament.query.filter(
            Tournament.name.like(
                f'%{args["name"] if args["name"] is not None else ""}%')
        ).paginate(page=args['page'], per_page=args['perPage']).items
        return tournaments_schema.jsonify(tournaments)


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
        return tournaments_schema.jsonify(tournaments)


class Images(Resource):
    def get(self, fname):
        with open(safe_join(app.config['IMAGE_DIR'], fname), 'rb') as img:
            return send_file(io.BytesIO(img.read()),
                             mimetype='image/png', as_attachment=True, attachment_filename=os.path.split(fname)[1])


api.add_resource(DatabaseVersionAPI, '/event_version')
api.add_resource(UsersAPI, '/users', '/users/<int:user_id>')
api.add_resource(EventsAPI, '/events/<int:event_id>')
api.add_resource(TournamentsAPI, '/tournaments',
                 '/tournaments/<int:tournament_id>')
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
    # app.run(debug=True, ssl_context=('localhost.crt', 'localhost.key'))


if __name__ == '__main__':
    main()
