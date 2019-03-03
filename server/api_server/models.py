from datetime import date

from . import db


class Serializeable():
    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class Constants(db.Model, Serializeable):
    __tablename__ = "Constants"
    last_event_update = db.Column(db.Date, primary_key=True)

    @staticmethod
    def constructor_params():
        return {
            'last_event_update': date
        }

    def __repr__(self):
        return f'<Constants last_event_update: {self.last_event_update}>'


class User(db.Model, Serializeable):
    __tablename__ = "User"
    user_id = db.Column(db.Integer, primary_key=True)
    tag = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    email = db.Column(db.String(255), nullable=False)
    pw = db.Column(db.String(255), nullable=False)
    photo_path = db.Column(db.String(255))

    @staticmethod
    def constructor_params():
        return {
            'tag': str,
            'email': str,
            'pw': str,
            'first_name': str,
            'last_name': str,
            'photo_path': str,
        }

    def __repr__(self):
        return f'<User {self.tag} ({self.user_id})>'


class Friends(db.Model, Serializeable):
    __tablename__ = "Friends"
    user_1 = db.Column(db.Integer, db.ForeignKey(
        "User.user_id"), primary_key=True)
    user_2 = db.Column(db.Integer, db.ForeignKey(
        "User.user_id"), primary_key=True)

    @staticmethod
    def constructor_params():
        return {
            'user_1': int,
            'user_2': int,
        }

    def __repr__(self):
        return f'<Friends {self.user_1}, {self.user_2}>'


class Player(db.Model, Serializeable):
    __tablename__ = "Player"
    player_id = db.Column(db.Integer, primary_key=True)
    ranking = db.Column(db.Integer)
    tag = db.Column(db.String(255), nullable=False)

    @staticmethod
    def constructor_params():
        return {
            'player_id': int,
            'tag': str,
            'ranking': int,
        }

    def __repr__(self):
        return f'<Player {self.tag} ({self.player_id})>'


class FantasyLeague(db.Model, Serializeable):
    __tablename__ = "FantasyLeague"
    league_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(45), nullable=False)
    public = db.Column(db.Boolean, nullable=False)

    event_id = db.Column(db.Integer, db.ForeignKey(
        "Event.event_id"), nullable=False)
    event = db.relationship(
        'Event', backref=db.backref('fantasy_leagues', lazy=True))
    owner_id = db.Column(db.Integer, db.ForeignKey(
        'User.user_id'), nullable=False)
    owner = db.relationship(
        'User', backref=db.backref('fantasy_leagues', lazy=True))
    draft_size = db.Column(db.Integer, nullable=False)

    @staticmethod
    def constructor_params():
        return {
            'event_id': int,
            'name': str,
            'owner': str,
            'public': bool
        }

    def __repr__(self):
        return f'<League {self.league_id}>'


class Tournament(db.Model, Serializeable):
    __tablename__ = "Tournament"
    tournament_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    slug = db.Column(db.String(255))
    icon_path = db.Column(db.String(255))
    banner_path = db.Column(db.String(255))
    is_featured = db.Column(db.Boolean, nullable=False)
    ends_at = db.Column(db.Integer, nullable=False)

    @staticmethod
    def constructor_params():
        return {
            'tournament_id': int,
            'name': str,
            'slug': str,
            'icon_path': str,
            'banner_path': str,
            'is_featured': bool,
            'ends_at': int
        }

    def __repr__(self):
        return f'<Tournament {self.tournament_id}>'


class Event(db.Model, Serializeable):
    __tablename__ = "Event"
    event_id = db.Column(db.Integer, primary_key=True)
    tournament_id = db.Column(db.Integer, db.ForeignKey(
        "Tournament.tournament_id"), nullable=False)
    tournament = db.relationship(
        'Tournament', backref=db.backref('events', lazy=True))
    name = db.Column(db.String(255))
    slug = db.Column(db.String(255))
    num_entrants = db.Column(db.Integer, nullable=False)
    start_at = db.Column(db.Integer, nullable=False)
    videogame_id = db.Column(db.Integer, db.ForeignKey(
        "VideoGame.videogame_id"), nullable=False)
    videogame = db.relationship(
        'VideoGame', backref=db.backref('events', lazy=True))

    @staticmethod
    def constructor_params():
        return {
            'event_id': int,
            'tournament_id': int,
            'name': str,
            'slug': str,
            'num_entrants': int,
            'start_at': int,
            'videogame_id': int,
        }

    def __repr__(self):
        return f'<Event {self.name} ({self.event_id})>'


