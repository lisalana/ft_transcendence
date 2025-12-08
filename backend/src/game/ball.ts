import { Vector2 } from "./game";

export default class Ball {
    public position: Vector2 = { x: 400, y: 175 };
    public velocity: Vector2 = { x: 5, y: 3 };
    
    private readonly CANVAS_WIDTH = 800;
    private readonly CANVAS_HEIGHT = 400;
    private readonly BALL_RADIUS = 7;
    private readonly PADDLE_WIDTH = 10;
    private readonly PADDLE_HEIGHT = 50;
    private readonly MAX_VELOCITY_Y = 5;

    public lastTouchedBy: number | null = null;

    constructor() {
        this.resetBall();
    }

    public update(): number {
        // Update position
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Top and bottom wall collision (Standard 400px height logic)
        // Note: 3/4 player modes use custom logic in their Game class, so this is safe for 2-player default.
        if (this.position.y - this.BALL_RADIUS <= 0 || this.position.y + this.BALL_RADIUS >= this.CANVAS_HEIGHT) {
            this.velocity.y = -this.velocity.y;
            this.position.y = Math.max(this.BALL_RADIUS, Math.min(this.CANVAS_HEIGHT - this.BALL_RADIUS, this.position.y));
        }

        // Check for scoring
        if (this.position.x < 0) {
            // If nobody touched it yet, bounce instead of score
            if (this.lastTouchedBy === null) {
                this.velocity.x = -this.velocity.x;
                this.position.x = this.BALL_RADIUS;
                return 0;
            }
            return 2; // Player 2 scored (Ball went Left)
        } else if (this.position.x > this.CANVAS_WIDTH) {
            // If nobody touched it yet, bounce instead of score
            if (this.lastTouchedBy === null) {
                this.velocity.x = -this.velocity.x;
                this.position.x = this.CANVAS_WIDTH - this.BALL_RADIUS;
                return 0;
            }
            return 1; // Player 1 scored (Ball went Right)
        }
        
        return 0;
    }

    public checkPaddleCollision(paddleX: number, paddleY: number, playerId: number = 0): boolean {
        // Check if ball collides with paddle
        const ballLeft = this.position.x - this.BALL_RADIUS;
        const ballRight = this.position.x + this.BALL_RADIUS;
        const ballTop = this.position.y - this.BALL_RADIUS;
        const ballBottom = this.position.y + this.BALL_RADIUS;

        const paddleLeft = paddleX;
        const paddleRight = paddleX + this.PADDLE_WIDTH;
        const paddleTop = paddleY;
        const paddleBottom = paddleY + this.PADDLE_HEIGHT;

        // AABB collision detection
        if (ballLeft <= paddleRight && ballRight >= paddleLeft &&
            ballTop <= paddleBottom && ballBottom >= paddleTop) {
            
            this.lastTouchedBy = playerId;

            // Bounce ball away from paddle
            this.velocity.x = -this.velocity.x * 1.05; // Slightly increase speed
            
            // Add some spin based on where it hits the paddle
            const hitPosition = (this.position.y - paddleY) / this.PADDLE_HEIGHT; // 0 to 1
            const spin = (hitPosition - 0.5) * this.MAX_VELOCITY_Y; // -4 to +4
            this.velocity.y += spin;

            // Clamp velocity
            this.velocity.y = Math.max(-this.MAX_VELOCITY_Y, Math.min(this.MAX_VELOCITY_Y, this.velocity.y));

            // Push ball away from paddle to prevent multiple collisions
            if (paddleX < this.CANVAS_WIDTH / 2) {
                this.position.x = paddleRight + this.BALL_RADIUS;
            } else {
                this.position.x = paddleLeft - this.BALL_RADIUS;
            }

            return true;
        }

        return false;
    }

    public resetBall() {
        this.lastTouchedBy = null;
        this.position = { x: this.CANVAS_WIDTH / 2, y: this.CANVAS_HEIGHT / 2 };
        this.velocity = { 
            x: (Math.random() > 0.5 ? 1 : -1) * 5,
            y: (Math.random() - 0.5) * 4
        };
    }

    public getPosition() {
        return this.position;
    }

    public getVelocity() {
        return this.velocity;
    }
}
