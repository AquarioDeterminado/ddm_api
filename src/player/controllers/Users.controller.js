const {sequelize} = require("../../conf/DB.conf");
const {sendGrid} = require("../../conf/SendGrid.conf");
const {normalizeEmail} = require("validator");
const {makeId} = require("../../utils/TokenSecurity.util");
const {API_URL} = require("../../app");
const crypto = require('crypto');
const {pbkdf2Sync: pbkdf2} = require("pbkdf2");
const {AccountStateTypes} = require("../models/AccountState.model");

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

async function getUser(id, authKey) {
    const authVerif = checkAuthKey(authKey);
    if (!authVerif.verified)
        return {status: 400, message: authVerif.message, user: null};
    else if (authVerif.user_id !== id)
        return {status: 400, message: "User not authorized", user: null};

    const user = await sequelize.models.user.findOne({where: {id: id}, include: [sequelize.models.player, sequelize.models.pass]});
    const userInfo = {
        id: user.id,
        email: user.email,
        nickname: user.player.nickname,
        base: user.player.base,
        createdAt: user.createdAt,
        lastLogin: user.player.lastLogin,
    };

    return {status: 200, message: "User found", user: userInfo};
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

    const verifPath = `${API_URL}/verify/${newVerifCodeRequest.verifCode}`;

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
                nickname: cleanInfo.nickname}
            );
            pass = await sequelize.models.pass.create({hash: cleanInfo.password.hash, salt: cleanInfo.password.salt, iterations: cleanInfo.password.iterations});

            await pass.setUser(newUser);
            await newplayer.setUser(newUser);

            const accountState = await sequelize.models.accountstate.findOne({where: {state: AccountStateTypes.WAITING_VERIFICATION}});
            await newUser.setAccountstate(accountState);
            await newUser.save();

            sendVerificationEmail(cleanInfo.email, newUser.id);
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

module.exports = {createUser, verifyUser, sendVerificationEmail, authKeyVerif, authenticateUser, getUser, removeUser, updateUser, getAllUsers};