class VideoGame(db.Model, Serializeable):
    __tablename__ = "VideoGame"
    videogame_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    display_name = db.Column(db.String(255), nullable=False)
    photo_path = db.Column(db.String(255))

    @staticmethod
    def constructor_params():
        return {
            'videogame_id': int,
            'name': str,
            'display_name': str,
            'photo_path': str
        }

    def __repr__(self):
        return f'<VideoGame {self.videogame_id}>'


class Entrant(db.Model, Serializeable):
    __tablename__ = "Entrant"
    event_id = db.Column(db.Integer, db.ForeignKey(
        "Event.event_id"), primary_key=True)
    event = db.relationship('Event', backref=db.backref('entrants', lazy=True))
    player_id = db.Column(db.Integer, db.ForeignKey(
        "Player.player_id"), primary_key=True)
    player = db.relationship(
        'Player', backref=db.backref('entrants', lazy=True))
    seed = db.Column(db.Integer)

    @staticmethod
    def constructor_params():
        return {
            'event_id': int,
            'player_id': int,
            'seed': int,
        }

    def __repr__(self):
        return f'<Entrant player {self.player_id} event {self.event_id}>'


class FantasyDraft(db.Model, Serializeable):
    __tablename__ = "FantasyDraft"
    league_id = db.Column(db.Integer, db.ForeignKey(
        "FantasyLeague.league_id"), primary_key=True)
    league = db.relationship(
        'FantasyLeague', backref=db.backref('fantasy_drafts', lazy=True))
    user_id = db.Column(db.Integer, db.ForeignKey(
        "User.user_id"), primary_key=True)
    user = db.relationship(
        'User', backref=db.backref('fantasy_drafts', lazy=True))
    player_id = db.Column(db.Integer, db.ForeignKey(
        "Player.player_id"), primary_key=True)
    player = db.relationship(
        'Player', backref=db.backref('fantasy_drafts', lazy=True))

    @staticmethod
    def constructor_params():
        return {
            'league_id': int,
            'user_id': int,
            'player_id': int,
        }

    def __repr__(self):
        return f'<FantasyDraft league {self.league_id} user {self.user_id}' \
               f'player {self.player_id}>'


class Placement(db.Model, Serializeable):
    __tablename__ = "Placement"
    event_id = db.Column(db.Integer, db.ForeignKey(
        "Event.event_id"), primary_key=True)
    event = db.relationship(
        'Event', backref=db.backref('placements', lazy=True))

    player_id = db.Column(db.Integer, db.ForeignKey(
        "Player.player_id"), primary_key=True)
    player = db.relationship(
        'Player', backref=db.backref('placements', lazy=True))
    place = db.Column(db.Integer)

    @staticmethod
    def constructor_params():
        return {
            'event_id': int,
            'player_id': int,
            'place': int,
        }

    def __repr__(self):
        return f'<Placement event {self.event_id} player {self.player_id}>'


class FantasyResult(db.Model, Serializeable):
    __tablename__ = "FantasyResult"
    league_id = db.Column(db.Integer, db.ForeignKey(
        "FantasyLeague.league_id"), primary_key=True)
    league = db.relationship(
        'FantasyLeague', backref=db.backref('fantasy_results', lazy=True))
    user_id = db.Column(db.Integer, db.ForeignKey(
        "User.user_id"), primary_key=True)
    user = db.relationship('User', backref=db.backref(
        'fantasy_results', lazy=True))
    score = db.Column(db.Integer)

    @staticmethod
    def constructor_params():
        return {
            'league_id': int,
            'user_id': int,
            'score': int,
        }

    def __repr__(self):
        return f'<FantasyResult league {self.league_id} user {self.user_id}>'
