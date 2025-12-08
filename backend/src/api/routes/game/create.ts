import { FastifyApp } from "../../../fastify";
import ApiRoute from "../../api";

export default class CreateGameRoute extends ApiRoute {
    constructor(app: FastifyApp) {
        super(app, '/api/game/create/:mode', 'POST', async (request, reply) => {
            const mode = (request.params as any).mode;
            const gameId = Math.random().toString(36).substring(2, 10);
            
            try {
                app.games_manager.createGame(app, gameId, mode);
            } catch (e) {
                 reply.code(404).send({ error: "Invalid game mode" });
                 return;
            }

            return {
                status: 'ok',
                timestamp: new Date().toISOString(),
                gameId,
                mode
            };
        });
    }
}