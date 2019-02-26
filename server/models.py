from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, DATE, Boolean
from database import Base


class Serializeable():
    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class Constants(Base, Serializeable):
    __tablename__ = "Constants"
    last_event_update = Column(DATE, primary_key=True)

    @staticmethod
    def constructor_params():
        return {
            'last_event_update': DATE
        }

    def __init__(self, last_event_update):
        self.last_event_update = last_event_update

    def __repr__(self):
        return f'<Constants last_event_update: {self.last_event_update}>'


class User(Base, Serializeable):
    __tablename__ = "User"
    user_id = Column(Integer, primary_key=True)
    tag = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String)
    pw = Column(String)
    photo_path = Column(String)

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

    def __init__(self, tag: str, email: str, pw: str, first_name: str = None, last_name: str = None, photo_path: str = None):
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.tag = tag

    def __repr__(self):
        return f'<User {self.tag} ({self.user_id})>'


class Friends(Base, Serializeable):
    __tablename__ = "Friends"
    user_1 = Column(Integer, ForeignKey("User.user_id"), primary_key=True)
    user_2 = Column(Integer, ForeignKey("User.user_id"), primary_key=True)

    @staticmethod
    def constructor_params():
        return {
            'user_1': int,
            'user_2': int,
        }

    def __init__(self, user_1, user_2):
        self.user_1 = user_1
        self.user_2 = user_2

    def __repr__(self):
        return f'<Friends {self.user_1}, {self.user_2}>'


class Player(Base, Serializeable):
    __tablename__ = "Player"
    player_id = Column(Integer, primary_key=True)
    ranking = Column(Integer)
    tag = Column(String)

    @staticmethod
    def constructor_params():
        return {
            'player_id': int,
            'tag': str,
            'ranking': int,
        }

    def __init__(self, player_id, tag, ranking=None):
        self.player_id = player_id
        self.tag = tag
        self.ranking = ranking

    def __repr__(self):
        return f'<Player {self.tag} ({self.player_id})>'


class FantasyLeague(Base, Serializeable):
    __tablename__ = "FantasyLeague"
    league_id = Column(Integer, primary_key=True)
    name = Column(String)
    event_id = Column(Integer, ForeignKey("Event.event_id"))
    owner = Column(Integer, ForeignKey('User.user_id'))
    public = Column(Boolean)

    @staticmethod
    def constructor_params():
        return {
            'event_id': int,
            'name':str, 
            'owner':str, 
            'public': bool
        }

    def __init__(self, event_id, name, owner, public=True):
        self.event_id = event_id
        self.name = name
        self.owner = owner
        self.public = public

    def __repr__(self):
        return f'<League {self.league_id}>'


class Tournament(Base, Serializeable):
    __tablename__ = "Tournament"
    tournament_id = Column(Integer, primary_key=True)
    name = Column(String)
    slug = Column(String)
    icon_path = Column(String)
    banner_path = Column(String)

    @staticmethod
    def constructor_params():
        return {
            'tournament_id': int,
            'name': str,
            'slug': str,
            'icon_path': str,
            'banner_path': str
        }

    def __init__(self, tournament_id, name, slug, icon_path, banner_path):
        self.tournament_id = tournament_id
        self.name = name
        self.slug = slug
        self.icon_path = icon_path
        self.banner_path = banner_path

    def __repr__(self):
        return f'<Tournament {self.tournament_id}>'


class Event(Base, Serializeable):
    __tablename__ = "Event"
    event_id = Column(Integer, primary_key=True)
    tournament_id = Column(Integer, ForeignKey("Tournament.tournament_id"))
    name = Column(String)
    slug = Column(String)
    num_entrants = Column(Integer)
    start_at = Column(Integer)
    videogame_id = Column(Integer, ForeignKey("VideoGame.videogame_id"))

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

    def __init__(self, event_id, name, tournament_id, slug, num_entrants, videogame_id, start_at=None):
        self.event_id = event_id
        self.name = name
        self.slug = slug
        self.tournament_id = tournament_id
        self.num_entrants = num_entrants
        self.videogame_id = videogame_id
        self.start_at = start_at

    def __repr__(self):
        return f'<Event {self.name} ({self.event_id})>'


class VideoGame(Base, Serializeable):
    __tablename__ = "VideoGame"
    videogame_id = Column(Integer, primary_key=True)
    name = Column(String)
    display_name = Column(String)
    photo_path = Column(String)

    @staticmethod
    def constructor_params():
        return {
            'videogame_id': int,
            'name': str,
            'display_name': str,
            'photo_path': str
        }

    def __init__(self, videogame_id, name, display_name, photo_path):
        self.videogame_id = videogame_id
        self.name = name
        self.display_name = display_name
        self.photo_path = photo_path

    def __repr__(self):
        return f'<VideoGame {self.videogame_id}>'


class Entrant(Base, Serializeable):
    __tablename__ = "Entrant"
    event_id = Column(Integer, ForeignKey("Event.event_id"), primary_key=True)
    player_id = Column(Integer, ForeignKey(
        "Player.player_id"), primary_key=True)
    seed = Column(Integer)

    @staticmethod
    def constructor_params():
        return {
            'event_id': int,
            'player_id': int,
            'seed': int,
        }

    def __init__(self, event_id, player_id, seed):
        self.event_id = event_id
        self.player_id = player_id
        self.seed = seed

    def __repr__(self):
        return f'<Entrant player {self.player_id} event {self.event_id}>'


class FantasyDraft(Base, Serializeable):
    __tablename__ = "FantasyDraft"
    league_id = Column(Integer, ForeignKey(
        "League.league_id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("User.user_id"), primary_key=True)
    player_id = Column(Integer, ForeignKey(
        "Player.player_id"), primary_key=True)

    @staticmethod
    def constructor_params():
        return {
            'league_id': int,
            'user_id': int,
            'player_id': int,
        }

    def __init__(self, league_id, user_id, player_id):
        self.league_id = league_id
        self.user_id = user_id
        self.player_id = player_id

    def __repr__(self):
        return f'<FantasyDraft league {self.league_id} user {self.user_id} player {self.player_id}>'


class Placement(Base, Serializeable):
    __tablename__ = "Placement"
    event_id = Column(Integer, ForeignKey("Event.event_id"), primary_key=True)
    player_id = Column(Integer, ForeignKey(
        "Player.player_id"), primary_key=True)
    place = Column(Integer)

    @staticmethod
    def constructor_params():
        return {
            'event_id': int,
            'player_id': int,
            'place': int,
        }

    def __init__(self, event_id, player_id, place=None):
        self.event_id = event_id
        self.player_id = player_id
        self.place = place

    def __repr__(self):
        return f'<Placement event {self.event_id} player {self.player_id}>'


class FantasyResult(Base, Serializeable):
    __tablename__ = "FantasyResult"
    league_id = Column(Integer, ForeignKey(
        "League.league_id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("User.user_id"), primary_key=True)
    score = Column(Integer)

    @staticmethod
    def constructor_params():
        return {
            'league_id': int,
            'user_id': int,
            'score': int,
        }

    def __init__(self, league_id, user_id, score):
        self.league_id = league_id
        self.user_id = user_id
        self.score = score

    def __repr__(self):
        return f'<FantasyResult league {self.league_id} user {self.user_id}>'
