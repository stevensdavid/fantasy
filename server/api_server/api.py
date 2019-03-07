"""
Main module for the restful Flask API. 
"""
import inspect
import io
import os
import time
from datetime import date
import bcrypt
import base64

from flask import (Flask, make_response, safe_join, send_file,
                   send_from_directory, request)
from flask_restful import Api, Resource, reqparse
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError

from . import api, app, db
from .marshmallow_schemas import (ConstantsSchema, EventSchema,
                                  FantasyDraftSchema, FantasyLeagueSchema,
                                  FantasyResultSchema, FriendsSchema,
                                  PlayerSchema, TournamentSchema, UserSchema,
                                  VideoGameSchema, EntrantSchema)
from .models import (Constants, Event, FantasyDraft, FantasyLeague,
                     FantasyResult, Friends, Player, Tournament, User,
                     VideoGame, Entrant)
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

"""
API endpoints providing support for:
Söka användare +
Skapa ny användare +
Ändra lösenord +
lägg till vän +

Se turneringar +
Se utvalda turneringar +
Söka turneringar +

Se alla events i turnering +

Se alla vänner till användare +

Se användares drafts +
Se användares ligor (både ägda och deltagande) +
Skapa ligor +
Skapa drafts +
Redigera liga +
Redigera drafts +
Bjud in deltagare
"""


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
        for arg, datatype in User.constructor_params().items():
            parser.add_argument(arg, type=datatype)
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
    def get(self, user_id):
        """Get all users who are friends with a specific user
        ---
        parameters:
            -   name: user_id
                in: path
                type: integer
                required: true
        responses:
            200:
                description: All of the user's friends
                schema:
                    id: Friends
                    type: array
                    items:
                        import: "swagger/User.json"
        """
        parser = make_pagination_reqparser()
        parser.add_argument('tag', str)
        args = parser.parse_args(strict=True)
        # The Friends junction table has symmetrical entries, i.e. both
        # Friends(x,y) and Friends(y,x)
        friends = User.query.filter(
            Friends.query.filter(
                Friends.user_1 == user_id, Friends.user_2 == User.user_id
            ).exists()
            & User.tag.like(
                f'%{args["tag"] if args["tag"] is not None else ""}%')
        ).paginate(page=args['page'], per_page=args['perPage']).items
        return users_schema.jsonify(friends)

    def post(self, user_id):
        """Make {user_id} friends with {friendId}. 

        Creates symmetrical records in the database
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
        friends = Friends(user_1=user_id, user_2=args['friendId'])
        db.session.add(friends)
        db.session.add(Friends(user_1=args['friendId'], user_2=user_id))
        try:
            db.session.commit()
        except IntegrityError:
            # These users are already friends
            db.session.rollback()
        return friends.as_dict()

    def delete(self, user_id):
        """Delete {user_id}s friendship with {friendId}. 

        Removes symmetrical records in the database
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
                    import: "swagger/Friends.json"
        """
        if not user_is_logged_in(user_id):
            return NOT_LOGGED_IN_RESPONSE
        args = self._parse_put_delete()
        friends = Friends.query.filter(
            Friends.user_1 == user_id, Friends.user_2 == args['friendId']
        ).first()
        if not friends:
            return {'error': 'Not found'}, 404
        db.session.delete(friends)
        db.session.delete(Friends.query.filter(
            Friends.user_2 == user_id, Friends.user_1 == args['friendId']
        ).first())
        db.session.commit()
        return friends.as_dict()

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
        current_draft = FantasyDraft.query.filter(
            FantasyDraft.league_id == league_id, FantasyDraft.user_id == user_id
        ).all()
        if len(current_draft) < league.draft_size_limit:
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
                    import: "swagger/FantasyDraft.json"
        """
        if not user_is_logged_in(user_id):
            return NOT_LOGGED_IN_RESPONSE
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
        return fantasy_draft_schema.jsonify(draft)


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
        responses:
            200:
                description: The fantasy leagues matching the parameters
                schema:
                        import: "swagger/FantasyLeague.json"
        """
        if league_id:
            league = FantasyLeague.query.filter(
                FantasyLeague.league_id == league_id).first()
            return fantasy_league_schema.jsonify(league)
        parser = make_pagination_reqparser()
        parser.add_argument('eventId', type=int)
        args = parser.parse_args(strict=True)
        # users = User.query.filter(User.tag.like(f'%{args["tag"]}%')).paginate(
        #     page=args['page'], per_page=args['perPage']).items
        allowed_privacies = [True] if args['requirePublic'] else [False, True]
        if args['eventId']:
            leagues = FantasyLeague.query.filter(
                FantasyLeague.event_id == args['eventId'],
                FantasyLeague.public.in_(allowed_privacies)
            ).paginate(page=args['page'], per_page=args['perPage']).items
        else:
            leagues = FantasyLeague.query.filter(FantasyLeague.public.in_(
                allowed_privacies)).paginate(page=args['page'],
                                             per_page=args['perPage']).items
        return fantasy_leagues_schema.jsonify(leagues)

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
                    import: "swagger/FantasyLeague.json"
        """
        league = FantasyLeague.query.filter(
            FantasyLeague.league_id == league_id).first()
        if not user_is_logged_in(league.owner_id):
            return NOT_LOGGED_IN_RESPONSE
        db.session.delete(league)
        db.session.commit()
        return fantasy_league_schema.jsonify(league)

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
        parser.add_argument('public', type=bool)
        parser.add_argument('name', type=str)
        args = parser.parse_args(strict=True)
        if not user_is_logged_in(args['ownerId']):
            return NOT_LOGGED_IN_RESPONSE
        league = FantasyLeague(event_id=args['eventId'],
                               owner_id=args['ownerId'],
                               draft_size=args['draftSize'],
                               public=args['public'],
                               name=args['name'])
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
                        draftSize:
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
        parser.add_argument('draftSize', type=int)
        parser.add_argument('public', type=bool)
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
        entrants = Entrant.query.filter(Entrant.event_id).order_by(
            Entrant.seed).paginate(page=args['page'], per_page=args['perPage']
                                   ).items
        if not entrants or entrants[0].seed is None:
            # The seeding is not yet complete. In most cases this also means
            # that signups are not yet complete, so update both using the API
            smashgg.get_entrants_in_event(event_id)
            # Rerun query
            entrants = Entrant.query.filter(Entrant.event_id).order_by(
                Entrant.seed).paginate(page=args['page'],
                                       per_page=args['perPage']
                                       ).items
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
                base64.b64encode((user.email + ':' + user.pw).encode()).decode(),
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
        game = VideoGame.query.filter(VideoGame.videogame_id == videogame_id).first()
        return video_game_schema.jsonify(game)


