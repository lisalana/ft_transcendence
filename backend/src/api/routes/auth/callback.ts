
import { FastifyReply } from "fastify";
import OAuthService from "../../../auth/oauth";
import { DatabaseManager } from "../../../database/database";
import { FastifyApp } from "../../../fastify";
import ApiRoute from "../../api";
import { UserModel } from "../database/models/user_model";

export default class GoogleAuthCallbackRoute extends ApiRoute {
    constructor(app: FastifyApp) {
        super(app, '/api/auth/google/callback', 'GET', async (request, reply : FastifyReply) => {
            const { code, state } = request.query as { code?: string; state?: string };

            const storedState = request.cookies.oauth_state;
            if (storedState !== state) {
                return reply.status(401).send({
                    status: 'error',
                    message: 'Invalid state parameter',
                    timestamp: new Date().toISOString(),
                });
            }

            if (!code) {
                return reply.status(400).send({
                    status: 'error',
                    message: 'Missing authorization code',
                    timestamp: new Date().toISOString(),
                });
            }

            try {
                // Échange le code contre un access token
                const google_token = await OAuthService.get_google_token(code);
                const userData = await OAuthService.get_google_userinfo(google_token);

                // Supprime le cookie oauth_state (sécurité)
                reply.clearCookie('oauth_state');

                const userModel = new UserModel();

                const db_user = userModel.findByEmail(userData.email);
                if (!db_user) {
                    const newUser = userModel.create({
                        username: userData.name,
                        email: userData.email,
                        access_token: google_token,
                        avatar_url: userData.picture,
                    });
                    console.log('✅ New user created:', newUser);
                }

                reply.redirect(`${process.env.FRONTEND_URL}`);
            } catch (error) {
                return reply.status(500).send({
                    status: 'error',
                    message: error instanceof Error ? error.message : 'Authentication failed',
                    timestamp: new Date().toISOString(),
                });
            }
        });
    }
}