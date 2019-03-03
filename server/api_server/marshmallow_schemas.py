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


class FriendsSchema(ma.ModelSchema):
    class Meta:
        model = Friends


class PlayerSchema(ma.ModelSchema):
    class Meta:
        model = Player


class TournamentSchema(ma.ModelSchema):
    class Meta:
        model = Tournament


class EventSchema(ma.ModelSchema):
    class Meta:
        model = Event


class VideoGameSchema(ma.ModelSchema):
    class Meta:
        model = VideoGame


class EntrantSchema(ma.ModelSchema):
    class Meta:
        model = Entrant


class FantasyDraftSchema(ma.ModelSchema):
    class Meta:
        model = FantasyDraft


class FantasyLeagueSchema(ma.ModelSchema):
    class Meta:
        model = FantasyLeague


class FantasyResultSchema(ma.ModelSchema):
    class Meta:
        model = FantasyResult


class PlacementSchema(ma.ModelSchema):
    class Meta:
        model = Placement
