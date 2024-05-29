async function getPlayer(authkey) {
    const token = await sequelize.models.token.findOne({where: {pass: authkey}});
    const user = await token.getUser();
    const player = user.getPlayer();
    return player;
}