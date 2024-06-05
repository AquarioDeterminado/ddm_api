module.exports = (sequelize, DataTypes) =>
    sequelize.define('game_env', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        player1_hp: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        player2_hp: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    });
