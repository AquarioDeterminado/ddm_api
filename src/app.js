require('dotenv').config({path:__dirname+'/./../.env'});
const {sequelize} =  require("./conf/DB");
const express = require('express');
const {exposeRoutes} = require("./conf/Routes");

const API_URL = `localhost:${process.env.PORT}`;

const app = express();

app.use(express.json());
exposeRoutes(app);
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});


module.exports = {app, API_URL};
