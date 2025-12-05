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
                
                console.log(`Client connected to game ${gameId}`);
                connection.send(`Connected to the game ${gameId} WebSocket server!`);
                
                game.add_player(connection);

                // Gérer les messages
                connection.on('message', (message: any) => {
                    const text = message.toString();
                    console.log(`Game ${gameId} received:`, text);
                    
                    // Envoyer à tous les participants
                    game.broadcast({ type: 'message', message: `Echo: ${text}` }, connection);
                });

                // Gérer la déconnexion
                connection.on('close', () => {
                    game.remove_player(connection);
                    console.log(`Client disconnected from game ${gameId}`);
                    
                    // Supprimer la partie si plus de participants
                    if (!game.player1 && !game.player2) {
                        console.log(`Game ${gameId} has no more participants. Cleaning up.`);
                        this.current_games.delete(gameId);
                    }
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

                if (game.player1 && playerId == 1 && game.player1.controller) {
                    console.log(`Player 1 controller already connected to game ${gameId}`);
                    connection.close(1008, 'Player 1 controller already connected');
                    return;
                }
                if (game.player2 && playerId == 2 && game.player2.controller) {
                    console.log(`Player 2 controller already connected to game ${gameId}`);
                    connection.close(1008, 'Player 2 controller already connected');
                    return;
                }
                
                if (playerId == 1 && game.player1)
                {
                    game.player1.controller = connection;
                }
                else if (playerId == 2 && game.player2)
                {
                    game.player2.controller = connection;
                }

                console.log(`Client controller connected to game ${gameId}`);
                connection.send(`Connected to the game ${gameId} WebSocket server!`);

                connection.on('message', (message: any) => {
                    const data = JSON.parse(message.toString());
                    if (data.type === 'controller')
                    {
                        game.broadcast({ type: 'message', message: `Player ${playerId} command: ${data.command}`});
                    }
                });

                connection.on('close', () => {
                    if (playerId == 1 && game.player1)
                    {
                        game.player1.controller = null;
                    }
                    else if (playerId == 2 && game.player2)
                    {
                        game.player2.controller = null;
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