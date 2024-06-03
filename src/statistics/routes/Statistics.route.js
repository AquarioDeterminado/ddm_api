import {getUserByTime, getWinProb, leastWins, mostWins, userByZone} from "../controllers/StatisticController";

const BASE_URL = "/statistics";

function StatisticsRoute(app) {
    app.get(`${BASE_URL}/getgenderstats`, async (req, res) => {
        const response = await getGenderStatis();

        return res.status(200).json(response);
    });

    /**
     * - intervalo de tempo
     * - array
     */
    app.get(`${BASE_URL}/userbytime`, async (req, res) => {
        const response = await getUserByTime();

        return res.status(200).json(response);
    });

    /**
     * {
     *     zone: "zona"
     *     users: 0
     *     geom: Polygon
     * }
     */
    app.get(`${BASE_URL}/userbyzone`, async (req, res) => {
        const response = await userByZone();

        return res.status(200).json(response);
    });

    app.post(`${BASE_URL}/getwinprob`, async (req, res) => {
        const userId = req.body.userId;

        const response = await getWinProb(userId);

        return res.status(200).json(response);
    });

    app.get(`${BASE_URL}/getmostwins`, async (req, res) => {
        const response = await mostWins();

        return res.status(200).json(response);
    });

    app.get(`${BASE_URL}/getlesswins`, async (req, res) => {
        const response = await leastWins();

        return res.status(200).json(response);
    });
}