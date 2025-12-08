import { FastifyApp } from "../../../fastify";
import ApiRoute from "../../api";

export default class JoinGameRoute extends ApiRoute {
    constructor(app: FastifyApp) {
        super(app, '/api/game/join/:gameId', 'POST', async (request, reply) => {
            // const gameId = (request.params as any).gameId;
            // app.current_games.set(gameId, new Game(app));
            // return {
            //     status: 'ok',
            //     timestamp: new Date().toISOString(),
            //     gameId,
            //     playerId: 0
            // };
        });
    }
}