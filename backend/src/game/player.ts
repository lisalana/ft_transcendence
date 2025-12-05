import type { WebSocket } from '@fastify/websocket';

export default class Player {
    public id: string;

    public position: { x: number; y: number } = { x: 0, y: 0 };
    public controller: WebSocket | null = null;

    constructor(id: string, public websocket: WebSocket, controller: WebSocket | null) {
        this.id = id;
        this.controller = controller;
    }
}