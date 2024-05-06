const {Users} = require("../views/Users");

function exposeRoutes(app) {
    Users(app);
}

module.exports = {exposeRoutes};