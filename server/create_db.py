from api_server import db
from api_server.models import *

db.drop_all()
db.create_all()
db.session.commit()
