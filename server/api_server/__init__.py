from flask import Flask
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow

# Initialize endpoints and database connection
app = Flask(__name__)
api = Api(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://fantasy:dB13%bofLUM1*sNG3%%p@dstevens.se/fantasy'
db = SQLAlchemy(app)
ma = Marshmallow(app)
