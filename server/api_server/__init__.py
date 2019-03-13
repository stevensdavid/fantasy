import os
from flask import Flask
from flask_marshmallow import Marshmallow
from flask_restful import Api
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from flasgger import Swagger

# Initialize endpoints and database connection
app = Flask(__name__)
api = Api(app)
with open('database_url') as file:
    app.config['SQLALCHEMY_DATABASE_URI'] = file.readline()
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
socketio = SocketIO(app)
