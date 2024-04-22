const AccountStateModel = require('../models/AccountState');
const BaseModel = require('../models/Base');
const DogModel = require('../models/Dog');
const FriendRequestModel = require('../models/FriendRequest');
const GameEnvModel = require('../models/GameEnv');
const LitterModel = require('../models/Litter');
const PackModel = require('../models/Pack');
const PassModel = require('../models/Pass');
const PlayerModel = require('../models/Player');
const TokenModel = require('../models/Token');
const UserModel = require('../models/User');
const {DataTypes, Sequelize} = require('sequelize');


const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DBO_HOST,
    username: process.env.DBO_USER,
    password: process.env.DBO_PASS,
    database: process.env.DBO_DATABASE,
    schema: process.env.DBO_SCHEMA,
    port: process.env.DBO_PORT
});
sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the database:', error);

});

(async () => { await sequelize.sync({ alter: true });})();

const AccountState = AccountStateModel(sequelize, DataTypes);
const Base = BaseModel(sequelize, DataTypes);
const Dog = DogModel(sequelize, DataTypes);
const FriendRequest = FriendRequestModel(sequelize, DataTypes);
const GameEnv = GameEnvModel(sequelize, DataTypes);
const Litter = LitterModel(sequelize, DataTypes);
const Pack = PackModel(sequelize, DataTypes);
const Pass = PassModel(sequelize, DataTypes);
const Player = PlayerModel(sequelize, DataTypes);
const Token = TokenModel(sequelize, DataTypes);
const User = UserModel(sequelize, DataTypes);




User.hasMany(Player, {foreignKey: 'userId'});
Player.belongsTo(User, {foreignKey: 'userId'});

User.belongsTo(AccountState, {foreignKey: 'accountStateId'});
AccountState.hasOne(User, {foreignKey: 'accountStateId'});

User.hasMany(Pass, {foreignKey: 'userId'});
Pass.belongsTo(User, {foreignKey: 'userId'});

Pass.hasMany(Token, {foreignKey: 'passId'});
Token.belongsTo(Pass, {foreignKey: 'passId'});

FriendRequest.belongsTo(User,  {foreignKey: 'senderId'});
User.hasOne(FriendRequest, {foreignKey: 'senderId'});
FriendRequest.belongsTo(User,  {foreignKey: 'receiverId'});
User.hasOne(FriendRequest, {foreignKey: 'receiverId'});

User.hasMany(Base, {foreignKey: 'userId'});
Base.belongsTo(User, {foreignKey: 'userId'});

GameEnv.hasMany(Player, {foreignKey: 'player1Id'});
Player.belongsTo(GameEnv, {foreignKey: 'player1Id'});
GameEnv.hasMany(Player, {foreignKey: 'player2Id'});
Player.belongsTo(GameEnv, {foreignKey: 'player2Id'});

Player.belongsToMany(Dog, {through: "litter", foreignKey: 'playerId'});
Dog.belongsToMany(Player, {through: "litter", foreignKey: 'dogId'});

Pack.hasOne(Litter , {foreignKey: 'litterId'});
Litter.belongsTo(Pack, {foreignKey: 'litterId'});





module.exports = Object.freeze({sequelize: sequelize});