import { HTTPMethods } from "fastify";
import { FastifyApp } from "../fastify";

export default class ApiRoute
{
    constructor(app: FastifyApp, path: string, method: HTTPMethods | HTTPMethods[], callback: (request: any, reply: any) => Promise<any>)
    {
        app.instance.log.info(`Registering route [${method}] ${path}`);
        app.instance.route({
            method: method,
            url: path,
            handler: async (request, reply) => {
                return callback(request, reply);
            },
        });
    }
}