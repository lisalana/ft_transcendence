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

export abstract class Game {

    public players : Player[] = [];
    public ball: Ball = new Ball();

    public state: GameState = {
        players_position: [],
        ball_position: { x: 0, y: 0 },
        ball_velocity: { x: 0, y: 0 },
        score: [],
    };

    protected gameLoop: NodeJS.Timeout | null = null;
    protected websocket: WebSocket | null = null;
    public isActive: boolean = false;

    // Optimization: Fixed Time Step Loop
    protected lastFrameTime: number = 0;
    protected accumulator: number = 0;
    protected readonly TARGET_FPS = 60;
    protected readonly TIME_STEP = 1000 / this.TARGET_FPS; 
    
    // Optimization: Network Broadcast Rate Limiting
    protected timeSinceLastBroadcast: number = 0;
    protected readonly NETWORK_FPS = 30; 
    protected readonly NETWORK_TICK = 1000 / this.NETWORK_FPS;

    constructor(protected app: FastifyApp, public gameId: string) {
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
                // If all players with controllers are connected, resume the game
                const allConnected = this.players.every(p => p.controller);
                if (allConnected) {
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

    public broadcast(message: any) {
        if (!this.websocket) return;
        if (this.websocket.readyState === 1) {
            this.websocket.send(JSON.stringify(message));
        }
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
            this.initializeGame();
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

    protected startGameLoop() {
        if (this.gameLoop) return;

        this.lastFrameTime = performance.now();
        this.accumulator = 0;
        this.timeSinceLastBroadcast = 0;

        this.gameLoop = setInterval(() => {
            this.tick();
        }, 1000 / this.TARGET_FPS); 
    }

    protected stopGameLoop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }

    protected tick() {
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

    protected updateGameState() {
        this.state.ball_position = this.ball.getPosition();
        this.state.ball_velocity = this.ball.getVelocity();
        // Players position updates are handled by concrete classes or general logic if uniform
        for (let i = 0; i < this.players.length; i++) {
             if (this.players[i]) {
                 this.state.players_position[i] = this.players[i].getPosition();
             }
        }
        
        this.broadcast({ type: 'game_state_update', state: this.state });
    }

    protected updatePhysics() {
        // Update players
        for (const player of this.players) {
            player.update();
        }

        // Update ball
        const scorer = this.ball.update();
        if (scorer !== 0) {
            // Only score if someone touched the ball
            if (this.ball.lastTouchedBy !== null) {
                if (scorer === 1) this.state.score[0]++;
                else if (scorer === 2) this.state.score[1]++;

                if (this.state.score[0] >= 5 || this.state.score[1] >= 5) {
                    this.stop();
                    this.broadcast({ type: 'game_over', winnerId: this.state.score[0] >= 5 ? 1 : 2 });
                    return;
                }
            }
            this.ball.resetBall();
        }

        // Check paddle collisions - generic for 2 players for now, can be overridden
        if (this.players.length >= 2) {
             this.ball.checkPaddleCollision(this.players[0].position.x, this.players[0].position.y, 1);
             this.ball.checkPaddleCollision(this.players[1].position.x - 10, this.players[1].position.y, 2);
        }
    }

    // Abstract methods to be implemented by specific game types
    protected abstract initializeGame(): void;
}

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

export class ThreePlayersGame extends Game {
    constructor(app: FastifyApp, gameId: string) {
        super(app, gameId);
        this.players = [new Player(1, null), new Player(2, null), new Player(3, null)];
        this.state.players_position = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }];
        this.state.score = [0, 0, 0];
    }

    protected initializeGame() {
        this.state.score = [0, 0, 0];
        this.ball.resetBall(); 
        this.players[0].position = { x: 0, y: 800 / 2 - 25 }; // Left, Centered in 800h
        this.players[1].position = { x: 800, y: 800 / 2 - 25 }; // Right
        this.players[2].position = { x: 800 / 2 - 25, y: 0 }; // Top
        
        // Manual override for ball reset to center of 800x800
        this.ball.position = { x: 400, y: 400 };
    }
    
    protected updatePhysics() {
        // Custom physics loop for 3 players (Squared 800x800)
        
        for (const player of this.players) {
            // Pass 750 as maxY override for P1/P2 on 800h map
            player.update(750);
        }

        // Custom Ball Update for Square Map
        
        const ball = this.ball;
        ball.position.x += ball.velocity.x;
        ball.position.y += ball.velocity.y;

        // Wall Collisions
        // P3 is Top (y=0). P4 is Bottom (y=800).
        // 3-Player: Bottom is Wall. Top is P3.
        
        // Bottom Wall (Bounce) - In 3 player game, bottom is a safe wall
        if (ball.position.y + 7 >= 800) {
            ball.velocity.y = -ball.velocity.y;
            ball.position.y = 793;
        }
        
        // Scoring Logic
        let missedPlayerId = -1;

        // Top (P3 Missed)
        if (ball.position.y < 0) {
             if (this.ball.lastTouchedBy === null) {
                 ball.velocity.y = -ball.velocity.y;
                 ball.position.y = 7;
             } else {
                 missedPlayerId = 3;
             }
        }
        // Left (P1 Missed)
        else if (ball.position.x < 0) { 
             if (this.ball.lastTouchedBy === null) {
                 ball.velocity.x = -ball.velocity.x;
                 ball.position.x = 7;
             } else {
                 missedPlayerId = 1;
             }
        } 
        // Right (P2 Missed)
        else if (ball.position.x > 800) { 
             if (this.ball.lastTouchedBy === null) {
                 ball.velocity.x = -ball.velocity.x;
                 ball.position.x = 793;
             } else {
                 missedPlayerId = 2;
             }
        }

        if (missedPlayerId !== -1) {
            // Only score if someone touched the ball
            if (this.ball.lastTouchedBy !== null) {
                // Score goes to the last player who touched the ball
                const scorerIndex = this.ball.lastTouchedBy - 1;
                if (scorerIndex >= 0 && scorerIndex < 3) {
                    this.state.score[scorerIndex]++;
                }
                
                // Check Win Condition
                const maxScore = Math.max(...this.state.score);
                if (maxScore >= 5) {
                     // Winner is the one with max score
                     const winnerIndex = this.state.score.indexOf(maxScore);
                     this.stop();
                     this.broadcast({ type: 'game_over', winnerId: winnerIndex + 1 });
                     return;
                }
            }

            this.ball.position = { x: 400, y: 400 };
            // Reset velocity with some randomness? For now keep momentum or simple reset
            this.ball.resetBall(); 
        }

        // Paddles
        // P1 (Left)
        this.ball.checkPaddleCollision(this.players[0].position.x, this.players[0].position.y, 1);
        // P2 (Right)
        this.ball.checkPaddleCollision(this.players[1].position.x - 10, this.players[1].position.y, 2);
        
        // P3 (Top - Horizontal)
        const p3 = this.players[2];
        // Ball: x, y, radius 7. Paddle: x, y, w=50, h=10.
        // AABB
        if (ball.position.y - 7 <= p3.position.y + 10 && 
            ball.position.y + 7 >= p3.position.y &&
            ball.position.x + 7 >= p3.position.x &&
            ball.position.x - 7 <= p3.position.x + 50) {
             
             this.ball.lastTouchedBy = 3;
             ball.velocity.y = -ball.velocity.y * 1.05;
             ball.position.y = p3.position.y + 10 + 7;
        }
    }
}

export class FourPlayersGame extends Game {
    constructor(app: FastifyApp, gameId: string) {
        super(app, gameId);
        this.players = [
            new Player(1, null), 
            new Player(2, null), 
            new Player(3, null), 
            new Player(4, null)
        ];
        this.state.players_position = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }];
        this.state.score = [0, 0, 0, 0];
    }

    protected initializeGame() {
        this.state.score = [0, 0, 0, 0];
        this.ball.resetBall();
        this.players[0].position = { x: 0, y: 800 / 2 - 25 }; // Left
        this.players[1].position = { x: 800, y: 800 / 2 - 25 }; // Right
        this.players[2].position = { x: 800 / 2 - 25, y: 0 }; // Top
        this.players[3].position = { x: 800 / 2 - 25, y: 800 }; // Bottom
        
        this.ball.position = { x: 400, y: 400 };
    }
    
    protected updatePhysics() {
        for (const player of this.players) {
            player.update(750);
        }
        
        const ball = this.ball;
        ball.position.x += ball.velocity.x;
        ball.position.y += ball.velocity.y;
        
        let missedPlayerId = -1;

        if (ball.position.x < 0) {
            if (this.ball.lastTouchedBy === null) {
                ball.velocity.x = -ball.velocity.x;
                ball.position.x = 7;
            } else {
                missedPlayerId = 1;
            }
        }      
        else if (ball.position.x > 800) {
            if (this.ball.lastTouchedBy === null) {
                ball.velocity.x = -ball.velocity.x;
                ball.position.x = 793;
            } else {
                missedPlayerId = 2;
            }
        } 
        else if (ball.position.y < 0) {
            if (this.ball.lastTouchedBy === null) {
                ball.velocity.y = -ball.velocity.y;
                ball.position.y = 7;
            } else {
                missedPlayerId = 3;
            }
        }   
        else if (ball.position.y > 800) {
            if (this.ball.lastTouchedBy === null) {
                ball.velocity.y = -ball.velocity.y;
                ball.position.y = 793;
            } else {
                missedPlayerId = 4;
            }
        } 

        if (missedPlayerId !== -1) {
            // Only score if someone touched the ball
            if (this.ball.lastTouchedBy !== null) {
                // Score goes to the last player who touched the ball
                const scorerIndex = this.ball.lastTouchedBy - 1;
                if (scorerIndex >= 0 && scorerIndex < 4) {
                    this.state.score[scorerIndex]++;
                }
                
                // Check Win Condition
                const maxScore = Math.max(...this.state.score);
                if (maxScore >= 5) {
                     const winnerIndex = this.state.score.indexOf(maxScore);
                     this.stop();
                     this.broadcast({ type: 'game_over', winnerId: winnerIndex + 1 });
                     return;
                }
            }

            this.ball.position = { x: 400, y: 400 };
            this.ball.resetBall(); 
        }

        // P1 & P2
        this.ball.checkPaddleCollision(this.players[0].position.x, this.players[0].position.y, 1);
        this.ball.checkPaddleCollision(this.players[1].position.x - 10, this.players[1].position.y, 2);
        
        // P3 (Top)
        const p3 = this.players[2];
        if (ball.position.y - 7 <= p3.position.y + 10 && 
            ball.position.y + 7 >= p3.position.y &&
            ball.position.x + 7 >= p3.position.x &&
            ball.position.x - 7 <= p3.position.x + 50) {
             
             this.ball.lastTouchedBy = 3;
             ball.velocity.y = -ball.velocity.y * 1.05;
             ball.position.y = p3.position.y + 10 + 7;
        }
        
        // P4 (Bottom)
        const p4 = this.players[3];
        if (ball.position.y + 7 >= p4.position.y && 
            ball.position.y - 7 <= p4.position.y + 10 &&
            ball.position.x + 7 >= p4.position.x &&
            ball.position.x - 7 <= p4.position.x + 50) {
             
             this.ball.lastTouchedBy = 4;
             ball.velocity.y = -ball.velocity.y * 1.05;
             ball.position.y = p4.position.y - 7;
        }
    }
}