const {sequelize} = require("../../conf/DB.conf");
const {sendGrid} = require("../../conf/SendGrid.conf");
const {normalizeEmail} = require("validator");
const {makeId} = require("../../utils/TokenSecurity.util");
const {API_URL} = require("../../app");
const crypto = require('crypto');
const {pbkdf2Sync: pbkdf2} = require("pbkdf2");
const {AccountStateTypes} = require("../models/AccountState.model");
const {createStarterPack} = require("./StarterPack.controller");

const codeLifeTime = 60 * 5;

async function authenticateUser(email, password) {
    try {
        const user = await sequelize.models.user.findOne({where: {email: email}});
        const pass = await sequelize.models.pass.findOne({where: {userId: user.id}});

        if (user === null)
            return {status: 400, message: "User not found"};
        else if (pass.hash !== pbkdf2(password, pass.salt, pass.iterations, 64, 'sha512').toString('UTF-8'))
            return {status: 400, message: "Invalid password"};

        const token = makeId(18);
        const renewalDate = Date.now() + 3600;

        const newToken = await sequelize.models.token.create({token: token, renewalDate: renewalDate});
        await newToken.setPass(pass);
        return {status: 200, message: "Auth key created", authKey: token};
    } catch (error) {
        console.log(`Error creating auth key: ${error}`);
        return {status: 500, message: "Error Logging In"};
    }
}

async function authKeyVerif(authKey) {
const key = await sequelize.models.token.findOne({where: {token: authKey}});
    if (key === null)
        return {status: 400, message: "Auth key not found"};
    else if (Date.now() > key.renewalDate)
        return {status: 400, message: "Auth key expired"};
    else
        return {status: 200, message: "Auth key verified"};
}

async function checkAuthKey(id, authKey) {
    const key = await sequelize.models.token.findOne({where: {token: authKey}});
    const user = await sequelize.models.user.findOne({where: {id: id}});

    if (key === null || user === null)
        return {verified: false, message: "User not found"};
    else if (key.userId !== id)
        return {verified: false, message: "User not authorized"};
    else if (Date.now() > key.renewalDate)
        return {verified: false, message: "Auth key expired"};
    else
        return {verified: true, user_id: id};
}

async function getUser(id) {

    try {
        const user = await sequelize.models.user.findOne({where: {id: id}, include: sequelize.models.player});
        const userInfo = {
            username: user.players[0].nickname,
            hp: user.players[0].hp,
            photo: ("<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>" +
                "<circle cx='12' cy='6' r='3.5' stroke='currentColor' strokeWidth='2'/>" +
                "<path stroke='currentColor' strokeWidth='2' d='M7.96473 13.6977C9.13333 13.2367 10.3783 13 11.6346 13H12.3654C13.6217 13 14.8667 13.2367 16.0353 13.6977L16.7475 13.9787C17.4493 14.2556 18.097 14.6535 18.6612 15.1543L18.7766 15.2568C19.0745 15.5212 19.3406 15.8194 19.5694 16.1454C20.1751 17.0082 20.5 18.0367 20.5 19.0909V19.0909C20.5 19.8691 19.8691 20.5 19.0909 20.5H4.90913C4.13089 20.5 3.5 19.8691 3.5 19.0909V19.0909C3.5 18.0367 3.82494 17.0082 4.43057 16.1454C4.65941 15.8194 4.92547 15.5212 5.22335 15.2568L5.33878 15.1543C5.90299 14.6535 6.55073 14.2556 7.25252 13.9787L7.96473 13.6977Z'/>" +
                "</svg>")
        };
        return {status: 200, message: "User found", user: userInfo};
    } catch (error) {
        console.log(`Error getting user: ${error}`);
    }

    return {status: 500, message: "Error getting user"};
}

