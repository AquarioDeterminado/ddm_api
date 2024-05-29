const BASE_URL = "/statistics";

function StatisticsRoute(app) {
    app.post(`${BASE_URL}/getgenderstats`, (req, res) => {

    });

    /**
     * - intervalo de tempo
     * - array
     */
    app.post(`${BASE_URL}/userbytime`, (req, res) => {

    });

    /**
     * {
     *     zone: "zona"
     *     users: 0
     *     geom: Polygon
     * }
     */
    app.post(`${BASE_URL}/userbyzone`, (req, res) => {

    });

    app.post(`${BASE_URL}/getwinprob`, (req, res) => {

    });

    app.post(`${BASE_URL}/getmostwins`, (req, res) => {

    });

    app.post(`${BASE_URL}/getlesswins`, (req, res) => {

    });
}