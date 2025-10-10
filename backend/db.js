const Database = require("better-sqlite3");
const db = new Database("./data/db.sqlite");

function init() {
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'employee',
      email TEXT
    );`
  ).run();

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      shift_date TEXT,
      start_time TEXT,
      end_time TEXT,
      note TEXT
    );`
  ).run();

  const row = db
    .prepare("SELECT id FROM users WHERE username = ?")
    .get("admin");
  if (!row) {
    const bcrypt = require("bcrypt");
    const hashed = bcrypt.hashSync("admin", 10);
    db.prepare(
      "INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)"
    ).run("admin", hashed, "admin", "admin@example.com");
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
        "SELECT id, username, password, role, email FROM users WHERE username=?"
      )
      .get(username),
  getUserById: (id) =>
    db
      .prepare("SELECT id, username, role, email FROM users WHERE id = ?")
      .get(id),
  createShift: (username, shift_date, start_time, end_time, note = "") => {
    const stmt = db.prepare(
      "INSERT INTO shifts (username, shift_date, start_time, end_time, note) VALUES (?, ?, ?, ?, ?)"
    );
    const info = stmt.run(username, shift_date, start_time, end_time, note);
    return db
      .prepare("SELECT * FROM shifts WHERE id = ?")
      .get(info.lastInsertRowid);
  },
  updateShift: (id, username, shift_date, start_time, end_time, note) => {
    const stmt = db.prepare(
      "UPDATE shifts SET username=?, shift_date=?, start_time=?, end_time=?, note=? WHERE id=?"
    );
    stmt.run(username, shift_date, start_time, end_time, note, id);
    return db.prepare("SELECT * FROM shifts WHERE id=?").get(id);
  },
  deleteShift: (id) => {
    db.prepare("DELETE FROM shifts WHERE id=?").run(id);
  },
  getAllShifts: () =>
    db.prepare("SELECT * FROM shifts ORDER BY shift_date, start_time").all(),
  getShiftsByUsername: (username) =>
    db
      .prepare(
        "SELECT * FROM shifts WHERE username = ? ORDER BY shift_date, start_time"
      )
      .all(username),
};
