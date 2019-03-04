"""
Main module for the restful Flask API. 
"""
import inspect
import io
import os
import time
from datetime import date
import bcrypt

from flask import (Flask, make_response, safe_join, send_file,
                   send_from_directory)
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
                default: null
            -   name: tag
                in: query
                type: string
                required: false
                default: ''
            -   name: page
                in: query
                type: integer
                required: false
            -   name: perPage
                in: query
                type: integer
                required: false
        responses:
            200:
                description: >
                    A single user if user_id is specified or a paginated list of
                    all users
                schema:
                    id: User
                    properties:
                        user_id:
                            type: integer
                            description: The user's unique ID
                        tag:
                            type: string
                            description: The user's gamertag
                        first_name:
                            type: string
                        last_name:
                            type: string
                        email:
                            type: string
                        photo_path:
                            type: string
                            description: >
                                The URI of the profile photo. The image itself 
                                can be retrieved using GET /images/{photo_path}
                        fantasy_drafts:
                            type: array
                            items:
                                type: integer
                                description: >
                                    The unique ID of one of the user's fantasy 
                                    drafts
                            default: []
                        fantasy_leagues:
                            type: array
                            items:
                                type: integer
                                description: >
                                    The unique ID of one of the user's fantasy 
                                    leagues
                            default: []
                        fantasy_results:
                            type: array
                            items:
                                type: integer
                                description: >
                                    The unique ID of one of the user's fantasy 
                                    results
                            default: []
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
        parameters:
            -   name: userId
                in: body
                type: integer
                required: false
                default: autogenerated
            -   name: tag
                in: body
                type: string
                required: true
                description: The user's gamertag
            -   name: firstName
                in: body
                type: string
                required: false
            -   name: lastName
                in: body
                type: string
                required: false
            -   name: email
                in: body
                type: string
                required: true
            -   name: pw
                in: body
                type: string
                required: true
        responses:
            200:
                description: The created user
                schema:
                    id: User
                    properties:
                        user_id:
                            type: integer
                            description: The user's unique ID
                        tag:
                            type: string
                            description: The user's gamertag
                        first_name:
                            type: string
                        last_name:
                            type: string
                        email:
                            type: string
                        photo_path:
                            type: string
                            description: >
                                The URI of the profile photo. The image itself 
                                can be retrieved using GET /images/{photo_path}
        """
        parser = reqparse.RequestParser()
        parser.add_argument('tag', type=str)
        parser.add_argument('firstName', type=str)
        parser.add_argument('lastName', type=str)
        parser.add_argument('email', type=str)
        parser.add_argument('pw', type=str)
        args = parser.parse_args(strict=True)
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(args['pw'], salt)
        user = User(tag=args['tag'],
                    first_name=args['firstName'],
                    last_name=args['lastName'],
                    email=args['email'],
                    pw=hashed,
                    salt=salt,
                    photo_path=None)
        db.session.add(user)
        db.session.commit()
        return user_schema.jsonify(user)

    def put(self, user_id):
        """Update user
        ---
        parameters:
            -   name: user_id
                in: body
                type: integer
                required: false
                default: autogenerated
            -   name: tag
                in: body
                type: string
                required: true
                description: The user's gamertag
            -   name: first_name
                in: body
                type: string
                required: false
            -   name: last_name
                in: body
                type: string
                required: false
            -   name: email
                in: body
                type: string
                required: true
            -   name: pw
                in: body
                type: string
                required: true
        responses:
            200:
                description: The updated user
                schema:
                    id: User
                    properties:
                        user_id:
                            type: integer
                            description: The user's unique ID
                        tag:
                            type: string
                            description: The user's gamertag
                        first_name:
                            type: string
                        last_name:
                            type: string
                        email:
                            type: string
                        photo_path:
                            type: string
                            description: >
                                The URI of the profile photo. The image itself 
                                can be retrieved using GET /images/{photo_path}
                        fantasy_drafts:
                            type: array
                            items:
                                type: integer
                                description: >
                                    The unique ID of one of the user's fantasy 
                                    drafts
                            default: []
                        fantasy_leagues:
                            type: array
                            items:
                                type: integer
                                description: >
                                    The unique ID of one of the user's fantasy 
                                    leagues
                            default: []
                        fantasy_results:
                            type: array
                            items:
                                type: integer
                                description: >
                                    The unique ID of one of the user's fantasy 
                                    results
                            default: []
        """
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
                    id: Event
                    properties:
                        entrants:
                            type: array
                            items:
                                type: integer
                                description: The entrant's unique ID
                            description: List of the entrants in the event
                        event_id:
                            type: integer
                            description: The event's unique ID
                        fantasy_leagues:
                            type: array
                            items:
                                type: integer
                                description: The fantasy league's unique ID
                            description: >
                                List of all fantasy leagues for the event
                        name:
                            type: string
                            description: >
                                The name of the tournament. This is 
                                human-readable and suitable for users
                        num_entrants:
                            type: integer
                            description: >
                                The number of entrants in the tournament
                        placements:
                            type: array
                            items:
                                type: integer
                                description: >
                                    A list of all placements in the event. Not 
                                    entirely certain if this is an integer. 
                                    TODO investigate
                        slug:
                            type: string
                            description: >
                                The Smash.GG URL for the event. Users can visit 
                                smash.gg/{slug} to see the event page.
                        start_at:
                            type: integer
                            description: The timestamp at which the event starts
                        tournament:
                            type: integer
                            description: >
                                The unique ID of the tournament that this event 
                                is part of
                        videogame:
                            type: integer
                            description: >
                                The unique ID of the video game that this event 
                                is for
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
                    id: Tournament
                    properties:
                        banner_path:
                            type: string
                            description: >
                                The URI of the banner image. The image itself 
                                can be retrieved using GET /images/{banner_path}
                        ends_at:
                            type: integer
                            description: >
                                A timestamp marking the end time of the event
                        events:
                            type: array
                            items:
                                type: integer
                                description: >
                                    The unique ID of an event in the tournament
                        icon_path:
                            type: string
                            description: >
                                The URI of the icon image. The image itself can 
                                be retrieved using GET /images/{icon_path}
                        is_featured:
                            type: boolean
                            description: >
                                Whether or not the tournament is featured by 
                                Smash.GG
                        slug:
                            type: string
                            description: >
                                The Smash.GG URL for the tournament. Users can 
                                visit smash.gg/{slug} to see the tournament 
                                page.
                        tournament_id:
                            type: integer
                            description: The unique ID for the tournament
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
                        properties:
                            user_id:
                                type: integer
                                description: The user's unique ID
                            tag:
                                type: string
                                description: The user's gamertag
                            first_name:
                                type: string
                            last_name:
                                type: string
                            email:
                                type: string
                            photo_path:
                                type: string
                                description: >
                                    The URI of the profile photo. The image 
                                    itself can be retrieved using GET 
                                    /images/{photo_path}
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
        parameters:
            -   name: user_id
                in: path
                type: integer
                required: true
            -   name: friendId
                in: body
                type: integer
                required: true
        responses:
            200:
                description: The resulting friend-pair
                schema:
                    id: Friends
                    properties:
                        user_1: 
                            type: integer
                            description: An echo of {user_id}
                        user_2:
                            type: integer
                            description: An echo of {friendId}
        """
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
        parameters:
            -   name: user_id
                in: path
                type: integer
                required: true
            -   name: friendId
                in: body
                type: integer
                required: true
        responses:
            200:
                description: The deleted friend-pair
                schema:
                    id: Friends
                    properties:
                        user_1: 
                            type: integer
                            description: An echo of {user_id}
                        user_2:
                            type: integer
                            description: An echo of {friendId}
        """
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
            smashgg.get_new_events()
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
                    id: FeaturedTournaments
                    type: array
                    items:
                        properties:
                            banner_path:
                                type: string
                                description: >
                                    The URI of the banner image. The image 
                                    itself can be retrieved using GET 
                                    /images/{banner_path}
                            ends_at:
                                type: integer
                                description: >
                                    A timestamp marking the end time of the 
                                    event
                            events:
                                type: array
                                items:
                                    type: integer
                                    description: > 
                                        The unique ID of an event in the 
                                        tournament
                            icon_path:
                                type: string
                                description: >
                                    The URI of the icon image. The image itself 
                                    can be retrieved using GET 
                                    /images/{icon_path}
                            is_featured:
                                type: boolean
                                description: >
                                    Whether or not the tournament is featured by
                                    Smash.GG
                            slug:
                                type: string
                                description: >
                                    The Smash.GG URL for the tournament. Users 
                                    can visit smash.gg/{slug} to see the 
                                    tournament page.
                            tournament_id:
                                type: integer
                                description: The unique ID for the tournament
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
                type: integer
                in: body
                required: true
                description: The unique player ID of the player to draft
        responses:
            200:
                description: The created draft entity
                schema:

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
                type: integer
                in: body
                required: true
                description: The unique player ID of the player to draft
        responses:
            200:
                description: The removed draft entity
                schema:
        """
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
        responses:
            200:
                description: The deleted entity
                schema:

        """
        league = FantasyLeague.query.filter(
            FantasyLeague.league_id == league_id).first()
        db.session.delete(league)
        db.session.commit()
        return fantasy_league_schema.jsonify(league)

    def post(self):
        """Create a new fantasy league
        ---
        parameters:
            -   name: eventId
                in: body
                required: true
                type: integer
                description: > 
                    The unique identifier of the event that the league is for
            -   name: ownerId
                in: body
                required: true
                type: integer
                description: > 
                    The unique identifier of the player that created the league
            -   name: draftSize
                in: body
                required: true
                type: integer
                description: The number of players each user is allowed to draft
            -   name: public
                in: body
                required: true
                type: boolean
                description: Whether or not the league is invite-only
            -   name: name
                in: body
                required: true
                type: string
                description: The name of the league
        responses:
            200:
                description: The created fantasy league
                schema:

        """
        parser = reqparse.RequestParser()
        parser.add_argument('eventId', type=int)
        parser.add_argument('ownerId', type=int)
        parser.add_argument('draftSize', type=int)
        parser.add_argument('public', type=bool)
        parser.add_argument('name', type=str)
        args = parser.parse_args(strict=True)
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
        parameters:
            -   name: leagueId
                in: path
                required: true
                type: integer
                description: The unique identifier of the league
            -   name: draftSize
                in: body
                required: false
                type: integer
                description: > 
                    The number of players each user is allowed to draft. 
                    If the new size is smaller than the previous size, all 
                    drafts in the league will be deleted.
            -   name: public
                in: body
                required: false
                type: boolean
                description: Whether or not the league is invite-only
            -   name: name
                in: body
                required: false
                type: string
                description: The name of the league
        responses:
            200:
                description: The updated fantasy league
                schema:

        """
        parser = reqparse.RequestParser()
        parser.add_argument('leagueId', type=int)
        parser.add_argument('draftSize', type=int)
        parser.add_argument('public', type=bool)
        parser.add_argument('name', type=str)
        league = FantasyLeague.query.filter(FantasyLeague.league_id
                                            == league_id).first()
        if league is not None:
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
            -   name: page
                type: integer
                required: false
                description: The page of results to get
                default: 1
            -   name: perPage
                type: integer
                required: false
                description: The number of entrants to include on each page
                default: 20
        responses:
            200:
                description: The entrants in the event
                schema:

        """

        parser = make_pagination_reqparser()
        args = parser.parse_args()
        entrants = Entrant.query.filter(Entrant.event_id).order_by(
            Entrant.seed).paginate(page=args['page'], per_page=args['perPage']
                                   ).items
        if not entrants or entrants[0].seed is None:
            # The seeding is not yet complete. In most cases this also means
            # that signups are not yet complete, so update both using the API
            smashgg.get_entrants_in_event()
            # Rerun query
            entrants = Entrant.query.filter(Entrant.event_id).order_by(
                Entrant.seed).paginate(page=args['page'],
                                       per_page=args['perPage']
                                       ).items
        return entrants_schema.jsonify(entrants)


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
