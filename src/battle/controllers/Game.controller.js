const {sequelize} = require("../../conf/DB.conf");
const { WebSocketServer } = require("ws")



async function makeNewGame(idPlayer1, idEvent) {

    try {
        const event = await sequelize.models.event.findOne({where: {id: idEvent}});

        if (event === null) return {status: 400, message: "Event not found"};

        const player1 = await sequelize.models.player.findOne({where: {id: idPlayer1}});

        if (player1 === null) return {status: 400, message: "Player not found"};


        const game = await sequelize.models.game_env.create({player1_hp: 0, player2_hp: 0, playerWon: null, round: 1});
        game.setDataValue("player1Id", player1.id);
        game.setEvent(event);

        const player2 = await event.getPlayer();
        game.setDataValue("player2Id", player2.id);


        game.player1_hp = player1.hp;
        game.player2_hp = player2.hp;

        game.setGame_state(await sequelize.models.game_state.findOne({where: {id: 1}}));

        await game.save();
        return {status: 200, message: "Game started successfully", gameId: game.id};
    } catch (e) {
        console.log(e);
        return {status: 500, message: "Internal server error"};
    }
}

async function playersTurn(game, player, round) {
    if (game.player1Id === player.id || game.player2Id === player.id)
        if ((await game.getPlays({where: {playerId: player.id, round: round}})).length === 0)
            return true;

    return false;
}

async function playCard(round, idGame, idPlayer, cardId) {
    let play = null;
    try {
        const game = await sequelize.models.game_env.findOne({where: {id: idGame}});
        const player = await sequelize.models.player.findOne({where: {id: idPlayer}});
        const card = await sequelize.models.dog.findOne({where: {id: cardId}});

        if (game === null) return {status: 400, message: "Game not found"};
        if (player === null) return {status: 400, message: "Player not found"};
        if (card === null) return {status: 400, message: "Card not found"};

        if (!(await playersTurn(game, player, round))) return {status: 400, message: "Not your turn"};

        play = await sequelize.models.play.create({round});
        await play.setGame_env(game);
        await play.setPlayer(player);
        await play.setDog(card);

        if (await
            checkIfRoundIsFinished(game, round)) {
            await play.destroy()
            return {status: 400, message: "Round is finished"};
        }

        if (await checkIfIsLastPlay(game, round)) {
            return calculateRoundDamage(game, round, idPlayer);
        }

        await play.save();

        return {status: 200, message: "Play made successfully"};
    } catch (e) {
        console.log(e);
        if (play !== null) play.destroy();
        return {status: 500, message: "Internal server error"};
    }
}

async function calculateRoundDamage(game, round, playerId) {
    try {
        const plays = await game.getPlays({where: {round: round}});
        if (plays.length !== 2) return {status: 400, message: "Not enough plays to calculate damage"};

        const player1 = await plays[0].getPlayer();
        const player2 = await plays[1].getPlayer();
        const card1 = await plays[0].getDog();
        const card2 = await plays[1].getDog();

        const over1 = card2.attack - card1.hp;
        const over2 = card1.attack - card2.hp;

        over1 > 0 ? game.player1_hp -= over1 : null;
        over2 > 0 ? game.player2_hp -= over2: null;

        game.save();

        if (game.player1_hp <= 0) {
            await game.setDataValue('playerWon', player2.id);
            await game.setGame_state(await sequelize.models.game_state.findOne({where: {id: 3}}));


            if (player2.id === playerId)
                return {status: 201, message: "You Won"};
            else
                return {status: 202, message: "You Lost"};
        } else if (game.player2_hp <= 0) {
            await game.setDataValue('playerWon', player1.id);
            game.setGame_state(await sequelize.models.game_state.findOne({where: {id: 3}}));

            if (player1.id === playerId)
                return {status: 201, message: "You Won"};
            else
                return {status: 202, message: "You Lost"};
        } else if (game.player1_hp <= 0 && game.player2_hp <= 0) {
            game.setGame_state(await sequelize.models.game_state.findOne({where: {id: 3}}));

            return {status: 203, message: "Draw"};
        }

        return {status: 204, message: "Round finished", player1_hp: game.player1_hp, player2_hp: game.player2_hp,};
    } catch (e) {
        console.log(e);
        return {status: 500, message: "Internal server error"};
    }
}

async function checkIfIsLastPlay(game, round) {
    const totalRounds = (await game.getPlays({where: {round: round}})).length;
    const isLastPlay = 1 < totalRounds;
    return isLastPlay;
}

async function checkIfRoundIsFinished(game, round) {
    const totalRounds = await game.getPlays({where: {round: round}}).length;
    return 2 >= totalRounds;
}

async function getGameInfo(gameId) {

    try {
        const game = await sequelize.models.game_env.findOne({where: {id: gameId}});

        if (game === null) return {status: 400, message: "Game not found"};

        const plays = await game.getPlays({order: [['createdAt', 'DESC']]});
        const round = plays.length > 0 ? plays[0].round : 1;

        return {
            status: 200,
            message: "Game info retrieved successfully",
            game: {
                player1: {
                    id: game.player1Id,
                    hp: game.player1_hp,
                },
                player2: {
                    id: game.player2Id,
                    hp: game.player2_hp,
                },
                round: round
            }
        };
    } catch (e) {
        console.log(e);
        return {status: 500, message: "Internal server error"};
    }
}

module.exports = {
    makeNewGame,
    playCard,
    getGameInfo
};
