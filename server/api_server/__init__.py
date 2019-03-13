from flask import Flask
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flasgger import Swagger
# from flask_talisman import Talisman
import os

# Initialize endpoints and database connection
app = Flask(__name__)
api = Api(app)
# Wrap flask for SSL
# Talisman(app)
app.config['SQLALCHEMY_DATABASE_URI'] = (
    'mysql://fantasy:dB13%bofLUM1*sNG3%%p@dstevens.se/fantasy?charset=utf8mb4')
app.config['MYSQL_DATABASE_CHARSET'] = 'utf8mb4'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
ma = Marshmallow(app)
app.config['IMAGE_DIR'] = os.getcwd() + '/images'
app.config['SWAGGER'] = {
    "title": "Fantasy API",
    "description": "A RESTful API",
    "uiversion": 3
}
swagger = Swagger(app)
