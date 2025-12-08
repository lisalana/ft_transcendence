import Game from "./game";

export class GamesManager {
    private instances: Map<string, Game> = new Map();

    public createGame(app: any, gameId: string): Game {
        const game = new Game(app, gameId);
        this.instances.set(gameId, game);
        return game;
    }

    public getGame(gameId: string): Game | undefined {
        return this.instances.get(gameId);
    }

    public deleteGame(gameId: string): boolean {
        this.instances.get(gameId)?.destroy();
        return this.instances.delete(gameId);
    }
}