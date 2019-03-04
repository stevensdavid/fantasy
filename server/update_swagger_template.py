from apispec import APISpec
from apispec.ext.marshmallow import MarshmallowPlugin
from apispec_webframeworks.flask import FlaskPlugin
from flask import Flask, jsonify
from marshmallow import Schema, fields
from api_server.marshmallow_schemas import (ConstantsSchema, EventSchema,
                                  FantasyDraftSchema, FantasyLeagueSchema,
                                  FantasyResultSchema, FriendsSchema,
                                  PlayerSchema, TournamentSchema, UserSchema,
                                  VideoGameSchema, EntrantSchema)
import json
import os

# Create an APISpec
spec = APISpec(
    title="Swagger Petstore",
    version="1.0.0",
    openapi_version="3.0.2",
    plugins=[FlaskPlugin(), MarshmallowPlugin()],
)

spec.components.schema("Constants", schema=ConstantsSchema)
spec.components.schema("Event", schema=EventSchema)
spec.components.schema("FantasyDraft", schema=FantasyDraftSchema)
spec.components.schema("FantasyLeague", schema=FantasyLeagueSchema)
spec.components.schema("FantasyResult", schema=FantasyResultSchema)
spec.components.schema("Friends", schema=FriendsSchema)
spec.components.schema("Player", schema=PlayerSchema)
spec.components.schema("Tournament", schema=TournamentSchema)
spec.components.schema("User", schema=UserSchema)
spec.components.schema("VideoGame", schema=VideoGameSchema)
spec.components.schema("Entrant", schema=EntrantSchema)

for schema in spec.to_dict()['components']['schemas'].keys():
    if not os.path.exists('swagger'):
        os.mkdir('swagger')
    with open(f'swagger/{schema}.json', 'w') as file:
        file.writelines(json.dumps(spec.to_dict()['components']['schemas'][schema], indent=2))
