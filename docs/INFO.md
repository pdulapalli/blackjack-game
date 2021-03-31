# Info


## Basic Game/Endpoints Flow

NOTE: Recommend using an HTTP Request Client GUI to assist with these.

1. Create the player by issuing `POST /participant` with the required `POST` JSON payload
fields. Make note of the player `id` from the response.
```
{
    "name": "<desired-name>",
    "role": "PLAYER",
    "money": <desired-starting-money>
}
```

2. Create the dealer by issuing `POST /participant` with the required `POST` JSON payload
fields. Make note of the dealer `id` from the response.
```
{
    "name": "<desired-name>",
    "role": "DEALER",
    "money": 0.00
}
```

3. Create a deck of cards by issuing `POST /collection/deck`. No payload is required.
Make note of the `id` for this deck from the response.

4. Initialize a game by issuing `POST /game` with the required `POST` JSON payload
fields. Internally, this will deal the cards and process the bet. Make note of
the game `id` from the response.
```
{
    "playerId": <playerId-from-previous>,
    "dealerId": <dealerId-from-previous>,
    "deckId": <deckId-from-previous>,
    "bet": <any-positive-float>
}
```

5. Depending on what happened in the previous step, one of several scenarios
is possible

    a) The player has immediately achieved Blackjack and the game is resolved (or)

    b) It is now the player's turn to perform an action

6. Have the current participant perform an action (i.e. hit or stay) by issuing
`POST /game/move` with the required `POST` JSON payload fields. Replace
`<desired-action>` with `"HIT"` or `"STAY"` as desired.
```
{
    "gameId": <gameId-from-previous>,
    "participantId": <player-or-dealer-id-from-previous>,
    "action": <desired-action>
}
```

7. Continue issuing player actions as above until the game concludes. The final
outcome should be retrievable for the game at `GET /game/:gameId` once complete.
The player money can be viewed at
`GET /participant/:participantId`.

## API

### OpenAPI

The Open API specification is auto-generated on each build of this project.
When running locally, the live version can always be located
at: http://localhost:3000/api

The latest iteration of that has been saved as [JSON here](api/open_api.json).
This can be viewed as the raw file or can be imported into a Swagger editing
and preview tool. For a quick check, [this site](https://editor.swagger.io/)
can be used to generate a live preview.

### Postman

The requests used for this service are captured in
[this Postman collection](api/blackjack_game_collection.postman_collection.json).

This collection can be [imported into Postman](https://learning.postman.com/docs/getting-started/importing-and-exporting-data/#importing-data-into-postman) to
execute locally.

