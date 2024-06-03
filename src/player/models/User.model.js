module.exports =  (sequelize, DataTypes) =>
     sequelize.define('user', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        creationDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        gender: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
         {
        freezeTableName: true
    });
