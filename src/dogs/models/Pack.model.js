module.exports = (sequelize, DataTypes) =>
    sequelize.define('pack', {
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
        number_of_uses: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    });
