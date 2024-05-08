const {verifyUser, createUser, sendVerificationEmail, authenticateUser, removeUser, getUser, updateUser} = require("../controllers/UsersController");

const BASE_PATH = '/users';

function Users(app) {

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
    app.get(BASE_PATH + "/:id", async (req, res) => {
        const {id} = req.params;
        const {authKey} = req.body;

        const response = await getUser(id, authKey);

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

}

module.exports = {Users};
