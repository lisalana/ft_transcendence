import { FastifyApp } from "../../fastify";
import Player from "../player";
import { Game } from "../game";

export class TwoPlayersGame extends Game {

    constructor(app: FastifyApp, gameId: string) {
        super(app, gameId);
        this.players = [new Player(1, null), new Player(2, null)];
        this.state.players_position = [{ x: 0, y: 0 }, { x: 0, y: 0 }];
        this.state.score = [0, 0];
    }

    protected initializeGame() {
        this.state.score = [0, 0];
        this.ball.resetBall();
        this.players[0].position = { x: 0, y: 350 / 2 };
        this.players[1].position = { x: 800, y: 350 / 2 };
    }
}
