const {sequelize} =  require("../../conf/DB.conf");

async function getCurrentDeck(userId) {
    let deck = [];

    try {
        const user = await sequelize.models.user.findOne({where: {id: userId}});

        if (user === null) return {status: 400, message: "User not found"};

        const pack = (await user.getPacks({where: {active: true}}))[0];

        if (pack.length === 0) return {status: 400, message: "No active pack found"};

        const litter = await pack.getLitter({where: {active: true}});

        for (let i = 0; i < litter.length; i++) {
            const dog = await litter[i].getDog();

            deck.push({id: dog.id, name: dog.name, hp: dog.hp, attack: dog.attack, photo: dog.photo});
        }

    } catch (e) {
        console.log(e);
        return {status: 500, message: "Internal server error"};
    }



    return {status: 200, message: "Deck retrieved successfully", deck: deck};
}

async function getLitter(userId) {
    let data = [];

    try {
        const user = await sequelize.models.user.findOne({where: {id: userId}});

        if (user === null) return {status: 400, message: "User not found"};

        const player = (await user.getPlayers())[0];

        if (player === null) return {status: 400, message: "No Player available"};

        let litter = await player.getLitter({where: {active: true}});

        for (let i = 0; i < litter.length; i++) {
            const dog = await litter[i].getDog();

            data.push({id: dog.id, name: dog.name, hp: dog.hp, attack: dog.attack, photo: dog.photo});
        }

    } catch (e) {
        console.log(e);
        return {status: 500, message: "Internal server error"};
    }

    return {status: 200, message: "Litter retrieved successfully", litter: data};
}

async function addCardToCurrentHand(userId, dogId) {
    // Get user
    // Get pack
    // Get litter
    // Add dog to litter
    // return {status: 200, message: "Dog added to deck successfully"};
    try {
        const user = await sequelize.models.user.findOne({where: {id: userId}});
        const pack = (await user.getPacks({where: {active: true}}))[0];
        const player = (await user.getPlayers())[0];
        const litter = await player.getLitter({where: {active: true}});
        const litterInPack = await pack.getLitter();

        for (let i = 0; i < litterInPack.length; i++) {
            const dog = await litterInPack[i].getDog();

            if (dog.id === dogId)
                return {status: 400, message: "Dog already in deck"};
        }

        for (let i = 0; i < litter.length; i++) {
            const dog = await litter[i].getDog();

            if (dog.id === dogId) {
                await pack.addLitter(await dog.getLitter({where: {playerId: player.id}}));
                return {status: 200, message: "Dog added to deck successfully"};
            }
        }

    } catch (e) {
        console.log(e);
        return {status: 500, message: "Internal server error"};
    }

    return {status: 400, message: "Dog not found in litter"};
}

async function removeCardFromPack(userId, dogId) {

    try {
        const user = await sequelize.models.user.findOne({where: {id: userId}});
        const pack = (await user.getPacks({where: {active: true}}))[0];
        const player = (await user.getPlayers())[0];
        const litter = await player.getLitter({where: {active: true}});

        for (let i = 0; i < litter.length; i++) {
            const dog = await litter[i].getDog();

            if (dog.id === dogId) {
                await pack.removeLitter(await dog.getLitter());
                return {status: 200, message: "Dog removed from deck successfully"};
            }
        }

    } catch (e) {
        console.log(e);
        return {status: 500, message: "Internal server error"};
    }

    return {status: 400, message: "Dog not found in deck"};
}

async function getOpponentInfo(playerId) {
    let opponentInfo = {};
    let currentDeck = []

    try {
        const player = await sequelize.models.player.findOne({where: {id: playerId}})

        opponentInfo.username = player.nickname;
        opponentInfo.hp = player.hp;
        opponentInfo.photo = ("<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>" +
            "<circle cx='12' cy='6' r='3.5' stroke='currentColor' strokeWidth='2'/>" +
            "<path stroke='currentColor' strokeWidth='2' d='M7.96473 13.6977C9.13333 13.2367 10.3783 13 11.6346 13H12.3654C13.6217 13 14.8667 13.2367 16.0353 13.6977L16.7475 13.9787C17.4493 14.2556 18.097 14.6535 18.6612 15.1543L18.7766 15.2568C19.0745 15.5212 19.3406 15.8194 19.5694 16.1454C20.1751 17.0082 20.5 18.0367 20.5 19.0909V19.0909C20.5 19.8691 19.8691 20.5 19.0909 20.5H4.90913C4.13089 20.5 3.5 19.8691 3.5 19.0909V19.0909C3.5 18.0367 3.82494 17.0082 4.43057 16.1454C4.65941 15.8194 4.92547 15.5212 5.22335 15.2568L5.33878 15.1543C5.90299 14.6535 6.55073 14.2556 7.25252 13.9787L7.96473 13.6977Z'/>" +
            "</svg>");

        const user = await player.getUser();

        const pack = (await user.getPacks())[0];
        const litter = await pack.getLitter();

        for (i = 0; i < litter.length; i ++) {
            const dog = await litter[i].getDog();

            currentDeck.push({id: dog.id, name: dog.name, hp: dog.hp, attack: dog.attack, photo: dog.photo});
        }

        return {status: 200, opponentInfo: opponentInfo, currentDeck: currentDeck, message: "Opponent Info Retrieved"};

    } catch (e) {
        console.log(e);
        return {status: 500, message: "Internal server error"};
    }

}

module.exports = {getCurrentDeck, getLitter, addCardToCurrentHand, removeCardFromPack, getOpponentInfo};