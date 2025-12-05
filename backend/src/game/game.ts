import { FastifyApp } from "../fastify";
import type { WebSocket } from '@fastify/websocket';

export type GameState = {
    player1_position: number;
    player2_position: number;
    ball_position: { x: number; y: number; };
    ball_velocity: { x: number; y: number; };
};

export default class Game {

    public state: GameState = {
        player1_position: 0,
        player2_position: 0,
        ball_position: { x: 0, y: 0 },
        ball_velocity: { x: 0, y: 0 },
    };

    public gameId: string = Math.random().toString(36).substring(2, 10);

    public participants: Set<WebSocket> = new Set();
    
    constructor(private app: FastifyApp) {
        console.log(`Game ${this.gameId} created`);
    }

    public broadcast(message: any, expect?: WebSocket) {
        this.participants.forEach((client) => {
            if (expect !== client && client.readyState === 1) {
                client.send(JSON.stringify(message));
            }
        });
    }

    public update_game_state(state: GameState) {
        this.state = state;
        this.broadcast(JSON.stringify({ type: 'game_state_update', state: this.state }));
    }

    public add_player(connection: WebSocket) {
        this.participants.add(connection);
        this.broadcast({ type: 'message', message: `A new player has joined the game! Total players: ${this.participants.size}` }, connection);
        console.log(`Player added to the game`);
    }

    public remove_player(connection: WebSocket) {
        this.participants.delete(connection);
        this.broadcast({ type: 'message', message: `A player has left the game! Total players: ${this.participants.size}` }, connection);
        console.log(`Player removed from the game`);
    }

    public start() {
        console.log('Game started');
    }

    public stop() {
        console.log('Game stopped');
    }
}