import { FastifyApp } from "../../fastify";
import Player from "../player";
import { Game, GameSettings } from "../game";

export class TwoPlayersGame extends Game {
    // MODIFIER LE CONSTRUCTEUR pour accepter settings
    constructor(app: FastifyApp, gameId: string, settings?: GameSettings) {
        super(app, gameId, settings);  // ← PASSER settings au parent
        
        this.players = [new Player(1, null), new Player(2, null)];
        this.state.players_position = [{ x: 0, y: 0 }, { x: 0, y: 0 }];
        this.state.score = [0, 0];
    }

    protected initializeGame() {
        this.state.score = [0, 0];
        
        // APPLIQUER LA VITESSE DE LA BALLE selon settings
        this.ball.resetBall(this.settings.ballSpeed);
        
        this.players[0].position = { x: 0, y: 350 / 2 };
        this.players[1].position = { x: 800, y: 350 / 2 };
    }
}