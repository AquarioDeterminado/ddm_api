const {sequelize} = require("../../conf/DB.conf");
const BASE_PATH = "/games";
const {getPlayerCurrentGame, makeNewGame, playCard} = require("./../controllers/Game.controller");


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
}

module.exports = {Games};