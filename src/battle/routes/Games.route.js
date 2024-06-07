const {sequelize} = require("../../conf/DB.conf");
const BASE_PATH = "/games";
const {getGameInfo, makeNewGame, playCard} = require("./../controllers/Game.controller");


const Games = (app) => {

    /**
     *
     **/
    app.post(`${BASE_PATH}/currentgame/`, (req, res) => {
        const {authKey} = req.body;

        const response = getPlayerCurrentGame(authkey);

        res.status(response.status).json(response.data)
    });

    app.post(`${BASE_PATH}/makegame/`, (req, res) => {
        const {playerId, eventId} = req.body;

        const response = makeNewGame(playerId, eventId);

        res.status(response.status).json(response.data)
    });

    app.post(`${BASE_PATH}/play/`, (req, res) => {
        const {round, gameId, playerId, cardId} = req.body;

        const response = playCard(round, gameId, playerId, cardId);

        res.status(response.status).json(response.data)
    });

    app.ws(`${BASE_PATH}/start/`, (ws, req) => {

        ws.on('message', async (msg) => {
            const {action, info} = JSON.parse(msg);
            let response = {};

            switch (action) {
                case "startGame":
                    response = await makeNewGame(info.playerId, info.eventId);

                    ws.send(JSON.stringify(response));
                    break;
                case "play":
                    response = await playCard(info.round, info.gameId, info.playerId, info.cardId);

                    ws.send(JSON.stringify(response));
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