module.exports = (sequelize, DataTypes) =>
    sequelize.define('token', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        token: {
            type: DataTypes.STRING,
            allowNull: false
        },
        creationDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        renewalDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
    });
