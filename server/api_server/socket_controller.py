from .models import User, FantasyResult
from .api import user_is_logged_in, user_schema, users_schema
from flask_socketio import join_room, leave_room, send, emit
from flask import request
from . import socketio

ROOM_MEMBERS = {}


@socketio.on('join', namespace='/leagues')
def join_league_room(msg):
    user_id = msg['userID']
    league_id = msg['leagueID']
    if (user_is_logged_in(user_id, msg['token']) and 
        FantasyResult.query.filter_by(league_id=league_id,
                                      user_id=user_id).first()):
        # The user is a part of the league they are trying to join
        user = User.query.filter_by(user_id=user_id).first()
        join_room(league_id, namespace='/leagues')
        if not league_id in ROOM_MEMBERS:
            ROOM_MEMBERS[league_id] = set()
        ROOM_MEMBERS[league_id].add(user)
        emit('connected', users_schema.dump(ROOM_MEMBERS[league_id]), 
             namespace='/leagues', room=request.sid)
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
    if league_id in ROOM_MEMBERS:
        try:
            ROOM_MEMBERS[league_id].remove(user)
        except KeyError:
            pass
    emit('left-room', user_schema.dump(user),
         namespace='/leagues', emit=league_id)
