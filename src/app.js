require('dotenv').config({path:__dirname+'/./../.env'});
const express = require('express');
const {exposeRoutes} = require("./conf/Routes.conf");
const cors = require('cors');

const API_URL = `localhost:${process.env.PORT}`;

const app = express();
const expressWs = require('express-ws')(app);

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

exposeRoutes(app);

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});


module.exports = {app, API_URL};
