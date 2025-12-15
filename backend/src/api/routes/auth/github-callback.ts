import { FastifyReply } from "fastify";
import OAuthService from "../../../auth/oauth";
import { DatabaseManager } from "../../../database/database";
import { FastifyApp } from "../../../fastify";
import ApiRoute from "../../api";
import { UserModel } from "../../../database/models/user_model";

export default class GitHubAuthCallbackRoute extends ApiRoute {
    constructor(app: FastifyApp) {
        super(app, '/api/auth/github/callback', 'GET', async (request, reply: FastifyReply) => {
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
                const github_token = await OAuthService.get_github_token(code);
                const userData = await OAuthService.get_github_userinfo(github_token);

                reply.clearCookie('oauth_state');

                const userModel = new UserModel();
                let user = userModel.findByEmail(userData.email);

                if (!user) {
                    user = userModel.create({
                        username: userData.name || userData.login,
                        email: userData.email,
                        password_hash: '',
                        access_token: github_token,
                        avatar_url: userData.avatar_url,
                    });
                    console.log('✅ New GitHub user created:', user);
                } else {
                    console.log('✅ GitHub user logged in:', user);
                }

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