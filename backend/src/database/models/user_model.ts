import Database from 'better-sqlite3';
import { DatabaseManager } from '../database';

export interface User {
    id? : number;
    username: string;
    email: string;
    password_hash: string;
    access_token?: string;
    avatar_url?: string;
    created_at?: string;
    updated_at?: string;
}

export interface UserStats {
    user_id: number;
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
        INSERT INTO users (username, email, access_token, avatar_url)
        VALUES (?, ?, ?, ?)
    `);

    const result = statement.run(
        user.username,
        user.email,
        user.access_token || user.password_hash || '',  // Support les deux
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

    findByEmail(email: string): User | undefined {
        const statement = this.db.prepare(`SELECT * FROM users WHERE email = ?`);
        return statement.get(email) as User | undefined;
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

// on rend anonyme dans users et dans leaderboard
anonymize(userId: number): boolean {
    const user = this.findById(userId);
    if (!user) return false;
    
    const anonymizedUsername = `deleted_user_${userId}`;
    const anonymizedEmail = `deleted_${userId}@anonymized.local`;
    
    const statement = this.db.prepare(`
        UPDATE users 
        SET username = ?,
            email = ?,
            access_token = '',
            avatar_url = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `);
    statement.run(anonymizedUsername, anonymizedEmail, userId);
    
    const leaderboardStatement = this.db.prepare(`
        UPDATE leaderboard 
        SET player_name = ?
        WHERE player_name = ?
    `);
    leaderboardStatement.run(anonymizedUsername, user.username);
    
    return true;
}

deleteAccount(userId: number): boolean {
    const statement = this.db.prepare(`DELETE FROM users WHERE id = ?`);
    const result = statement.run(userId);
    return result.changes > 0;
}

exportUserData(userId : number) any {
    const user = this.findById(userId);
    if (!user)
        return null;
}

