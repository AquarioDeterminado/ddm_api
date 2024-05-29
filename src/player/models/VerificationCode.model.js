module.exports = (sequelize, DataTypes) =>
    sequelize.define('verification_code', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false
        },
        expirationDate: {
            type: DataTypes.DATE,
            allowNull: false
        }
    });
