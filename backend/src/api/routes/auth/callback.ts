import { FastifyReply } from "fastify";
import OAuthService from "../../../auth/oauth";
import { DatabaseManager } from "../../../database/database";
import { FastifyApp } from "../../../fastify";
import ApiRoute from "../../api";
import { UserModel } from "../../../database/models/user_model";

export default class GoogleAuthCallbackRoute extends ApiRoute {
    constructor(app: FastifyApp) {
        super(app, '/api/auth/google/callback', 'GET', async (request, reply: FastifyReply) => {
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
                const google_token = await OAuthService.get_google_token(code);
                const userData = await OAuthService.get_google_userinfo(google_token);

                reply.clearCookie('oauth_state');

                const userModel = new UserModel();
                let user = userModel.findByEmail(userData.email);

                if (!user) {
                    user = userModel.create({
                        username: userData.name,
                        email: userData.email,
                        password_hash: '',  // Vide pour OAuth
                        access_token: google_token,
                        avatar_url: userData.picture,
                    });
                    console.log('✅ New user created:', user);
                } else {
                    console.log('✅ User logged in:', user);
                }

                // Sauvegarder l'user_id dans un cookie
                reply.setCookie('user_id', user.id!.toString(), {
                    path: '/',  
                    httpOnly: true,
                    secure: true,
                    sameSite: 'lax',
                    maxAge: 30 * 24 * 60 * 60
                });

                reply.setCookie('username', user.username, {
                    path: '/', 
                    httpOnly: false,
                    secure: true,
                    sameSite: 'lax',
                    maxAge: 30 * 24 * 60 * 60
                });

                // Envoyer une page HTML qui ferme la popup ou redirige
                return reply.type('text/html').send(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Login Success</title>
                    </head>
                    <body>
                        <script>
                            if (window.opener) {
                                window.opener.postMessage({ type: 'auth_success' }, '${process.env.FRONTEND_URL}');
                                window.close();
                            } else {
                                window.location.href = '${process.env.FRONTEND_URL}';
                            }
                        </script>
                        <p>Login successful! Redirecting...</p>
                    </body>
                    </html>
                `);
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