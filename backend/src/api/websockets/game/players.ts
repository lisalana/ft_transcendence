import { FastifyApp } from "../../../fastify";
import Game from "../../../game/game";
import WebsocketRoute from "../../websocket";

export default class GamePlayerWebsocketRoute extends WebsocketRoute {
    constructor(app: FastifyApp) {
        super(app, '/api/game/:gameId/websocket', async (connection, request) => {
            const gameId = (request.params as any).gameId;
                
                const game = app.games_manager.getGame(gameId);
                if (!game) {    
                    console.log(`Game ${gameId} not found`);
                    connection.close(1008, 'Game not found');
                    return;
                }

                if (!game.getWebsocket()) {
                    game.setWebsocket(connection);
                }
                
                console.log(`Client connected to game ${gameId}`);
                connection.send(`Connected to the game ${gameId} WebSocket server!`);

                // Send initial player status
                if (game.players[0]?.controller) {
                    connection.send(JSON.stringify({ type: 'player_connection', playerId: 1, connected: true }));
                }
                if (game.players[1]?.controller) {
                    connection.send(JSON.stringify({ type: 'player_connection', playerId: 2, connected: true }));
                }

                connection.on('message', (message: any) => {
                    const text = message.toString();
                    // Check if it's a JSON message
                    try {
                        const data = JSON.parse(text);
                        if (data.type === 'start_game') {
                            console.log(`Game ${gameId} starting...`);
                            game.start();
                            return;
                        }
                    } catch (e) {
                        // Not JSON, ignore or treat as text
                    }

                    console.log(`Game ${gameId} received:`, text);
                    
                    game.broadcast({ type: 'message', message: `Echo: ${text}` });
                });

                connection.on('close', () => {
                    console.log(`Client disconnected from game ${gameId}`);
                    app.games_manager.deleteGame(gameId)
                });
        });
    }
}