def user_is_logged_in(user_id):
    """Verify the authentication token in the request's headers

    :param user_id: The ID  of the user that the incoming request claims to be
    :type user_id: int
    :return: If the request passes the authentication
    :retype: bool
    """
    header = request.headers.get('Authorization')
    try:
        scheme, token = header.split(' ')
    except ValueError:
        return False
    if scheme.lower() != 'bearer':
        return False
    user = User.query.filter(User.user_id == user_id).first()
    email, hashed = base64.b64decode(token).decode().split(':')
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
api.add_resource(LeagueAPI, '/leagues/<int:league_id>')
api.add_resource(EntrantsAPI, '/entrants/<int:event_id>')
api.add_resource(LoginAPI, '/login')
api.add_resource(VideoGameAPI, '/videogame/<int:videogame_id>')

NOT_LOGGED_IN_RESPONSE = [{'error': 'login required'}, 401]

def make_pagination_reqparser():
    parser = reqparse.RequestParser(bundle_errors=True)
    parser.add_argument('page', type=int)
    parser.add_argument('perPage', type=int)
    return parser


@app.teardown_appcontext
def shutdown_session(exception=None):
    db.session.remove()


def main():
    if 'FANTASY_PROD' in os.environ.keys() and os.environ['FANTASY_PROD'] == 'y':
	    app.run(host='0.0.0.0',
                    ssl_context=('/etc/letsencrypt/live/dstevens.se/fullchain.pem',
                                 '/etc/letsencrypt/live/dstevens.se/privkey.pem'))
    else:
         app.run(debug=True)


if __name__ == '__main__':
    main()
