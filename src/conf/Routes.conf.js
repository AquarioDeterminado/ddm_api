const {Users} = require("../player/routes/Users.route");
const {Events} = require("../battle/routes/Events.route.js");

function exposeRoutes(app) {
    Users(app);
    Events(app);
}

module.exports = {exposeRoutes};