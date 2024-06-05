module.exports = (sequelize, DataTypes) => sequelize.define('play', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    round : {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    freezeTableName: true
});
