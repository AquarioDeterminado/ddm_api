const {sequelize} = require("../../conf/DB.conf");
const BASE_PATH = "/games";

module.exports = (app) => {

    /**
     *
     **/
    app.post(`${BASE_PATH}/currentgame/`, (req, res) => {
        const {authKey} = req.body;

        const response = getPlayerCurrentGame(authkey);

        res.status(response.status).json(response.data)
    });

    app.post(`${BASE_PATH}/makegame/`, (req, res) => {
        const {authKey} = req.body;

        const response = makeNewGame(authKey)

        res.status(response.status).json(response.data)
    });

    app.post(`${BASE_PATH}/play/`, (req, res) => {
        const {authKey, play} = req.body;
        const {gameId, card} = play

        const response = makePlay(authKey, gameId, card);

        res.status(response.status).json(response.data)
    });
}