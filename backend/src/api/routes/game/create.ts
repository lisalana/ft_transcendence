import { FastifyApp } from "../../../fastify";
import Game from "../../../game/game";
import ApiRoute from "../../api";

export default class CreateGameRoute extends ApiRoute {
    constructor(app: FastifyApp) {
        super(app, '/api/game/create', 'POST', async (request, reply) => {
            const gameId = Math.random().toString(36).substring(2, 10);
            app.games_manager.createGame(app, gameId);
            // app.current_games.set(gameId, new Game(app));
            return {
                status: 'ok',
                timestamp: new Date().toISOString(),
                gameId
            };
        });
    }
}