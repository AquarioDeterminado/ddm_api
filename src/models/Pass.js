module.exports = (sequelize, DataTypes) =>
    sequelize.define("pass",{
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        hash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        salt: {
            type: DataTypes.STRING,
            allowNull: false
        },
        iterations: {
            type: DataTypes.INTEGER,
            allowNull: false
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
