const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const databasePath = process.env.SQLITE_DB_PATH || path.join(__dirname, '..', 'store.db');
const database = new DatabaseSync(databasePath);

function initializeDatabase() {
  const createOrdersTableSql = `
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      total_price REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;

  database.exec(createOrdersTableSql);

  return Promise.resolve();
}

function run(sql, parameters) {
  const statement = database.prepare(sql);
  const result = statement.run.apply(statement, parameters || []);

  return Promise.resolve({
    id: Number(result.lastInsertRowid),
    changes: result.changes
  });
}

function all(sql, parameters) {
  const statement = database.prepare(sql);

  return Promise.resolve(statement.all.apply(statement, parameters || []));
}

module.exports = {
  database: database,
  initializeDatabase: initializeDatabase,
  run: run,
  all: all
};