import { HTTPMethods } from "fastify";
import { FastifyApp } from "../fastify";

export default class WebsocketRoute
{
    constructor(app: FastifyApp, path: string, callback: (connection: any, reply: any) => Promise<any>)
    {
        app.instance.log.info(`Registering route [GET] ${path}`);
        app.instance.route({
            method: 'GET',
            url: path,
            websocket: true,
            handler: async (connection, reply) => {
                return callback(connection, reply);
            },
        });
    }
}