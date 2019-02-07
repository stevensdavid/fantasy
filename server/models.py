from sqlalchemy import Column, Integer, String
from database import Base

class Serializeable():
    def as_dict(self):
       return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class User(Base, Serializeable):
    __tablename__ = "User"
    user_id = Column(Integer, primary_key=True)
    tag = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String)

    def __init__(self, tag, email, first_name=None, last_name=None):
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.tag = tag

    def __repr__(self):
        return f'<User {self.tag}>'
