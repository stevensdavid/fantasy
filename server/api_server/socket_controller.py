from .models import User, FantasyResult
from .api import user_is_logged_in, user_schema, users_schema
from flask_socketio import join_room, leave_room, send, emit
from flask import request
from . import socketio

ROOM_MEMBERS = {}
SOCKETS = {}


@socketio.on('login', namespace='/')
def user_connected(msg):
    user_id = int(msg['userID'])
    if user_is_logged_in(user_id, msg['token']):
        SOCKETS[user_id] = request.sid


@socketio.on('disconnect', namespace='/')
def user_disconnected():
    for k, v in SOCKETS.copy().items():
        if v == request.sid:
            del SOCKETS[k]


@socketio.on('join', namespace='/leagues')
def join_league_room(msg):
    user_id = int(msg['userID'])
    league_id = int(msg['leagueID'])
    if (user_is_logged_in(user_id, msg['token']) and
        FantasyResult.query.filter_by(league_id=league_id,
                                      user_id=user_id).first()):
        # The user is a part of the league they are trying to join
        join_room(league_id, namespace='/leagues', sid=request.sid)
        if league_id not in ROOM_MEMBERS:
            ROOM_MEMBERS[league_id] = set()
        ROOM_MEMBERS[league_id].add(user_id)
        emit('connected', list(ROOM_MEMBERS[league_id]),
             namespace='/leagues', room=request.sid)
        emit('joined-room', user_id,
             namespace='/leagues', room=league_id)


@socketio.on('leave', namespace='/leagues')
def leave_league_room(msg):
    user_id = int(msg['userID'])
    if not user_is_logged_in(user_id, msg['token']):
        send('Unauthorized')
        return
    league_id = int(msg['leagueID'])
    leave_room(league_id, namespace='/leagues', sid=request.sid)
    if league_id in ROOM_MEMBERS:
        try:
            ROOM_MEMBERS[league_id].remove(user_id)
        except KeyError:
            pass
    emit('left-room', user_id,
         namespace='/leagues', room=league_id)
