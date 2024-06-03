const {AccountStateModel, populate: AccountStatePopulate} = require('../player/models/AccountState.model');
const BaseModel = require('../player/models/Base.model');
const DogModel = require('../Dogs/models/Dog.model');
const FriendRequestModel = require('../player/models/FriendRequest.model');
const EventModel = require('../battle/models/Event.model');
const GameEnvModel = require('../battle/models/GameEnv.model');
const {GameStateModel} = require("../battle/models/GameState.model");
const LitterModel = require('../Dogs/models/Litter.model');
const PackModel = require('../Dogs/models/Pack.model');
const PassModel = require('../player/models/Pass.model');
const PlayerModel = require('../player/models/Player.model');
const TokenModel = require('../player/models/Token.model');
const UserModel = require('../player/models/User.model');
const VerificationModel = require('../player/models/VerificationCode.model');
const {DataTypes, Sequelize} = require('sequelize');
const {app} = require("../app");

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
const Event = EventModel(sequelize, DataTypes);
const GameEnv = GameEnvModel(sequelize, DataTypes);
const GameState = GameStateModel(sequelize, DataTypes);
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
GameEnv.belongsTo(Player, {foreignKey: 'playerWon'});
Player.hasMany(GameEnv, {foreignKey: 'playerWon'});

GameEnv.belongsTo(Event, {foreignKey: 'eventId'});
Event.hasOne(GameEnv, {foreignKey: 'eventId'});

GameEnv.belongsTo(GameState, {foreignKey: 'gameStateId'});
GameState.hasOne(GameEnv, {foreignKey: 'gameStateId'});


Player.belongsToMany(Dog, {through: "litter", foreignKey: 'playerId'});
Dog.belongsToMany(Player, {through: "litter", foreignKey: 'dogId'});

Pack.hasOne(Litter , {foreignKey: 'litterId'});
Litter.belongsTo(Pack, {foreignKey: 'litterId'});



sequelize.sync({ alter: true, force: process.env.FORCE_DB_SYNC});



module.exports = Object.freeze({sequelize: sequelize});