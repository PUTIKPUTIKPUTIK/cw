const Database = require("better-sqlite3");
const db = new Database("./data/db.sqlite");

function init() {
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'employee'
    );`
  ).run();

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      shift_date TEXT,
      start_time TEXT,
      end_time TEXT,
      note TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );`
  ).run();

  const row = db
    .prepare("SELECT id FROM users WHERE username = ?")
    .get("admin");
  if (!row) {
    const bcrypt = require("bcrypt");
    const hashed = bcrypt.hashSync("admin", 10);
    db.prepare(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)"
    ).run("admin", hashed, "admin");
    console.log("Seeded admin/admin");
  }
}

module.exports = {
  db,
  init,
  createUser: (username, passwordHash, role = "employee") => {
    const stmt = db.prepare(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)"
    );
    const info = stmt.run(username, passwordHash, role);
    return info.lastInsertRowid;
  },
  getUserByUsername: (username) =>
    db
      .prepare(
        "SELECT id, username, password, role FROM users WHERE username=?"
      )
      .get(username),
  getUserById: (id) =>
    db.prepare("SELECT id, username, role FROM users WHERE id = ?").get(id),
  createShift: (user_id, shift_date, start_time, end_time, note = "") => {
    const stmt = db.prepare(
      "INSERT INTO shifts (user_id, shift_date, start_time, end_time, note) VALUES (?, ?, ?, ?, ?)"
    );
    const info = stmt.run(user_id, shift_date, start_time, end_time, note);
    return db
      .prepare("SELECT * FROM shifts WHERE id = ?")
      .get(info.lastInsertRowid);
  },
  getAllShifts: () =>
    db
      .prepare(
        `
    SELECT s.*, u.username as user_name
    FROM shifts s LEFT JOIN users u ON s.user_id = u.id
    ORDER BY shift_date, start_time
    `
      )
      .all(),
  getShiftsByUser: (user_id) =>
    db
      .prepare(
        "SELECT * FROM shifts WHERE user_id = ? ORDER BY shift_date, start_time"
      )
      .all(user_id),
};
