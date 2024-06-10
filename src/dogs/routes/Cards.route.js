const {getCurrentDeck, getLitter, removeCardFromPack, addCardToCurrentHand, getOpponentInfo} =  require("../controllers/Cards.controller");
const {sequelize} = require("../../conf/DB.conf");
const {getUserIdFromAuthKey} = require("../../player/controllers/Users.controller");
const BASE_URL = "/cards";

const Cards = (app) => {
    app.post(BASE_URL + "/currentpack/", async (req, res) => {
        const {authKey} = req.body;
        console.log(authKey);

        const userId = await getUserIdFromAuthKey(authKey);

        const response = await getCurrentDeck(userId);

        res.status(response.status).json({message: response.message, pack: response.deck});
    });

    app.post(BASE_URL + "/litter/", async (req, res) => {
        const {authKey} = req.body;

        const userId = await getUserIdFromAuthKey(authKey);

        const response = await getLitter(userId);

        res.status(response.status).json({message: response.message, litter: response.litter});
    });

    app.post(BASE_URL + "/currentpack/add/", async (req, res) => {
        const {authKey, cardId} = req.body;

        const userId = await getUserIdFromAuthKey(authKey);

        const response = await addCardToCurrentHand(userId, cardId);

        res.status(response.status).json({message: response.message});
    });

    app.post(BASE_URL + "/currentpack/remove/", async (req, res) => {
        const {authKey, cardId} = req.body;

        const userId = await getUserIdFromAuthKey(authKey);

        const response = await removeCardFromPack(userId, cardId);

        res.status(response.status).json({message: response.message});
    });

    app.post(BASE_URL + "/getopponentinfo/", async (req, res) => {
        const {playerId} = req.body;

        const response = await getOpponentInfo(playerId);

        res.status(response.status).json({message: response.message, opponentInfo: response.opponentInfo, currentDeck: response.currentDeck});
    });
}

module.exports = {Cards: Cards};