import { FastifyApp } from "../fastify";
import type { WebSocket } from '@fastify/websocket';
import Player from "./player";
import Ball from "./ball";

export type Vector2 = { x: number; y: number; };

export type GameState = {
    players_position: Vector2[];
    ball_position: Vector2;
    ball_velocity: Vector2;
    score: number[];
};

export default class Game {

    public players : Player[] = [new Player(1, null), new Player(2, null)];
    public ball: Ball = new Ball();

    public state: GameState = {
        players_position: [{ x: 0, y: 350 / 2 }, { x: 800, y: 350 / 2 }],
        ball_position: { x: 800 / 2, y: 350 / 2 },
        ball_velocity: { x: 0, y: 0 },
        score: [0, 0],
    };

    private gameLoop: NodeJS.Timeout | null = null;
    private websocket: WebSocket | null = null;
    // public isRunning: boolean = false; // Deprecated, use isActive
    public isActive: boolean = false;

    // Optimization: Fixed Time Step Loop
    private lastFrameTime: number = 0;
    private accumulator: number = 0;
    private readonly TARGET_FPS = 75;
    private readonly TIME_STEP = 1000 / this.TARGET_FPS; // ~13.33ms
    
    // Optimization: Network Broadcast Rate Limiting
    private timeSinceLastBroadcast: number = 0;
    private readonly NETWORK_FPS = 30; // Send updates 30 times per second
    private readonly NETWORK_TICK = 1000 / this.NETWORK_FPS; // ~33.33ms

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

        // Reset positions
        this.players[0].position = { x: 0, y: 350 / 2 };
        this.players[1].position = { x: 800, y: 350 / 2 };
        
        // Initialize timing variables
        this.lastFrameTime = performance.now();
        this.accumulator = 0;
        this.timeSinceLastBroadcast = 0;

        // Use setInterval as the driver, but the logic inside handles the precision
        // Running slightly faster than TARGET_FPS ensures we don't fall behind
        this.gameLoop = setInterval(() => {
            this.tick();
        }, 1000 / this.TARGET_FPS); 
    }

    private tick() {
        const now = performance.now();
        const deltaTime = now - this.lastFrameTime;
        this.lastFrameTime = now;

        this.accumulator += deltaTime;

        if (this.accumulator > 200) {
            this.accumulator = 200;
        }

        while (this.accumulator >= this.TIME_STEP) {
            this.updatePhysics();
            this.accumulator -= this.TIME_STEP;
        }

        this.timeSinceLastBroadcast += deltaTime;
        if (this.timeSinceLastBroadcast >= this.NETWORK_TICK) {
            this.updateGameState();
            this.timeSinceLastBroadcast = 0;
        }
    }

    private updatePhysics() {
        for (const player of this.players) {
            player.update();
        }

        const scorer = this.ball.update();
        if (scorer !== 0) {
            if (scorer === 1) this.state.score[0]++;
            else if (scorer === 2) this.state.score[1]++;

            if (this.state.score[0] >= 5 || this.state.score[1] >= 5) {
                this.stop();
                this.broadcast({ type: 'game_over', winnerId: this.state.score[0] >= 5 ? 1 : 2 });
                return;
            } else {
                this.ball.resetBall();
            }
        }

        this.ball.checkPaddleCollision(this.players[0].position.x, this.players[0].position.y);
        this.ball.checkPaddleCollision(this.players[1].position.x - 10, this.players[1].position.y);
    }

    private stopGameLoop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }

    public broadcast(message: any) {
        if (!this.websocket) return;
        if (this.websocket.readyState === 1) {
            this.websocket.send(JSON.stringify(message));
        }
    }

    private updateGameState() {
        
        this.state.players_position[0] = this.players[0] ? this.players[0].getPosition() : { x: 0, y: 350 / 2 };
        this.state.players_position[1] = this.players[1] ? this.players[1].getPosition() : { x: 800, y: 350 / 2 };
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
            this.state.score = [0, 0];
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