import Fastify from 'fastify';
import cors from '@fastify/cors';
import staticPlugin from '@fastify/static';
import websocketPlugin from '@fastify/websocket';
import { ApiRoutes, WebsocketRoutes } from './api/routes';
import path from 'path';
import { fileURLToPath } from 'url';
import Game from './game/game';
import { GamesManager } from './game/games.manager';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class FastifyApp {

    public static readonly PORT = 4000;
    public static readonly HOST = '0.0.0.0';

    public current_games: Map<string, Game> = new Map();

    public games_manager: GamesManager = new GamesManager();

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
        
        await ApiRoutes.registerAll(this);
        await WebsocketRoutes.registerAll(this);
    }

    async listen()
    {
        await this.instance.listen({ port: FastifyApp.PORT, host: FastifyApp.HOST });
        console.log(`🚀 Backend running on port ${FastifyApp.PORT}`);
    }
}