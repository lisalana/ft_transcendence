import { FastifyApp } from "../fastify";
import type { WebSocket } from '@fastify/websocket';
import Player from "./player";

export type GameState = {
    ball_position: { x: number; y: number; };
    ball_velocity: { x: number; y: number; };
};

export default class Game {

    public player1: Player | null = null;
    public player2: Player | null = null;

    public state: GameState = {
        ball_position: { x: 0, y: 0 },
        ball_velocity: { x: 0, y: 0 },
    };

    public gameId: string = Math.random().toString(36).substring(2, 10);
    
    constructor(private app: FastifyApp) {
        console.log(`Game ${this.gameId} created`);
    }

    public broadcast(message: any, expect?: WebSocket) {
        if (expect == this.player1?.websocket)
        {
            this.player2?.websocket.send(JSON.stringify(message));
        } else if (expect == this.player2?.websocket) {
            this.player1?.websocket.send(JSON.stringify(message));
        }
    }

    public update_game_state(state: GameState) {
        this.state = state;
        this.broadcast(JSON.stringify({ type: 'game_state_update', state: this.state }));
    }

    public add_player(connection: WebSocket) {
        if (!this.player1) {
            this.player1 = new Player('player1', connection, null);
            this.player1.websocket.send(JSON.stringify({ type: 'set_player_id', playerId: 1}));
        } else if (!this.player2) {
            this.player2 = new Player('player2', connection, null);
            this.player2.websocket.send(JSON.stringify({ type: 'set_player_id', playerId: 2}));
        } else {
            console.log('Game is full, cannot add more players');
            connection.close(1008, 'Game is full');
            return;
        }
        this.broadcast({ type: 'message', message: `A new player has joined the game!` }, connection);
        console.log(`Player added to the game`);
    }

    public remove_player(connection: WebSocket) {
        if (this.player1 && this.player1.websocket === connection) {
            this.player1 = null;
        } else if (this.player2 && this.player2.websocket === connection) {
            this.player2 = null;
        }
        this.broadcast({ type: 'message', message: `A player has left the game!` }, connection);
    }

    public start() {
        console.log('Game started');
    }

    public stop() {
        console.log('Game stopped');
    }
}