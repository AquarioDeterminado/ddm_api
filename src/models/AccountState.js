module.exports = (sequelize, DataTypes) =>
    sequelize.define('account_state', {
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