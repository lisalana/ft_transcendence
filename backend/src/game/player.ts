import type { WebSocket } from '@fastify/websocket';

export default class Player {
    public position: { x: number; y: number } = { x: 0, y: 0 };
    public controller: WebSocket | null = null;
    public direction: 'up' | 'down' | 'stop' = 'stop';

    constructor(public id: number, controller: WebSocket | null) {
        this.id = id;
        this.controller = controller;
    }

    public getPosition() {
        return this.position;
    }

    public setDirection(direction: 'up' | 'down' | 'stop') {
        this.direction = direction;
    }

    public update() {
        const speed = 5;
        const minY = 0;
        const maxY = 350;

        if (this.direction === 'up') {
            this.position.y = Math.max(minY, this.position.y - speed);
        } else if (this.direction === 'down') {
            this.position.y = Math.min(maxY, this.position.y + speed);
        }
    }
}