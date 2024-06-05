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

        for (let i = 0; i < litter.length; i++) {
            const dog = await litter[i].getDog();

            if (dog.id === dogId) {
                await pack.addLitter(await dog.getLitter());
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

module.exports = {getCurrentDeck, getLitter, addCardToCurrentHand, removeCardFromPack};