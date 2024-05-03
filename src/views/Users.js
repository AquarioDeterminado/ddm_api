const BASE_PATH = '/users';

function Users(server) {

    //Create a new user
    server.app.post(BASE_PATH + "/create", async (req, res) => {

    });

    //Get user by id and authenticator
    server.app.get(BASE_PATH + "/:id", async (req, res) => {

    });

    //Update user by id and authenticator
    server.app.put(BASE_PATH + "/:id", async (req, res) => {

    });

    //Delete user by id and authenticator
    server.app.delete(BASE_PATH + "/:id", async (req, res) => {

    });

    //Authenticate user
    server.app.post(BASE_PATH + "/auth", async (req, res) => {

    });

    //Confirm user email
    server.app.post(BASE_PATH + "/confirm", async (req, res) => {

    });

}
