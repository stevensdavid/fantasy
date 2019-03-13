from .models import User, FantasyResult
from .api import user_is_logged_in, user_schema
from flask_socketio import join_room, leave_room, send, emit
from . import socketio


@socketio.on('join', namespace='/leagues')
def join_league_room(msg):
    user_id = msg['userID']
    if not user_is_logged_in(user_id, msg['token']):
        send('Unauthorized')
        return
    league_id = msg['leagueID']
    if FantasyResult.query.filter_by(league_id=league_id,
                                     user_id=user_id).exists():
        # The user is a part of the league they are trying to join
        user = User.query.filter_by(user_id=user_id).first()
        join_room(league_id, namespace='/leagues')
        emit('joined-room', user_schema.dump(user),
             namespace='/leagues', room=league_id)


@socketio.on('leave', namespace='/leagues')
def leave_league_room(msg):
    user_id = msg['userID']
    if not user_is_logged_in(user_id, msg['token']):
        send('Unauthorized')
        return
    league_id = msg['leagueID']
    user = User.query.filter_by(user_id=user_id).first()
    leave_room(league_id)
    emit('left-room', user_schema.dump(user), emit=league_id)
