const nodemailer = require('nodemailer');

const sendGridConf = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY
    }
});

module.exports = {sendGrid: sendGridConf}
