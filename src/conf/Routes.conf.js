const {Users} = require("../player/routes/Users.route");
const {EventsRoute, EventsActions} = require("../battle/routes/Events.route.js");
const {Battle} = require("../battle/routes/Games.route.js");
const {Cards} = require("../dogs/routes/Cards.route");
const {wss} = require("../app");

function exposeRoutes(app, wss) {
    expressRoutes(app);
    wssRoutes(wss);
}

function expressRoutes(app) {
    Users(app);
    EventsRoute(app);
    Cards(app);
}

function wssRoutes(wss) {
    wss.on('connection', function connection(ws, req) {
        ws.on('message', function incoming(data) {
            const {action, info} = JSON.parse(data);

            const clients = wss.clients;

            Battle(action, info, ws, clients);
            EventsActions(action, info, ws, clients);
        });
        console.log("Connection established")

    });
}

module.exports = {exposeRoutes};