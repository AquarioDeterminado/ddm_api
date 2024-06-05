module.exports = (sequelize, DataTypes) =>
    sequelize.define('litter', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    });
