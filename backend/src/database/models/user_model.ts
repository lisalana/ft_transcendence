import Database from 'better-sqlite3';
import { DatabaseManager } from '../database';

export interface User {
    id? : number; //string pour hash id  ? 
    username: string;
    email: string;
    password_hash: string;
    avatar_url?: string;
    created_at?: string;
    updated_at?: string;
}

export interface UserStats {
    user_id: number; //string pour hash id  ? 
    games_played: number;
    games_won: number;
    games_lost: number;
    total_score: number; // chaque partie gagnée rapporte des points au user ? Vous en pensez quoi ? 
}

export class UserModel {
    private db: Database.Database;

    constructor() {
    this.db = DatabaseManager.getInstance().getDatabase();
    }

    create(user: User): User {
        const statement = this.db.prepare(`
            INSERT INTO users (username, email, password_hash, avatar_url)
            VALUES (?, ?, ?, ?)
            `);

    const result = statement.run(
        user.username,
        user.email,
        user.password_hash,
        user.avatar_url || null,
    );

    const statsStatement = this.db.prepare(`
        INSERT INTO user_stats (user_id) VALUES (?)
        `);
    statsStatement.run(result.lastInsertRowid);

    return this.findById(result.lastInsertRowid as number)!;
    }

    findById(id: number): User | undefined {
        const statement = this.db.prepare(`SELECT * FROM users WHERE id = ?`);
        return statement.get(id) as User | undefined;
    }

    findByUsername(username: string): User | undefined {
        const statement = this.db.prepare(`SELECT * FROM users WHERE username = ?`);
        return statement.get(username) as User | undefined;
    }

    findAll(): User[] {
        const statement = this.db.prepare(`SELECT * FROM users ORDER BY created_at DESC`);
        return statement.all() as User[];
    }

    getStats(userId: number): UserStats | undefined {
        const statement = this.db.prepare(`SELECT * FROM user_stats WHERE user_id = ?`);
        return statement.get(userId) as UserStats | undefined;
    }
}