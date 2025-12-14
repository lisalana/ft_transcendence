import { FastifyApp } from "../../../fastify";
import ApiRoute from "../../api";

export default class CreateGameRoute extends ApiRoute {
    constructor(app: FastifyApp) {
        super(app, '/api/game/create/:mode', 'POST', async (request, reply) => {
            const mode = (request.params as any).mode;
            const gameId = Math.random().toString(36).substring(2, 10);
            
            // Recup les settings du body
            const settings = (request.body as any) || {};
            const gameSettings = {
                paddleSize: settings.paddleSize || 50,
                ballSpeed: settings.ballSpeed || 3,
                winScore: settings.winScore || 11
            };

            try {
                // Passer les setting au game manager
                app.games_manager.createGame(app, gameId, mode, gameSettings);
            } catch (e) {
                reply.code(404).send({ error: "Invalid game mode" });
                return;
            }

            return {
                status: 'ok',
                timestamp: new Date().toISOString(),
                gameId,
                mode,
                settings: gameSettings  // Retourner les settings pour confirmation
            };
        });
    }
}