async function createVerifCode(id) {
    try {
        const user = await sequelize.models.user.findOne({where: {id: id}});

        if (user === undefined || user === null) {
                return {status: 400, message: "User not found"};
        }
        const oldCode = await sequelize.models.verification_code.findOne({where: {userId: user.id}});

        if (oldCode !== undefined && oldCode !== null) {
            if (Date.now() < oldCode.createdAt + 3600) {
                return {
                    status: 400,
                    message: `Verification code already sent; wait ${(oldCode.createdAt + 3600 - Date.now()) / 60} minutes`
                };
            } else {
                oldCode.destroy();
            }
        }

        const code = makeId(18);
        const newCode = await sequelize.models.verification_code.create({code: code, expirationDate: Date.now() + codeLifeTime});
        newCode.setUser(user);

        return {status: 200, message: "Verification code created", verifCode: newCode};
    } catch (error) {
        console.log(`Error creating verification code: ${error}`);
        return {status: 500, message: "Error Logging In"};
    }
}

async function sendVerificationEmail(email) {

    const user = await sequelize.models.user.findOne({where: {email: email}, include: sequelize.models.account_state});
    if (user === null || user === undefined)
        if (user.account_state.state !== AccountStateTypes.WAITING_VERIFICATION)
            return {status: 400, message: "User not eligible for verification"};

    const newVerifCodeRequest = await createVerifCode(user.id);
    if (newVerifCodeRequest.status !== 200)
        return newVerifCodeRequest;

    const verifPath = ` /${newVerifCodeRequest.verifCode.code}`;

    const sender = "no-reply@dogdm.pt"
    const subject = "DogDM Account Verification";
    const text = `
            Hi ${user.name},

            Thank you for registering with DogDM! Please click the link below to verify your email address and complete your registration:

            ${verifPath}

            If you did not sign up for a DogDM account, please ignore this email.

            Best regards,
            The DogDM Team
        `;
    const html = `
            <p>Hi ${user.name},</p>
            <p>Thank you for registering with DogDM! Please click the link below to verify your email address and complete your registration:</p>
            <p><a href="${verifPath}">Click here to verify your email</a></p>
            <p>If you did not sign up for a DogDM account, please ignore this email.</p>
            <p><a href="https://www.dogdm.pt">Click here to be redirected to the game!!</a></p>
            <p>Best regards,</p>
            <p>The DogDM Team</p>
        `;

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
    return {status: 200, message: "Verification email sent"};
}

async function verifyUser(token) {
    const verifCode = await sequelize.models.verification_code.findOne({where: {code: token}});
    if (verifCode === null) {
        return {status: 400, message: "Invalid token"};
    } else {
        const user = await sequelize.models.user.findOne({where: {id: verifCode.userId}});

        const activeState = await AccountState(AccountStateTypes.ACTIVE);
        await user.setAccountstate(activeState);
        await user.save();
        await verifCode.destroy();
        return {status: 200, message: "User verified"};
    }
}

async function createUser(userInfo) {
    const cleanInfo = await checkUserInfo(userInfo);
    if (cleanInfo.ready === false) {
        return {status: 400, message: cleanInfo.message};
    } else if (await emailUsed(cleanInfo.email)) {
        return {status: 400, message: "Email already in use"};
    } else {

        var newUser, newplayer, pass = undefined;

        try {
            newUser = await sequelize.models.user.create({email: cleanInfo.email});
            newplayer = await sequelize.models.player.create({
                nickname: cleanInfo.nickname, hp: 120}
            );
            pass = await sequelize.models.pass.create({hash: cleanInfo.password.hash, salt: cleanInfo.password.salt, iterations: cleanInfo.password.iterations});

            await pass.setUser(newUser);
            await newplayer.setUser(newUser);

            const accountState = await sequelize.models.accountstate.findOne({where: {state: AccountStateTypes.WAITING_VERIFICATION}});
            await newUser.setAccountstate(accountState);
            await newUser.save();

            sendVerificationEmail(cleanInfo.email, newUser.id);

            if((await createStarterPack(newUser)).status !== 200)
                throw new Error("Error creating starter pack");

            return {status: 200, message: "User created; email verification sent"};
        } catch (error) {
            if (newUser !== undefined)
                newUser.destroy();
            if (newplayer !== undefined)
                newplayer.destroy();
            if (pass !== undefined)
                pass.destroy();
            console.log(`Error creating user: ${error}`);
            return {status: 500, message: "Error creating user"};
        }

    }
}

async function hashPassword(password) {
    var salt = crypto.randomBytes(128).toString('base64');
    var iterations = 10000;
    const hash = await pbkdf2(password, salt, iterations, 64, 'sha512').toString('UTF-8');


    return {
        salt: salt,
        hash: hash,
        iterations: iterations
    };
}

