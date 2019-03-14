from .models import (Constants, User, Friends, Player, Tournament, Event,
                     VideoGame, Entrant, FantasyDraft, FantasyLeague,
                     FantasyResult, Placement)
from . import app, ma


class ConstantsSchema(ma.ModelSchema):
    class Meta:
        model = Constants


class UserSchema(ma.ModelSchema):
    class Meta:
        model = User
        exclude = ('pw',)
    fantasy_drafts = ma.Nested(
        'FantasyDraftSchema',
        only=["league_id", "player_id"],
        many=True
    )
    fantasy_results = ma.Nested(
        'FantasyResultSchema',
        only=["league_id", "score"],
        many=True
    )
    fantasy_leagues = ma.Nested(
        'FantasyLeagueSchema',
        only=["league_id", "name"],
        many=True
    )
    following = ma.Nested(
        'UserSchema',
        only=["friend_id", "tag", "photo_path"],
        many=True
    )
    followers = ma.Nested(
        'UserSchema',
        only=["user_id", "tag", "photo_path"],
        many=True
    )


class FriendsSchema(ma.ModelSchema):
    class Meta:
        model = Friends
        exclude = ('user_id', 'friend_id')
    user = ma.Nested(
        UserSchema,
        only=["user_id", "tag", "photo_path"]
    )
    friend = ma.Nested(
        UserSchema,
        only=["user_id", "tag", "photo_path"]
    )


class PlayerSchema(ma.ModelSchema):
    class Meta:
        model = Player
    entrants = ma.Nested(
        'EntrantSchema',
        only=["event_id"],
        many=True
    )
    fantasy_drafts = ma.Nested(
        'FantasyDraftSchema',
        only=["league_id", "user_id"],
        many=True
    )
    placements = ma.Nested(
        'PlacementSchema',
        only=["event_id", "place"],
        many=True
    )


class FantasyDraftSchema(ma.ModelSchema):
    class Meta:
        model = FantasyDraft
    player = ma.Nested(
        PlayerSchema,
        only=["tag", "player_id", "ext_photo_url", "photo_path"]
    )
    user = ma.Nested(
        UserSchema,
        only=["user_id", "tag"]
    )


class EntrantSchema(ma.ModelSchema):
    class Meta:
        model = Entrant
    player = ma.Nested(
        PlayerSchema,
        only=['tag', 'player_id', "ext_photo_url", "photo_path"]
    )


class VideoGameSchema(ma.ModelSchema):
    class Meta:
        model = VideoGame
    events = ma.Nested(
        'EventSchema',
        only=["event_id", "name", "tournament"],
        many=True
    )


class EventSchema(ma.ModelSchema):
    class Meta:
        model = Event
    entrants = ma.Nested(
        EntrantSchema,
        only=['seed', 'player'],
        many=True
    )
    videogame = ma.Nested(
        VideoGameSchema,
        only=['name', 'ext_photo_url', 'photo_path', 'videogame_id']
    )
    # Refer by class name to avoid circular dependency
    tournament = ma.Nested(
        'TournamentSchema',
        only=["tournament_id", "name", "ext_icon_url", "ext_banner_url"]
    )
    fantasy_leagues = ma.Nested(
        'FantasyLeagueSchema',
        only=["league_id", "public"],
        many=True
    )
    placments = ma.Nested(
        'PlacementSchema',
        only=["player_id", "place"],
        many=True
    )


class TournamentSchema(ma.ModelSchema):
    class Meta:
        model = Tournament
    events = ma.Nested(
        EventSchema,
        only=['videogame', 'start_at', 'name', 'event_id'],
        many=True
    )


class FantasyLeagueSchema(ma.ModelSchema):
    class Meta:
        model = FantasyLeague
    event = ma.Nested(
        EventSchema,
        only=["tournament", "name", "event_id"]
    )
    fantasy_drafts = ma.Nested(
        FantasyDraftSchema,
        many=True,
        only=["user_id", "player"]
    )
    fantasy_results = ma.Nested(
        'FantasyResultSchema',
        only=["user", "score"],
        many=True
    )


class FantasyResultSchema(ma.ModelSchema):
    class Meta:
        model = FantasyResult
    user = ma.Nested(
        UserSchema,
        only=["user_id", "tag"]
    )


class PlacementSchema(ma.ModelSchema):
    class Meta:
        model = Placement
    player = ma.Nested(
        PlayerSchema,
        only=["player_id", "tag", "ext_photo_url", "photo_path"]
    )
