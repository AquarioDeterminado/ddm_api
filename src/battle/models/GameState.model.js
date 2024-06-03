const GameStates = {
    STARTING: 'STARTING',
    ACTIVE: 'ACTIVE',
    FINISHED: 'FINISHED',
    ABANDONED: 'ABANDONED',
};

const GameStateModel = (sequelize, DataTypes) =>
    sequelize.define('game_state', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false
        }
    })


module.exports = {
    GameStates,
    GameStateModel
};