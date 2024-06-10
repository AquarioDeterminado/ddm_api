const {sequelize} = require("../../conf/DB.conf");
const {getGameInfo, makeNewGame, playCard} = require("./../controllers/Game.controller");
const {getUserIdFromAuthKey} = require("../../player/controllers/Users.controller");
const WebSocket = require("ws");

async function Battle(action, info, ws, clients) {
    let response = {};
    let userId, user, player

    switch (action) {
        case "startGame":

            userId = await getUserIdFromAuthKey(info.authKey);
            user = await sequelize.models.user.findOne({where: {id: userId}});
            player = (await user.getPlayers())[0];

            response = await makeNewGame(player.id, info.eventId);

            ws.playerId = player.id + ":" + info.eventId

            ws.send(JSON.stringify(response));

            clients.forEach(function each(client) {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({status: 200, message: "Enemy Entered Match", gameId: response.gameId, player: {id: player.id, nickname: player.nickname}}));
                }
            });

            break;

        case "play":

            userId = await getUserIdFromAuthKey(info.authKey);
            user = await sequelize.models.user.findOne({where: {id: userId}});
            player = (await user.getPlayers())[0];

            response = await playCard(info.round, info.gameId, player.id, info.cardId);

            ws.send(JSON.stringify(response));

            clients.forEach(function each(client) {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    if (response.status === 200)
                        client.send(JSON.stringify({status: 200, message: "Your Turn"}));
                    else if (response.status === 201)
                        client.send(JSON.stringify({status: 202, message: "You Lost"}));
                    else if (response.status === 202)
                        client.send(JSON.stringify({status: 201, message: "You Won"}));
                    else if (response.status - 200 >= 0 && response.status - 200 <= 100)
                        client.send(JSON.stringify(response));
                }
            });

            break;

        case "getGame":

            response = await getGameInfo(info.gameId);

            ws.send(JSON.stringify(response));
            break;
        default:
            ws.send(JSON.stringify({status: 400, message: "Action not found"}));
    }
}

module.exports = {Battle};