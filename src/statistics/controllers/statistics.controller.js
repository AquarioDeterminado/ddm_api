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
    const users = await sequelize.models.user.findAll({
        attributes: 'zone'
    });

    let zones = [];
    for (let i = 0; i < users.length; i++) {
        if (zones[users[i].zone]) {
            zones[users[i].zone] += 1;
        } else {
            zones[users[i].zone] = 1;
        }
    }

    return zones;
}

async function mostWins () {
    const matches = await sequelize.models.game_env.findAll({
        attributes: 'playerWon',
        where: {
            gameStateId: 3 //GameStates.FINISHED
        }
    });

    let wins = [];
    for (let i = 0; i < matches.length; i++) {
        if (wins[matches[i].playerWon]) {
            wins[matches[i].playerWon] += 1;
        } else {
            wins[matches[i].playerWon] = 1;
        }
    }

    //max
    let max = 0;
    for (let i = 0; i < wins.length; i++) {
        if (wins[i] > max) {
            max = i;
        }
    }

    return {userId: max, wins: wins[max]};
}

async function leastWins () {
    const matches = await sequelize.models.game_env.findAll({
        attributes: ['playerWon', 'player1Id', 'player2Id' ],
        where: {
            gameStateId: 3 //GameStates.FINISHED
        }
    });

    let losses = [];
    for (let i = 0; i < matches.length; i++) {
        let playerLost = matches[i].player1Id === matches[i].playerWon ? matches[i].player2Id : matches[i].player1Id;
        if (losses[playerLost]) {
            losses[playerLost] += 1;
        } else {
            losses[playerLost] = 1;
        }
    }

    //max
    let min = 1000000000;
    for (let i = 0; i < losses.length; i++) {
        if (losses[i] < min) {
            min = i;
        }
    }

    return {userId: min, losses: losses[min]};
}

function getWinProb (userId) {
    const user = sequelize.models.user.findOne({
        where: {
            id: userId
        }
    });

    const userMatchs = user.getGameEnvs();

    const userWinnedMatchs = user.getGameEnvs({where: {playerWon: userId}});

    return userWinnedMatchs.length / userMatchs.length;
}

export {getGenderStatis, getUserByTime, userByZone, mostWins, leastWins, getWinProb};
