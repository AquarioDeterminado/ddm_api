const {sequelize} = require("../../conf/DB.conf");

const AccountStateTypes = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    BLOCKED: 'BLOCKED',
    WAITING_VERIFICATION: 'WAITING_VERIFICATION'
};


const AccountStateModel = (sequelize, DataTypes) =>
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
    })


function populate () {
    const AccountState = sequelize.models.account_state;
    AccountState.create({state: AccountStateTypes.ACTIVE});
    AccountState.create({state: AccountStateTypes.INACTIVE});
    AccountState.create({state: AccountStateTypes.BLOCKED});
    AccountState.create({state: AccountStateTypes.WAITING_VERIFICATION});
}

module.exports = {AccountStateModel, AccountStateTypes, populate};