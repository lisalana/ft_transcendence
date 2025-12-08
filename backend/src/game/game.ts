import { FastifyApp } from "../fastify";
import type { WebSocket } from '@fastify/websocket';
import Player from "./player";
import Ball from "./ball";

export type GameState = {
    player1_position: { x: number; y: number; };
    player2_position: { x: number; y: number; };
    ball_position: { x: number; y: number; };
    ball_velocity: { x: number; y: number; };
    score: { p1: number; p2: number; };
};

export default class Game {

    public players : Player[] = [new Player(1, null), new Player(2, null)];
    public ball: Ball = new Ball();

    public state: GameState = {
        player1_position: { x: 0, y: 350 / 2 },
        player2_position: { x: 800, y: 350 / 2 },
        ball_position: { x: 800 / 2, y: 350 / 2 },
        ball_velocity: { x: 0, y: 0 },
        score: { p1: 0, p2: 0 },
    };

    private gameLoop: NodeJS.Timeout | null = null;
    private websocket: WebSocket | null = null;
    public isRunning: boolean = false; // Deprecated, use isActive
    public isActive: boolean = false;

    constructor(private app: FastifyApp, public gameId: string) {
        console.log(`Game ${this.gameId} created`);
    }

    public setWebsocket(websocket: WebSocket) {
        this.websocket = websocket;
    }

    public getWebsocket() {
        return this.websocket;
    }

    public notifyPlayerConnection(playerId: number, connected: boolean) {
        this.broadcast({ type: 'player_connection', playerId, connected });
        
        if (this.isActive) {
            if (connected) {
                // If both players are connected, resume the game
                if (this.players[0].controller && this.players[1].controller) {
                    console.log("Resuming game...");
                    this.startGameLoop();
                    this.broadcast({ type: 'game_resumed' });
                }
            } else {
                // If any player disconnects, pause the game
                console.log("Pausing game...");
                this.stopGameLoop();
                this.broadcast({ type: 'game_paused' });
            }
        }
    }

    private startGameLoop() {
        if (this.gameLoop) return;

        this.players[0].position = { x: 0, y: 350 / 2 };
        this.players[1].position = { x: 800, y: 350 / 2 };
        this.gameLoop = setInterval(() => {
            // Update players
            for (const player of this.players) {
                player.update();
            }

            // Update ball
            const scorer = this.ball.update();
            if (scorer !== 0) {
                if (scorer === 1) this.state.score.p1++;
                else if (scorer === 2) this.state.score.p2++;

                if (this.state.score.p1 >= 5 || this.state.score.p2 >= 5) {
                    this.stop();
                    this.broadcast({ type: 'game_over', winnerId: this.state.score.p1 >= 5 ? 1 : 2 });
                    return;
                } else {
                    this.ball.resetBall();
                }
            }

            // Check paddle collisions
            this.ball.checkPaddleCollision(this.players[0].position.x, this.players[0].position.y);
            this.ball.checkPaddleCollision(this.players[1].position.x - 10, this.players[1].position.y);

            // Update and broadcast game state
            this.updateGameState();
        }, 16); // 60 FPS
    }

    private stopGameLoop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }

    public broadcast(message: any) {
        if (!this.websocket) return;
        this.websocket.send(JSON.stringify(message));
    }

    private updateGameState() {
        
        this.state.player1_position = this.players[0] ? this.players[0].getPosition() : { x: 0, y: 350 / 2 };
        this.state.player2_position = this.players[1] ? this.players[1].getPosition() : { x: 800, y: 350 / 2 };
        this.state.ball_position = this.ball.getPosition();
        this.state.ball_velocity = this.ball.getVelocity();
        
        this.broadcast({ type: 'game_state_update', state: this.state });
    }

    public update_game_state(state: GameState) {
        this.state = state;
        this.updateGameState();
    }

    public destroy() {
        this.websocket?.close();
        for (const player of this.players) {
            player.controller?.close();
        }
        this.stopGameLoop();
        console.log(`Game ${this.gameId} destroyed`);
    }

    public start() {
        if (!this.isActive) {
            this.isActive = true;
            this.state.score = { p1: 0, p2: 0 }; // Reset score
            this.ball.resetBall();
            this.startGameLoop();
            console.log('Game started');
            this.broadcast({ type: 'game_started' });
        }
    }

    public stop() {
        this.isActive = false;
        console.log('Game stopped');
        this.stopGameLoop();
        this.broadcast({ type: 'game_stopped' });
    }
}