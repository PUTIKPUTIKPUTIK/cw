const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
require("dotenv").config();

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "username & password required" });

  const exists = db.getUserByUsername(username);
  if (exists) return res.status(400).json({ error: "user exists" });

  const hash = await bcrypt.hash(password, 10);
  const id = db.createUser(username, hash);
  const token = jwt.sign(
    { id, username, role: "employee" },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.status(201).json({ token, user: { id, username, role: "employee" } });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = db.getUserByUsername(username);
  if (!user) return res.status(400).json({ error: "invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ error: "invalid credentials" });

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
  res.json({
    token,
    user: { id: user.id, username: user.username, role: user.role },
  });
});

module.exports = router;
