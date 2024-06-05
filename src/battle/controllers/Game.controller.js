const {sequelize} = require("../../conf/DB.conf");

async function makeNewGame(idPlayer1, idEvent) {

    const event = sequelize.models.event.findOne({where: {id: idEvent}});

    if (event === null) return {status: 400, message: "Event not found"};

    const player1 = sequelize.models.user.findOne({where: {id: idPlayer1}});

    if (player1 === null) return {status: 400, message: "Player not found"};

    const game = await sequelize.models.game_env.create({player1_hp: 0, player2_hp: 0, playerWon: null, round: 1});
    game.setPlayer1Id(player1);
    game.setEvent(event);
    game.setPlayer2Id(event.getPlayer)
    game.setGame_state(await sequelize.models.game_state.findOne({where: {id: 1}}));

    await game.save();

    return {status: 200, message: "Game created successfully", game: game};
}

async function playCard(round, idGame, idPlayer, cardId) {
    const game = sequelize.models.game_env.findOne({where: {id: idGame}});
    const player = sequelize.models.user.findOne({where: {id: idPlayer}});
    const card = sequelize.models.card.findOne({where: {id: cardId}});

    if (game === null) return {status: 400, message: "Game not found"};
    if (player === null) return {status: 400, message: "Player not found"};
    if (card === null) return {status: 400, message: "Card not found"};

    const play = sequelize.models.play.create({round});
    play.setGameEnv(game);
    play.setPlayer(player);
    play.setCard(card);

    if (checkIfRoundIsFinished(game)) {
        await play.destroy()
        return {status: 400, message: "Round is finished"};
    }

    if(checkIfIsLastPlay(game)) {
        return calculateRoundDamage(game, round);
    }

    play.save();

    return {status: 200, message: "Play created successfully"};
}

async function calculateRoundDamage(game, round) {
    const plays = game.getPlays({where: {round: round}});
    const player1 = plays[0].getPlayer();
    const player2 = plays[1].getPlayer();
    const card1 = plays[0].getDog();
    const card2 = plays[1].getDog();

    const over1 = card1.hp - card2.attack;
    const over2 = card2.hp - card1.attack;

    game.player1_hp = -over1;
    game.player2_hp = -over2;

    if (game.player1_hp <= 0) {
        game.setPlayerWon(player2);
        game.setGameState(await sequelize.models.game_state.findOne({where: {id: 3}}));

        return {status: 200, message: "Player 2 won"};
    }else if (game.player2_hp <= 0) {
        game.setPlayerWon(player1);
        game.setGameState(await sequelize.models.game_state.findOne({where: {id: 3}}));

        return {status: 200, message: "Player 1 won"};
    } else if (game.player1_hp <= 0 && game.player2_hp <= 0) {
        game.setGameState(await sequelize.models.game_state.findOne({where: {id: 3}}));

        return {status: 200, message: "Draw"};
    }

    return {status: 200, message: "Round finished", player1_hp: game.player1_hp, player2_hp: game.player2_hp, };
}

function checkIfIsLastPlay(game, round) {
    const totalRounds = game.getPLays({where: {round: round}}).length;
    return 1 === totalRounds;
}

function checkIfRoundIsFinished(game, round) {
    const totalRounds = game.getPlays({where: {round: round}}).length;
    return 2 >= totalRounds;
}

module.exports = {
    makeNewGame,
    playCard
};
