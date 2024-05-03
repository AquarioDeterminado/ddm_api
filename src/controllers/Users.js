import {sequelize} from "../conf/DB";
import {sendGrid} from "../conf/SendGrid";
import checkPassword from "../utils/InputCleaner";
import {isDate, isEmail, stripLow, trim, validator} from "validator";

function createVerifCode(id) {

}

function sendVerificationEmail(email, id) {

    const verifPath = createVerifCode(id);

    const sender = "no-reply@dogdm.pt"
    const subject = "DogDM Account Verification";
    const text = `Click the link to verify your email: ${verifPath}`;
    const html = `<a href=${verifPath}>Click here to verify your email</a>`;

    sendGrid.sendMail({
        from: sender,
        to: email,
        subject: subject,
        text: text,
        html: html
    },
        (error, info) => {
        if (error) {
            console.log(`Error sending email: ${error}`);
        } else {
            console.log(`Email sent: ${info.response}`);
        }
    });
}

async function createUser(userInfo) {
    const cleanInfo = checkUserInfo(userInfo);
    if (cleanInfo.ready === false) {
        return {status: 400, message: cleanInfo.message};
    } else if (emailUsed(cleanInfo.email)) {
        return {status: 400, message: "Email already in use"};
    } else {
        const newUser = await sequelize.models.User.create(cleanInfo);
        sendVerificationEmail(cleanInfo.email, newUser.id);
        return {status: 200, message: "User created; email verification sent"};
    }
}

function emailUsed(email) {
    return !!sequelize.models.User.findOne({where: {email: email}});
}

function checkUserInfo(userInfo) {
    var cleanInfo = {};
    if (isEmail(userInfo.email)) {
        cleanInfo = { ...cleanInfo, email: validator.normalizeEmail(userInfo.email)};
    }

    const passwordCheck = checkPassword(userInfo.password);
    if (passwordCheck.clean)
        cleanInfo = { ...cleanInfo, password: passwordCheck.password};

    const basePointCheck = isPoint(userInfo.base);
    if (basePointCheck.clean) {
        cleanInfo = { ...cleanInfo, base: stripLow(trim(userInfo.base))};
    }
}


function checkPoint(point) {
    if (point === undefined || point === null) {
        return {ready: false, message: "Point is required"};
    } else if (false /*TODO: Validate point*/) {
        return {ready: false, message: "Point is invalid"};
    }
    return {ready: true};
}

export default createUser;