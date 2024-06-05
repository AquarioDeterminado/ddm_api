const {AccountStateModel, populate: AccountStatePopulate} = require('../player/models/AccountState.model');
const BaseModel = require('../player/models/Base.model');
const DogModel = require('../dogs/models/Dog.model');
const FriendRequestModel = require('../player/models/FriendRequest.model');
const EventModel = require('../battle/models/Event.model');
const GameEnvModel = require('../battle/models/GameEnv.model');
const {GameStateModel} = require("../battle/models/GameState.model");
const LitterModel = require('../dogs/models/Litter.model');
const PackModel = require('../dogs/models/Pack.model');
const PassModel = require('../player/models/Pass.model');
const PlayerModel = require('../player/models/Player.model');
const PlayModel = require('../battle/models/Play.model');
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

try {

    sequelize.authenticate().then(() => {
        console.log('Connection to DB has been established successfully.');
        makeDB().then(() => {
            console.log('DB created');
        }).then(() => {

            console.log('All models were synchronized successfully.');

            const {
                accountstate: AccountState,
                base: Base,
                dog: Dog,
                friend_request: FriendRequest,
                event: Event,
                game_env: GameEnv,
                game_state: GameState,
                litter: Litter,
                pack: Pack,
                pass: Pass,
                player: Player,
                play: Play,
                token: Token,
                user: User,
                verification_code: VerificationCode
            } = sequelize.models

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

            FriendRequest.belongsTo(User, {foreignKey: 'senderId'});
            User.hasOne(FriendRequest, {foreignKey: 'senderId'});
            FriendRequest.belongsTo(User, {foreignKey: 'receiverId'});
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

            Event.belongsTo(Player, {foreignKey: 'playerId'});
            Player.hasMany(Event, {foreignKey: 'playerId'});

            Player.hasMany(Litter, {foreignKey: 'playerId'});
            Litter.belongsTo(Player, {foreignKey: 'playerId'});

            Dog.hasMany(Litter, {foreignKey: 'dogId'});
            Litter.belongsTo(Dog, {foreignKey: 'dogId'});

            Play.belongsTo(GameEnv, {foreignKey: 'gameEnvId'});
            GameEnv.hasMany(Play, {foreignKey: 'gameEnvId'});

            Play.belongsTo(Player, {foreignKey: 'playerId'});
            Player.hasMany(Play, {foreignKey: 'playerId'});

            Play.belongsTo(Dog, {foreignKey: 'dogId'});
            Dog.hasMany(Play, {foreignKey: 'dogId'});

            Pack.belongsToMany(Litter, {foreignKey: 'packId', through: 'litter_pack'});
            Litter.belongsToMany(Pack, {foreignKey: 'litterId', through: 'litter_pack'});

            Pack.belongsTo(User, {foreignKey: 'userId'});
            User.hasMany(Pack, {foreignKey: 'userId'});

            const force = process.env.FORCE_DB_SYNC === 'true';
            sequelize.sync({alter: true, force: force}).then(() => {
                console.log('All relations were synchronized successfully.');

            }).catch((error) => {
                console.error('Unable to sync the database:', error);
            });
        });
    }).catch((error) => {
        console.error('Unable to connect to the database:', error);
    });
} catch (e) {
    console.log(e);
}

async function makeDB() {
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
    const Play = PlayModel(sequelize, DataTypes);
    const Token = TokenModel(sequelize, DataTypes);
    const User = UserModel(sequelize, DataTypes);
    const VerificationCode = VerificationModel(sequelize, DataTypes);
}

module.exports = Object.freeze({sequelize: sequelize});