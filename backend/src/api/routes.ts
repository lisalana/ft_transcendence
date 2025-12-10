import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { FastifyApp } from '../fastify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ApiRoutes {
    public static async registerAll(app: FastifyApp) {
        app.instance.log.info('Registering API routes...');
        const routesPath = path.join(__dirname, 'routes');
        const routeFiles = fs.readdirSync(routesPath);

        await Promise.all(routeFiles.map(async file => {
            const fullPath = path.join(routesPath, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                const subFiles = fs.readdirSync(fullPath);
                await Promise.all(subFiles.map(async subFile => {
                    const subFullPath = path.join(fullPath, subFile);
                    if (fs.statSync(subFullPath).isFile() && subFile.endsWith('.ts')) {
                        const { default: RouteClass } = await import(subFullPath)
                        new RouteClass(app);
                    }
                }));
            } else if (stat.isFile() && file.endsWith('.ts')) {
                const { default: RouteClass } = await import(fullPath)
                new RouteClass(app);
            }
        }));
    }
}

export class WebsocketRoutes {
    public static async registerAll(app: FastifyApp) {
        app.instance.log.info('Registering Websocket routes...');
        const routesPath = path.join(__dirname, 'websockets');
        const routeFiles = fs.readdirSync(routesPath);

        await Promise.all(routeFiles.map(async file => {
            const fullPath = path.join(routesPath, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                const subFiles = fs.readdirSync(fullPath);
                await Promise.all(subFiles.map(async subFile => {
                    const subFullPath = path.join(fullPath, subFile);
                    if (fs.statSync(subFullPath).isFile() && subFile.endsWith('.ts')) {
                        const { default: RouteClass } = await import(subFullPath)
                        new RouteClass(app);
                    }
                }));
            } else if (stat.isFile() && file.endsWith('.ts')) {
                const { default: RouteClass } = await import(fullPath)
                new RouteClass(app);
            }
        }));
    }
}

export default class ListUsersRoute extends ApiRoute {
  constructor(app: FastifyApp) {
    super(app, '/api/users', 'GET', async (request, reply) => {
      const userModel = new UserModel();
      const users = userModel.findAll();
      
      const sanitizedUsers = users.map(({ password_hash, ...user }) => user);
      
      return { success: true, users: sanitizedUsers };
    });
  }
}

