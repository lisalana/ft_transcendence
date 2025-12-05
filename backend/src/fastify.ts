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
                    game.participants.forEach(participant => {
                        if (participant.readyState === 1) { // OPEN
                            participant.send(`Echo: ${text}`);
                        }
                    });
                });

                // Gérer la déconnexion
                connection.on('close', () => {
                    game.remove_player(connection);
                    console.log(`Client disconnected from game ${gameId}`);
                    
                    // Supprimer la partie si plus de participants
                    if (game.participants.size === 0) {
                        console.log(`Game ${gameId} has no more participants. Cleaning up.`);
                        this.current_games.delete(gameId);
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