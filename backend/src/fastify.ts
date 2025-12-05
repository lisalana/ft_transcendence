import Fastify from 'fastify';
import cors from '@fastify/cors';
import staticPlugin from '@fastify/static';
import websocketPlugin from '@fastify/websocket';
import { ApiRoutes } from './api/routes';
import path from 'path';
import { fileURLToPath } from 'url';
import Game from './game/game';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class FastifyApp {

    public static readonly PORT = 4000;
    public static readonly HOST = '0.0.0.0';

    public current_games: Map<string, Game> = new Map();

    public instance =  Fastify({ 
      logger: false 
    });

    constructor ()
    {
    }

    async initialize()
    {
        await this.instance.register(cors, {
            origin: true
        });
        await this.instance.register(websocketPlugin);
        await this.instance.register(staticPlugin, {
            root: path.join(__dirname, '../static')
        });

        await this.instance.register(async (fastify) => {
            fastify.get('/api/game/:gameId/websocket', { websocket: true }, (connection, request) => {
                const gameId = (request.params as any).gameId;
                
                if (!this.current_games.has(gameId)) {
                    console.log(`Game ${gameId} not found`);
                    connection.close(1008, 'Game not found');
                    return;
                }

                const game = this.current_games.get(gameId);
                if (!game) {
                    console.log(`Game ${gameId} retrieval error`);
                    connection.close(1011, 'Game retrieval error');
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
                    
                    this.current_games.get(gameId)?.destroy();
                    this.current_games.delete(gameId);
                });
            });

            fastify.get('/api/game/:gameId/:playerId/controller_scocket', { websocket: true }, (connection, request) => {
                const gameId = (request.params as any).gameId;
                const playerId = (request.params as any).playerId;
                
                if (!this.current_games.has(gameId)) {
                    console.log(`Game ${gameId} not found`);
                    connection.close(1008, 'Game not found');
                    return;
                }

                const game = this.current_games.get(gameId)!;
                

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
        });
        

        await ApiRoutes.registerAll(this);
    }

    async listen()
    {
        await this.instance.listen({ port: FastifyApp.PORT, host: FastifyApp.HOST });
        console.log(`🚀 Backend running on port ${FastifyApp.PORT}`);
    }
}