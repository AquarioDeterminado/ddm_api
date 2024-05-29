module.exports = (sequelize, DataTypes) =>
    sequelize.define('dog', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        photo: {
            type: DataTypes.STRING, //TODO: implement sequelize-file
            allowNull: false
        },
    });
