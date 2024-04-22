module.exports = (sequelize, DataTypes) =>
    sequelize.define('litter', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        creationDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    });
