import { FastifyApp } from "../../../fastify";
import Game from "../../../game/game";
import WebsocketRoute from "../../websocket";

export default class GameControllerWebsocketRoute extends WebsocketRoute {
    constructor(app: FastifyApp) {
        super(app, '/api/game/:gameId/:playerId/controller_socket', async (connection, request) => {
            const gameId = (request.params as any).gameId;
            const playerId = (request.params as any).playerId;
            
            const game = app.games_manager.getGame(gameId);
            if (!game) {
                console.log(`Game ${gameId} not found`);
                connection.close(1008, 'Game not found');
                return;
            }
            
            if (game.players[0] && playerId == 1 && game.players[0].controller) {
                console.log(`Player 1 controller already connected to game ${gameId}`);
                connection.close(1008, 'Player 1 controller already connected');
                return;
            }
            if (game.players[1] && playerId == 2 && game.players[1].controller) {
                console.log(`Player 2 controller already connected to game ${gameId}`);
                connection.close(1008, 'Player 2 controller already connected');
                return;
            }
            
            if (playerId == 1 && game.players[0])
            {
                game.players[0].controller = connection;
                game.notifyPlayerConnection(1, true);
            }
            else if (playerId == 2 && game.players[1])
            {
                game.players[1].controller = connection;
                game.notifyPlayerConnection(2, true);
            }
            console.log(`Client controller connected to game ${gameId}`);
            connection.send(`Connected to the game ${gameId} WebSocket server!`);
            connection.on('message', (message: any) => {
                const data = JSON.parse(message.toString());
                if (data.type === 'controller')
                {
                    game.broadcast({ type: 'message', message: `Received command from player ${playerId}: ${data.command}` });
                    if (playerId == 1 && game.players[0])
                    {
                        game.players[0].setDirection(data.command);
                    }
                    else if (playerId == 2 && game.players[1])
                    {
                        game.players[1].setDirection(data.command);
                    }
                }
            });
            connection.on('close', () => {
                if (playerId == 1 && game.players[0])
                {
                    game.players[0].controller = null;
                    game.notifyPlayerConnection(1, false);
                }
                else if (playerId == 2 && game.players[1])
                {
                    game.players[1].controller = null;
                    game.notifyPlayerConnection(2, false);
                }
            });
        });
    }
}