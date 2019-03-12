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
        exclude = ('pw', 'salt',)


class FriendsSchema(ma.ModelSchema):
    class Meta:
        model = Friends


class PlayerSchema(ma.ModelSchema):
    class Meta:
        model = Player


class FantasyDraftSchema(ma.ModelSchema):
    class Meta:
        model = FantasyDraft


class EntrantSchema(ma.ModelSchema):
    class Meta:
        model = Entrant
    player = ma.Nested(PlayerSchema, only=['tag', 'player_id'])


class VideoGameSchema(ma.ModelSchema):
    class Meta:
        model = VideoGame


class EventSchema(ma.ModelSchema):
    class Meta:
        model = Event
    entrants = ma.Nested(EntrantSchema, only=['seed', 'player'], many=True)
    videogame = ma.Nested(
        VideoGameSchema,
        only=['name', 'ext_photo_url', 'photo_path', 'videogame_id']
    )


class TournamentSchema(ma.ModelSchema):
    class Meta:
        model = Tournament
    events = ma.Nested(
        EventSchema, only=['videogame', 'start_at', 'name'], many=True)


class FantasyLeagueSchema(ma.ModelSchema):
    class Meta:
        model = FantasyLeague


class FantasyResultSchema(ma.ModelSchema):
    class Meta:
        model = FantasyResult


class PlacementSchema(ma.ModelSchema):
    class Meta:
        model = Placement
