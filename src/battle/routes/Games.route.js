const {sequelize} = require("../../conf/DB.conf");
const BASE_PATH = "/games";
const {getGameInfo, makeNewGame, playCard} = require("./../controllers/Game.controller");
const {getUserIdFromAuthKey} = require("../../player/controllers/Users.controller");
const {wss} = require("../../app");
const WebSocket = require("ws");




const Games = (app) => {

    const wss = new WebSocket.Server({ port: 8000, path: `${BASE_PATH}/start/` });

    console.log("Websocket server started");
    console.log(wss);

    wss.on('connection', function connection(ws)  {

        console.log("Connection established")

        ws.on('message', async function incoming(data) {
            const {action, info} = JSON.parse(data);
            let response = {};
            let userId, user, player

            switch (action) {
                case "startGame":

                    userId = await getUserIdFromAuthKey(info.authKey);
                    user = await sequelize.models.user.findOne({where: {id: userId}});
                    player = (await user.getPlayers())[0];

                    response = await makeNewGame(player.id, info.eventId);

                    ws.send(JSON.stringify(response));
                    break;
                case "play":

                    userId = await getUserIdFromAuthKey(info.authKey);
                    user = await sequelize.models.user.findOne({where: {id: userId}});
                    player = (await user.getPlayers())[0];


                    response = await playCard(info.round, info.gameId, player.id, info.cardId);

                    ws.send(JSON.stringify(response));

                    wss.clients.forEach(function each(client) {
                        if (client !== ws && client.readyState === WebSocket.OPEN) {
                            if (response.status === 200)
                                client.send(JSON.stringify({status: 200, message:"Your Turn"}));
                            else if (response.status === 201)
                                client.send(JSON.stringify({status: 202, message:"You Lost"}));
                            else if (response.status === 202)
                                client.send(JSON.stringify({status: 201, message:"You Won"}));
                            else if (response.status - 200  >= 0 && response.status - 200 <= 100)
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
        });
    });
}

module.exports = {Games};