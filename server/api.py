from flask import Flask
from flask_restful import Api, Resource, reqparse
import inspect

from database import db_session
from models import User

app = Flask(__name__)
api = Api(app)

class HelloWorld(Resource):
    def get(self):
        return {'hello': 'world'}

class Users(Resource):
    def get(self):
        users = User.query.all()
        return {'users': [x.as_dict() for x in users]}
    
    def put(self):
        parser = reqparse.RequestParser()
        for arg, datatype in User.constructor_params():
            parser.add_argument(arg, type=datatype)
        args = parser.parse_args(strict=True)
        # pylint: disable=no-member
        db_session.add(User(**args))
        db_session.commit()

api.add_resource(HelloWorld, '/')
api.add_resource(Users, '/users')

@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()

if __name__ == '__main__':
    app.run(debug=True)
