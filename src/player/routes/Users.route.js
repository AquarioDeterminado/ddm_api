const {verifyUser, createUser, sendVerificationEmail, authenticateUser, removeUser, getUser, updateUser, getAllUsers,
    authKeyVerif
} = require("../controllers/Users.controller");
const cors = require("cors");
const {sequelize} = require("../../conf/DB.conf");

const BASE_PATH = '/users';

function UsersRoute(app) {
    app.use(cors({
        origin: 'http://localhost:8080',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }));

    /*** Create a new user
     * @param {Object} userInfo - User information
     * @param {string} userInfo.email - User email
     * @param {string} userInfo.password - User username
     * @param {string} userInfo.nickname - User username
     * @param {string} userInfo.base - User password
     *
     * return:
     * @returns {string} message - Response message
     **/
    app.post(BASE_PATH + "/create", async (req, res) => {
        const {userInfo} = req.body;

        const response = await createUser(userInfo);
        res.status(response.status).json({message: response.message});
    });

    /*** Get user by id and authenticator
     * @param {string} id - User id
     * @param {string} authKey - User authenticator
     *
     * return:
     * @returns {string} message - Response message
     * @returns {Object} user - User information
     **/
    app.post(BASE_PATH + "/", async (req, res) => {
        const {authKey} = req.body;

        const token = await sequelize.models.token.findOne({where: {token: authKey}});
        const pass = await token.getPass();
        const user = await pass.getUser();
        const userId = user.id;


        const response = await getUser(userId);

        res.status(response.status).json({message: response.message, user: response.user});
    });

    /*** Update user by id and authenticator
     * @param {string} user_id - User id
     * @param {string} authKey - User authenticator
     * @param {Object} userUpdatedInfo - User updated information
     * @param {string} userUpdatedInfo.email - User email
     * @param {string} userUpdatedInfo.playerId - User username
     * @param {string} userUpdatedInfo.nickname - User username
     * @param {string} userUpdatedInfo.base - User password
     *
     *
     * return:
     * @returns {string} message - Response message
     **/
    app.put(BASE_PATH + "/:id", async (req, res) => {
        const {user_id} = req.params;
        const {authKey, userUpdatedInfo} = req.body;

        const response = await updateUser(user_id, authKey, userUpdatedInfo);

        res.status(response.status).json({message: response.message});
    });

    /*** Remove user by id and authenticator
     * @param {string} user_id - User id
     * @param {string} authKey - User authenticator
     *
     * return:
     * @returns {string} message - Response message
     **/
    app.delete(BASE_PATH + "/:id", async (req, res) => {
        const {authKey, user_id} = req.body;

        const response = await removeUser(user_id, authKey);

        res.status(response.status).json({message: response.message});
    });

    /*** Authenticate user
     * @param {string} email - User email
     * @param {string} password - User password
     *
     * return:
     * @returns {string} message - Response message
     * @returns {string} authKey - User authenticator
     **/
    app.post(BASE_PATH + "/auth", async (req, res) => {
        const {email, password} = req.body;

        const response = await authenticateUser(email, password);

        res.status(response.status).json({message: response.message, authKey: response.authKey});
    });

    app.post(BASE_PATH + "/authkey", async (req, res) => {
        const {authKey} = req.body;

        const response = await authKeyVerif(authKey);

        res.status(response.status).json({message: response.message});
    });

    /*** Ask for verification code
     * @param {string} email - User email
     *
     * return:
     * @returns {string} message - Response message
     * **/
    app.post(BASE_PATH + "/askverifcode",async (req, res) => {
        const {email} = req.body;

        const response = await sendVerificationEmail(email);
        res.status(response.status).json({message: response.message});
    });

    /*** Confirm user email
     * @param {string} verifToken - Verification token
     *
     * return:
     * @returns {string} message - Response message
     **/
    app.get(BASE_PATH + "/confirm/:verifToken", async (req, res) => {
        const {verifToken} = req.params;

        const response = await verifyUser(verifToken);
        res.status(response.status).json({message: response.message});
    });

    /*** Get all users
     **/
    app.get(BASE_PATH + "/", async (req, res) => {
        const response = await getAllUsers();
        res.status(response.status).json({message: response.message, users: response.users});
    });
}

module.exports = {Users: UsersRoute};
