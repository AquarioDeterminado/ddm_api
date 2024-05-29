module.exports = (sequelize, DataTypes) => sequelize.define('friend_request', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    accepted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    sentDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    acceptedDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    }
});