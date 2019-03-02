from flask import Flask
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
# from flask_talisman import Talisman
import os

# Initialize endpoints and database connection
app = Flask(__name__)
api = Api(app)
# Wrap flask for SSL
# Talisman(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://fantasy:dB13%bofLUM1*sNG3%%p@dstevens.se/fantasy'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
ma = Marshmallow(app)
app.config['IMAGE_DIR'] = os.getcwd() + '/images'
