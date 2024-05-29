import {sequelize} from "../../conf/DB.conf";

async function getGenderStatis() {

    let man, women, other = 0;

    const users = await sequelize.models.user.findAll({
        attributes: 'gender'
    });

    for (let i = 0; i < users.length; i++) {
        if (users[i].gender === "man") {
            man += 1;
        } else if (users[i].gender === "women") {
            women += 1;
        } else {
            other += 1;
        }
    }
    return {man, women, other};
}

async function getUserByTime () {
    const timeLeap = 60 * 60 * 24;

    const users = await sequelize.models.user.findAll({
        attributes: 'createdAt'
    });

    let stat = {time: users[0].createdAt, count: 0, users: [users[0]]};
    for (let i = 0; i < users.length; i++) {
        if (users[i].createdAt - stat.time > timeLeap) {
            time.push(stat);
            stat = {time: users[i].createdAt, count: 0, users: [users[i]]};
        } else {
            stat.count += 1;
            stat.users.push(users[i]);
        }
    }

    return stat;
}

async function userByZone () {
    //TODO: não sei como fazer as zonas
}

async function mostWins () {

}

async function leastWins () {

}