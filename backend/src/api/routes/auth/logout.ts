import { FastifyReply } from "fastify";
import { FastifyApp } from "../../../fastify";
import ApiRoute from "../../api";

export default class LogoutRoute extends ApiRoute {
    constructor(app: FastifyApp) {
        super(app, '/api/auth/logout', 'GET', async (request, reply: FastifyReply) => {
            // Supprimer les cookies
            reply.clearCookie('user_id', { path: '/' });
            reply.clearCookie('username', { path: '/' });
            reply.clearCookie('oauth_state', { path: '/' });

            // Rediriger vers la homepage
            return reply.type('text/html').send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Logged Out</title>
                </head>
                <body>
                    <script>
                        window.location.href = '${process.env.FRONTEND_URL}';
                    </script>
                    <p>Logging out...</p>
                </body>
                </html>
            `);
        });
    }
}