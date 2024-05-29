const GameStates = {
    STARTING: 'STARTING',
    ACTIVE: 'ACTIVE',
    FINISHED: 'FINISHED',
    ABANDONED: 'ABANDONED',
};

const GameStateModel = (sequelize, DataTypes) => {
    const model = sequelize.define('game_state', {
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
    });

    return model;
}