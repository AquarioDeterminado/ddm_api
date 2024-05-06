const {verifyUser, createUser, sendVerificationEmail} = require("../controllers/UsersController");

const BASE_PATH = '/users';

function Users(app) {

    /*** Create a new user
     * @param {Object} userInfo - User information
     * @param {string} userInfo.email - User email
     * @param {string} userInfo.password - User username
     * @param {string} userInfo.nickname - User username
     * @param {string} userInfo.base - User password
     **/
    app.post(BASE_PATH + "/create", async (req, res) => {
        const {userInfo} = req.body;

        const response = await createUser(userInfo);
        res.status(response.status).json({message: response.message});
    });

    /*** Get user by id and authenticator
        * @param {string} id - User id
        * @param {string} authKey - User authenticator
     **/

    app.get(BASE_PATH + "/:id", async (req, res) => {
        const {id} = req.params;
        const {authKey} = req.body;

        const response = await getUser(id, authKey);

        res.status(response.status).json({message: response.message, user: response.user});
    });

    //Update user by id and authenticator
    app.put(BASE_PATH + "/:id", async (req, res) => {

    });

    //Delete user by id and authenticator
    app.delete(BASE_PATH + "/:id", async (req, res) => {

    });

    //Authenticate user
    app.post(BASE_PATH + "/auth", async (req, res) => {
        const {email, password} = req.body;

        const response = await authenticateUser(email, password);

        res.status(response.status).json({message: response.message, authKey: response.authKey});
    });

    app.post(BASE_PATH + "/askverifcode",async (req, res) => {
        const {email} = req.body;

        const response = await sendVerificationEmail(email);
        res.status(response.status).json({message: response.message});
    });

    /*** Confirm user email
        * @param {string} verifToken - Verification token
     **/
    app.get(BASE_PATH + "/confirm/:verifToken", async (req, res) => {
        const {verifToken} = req.params;

        const response = await verifyUser(verifToken);
        res.status(response.status).json({message: response.message});
    });
}

module.exports = {Users};
