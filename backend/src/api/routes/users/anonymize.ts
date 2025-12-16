import { FastifyApp } from "../../../fastify";
import ApiRoute from "../../api";
import { UserModel } from "../../../database/models/user_model";

export default class AnonymizeUserRoute extends ApiRoute {
    constructor(app: FastifyApp) {
        super(app, '/api/users/me/anonymize', 'POST', async (request, reply) => {
            const userId = request.cookies.user_id;
            
            if (!userId) {
                reply.code(401).send({
                    success: false,
                    error: 'Non authentifié'
                });
                return;
            }

            const userModel = new UserModel();
            const anonymized = userModel.anonymize(parseInt(userId));
            
            if (anonymized) {
                reply.clearCookie('user_id');
                
                return {
                    success: true,
                    message: 'Compte anonymisé avec succès. Vos statistiques sont préservées.'
                };
            } else {
                reply.code(500).send({
                    success: false,
                    error: 'Erreur lors de l\'anonymisation'
                });
            }
        }, {
            description: 'GDPR: Anonymiser son compte (préserve les stats)',
            tags: ['users', 'gdpr']
        });
    }
}