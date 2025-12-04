import Fastify from 'fastify';
import cors from '@fastify/cors';
import { ApiRoutes } from './api/routes';


export class FastifyApp {

    public static readonly PORT = 4000;
    public static readonly HOST = '0.0.0.0';

    public instance =  Fastify({ 
      logger: true 
    });

    constructor ()
    {
    }

    async initialize()
    {
        await this.instance.register(cors, {
            origin: true
        });
        await ApiRoutes.registerAll(this);
    }

    async listen()
    {
        await this.instance.listen({ port: FastifyApp.PORT, host: FastifyApp.HOST });
        console.log(`🚀 Backend running on port ${FastifyApp.PORT}`);
    }
}