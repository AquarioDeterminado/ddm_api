module.exports = (sequelize, DataTypes) =>
    sequelize.define('player', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        nickname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        currentLocation: {
            type: DataTypes.GEOGRAPHY('POINT'),
            allowNull: true
        },
        base: {
            type: DataTypes.GEOGRAPHY('POINT'),
            allowNull: true
        },
        lastLogin: {
            type: DataTypes.DATE,
            allowNull: true
        },
        hp: {
            type: DataTypes.INTEGER,
            allowNull: false,
            default: 100
        },
    });
