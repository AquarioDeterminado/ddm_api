import nodemailer from 'nodemailer'

export const sendGrid = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY
    }
});

export default {sendGrid}
