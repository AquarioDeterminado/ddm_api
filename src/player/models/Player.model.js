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
            allowNull: false
        },
        lastLogin: {
            type: DataTypes.DATE,
            allowNull: true
        },
    });
