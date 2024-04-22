require('dotenv').config({path:__dirname+'/./../.env'});
const {sequelize} = require("./conf/DB");

const express = require('express');
const app = express();

app.use(express.json());
