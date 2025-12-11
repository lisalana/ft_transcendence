import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DatabaseManager {
  private db: Database.Database;
  private static instance: DatabaseManager;

  private constructor() {
    const dbPath = path.join(__dirname, '../../data/transcendence.db');
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.initializeTables();
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private initializeTables(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        avatar_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_stats (
        user_id INTEGER PRIMARY KEY,
        games_played INTEGER DEFAULT 0,
        games_won INTEGER DEFAULT 0,
        games_lost INTEGER DEFAULT 0,
        total_score INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Database tables initialized');
  }

  public getDatabase(): Database.Database {
    return this.db;
  }

  public close(): void {
    this.db.close();
  }
}