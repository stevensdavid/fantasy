"""
Main module for the restful Flask API. 
"""
import base64
import inspect
import io
import logging
import os
import time
from datetime import date
from threading import Thread

import bcrypt
from apscheduler.schedulers.background import BackgroundScheduler
from flask import (Flask, make_response, request, safe_join, send_file,
                   send_from_directory)
from flask_restful import Api, Resource, reqparse, inputs
from flask_socketio import send, emit
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError

from . import api, app, db, socketio
from .marshmallow_schemas import (ConstantsSchema, EntrantSchema, EventSchema,
                                  FantasyDraftSchema, FantasyLeagueSchema,
                                  FantasyResultSchema, FriendsSchema,
                                  PlayerSchema, TournamentSchema, UserSchema,
                                  VideoGameSchema)
from .models import (Constants, Entrant, Event, FantasyDraft, FantasyLeague,
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
entrant_schema = EntrantSchema()

events_schema = EventSchema(many=True)
fantasy_drafts_schema = FantasyDraftSchema(many=True)
fantasy_leagues_schema = FantasyLeagueSchema(many=True)
fantasy_results_schema = FantasyResultSchema(many=True)
friends_schema = FriendsSchema(many=True)
players_schema = PlayerSchema(many=True)
tournaments_schema = TournamentSchema(many=True)
users_schema = UserSchema(many=True)
video_games_schema = VideoGameSchema(many=True)
entrants_schema = EntrantSchema(many=True)


class UsersAPI(Resource):
    def get(self, user_id=None):
        """Get users
        ---
        parameters:
            -   name: user_id
                in: path
                type: integer
                required: false
                description: A specific user to retrieve
            -   name: tag
                in: query
                type: string
                required: false
                description: A substring to search for in tags
            -   name: page
                in: query
                type: integer
                required: false
                default: 1
            -   name: perPage
                in: query
                type: integer
                required: false
                default: 20
        responses:
            200:
                description: >
                    A single user if user_id is specified or a paginated list of
                    all users
                schema:
                    import: "swagger/User.json"
        """
        if user_id:
            user = User.query.filter(User.user_id == user_id).first()
            return user_schema.jsonify(user)
        parser = make_pagination_reqparser()
        parser.add_argument('tag', str)
        args = parser.parse_args(strict=True)
        # users = User.query.all()
        users = User.query.filter(User.tag.like(f'%{args["tag"]}%')).paginate(
            page=args['page'], per_page=args['perPage']).items
        return users_schema.jsonify(users)

    def post(self):
        """Create user
        ---
        consumes:
            -   application/json
        parameters:
            -   in: body
                name: user
                description: The user to create
                schema:
                    type: object
                    required:
                        -   tag
                        -   email
                        -   pw
                    properties:
                        tag:
                            type: string
                        firstName:
                            type: string
                        lastName:
                            type: string
                        email:
                            type: string
                        pw:
                            type: string
        responses:
            200:
                description: The created user
                schema:
                    import: "swagger/User.json"
        """
        parser = reqparse.RequestParser()
        parser.add_argument('tag', type=str)
        parser.add_argument('firstName', type=str)
        parser.add_argument('lastName', type=str)
        parser.add_argument('email', type=str)
        parser.add_argument('pw', type=str)
        args = parser.parse_args(strict=False)
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(args['pw'], salt)
        user = User(tag=args['tag'],
                    first_name=args['firstName'],
                    last_name=args['lastName'],
                    email=args['email'].lower(),
                    pw=hashed,
                    salt=salt,
                    photo_path=None)
        db.session.add(user)
        db.session.commit()
        return user_schema.jsonify(user)

    def put(self, user_id):
        """Update user
        ---
        consumes:
            -   application/json
        parameters:
            -   in: path
                name: user_id
                type: integer
                required: true
            -   in: body
                name: user
                description: The user to edit
                schema:
                    type: object
                    required:
                    properties:
                        tag:
                            type: string
                        first_name:
                            type: string
                        last_name:
                            type: string
                        email:
                            type: string
                        pw:
                            type: string
        security:
            - bearerAuth: []
        responses:
            200:
                description: The updated user
                schema:
                    import: "swagger/User.json"
        """
        if not user_is_logged_in(user_id):
            return NOT_LOGGED_IN_RESPONSE
        parser = reqparse.RequestParser()
        parser.add_argument('tag', type=str)
        parser.add_argument('first_name', type=str)
        parser.add_argument('last_name', type=str)
        parser.add_argument('email', type=str)
        parser.add_argument('pw', type=str)
        user = User.query.filter(User.user_id == user_id).first()
        if user is not None:
            args = parser.parse_args(strict=True)
            for key, value in args.items():
                if value is not None:
                    setattr(user, key, value)
            # Handle passwords separately as they need rehashing
            if args['pw']:
                salt = bcrypt.gensalt()
                hashed = bcrypt.hashpw(args['pw'], salt)
                user.salt = salt
                user.pw = hashed
            db.session.commit()
            return user_schema.jsonify(user)
        return {"error": "User not found"}, 404


class PlayerAPI(Resource):
    def get(self, player_id):
        '''Get information about a player
        ---
        parameters:
            -   name: player_id
                in: path
                type: integer
                required: true
        responses:
            200:
                description: The player in question
                schema:
                    import: "swagger/Player.json"
        '''
        player = Player.query.filter_by(player_id=player_id).first()
        return player_schema.jsonify(player)


class EventsAPI(Resource):
    def get(self, event_id):
        """Get event information
        ---
        parameters:
            -   name: event_id
                in: path
                type: integer
                required: true
        responses:
            200:
                description: The event
                schema:
                    import: "swagger/Event.json"
        """
        event = Event.query.filter(Event.event_id == event_id).first()
        if event and not event.entrants:
            smashgg.get_entrants_in_event(event_id)
            event = Event.query.filter(Event.event_id == event_id).first()
        return event_schema.jsonify(event)


class TournamentsAPI(Resource):
    def get(self, tournament_id=None):
        """Get tournaments, or a specific tournament
        ---
        parameters:
            -   name: tournament_id
                in: path
                type: integer
                required: false
            -   name: name
                in: query
                type: string
                required: false
                description: >
                    Search for tournaments matching the equivalent of the regex 
                    .*{name}.*
            -   name: page
                in: query
                required: false
                type: integer
                description: The page of results to return
                default: 1
            -   name: perPage
                in: query
                required: false
                type: integer
                description: The number of items to include per page
                default: 20
        responses:
            200:
                description: >
                    A single tournament if tournament_id is specified, else a 
                    paginated list of tournaments
                schema:
                    import: "swagger/Tournament.json"
        """
        if tournament_id:
            tournament = Tournament.query.filter(
                Tournament.tournament_id == tournament_id).first()
            if tournament and not tournament.events:
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
    def get(self, user_id):
        """Get all users who a specific user considers friends
        ---
        parameters:
            -   name: user_id
                in: path
                type: integer
                required: true
            -   name: page
                in: query
                required: false
                type: integer
                description: The page of results to return
                default: 1
            -   name: perPage
                in: query
                required: false
                type: integer
                description: The number of items to include per page
                default: 20
        responses:
            200:
                description: All of the user's friends
                schema:
                    type: array
                    items:
                        type: object
                        schema:
                            import: "swagger/User.json"
        """
        parser = make_pagination_reqparser()
        parser.add_argument('tag', str)
        args = parser.parse_args(strict=True)
        friends = User.query.filter(
            Friends.query.filter(
                Friends.user_id == user_id, Friends.friend_id == User.user_id
            ).exists()
            & User.tag.like(
                f'%{args["tag"] if args["tag"] is not None else ""}%')
        ).paginate(page=args['page'], per_page=args['perPage']).items
        return users_schema.jsonify(friends)

    def post(self, user_id):
        """Make {user_id} friends with {friendId}.

        Creates asymmetrical records in the database
        ---
        consumes:
            -   application/json
        parameters:
            -   name: user_id
                in: path
                type: integer
                required: true
            -   name: friendId
                in: body
                required: true
                schema:
                    type: object
                    required:
                        -   friendId
                    properties:
                        friendId:
                            type: integer
        security:
            - bearerAuth: []
        responses:
            200:
                description: The resulting friend-pair
                schema:
                    import: "swagger/Friends.json"
        """
        if not user_is_logged_in(user_id):
            return NOT_LOGGED_IN_RESPONSE
        args = self._parse_put_delete()
        # Create symmetrical entities
        friends = Friends(user_id=user_id, friend_id=args['friendId'])
        db.session.add(friends)
        try:
            db.session.commit()
        except IntegrityError:
            # These users are already friends
            db.session.rollback()
        return friends.as_dict()

    def delete(self, user_id):
        """Delete {user_id}s friendship with {friendId}. 

        Removes asymmetrical records in the database
        ---
        consumes:
            -   application/json
        parameters:
            -   name: user_id
                in: path
                type: integer
                required: true
            -   name: friendId
                in: body
                required: true
                schema:
                    type: object
                    required:
                        -   friendId
                    properties:
                        friendId:
                            type: integer
        security:
            - bearerAuth: []
        responses:
            200:
                description: The deleted friend-pair
                schema:
                    type: object
                    properties:
                        user_id:
                            type: integer
                        friend_id:
                            type: integer
        """
        if not user_is_logged_in(user_id):
            return NOT_LOGGED_IN_RESPONSE
        args = self._parse_put_delete()
        friends = Friends.query.filter(
            Friends.user_id == user_id, Friends.friend_id == args['friendId']
        ).first()
        if not friends:
            return {'error': 'Not found'}, 404
        db.session.delete(friends)
        db.session.commit()
        schema = FriendsSchema(only=['user_id', 'friend_id'])
        return schema.jsonify(friends)

    def _parse_put_delete(self):
        parser = reqparse.RequestParser()
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
            smashgg.get_new_tournaments()
            current_version.last_event_update = date.today()
            db.session.commit()
        return {'last_event_update': current_version.last_event_update}


class FeaturedTournamentsAPI(Resource):
    def get(self):
        """Get all upcoming featured tournaments
        ---
        responses:
            200:
                description: A list of the featured tournaments
                schema:
                    type: array
                    items:
                        import: "swagger/Tournament.json"
        """
        tournaments = Tournament.query.filter(
            Tournament.is_featured & (Tournament.ends_at > time.time())).all()
        return tournaments_schema.jsonify(tournaments)


class ImagesAPI(Resource):
    def get(self, fname):
        """Get an image file
        ---
        parameters:
            -   name: fname
                in: path
                type: integer
                required: true
                description: >
                    The URI of the image. This should ideally by taken straight
                    from one of the relevant entities, such as 
                    Tournament.banner_path
        responses:
            200:
                description: The image in PNG format
                content:
                    image/png:
                        schema:
                            type: string
                            format: binary
        """
        with open(safe_join(app.config['IMAGE_DIR'], fname), 'rb') as img:
            return send_file(io.BytesIO(img.read()),
                             mimetype='image/png', as_attachment=True,
                             attachment_filename=os.path.split(fname)[1])


class DraftsAPI(Resource):
    def get(self, league_id, user_id=None):
        """Get fantasy drafts
        ---
        parameters:
            -   name: league_id
                in: path
                required: true
                type: integer
                description: The ID of the league to get drafts for
            -   name: user_id
                in: path
                required: false
                type: integer
                description: >
                    The ID of a specific user whose draft should be extracted.
                    The response will have the same schema, but every returned
                    item will belong to the same user.
        responses:
            200:
                schema:
                    type: array
                    items:
                        import: "swagger/FantasyDraft.json"
        """
        if user_id:
            draft = FantasyDraft.query.filter(
                FantasyDraft.league_id == league_id,
                FantasyDraft.user_id == user_id).all()
            return fantasy_drafts_schema.jsonify(draft)
        drafts = FantasyDraft.query.filter(
            FantasyDraft.league_id == league_id).all()
        return fantasy_drafts_schema.jsonify(drafts)

    def post(self, league_id, user_id):
        """Add a player to the user's fantasy draft
        ---
        consumes:
            -   application/json
        parameters:
            -   name: league_id
                type: integer
                in: path
                required: true
                description: The fantasy league's unique identifier
            -   name: user_id
                type: integer
                in: path
                required: true
                description: The unique ID of the user to draft the player for
            -   name: playerId
                description: The unique player ID of the player to draft
                in: body
                schema:
                    type: object
                    required:
                        -   playerId
                    properties:
                        playerId:
                            type: integer
        security:
            - bearerAuth: []
        responses:
            200:
                description: The created draft entity
                schema:
                    import: "swagger/FantasyDraft.json"
            400:
                description: Bad request
                schema:
                    properties:
                        error:
                            type: string
                            description: >
                                An error message describing what went wrong. The
                                API distinguishes between two different causes 
                                of errors: the user's draft being full and 
                                integrity errors due to the passed parameters.
        """
        if not user_is_logged_in(user_id):
            return NOT_LOGGED_IN_RESPONSE
        parser = reqparse.RequestParser()
        parser.add_argument('playerId', type=int)
        args = parser.parse_args(strict=True)
        league = FantasyLeague.query.filter(
            FantasyLeague.league_id == league_id).first()
        if league.event.start_at < time.time():
            # This event has already started
            return {
                "error": "The event has already begun, and drafting has closed."
            }, 400
        current_draft = FantasyDraft.query.filter(
            FantasyDraft.league_id == league_id, FantasyDraft.user_id == user_id
        ).all()
        if len(current_draft) < league.draft_size:
            if league.is_snake and league.turn != user_id:
                return {
                    "error": f"It is user {league.turn}'s turn to draft, not "
                    "yours"
                }, 400
            draft = FantasyDraft(league_id=league_id,
                                 user_id=user_id, player_id=args['playerId'])
            db.session.add(draft)
            try:
                db.session.commit()
            except IntegrityError:
                db.session.rollback()
                return {
                    "error": "One of the provided parameters points to a non-"
                             "existent entity."
                }, 400
            if league.is_snake:
                emit('new-draft', fantasy_draft_schema.dump(draft),
                     namespace='/leagues', room=league_id)
                users = sorted(map(lambda x: x.user, league.fantasy_results),
                               key=lambda x: x.user_id)
                first_draft = FantasyDraft.query.filter_by(
                    league_id=league_id, user_id=users[0].user_id
                ).all()
                last_draft = FantasyDraft.query.filter_by(
                    league_id=league_id, user_id=users[-1].user_id
                ).all()
                if len(first_draft) == len(last_draft):
                    league.ascending = not league.ascending
                    # Turn should repeat to form snake
                else:
                    # Turn should change
                    league.turn = users.index(user_id) + (1 if league.ascending
                                                          else - 1)
                    db.session.commit()
                emit('turn-change', {'turn': league.turn})
            return fantasy_draft_schema.jsonify(draft)
        return {
            "error": f"The user's draft is full. The draft size limit for "
            f"league {league.name} is {league.draft_size_limit}."
        }, 400

    def delete(self, league_id, user_id):
        """Remove a player from the user's fantasy draft
        ---
        consumes:
            -   application/json
        parameters:
            -   name: league_id
                type: integer
                in: path
                required: true
                description: The fantasy league's unique identifier
            -   name: user_id
                type: integer
                in: path
                required: true
                description: The unique ID of the user to remove the player for
            -   name: playerId
                description: The unique player ID of the player to remove
                in: body
                schema:
                    type: object
                    required:
                        -   playerId
                    properties:
                        playerId:
                            type: integer
        security:
            - bearerAuth: []
        responses:
            200:
                description: The removed draft entity
                schema:
                    type: object
                    properties:
                        league_id:
                            type: integer
                        user_id:
                            type: integer
                        player_id:
                            type: integer
        """
        if not user_is_logged_in(user_id):
            return NOT_LOGGED_IN_RESPONSE
        league = FantasyLeague.query.filter(
            FantasyLeague.league_id == league_id).first()
        if league.is_snake:
            return {"error": "Players cannot be deleted from snake drafts"}, 400
        if league.event.start_at < time.time():
            # This event has already started
            return {
                "error": "The event has already begun, and drafting has closed."
            }, 400
        parser = reqparse.RequestParser()
        parser.add_argument('playerId', type=int)
        args = parser.parse_args(strict=True)
        draft = FantasyDraft.query.filter(
            FantasyDraft.league_id == league_id,
            FantasyDraft.user_id == user_id,
            FantasyDraft.player_id == args['playerId']
        ).first()
        db.session.delete(draft)
        db.session.commit()
        schema = FantasyDraftSchema(only=["league_id", "player_id", "user_id"])
        return schema.jsonify(draft)


class LeagueAPI(Resource):
    def get(self, league_id=None):
        """Get fantasy leagues
        ---
        parameters:
            -   name: league_id
                in: path
                required: false
                type: integer
                description: The ID of the league to retrieve
            -   name: eventId
                in: query
                required: false
                type: integer
                description: The ID of the event to query leagues for
            -   name: page
                in: query
                required: false
                type: integer
                description: The page of results to return
                default: 1
            -   name: perPage
                in: query
                required: false
                type: integer
                description: The number of items to include per page
                default: 20
            -   name: requirePublic
                in: query
                required: false
                type: boolean
                description: Only return public fantasy leagues
                default: false
            -   name: userId
                in: query
                required: false
                type: integer
        responses:
            200:
                type: object
                properties:
                    either:
                        import: "swagger/FantasyLeague.json"
                    or:
                        type: array
                        items:
                            import: "swagger/UnNestedFantasyLeague.json"
        """
        if league_id:
            league = FantasyLeague.query.filter(
                FantasyLeague.league_id == league_id).first()
            return fantasy_league_schema.jsonify(league)
        parser = make_pagination_reqparser()
        parser.add_argument('eventId', type=int)
        parser.add_argument('userId', type=int)
        parser.add_argument('requirePublic', type=inputs.boolean)
        args = parser.parse_args(strict=True)
        allowed_privacies = [True] if args['requirePublic'] else [False, True]
        if args['eventId']:
            leagues = FantasyLeague.query.filter(
                FantasyLeague.fantasy_results.any(
                    FantasyResult.user_id == args['userId']
                ) if args['userId'] else True,
                FantasyLeague.event_id == args['eventId'],
                FantasyLeague.public.in_(allowed_privacies)
            ).paginate(page=args['page'], per_page=args['perPage']).items
        else:
            leagues = FantasyLeague.query.filter(
                FantasyLeague.public.in_(allowed_privacies),
                FantasyLeague.fantasy_results.any(
                    FantasyResult.user_id == args['userId']
                ) if args['userId'] else True
            ).paginate(page=args['page'],
                       per_page=args['perPage']).items
        schema = FantasyLeagueSchema(many=True,
                                     exclude=("fantasy_results",
                                              "fantasy_drafts"))
        return schema.jsonify(leagues)

    def delete(self, league_id):
        """Delete a fantasy league
        ---
        parameters:
            -   name: league_id
                in: path
                type: integer
                description: The ID of the league to delete
                required: true
        security:
            - bearerAuth: []
        responses:
            200:
                description: The deleted entity
                schema:
                    type: object
                    properties:
                        league_id:
                            type: integer
                        name:
                            type: string
                        public:
                            type: boolean
                        is_snake:
                            type: boolean
                        turn:
                            type: integer
                        event_id:
                            type: integer
                        owner_id:
                            type: integer
                        draft_size:
                            type: integer
        """
        league = FantasyLeague.query.filter(
            FantasyLeague.league_id == league_id).first()
        if not user_is_logged_in(league.owner_id):
            return NOT_LOGGED_IN_RESPONSE
        db.session.delete(league)
        db.session.commit()
        schema = FantasyLeagueSchema(
            exclude=["owner", "event", "fantasy_drafts", "fantasy_results"])
        return schema.jsonify(league)

    def post(self):
        """Create a new fantasy league
        ---
        consumes:
            -   application/json
        parameters:
            -   name: league
                description: The fantasy league to create
                in: body
                schema:
                    type: object
                    required:
                        -   eventId
                        -   ownerId
                        -   draftSize
                        -   public
                        -   name
                        -   isSnake
                    properties:
                        eventId:
                            type: integer
                            description: >
                                The unique identifier of the event that the 
                                league is for
                        ownerId:
                            type: integer
                            description: >
                                The unique identifier of the player that created
                                the league
                        draftSize:
                            type: integer
                            description: >
                                The number of players each user is allowed to 
                                draft
                        public:
                            type: boolean
                            description: >
                                Whether or not the league is invite-only
                        name:
                            type: string
                            description: The name of the league
                        isSnake:
                            type: boolean
        security:
            - bearerAuth: []
        responses:
            200:
                description: The created fantasy league
                schema:
                    import: "swagger/FantasyLeague.json"
        """
        parser = reqparse.RequestParser()
        parser.add_argument('eventId', type=int)
        parser.add_argument('ownerId', type=int)
        parser.add_argument('draftSize', type=int)
        parser.add_argument('public', type=inputs.boolean)
        parser.add_argument('name', type=str)
        parser.add_argument('isSnake', type=inputs.boolean)
        args = parser.parse_args(strict=True)
        if not user_is_logged_in(args['ownerId']):
            return NOT_LOGGED_IN_RESPONSE
        league = FantasyLeague(event_id=args['eventId'],
                               owner_id=args['ownerId'],
                               draft_size=args['draftSize'],
                               public=args['public'],
                               name=args['name'],
                               is_snake=args['isSnake'])
        db.session.add(league)
        db.session.commit()
        return fantasy_league_schema.jsonify(league)

    def put(self, league_id):
        """Update a fantasy league
        ---
        consumes:
            -   application/json
        parameters:
            -   name: leagueId
                in: path
                required: true
                type: integer
                description: The unique identifier of the league
            -   name: league
                description: The updated fantasy league
                in: body
                schema:
                    type: object
                    required:
                    properties:
                        draft_size:
                            type: integer
                            description: >
                                The number of players each user is allowed to 
                                draft. If the new size is smaller than the 
                                previous size, all drafts in the league will be 
                                deleted.
                        public:
                            type: boolean
                            description: >
                                Whether or not the league is invite-only
                        name:
                            type: string
                            description: The name of the league
        security:
            - bearerAuth: []
        responses:
            200:
                description: The updated fantasy league
                schema:
                    import: "swagger/FantasyLeague.json"
        """
        parser = reqparse.RequestParser()
        parser.add_argument('leagueId', type=int)
        parser.add_argument('draft_size', type=int)
        parser.add_argument('public', type=inputs.boolean)
        parser.add_argument('name', type=str)
        league = FantasyLeague.query.filter(FantasyLeague.league_id
                                            == league_id).first()
        if league is not None:
            if not user_is_logged_in(league.owner_id):
                return NOT_LOGGED_IN_RESPONSE
            args = parser.parse_args(strict=True)
            for key, value in args.items():
                if value is not None:
                    setattr(league, key, value)
            db.session.commit()
            return user_schema.jsonify(league)
        return {"error": "League not found"}, 404


class EntrantsAPI(Resource):
    def get(self, event_id):
        """Get entrants in event
        ---
        parameters:
            -   name: event_id
                in: path
                type: integer
                required: true
                description: The ID of the event
            -   name: page
                in: query
                type: integer
                required: false
                description: The page of results to get
                default: 1
            -   name: perPage
                in: query
                type: integer
                required: false
                description: The number of entrants to include on each page
                default: 20
        responses:
            200:
                description: The entrants in the event
                schema:
                    type: array
                    items:
                        import: "swagger/Entrant.json"
        """
        parser = make_pagination_reqparser()
        args = parser.parse_args()
        entrants = Entrant.query.filter(Entrant.event_id == event_id).order_by(
            Entrant.seed).paginate(page=args['page'], per_page=args['perPage']
                                   ).items
        if not entrants or entrants[0].seed is None:
            # The seeding is not yet complete. In most cases this also means
            # that signups are not yet complete, so update both using the API
            smashgg.get_entrants_in_event(event_id)
            # Rerun query
            entrants = Entrant.query.filter(
                Entrant.event_id == event_id).order_by(
                    Entrant.seed).paginate(
                        page=args['page'], per_page=args['perPage']).items
        return entrants_schema.jsonify(entrants)


class LoginAPI(Resource):
    def post(self):
        '''Verify credentials and get token
        ---
        consumes:
            application/json
        parameters:
            -   name: credentials
                in: body
                schema:
                    type: object
                    required:
                        -   email
                        -   pw
                    properties:
                        email:
                            type: string
                        pw:
                            type: string
        responses:
            200:
                schema:
                    type: object
                    properties:
                        token:
                            type: string
                            description: >
                                The resulting authentication token. This token
                                should be included in the authorization header
                                as "Authorization: bearer {token}"
                        userId:
                            type: integer
                            description: The user's unique ID
            400:
                description: Failed login
                schema:
                    properties:
                        error:
                            type: string
                            description: The error message
        '''
        parser = reqparse.RequestParser()
        parser.add_argument('email', type=str)
        parser.add_argument('pw', type=str)
        args = parser.parse_args()
        user = User.query.filter(User.email == args['email'].lower()).first()
        if not user or not bcrypt.hashpw(args['pw'], user.pw) == user.pw:
            return {'error': 'Invalid username or password'}, 400
        # User is authenticated
        return {'token':
                base64.b64encode(
                    (user.email + ':' + user.pw).encode()).decode(),
                'userId': user.user_id}, 200


class VideoGameAPI(Resource):
    def get(self, videogame_id):
        '''Get a videogame
        ---
        parameters:
            -   in: path
                name: videogame_id
                type: integer
                required: true
        responses:
            200:
                schema:
                    import: "swagger/VideoGame.json"
        '''
        game = VideoGame.query.filter(
            VideoGame.videogame_id == videogame_id).first()
        return video_game_schema.jsonify(game)


class FantasyResultAPI(Resource):
    def get(self):
        '''Get fantasy results
        ---
        parameters:
            -   in: query
                name: userId
                type: integer
                required: false
                description: >
                    Get all results for a specific user. If this parameter is
                    unfilled, the other one must have a value.
            -   in: query
                name: leagueId
                type: integer
                required: false
                description: >
                    Get all results for a specific league. If this parameter is
                    unfilled, the other one must have a value.
        responses:
            200:
                description: The fantasy results
                schema:
                    type: array
                    items:
                        import: "swagger/FantasyResult.json"
            400:
                description: >
                    Bad request, likely due to not specifying any of the query
                    parameters.
        '''
        parser = reqparse.RequestParser()
        parser.add_argument('userId', type=int)
        parser.add_argument('leagueId', type=int)
        args = parser.parse_args(strict=True)
        if not args['userId'] and not args['leagueId']:
            return {'error': 'Both userId and leagueId are unspecified'}, 400
        results = FantasyResult.query.filter(
            FantasyResult.league_id == args['leagueId']
            if args['leagueId'] else True,
            FantasyResult.user_id == args['userId']
            if args['userId'] else True
        ).all()
        return fantasy_results_schema.jsonify(results)

    def post(self):
        '''Add a user to a fantasy league
        ---
        consumes:
            application/json
        parameters:
            -   in: body
                schema:
                    type: object
                    required:
                        -   userId
                        -   leagueId
                    properties:
                        userId:
                            type: integer
                            description: The ID of the user to add
                        leagueId:
                            type: integer
                            description: The ID of the league to add the user to
        security:
            - bearerAuth: []
        responses:
            200:
                description: The user was successfully added to the league
                schema:
                    import: "swagger/FantasyResult.json"
            400:
                description: Bad request
        '''
        parser = reqparse.RequestParser()
        parser.add_argument('userId', type=int)
        parser.add_argument('leagueId', type=int)
        args = parser.parse_args(strict=True)
        league = FantasyLeague.query.filter_by(
            league_id=args['leagueId']).first()
        if not league:
            return {'error': 'League not found'}, 400
        if league.is_snake and league.fantasy_drafts:
            return {'error': 'Cannot join an in-progress snake draft'}, 400
        if ((not user_is_logged_in(league.owner_id)
             and not user_is_logged_in(args['userId']))
                or (not league.public
                    and not user_is_logged_in(league.owner_id))):
            return NOT_LOGGED_IN_RESPONSE
        # Participation is marked by presence of a FantasyResult entity
        fantasy_result = FantasyResult(user_id=args['userId'],
                                       league_id=args['leagueId'])
        db.session.add(fantasy_result)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return {'error': 'User or league not found'}, 400
        return fantasy_result_schema.jsonify(fantasy_result)

    def delete(self):
        '''Remove a user from a fantasy league
        ---
        consumes:
            application/json
        security:
            - bearerAuth: []
        parameters:
            -   in: body
                schema:
                    type: object
                    required:
                        -   userId
                        -   leagueId
                    properties:
                        userId:
                            type: integer
                            description: The ID of the user to remove
                        leagueId:
                            type: integer
                            description: >
                                The ID of the league to remove the user from
        responses:
            200:
                description: The user was successfully removed from the league
                schema:
                    type: object
                    properties:
                        user_id:
                            type: integer
                        league_id:
                            type: integer
                        score:
                            type: integer
            400:
                description: Bad request
        '''
        parser = reqparse.RequestParser()
        parser.add_argument('userId', type=int)
        parser.add_argument('leagueId', type=int)
        args = parser.parse_args(strict=True)
        league = FantasyLeague.query.filter_by(
            league_id=args['leagueId']).first()
        if not league:
            return {'error': 'League not found'}, 400
        if (not user_is_logged_in(league.owner_id)
                and not user_is_logged_in(args['userId'])):
            return NOT_LOGGED_IN_RESPONSE
        # Participation is marked by presence of a FantasyResult entity
        fantasy_result = FantasyResult.query.filter(
            FantasyResult.user_id == args['userId'],
            FantasyResult.league_id == args['leagueId']).first()
        db.session.delete(fantasy_result)
        # Remove all drafts by the user
        FantasyDraft.filter(FantasyDraft.league_id == args['leagueId'],
                            FantasyDraft.user_id == args['userId']).delete()
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return {'error': 'User or league not found'}, 400
        schema = FantasyResultSchema(only=["league_id", "user_id", "score"])
        return schema.jsonify(fantasy_result)


def user_is_logged_in(user_id, token=None):
    """Verify the authentication token in the request's headers

    :param user_id: The ID  of the user that the incoming request claims to be
    :type user_id: int
    :return: If the request passes the authentication
    :retype: bool
    """
    if token is None:
        header = request.headers.get('Authorization')
        try:
            scheme, token = header.split(' ')
        except (ValueError, AttributeError):
            return False
        if scheme.lower() != 'bearer':
            return False
    user = User.query.filter(User.user_id == user_id).first()
    try:
        email, hashed = base64.b64decode(token).decode().split(':')
    except UnicodeDecodeError:
        return False
    return email == user.email and hashed == user.pw


api.add_resource(DatabaseVersionAPI, '/event_version')
api.add_resource(UsersAPI, '/users', '/users/<int:user_id>')
api.add_resource(EventsAPI, '/events/<int:event_id>')
api.add_resource(TournamentsAPI, '/tournaments',
                 '/tournaments/<int:tournament_id>')
api.add_resource(FriendsAPI, '/friends/<int:user_id>')
api.add_resource(FeaturedTournamentsAPI, '/featured')
api.add_resource(ImagesAPI, '/images/<path:fname>')
api.add_resource(DraftsAPI, '/drafts/<int:league_id>/<int:user_id>')
api.add_resource(LeagueAPI, '/leagues/<int:league_id>', '/leagues')
api.add_resource(EntrantsAPI, '/entrants/<int:event_id>')
api.add_resource(LoginAPI, '/login')
api.add_resource(VideoGameAPI, '/videogame/<int:videogame_id>')
api.add_resource(PlayerAPI, '/players/<int:player_id>')
api.add_resource(FantasyResultAPI, '/fantasy_participants')

NOT_LOGGED_IN_RESPONSE = [{'error': 'login required'}, 401]


def make_pagination_reqparser():
    parser = reqparse.RequestParser(bundle_errors=True)
    parser.add_argument('page', type=int)
    parser.add_argument('perPage', type=int)
    return parser


@app.teardown_appcontext
def shutdown_session(exception=None):
    db.session.remove()


def routine_update():
    app.logger.info('Performing routine database update')
    smashgg.get_new_tournaments()
    constants = Constants.query.first()
    if not constants:
        constants = Constants(last_event_update=0)
        db.session.add(constants)
        db.session.commit()
        constants = Constants.query.first()
    # Get all events that start after the last update and have a league
    events_new_attendants = Event.query.filter(
        Event.start_at > constants.last_event_update,
        FantasyLeague.query.filter(
            FantasyLeague.event_id == Event.event_id).exists()
    ).all()
    for event in events_new_attendants:
        smashgg.get_entrants_in_event(event.event_id)
    # Get all events that have started, end after the last update and have a
    # league
    events_new_results = Event.query.filter(
        Event.start_at > time.time(),
        Event.tournament.has(Tournament.ends_at > constants.last_event_update),
        FantasyLeague.query.filter(
            FantasyLeague.event_id == Event.event_id).exists()
    ).all()
    for event in events_new_results:
        smashgg.update_standing(event.event_id)
    # Update the timestamp
    constants.last_event_update = time.time()
    db.session.commit()


def main():
    if ('FANTASY_PROD' in os.environ.keys()
            and os.environ['FANTASY_PROD'] == 'y'):
        scheduler = BackgroundScheduler()
        scheduler.add_job(func=routine_update,
                          trigger="interval", seconds=60*60)
        scheduler.start()
        # Run a routine update immediately
        routine_update()
        socketio.run(
            app,
            log_output=True,
            host='0.0.0.0',
            use_reloader=False,
            ssl_context=('/etc/letsencrypt/live/dstevens.se/fullchain.pem',
                         '/etc/letsencrypt/live/dstevens.se/privkey.pem')
        )
    else:
        socketio.run(app, debug=True)


if __name__ == '__main__':
    main()
