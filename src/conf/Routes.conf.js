const {Users} = require("../player/routes/Users.route");
const {Events} = require("../battle/routes/Events.route.js");
const {Games} = require("../battle/routes/Games.route.js");
const {Cards} = require("../Dogs/routes/Cards.route");

function exposeRoutes(app) {
    Users(app);
    Events(app);
    Games(app);
    Cards(app);
}

module.exports = {exposeRoutes};