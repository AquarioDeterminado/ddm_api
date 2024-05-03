import {validator} from "validator";

function checkPassword(password) {
    if (password === undefined || password === null) {
        return {ready: false, message: "Password is required"};
    }else if (!validator.isLength(password, {min: 8})) {
        return {ready: false, message: "Password is too short"};
    } else if (!validator.isStrongPassword(password)) {
        return {ready: false, message: "Password is invalid"};
    }
    return {ready: true};
}

module.exports = {
    checkPassword,
};