async function emailUsed(email) {
    return await sequelize.models.user.findOne({where: {email: email}}) !== null;
}

async function checkUserInfo(userInfo) {
    if (userInfo === undefined || userInfo === null)
        return {ready: false, message: "User information is required"};

    var cleanInfo = {};

    if (userInfo.email === undefined)
        return {ready: false, message: "Email is required"};
    if (normalizeEmail(userInfo.email))
        cleanInfo = {...cleanInfo, email: normalizeEmail(userInfo.email)};
    else
        return {ready: false, message: "Email is invalid"};

    /*const nicknameCheck = checkUsername(userInfo.nickname); TODO
    if (nicknameCheck.clean)
        cleanInfo = { ...cleanInfo, nickname: nicknameCheck.nickname};
    else
        return {ready: false, message: nicknameCheck.message};
    */
    cleanInfo = {...cleanInfo, nickname: userInfo.nickname};


    const passwordCheck = await checkPassword(userInfo.password);
    if (passwordCheck.clean)
        cleanInfo = {...cleanInfo, password: passwordCheck.password};
    else
        return {ready: false, message: passwordCheck.message};



    /*const basePointCheck = isPoint(userInfo.base);
    if (basePointCheck.clean)
        cleanInfo = { ...cleanInfo, base: stripLow(trim(basePointCheck.base))};
    else
        return {ready: false, message: basePointCheck.message};
    */
    cleanInfo = {...cleanInfo, base: userInfo.base};


    return {...cleanInfo, ready: true};
}

async function checkPassword(password) {
    const regex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])");

    if (password === undefined || password === null) {
        return {clean: false, message: "Password is required"};
    } else if (password.length < 8) {
        return {clean: false, message: "Password must have at least 8 characters"};
    } else if (regex.test(password) === false) {
        return {
            clean: false,
            message: "Password must have at least one uppercase letter, one lowercase letter and one number"
        };
    }

    password = await hashPassword(password);
    return {clean: true, password: password};

}


function checkPoint(point) {
    if (point === undefined || point === null) {
        return {ready: false, message: "Point is required"};
    } else if (false /*TODO: Validate point*/) {
        return {ready: false, message: "Point is invalid"};
    }
    return {ready: true};
}

async function AccountState(state) {
    return await sequelize.models.accountstate.findOne({where: {state: state}});
}

async function removeUser(userId, authKey) {
    const authVerif = await checkAuthKey(userId, authKey);
    if (!authVerif.verified)
        return {status: 400, message: authVerif.message};
    else if (authVerif.user_id !== userId)
        return {status: 400, message: "User not authorized"};

    const user = sequelize.models.user.findOne({where: {id: userId}});
    user.destroy();
    return {status: 200, message: "User removed"};
}

async function updateUser(userId, authKey, updatedUserInfo) {
    const authVerif = await checkAuthKey(userId, authKey);
    if (!authVerif.verified)
        return {status: 400, message: authVerif.message};
    else if (authVerif.user_id !== userId)
        return {status: 400, message: "User not authorized"};

    const user = sequelize.models.user.findOne({where: {id: userId}});
    const player = await sequelize.models.player.findOne({where: {id: updatedUserInfo.playerId}});

    //TODO: Check Info
    if (updatedUserInfo.email !== undefined)
        user.setEmail(updatedUserInfo.email);
    if (updatedUserInfo.nickname !== undefined)
        player.setNickname(updatedUserInfo.nickname);
    if (updatedUserInfo.base !== undefined)
        player.setBase(updatedUserInfo.base);

    user.save();
    return {status: 200, message: "User updated"};
}

async function getAllUsers() {
    return {status: 200, users: await sequelize.models.user.findAll()};
}

async function getUserIdFromAuthKey(authKey) {
    const token = await sequelize.models.token.findOne({where: {token: authKey}});
    if (token === null)
        return {status: 400, message: "Auth key not found"};
    const pass = await token.getPass();
    const user = await pass.getUser();
    const userId = user.id;
    return userId;
}

module.exports = {createUser, verifyUser, sendVerificationEmail, authKeyVerif, authenticateUser, getUser, removeUser, updateUser, getAllUsers, getUserIdFromAuthKey};