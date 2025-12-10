import { FastifyApp } from "../../../fastify";
import ApiRoute from "../../api";

export default class DatabaseRoute extends ApiRoute {
    constructor(app: FastifyApp) {
        super(app, '/api/database', 'GET', async (request, reply) => {
            // request.log.info('Database route accessed');
        });
    }
}