import initSqlJs, { Database } from "sql.js";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "syncrofeed.sqlite");

let sqlJsPromise: ReturnType<typeof initSqlJs> | null = null;
let dbPromise: Promise<Database> | null = null;

function getSqlJs() {
  if (!sqlJsPromise) {
    sqlJsPromise = initSqlJs({
      locateFile: (file) => path.join(process.cwd(), "node_modules", "sql.js", "dist", file),
    });
  }
  return sqlJsPromise;
}

function ensureSchema(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS feeds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      site_url TEXT,
      description TEXT,
      icon_url TEXT,
      last_fetched_at INTEGER,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      feed_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      content TEXT,
      summary TEXT,
      author TEXT,
      published_at INTEGER,
      read INTEGER NOT NULL DEFAULT 0,
      starred INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      FOREIGN KEY(feed_id) REFERENCES feeds(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS collection_feeds (
      collection_id INTEGER NOT NULL,
      feed_id INTEGER NOT NULL,
      PRIMARY KEY (collection_id, feed_id),
      FOREIGN KEY(collection_id) REFERENCES collections(id) ON DELETE CASCADE,
      FOREIGN KEY(feed_id) REFERENCES feeds(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_articles_feed_id ON articles(feed_id);
    CREATE INDEX IF NOT EXISTS idx_articles_read ON articles(read);
    CREATE INDEX IF NOT EXISTS idx_articles_starred ON articles(starred);
  `);
}

export async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      if (!fsSync.existsSync(DATA_DIR)) fsSync.mkdirSync(DATA_DIR, { recursive: true });
      const SQL = await getSqlJs();
      let db: Database;
      if (fsSync.existsSync(DB_PATH)) {
        const fileBuffer = await fs.readFile(DB_PATH);
        db = new SQL.Database(fileBuffer);
      } else {
        db = new SQL.Database();
      }
      db.run("PRAGMA foreign_keys = ON;");
      ensureSchema(db);
      return db;
    })();
  }
  return dbPromise;
}

export async function persistDb() {
  const db = await getDb();
  const data = db.export();
  await fs.writeFile(DB_PATH, Buffer.from(data));
}

export function rowToObject(stmt: any) {
  const row = stmt.getAsObject();
  return Object.fromEntries(Object.entries(row));
}
