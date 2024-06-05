const {getEvents, getEvent, createEvent, updateEvent, deleteEvent} = require("../controllers/Events.controller");

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

module.exports = {Events: EventsRoute};
