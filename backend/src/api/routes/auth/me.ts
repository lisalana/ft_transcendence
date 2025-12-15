import { FastifyReply } from "fastify";
import { FastifyApp } from "../../../fastify";
import ApiRoute from "../../api";
import { UserModel } from "../../../database/models/user_model";

export default class MeRoute extends ApiRoute {
    constructor(app: FastifyApp) {
        super(app, '/api/auth/me', 'GET', async (request, reply: FastifyReply) => {
            const userId = request.cookies.user_id;
            
            if (!userId) {
                return {
                    success: false,
                    authenticated: false
                };
            }

            const userModel = new UserModel();
            const user = userModel.findById(parseInt(userId));

            if (!user) {
                return {
                    success: false,
                    authenticated: false
                };
            }

            const { password_hash, access_token, ...sanitizedUser } = user;
            return {
                success: true,
                authenticated: true,
                user: sanitizedUser
            };
        }, {
            description: 'Get current authenticated user',
            tags: ['auth']
        });
    }
}