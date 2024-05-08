const {AccountStateModel} = require('../models/AccountState');
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
const VerificationModel = require('../models/VerificationCode');
const {DataTypes, Sequelize} = require('sequelize');


const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DBO_HOST,
    username: process.env.DBO_USER,
    password: process.env.DBO_PASS,
    database: process.env.DBO_DATABASE,
    schema: process.env.DBO_SCHEMA,
    port: process.env.DBO_PORT,
    logging: false,
});
sequelize.authenticate().then(() => {
    console.log('Connection to DB has been established successfully.');
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
const VerificationCode = VerificationModel(sequelize, DataTypes);




User.hasMany(Player, {foreignKey: 'userId'});
Player.belongsTo(User, {foreignKey: 'userId'});

User.hasOne(VerificationCode, {foreignKey: 'userId'});
VerificationCode.belongsTo(User, {foreignKey: 'userId'});

AccountState.hasOne(User, {foreignKey: 'accountStateId'});
User.belongsTo(AccountState, {foreignKey: 'accountStateId'});

User.hasOne(Pass, {foreignKey: 'userId'});
Pass.belongsTo(User, {foreignKey: 'userId'});

Pass.hasMany(Token, {foreignKey: 'passId'});
Token.belongsTo(Pass, {foreignKey: 'passId'});

FriendRequest.belongsTo(User,  {foreignKey: 'senderId'});
User.hasOne(FriendRequest, {foreignKey: 'senderId'});
FriendRequest.belongsTo(User,  {foreignKey: 'receiverId'});
User.hasOne(FriendRequest, {foreignKey: 'receiverId'});

User.hasMany(Base, {foreignKey: 'userId'});
Base.belongsTo(User, {foreignKey: 'userId'});

GameEnv.belongsTo(Player, {foreignKey: 'player1Id'});
Player.hasMany(GameEnv, {foreignKey: 'player1Id'});
GameEnv.belongsTo(Player, {foreignKey: 'player2Id'});
Player.hasMany(GameEnv, {foreignKey: 'player2Id'});

Player.belongsToMany(Dog, {through: "litter", foreignKey: 'playerId'});
Dog.belongsToMany(Player, {through: "litter", foreignKey: 'dogId'});

Pack.hasOne(Litter , {foreignKey: 'litterId'});
Litter.belongsTo(Pack, {foreignKey: 'litterId'});


sequelize.sync({ alter: true, force: false });



module.exports = Object.freeze({sequelize: sequelize});