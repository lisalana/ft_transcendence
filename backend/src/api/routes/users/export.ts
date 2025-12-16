import { FastifyApp } from "../../../fastify";
import ApiRoute from "../../api";
import { UserModel } from "../../../database/models/user_model";

export default class ExportUserDataRoute extends ApiRoute {
    constructor(app: FastifyApp) {
        super(app, '/api/users/me/export', 'GET', async (request, reply) => {
            const userId = request.cookies.user_id;
            
            if (!userId) {
                reply.code(401).send({
                    success: false,
                    error: 'Non authentifié'
                });
                return;
            }

            const userModel = new UserModel();
            const userData = userModel.exportUserData(parseInt(userId));
            
            if (!userData) {
                reply.code(404).send({
                    success: false,
                    error: 'Utilisateur non trouvé'
                });
                return;
            }

            reply.header('Content-Disposition', `attachment; filename="user_data_${userId}.json"`);
            reply.header('Content-Type', 'application/json');
            
            return userData;
        }, {
            description: 'GDPR: Exporter toutes ses données personnelles',
            tags: ['users', 'gdpr']
        });
    }
}