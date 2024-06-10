const {getEvents, getEvent, createEvent, updateEvent, deleteEvent} = require("../controllers/Events.controller");
const {getUserIdFromAuthKey} = require("../../player/controllers/Users.controller");
const {playCard} = require("../controllers/Game.controller");
const {sequelize} = require("../../conf/DB.conf");
const WebSocket = require("ws");

const BASE_PATH = "/events";

function EventsRoute(app) {

    /*** Gets EventsRoute Available for user
     * @param {string} authKey
     *
     * return:
     * @returns {string} message
     * @returns {array} events
     */
    app.post(`${BASE_PATH}/`, async (req, res) => {
        const {authKey} = req.body;

        const response = await getEvents(authKey);

        res.status(response.status).send({message: response.message, events: response.events});
    });

    app.post(`${BASE_PATH}/makeEvent/`, async (req, res) => {
        const {authKey, eventInfo} = req.body;

        const playerId = await getUserIdFromAuthKey(authKey);

        const response = await createEvent(eventInfo, playerId);

        res.status(response.status).send({message: response.message});
    });

    /*** Get Event by id
     * @param {string} id - Event id
     *
     * return:
     * @returns {string} message
     * @returns {Object} event
     */
    app.get(`${BASE_PATH}/:id`, (req, res) => {
        const {id} = req.params;

        const response = getEvent(id);

        res.status(response.status).send({message: response.message, event: response.event});
    });

    /*** Create Event
     * @param {Object} eventInfo - Event information
     * @param {string} authKey - User authenticator
     *
     * return:
     * @returns {string} message
     */
    app.post(`${BASE_PATH}/create` , (req, res) => {
        const {eventInfo, authKey} = req.body;

        const response = createEvent(eventInfo, authKey);

        res.status(response.status).send({message: response.message});
    });

    /*** Update Event by id
     * @param {string} id - Event id
     * * @param {Object} eventInfo - Event information
     * * @param {string} authKey - User authenticator
     * *
     * * return:
     * @returns {string} message
     */
    app.put(`${BASE_PATH}/:id`, (req, res) => {
        const {id} = req.params;
        const {eventInfo, authKey} = req.body;

        const response = updateEvent(id, eventInfo, authKey);

        res.status(response.status).send({message: response.message});
    });

    /*** Delete Event by id
     * @param {string} id - Event id
     * @param {string} authKey - User authenticator
     *
     * return:
     * @returns {string} message
     */
    app.delete(`${BASE_PATH}/:id`, (req, res) => {
        const {id} = req.params;
        const {authKey} = req.body;

        const response = deleteEvent(id, authKey);

        res.status(response.status).send({message: response.message});
    });

}

async function EventsActions(action, info, ws, clients) {
    let event, player;

    switch (action) {
        case "logPlayer":

            const userId = await getUserIdFromAuthKey(info.authKey);
            player = (await (await sequelize.models.user.findOne({where: {id: userId}})).getPlayers())[0]
            const playerId = player.id;

            ws.playerId = playerId;

            let event = {
                name: player.nickname,
                description: player.nickname + " wants to figth",
                location: info.eventInfo.location
            }

            const response = await createEvent(event, playerId);

            ws.send(JSON.stringify(response));

            for (const client of clients) {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(await getEvents()));
                }
            }
            break;

        case "sendPlayInvite":
            if (ws.playerId === undefined) {
                ws.send(JSON.stringify({status: 400, message: "Player not logged in"}));
                break;
            }


            player = await sequelize.models.player.findOne({where: {id: info.playerId}});

            event = await sequelize.models.event.findOne({where: {id: info.eventId}});
            const enemyPlayer = await event.getPlayer();

            ws.send(JSON.stringify({status: 200, message: "Invite sent"}));

            for (const client of clients) {
                if (client.playerId === enemyPlayer.id  && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({status: 200, message: "Invite received", player: player.nickname}));
                }
            }
            break;

        case "acceptPlayInvite":
            //TODO:
            break;

            //Temporary
        case "GoIntoGame":
            const otherPlayer = await sequelize.models.player.findOne({where: {id: info.otherPlayerId}});

            const currentGame = await sequelize.models.game_env.findOne({where: {eventId: info.eventId}});



    }
}

module.exports = {EventsRoute, EventsActions};
