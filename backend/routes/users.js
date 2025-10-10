const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const db = require("../db");
const bcrypt = require("bcrypt");

router.post("/update", auth, (req, res) => {
  const { email, password } = req.body;
  const user = db.getUserById(req.user.id);

  if (!user) {
    return res.status(404).json({ error: "Такого пользователя нет" });
  }

  let updatedEmail = email || user.email;
  let updatedPassword = user.password;

  if (password) {
    updatedPassword = bcrypt.hashSync(password, 10);
  }

  db.db
    .prepare("UPDATE users SET email = ?, password = ? WHERE id = ?")
    .run(updatedEmail, updatedPassword, req.user.id);

  res.json({ success: true });
});

module.exports = router;
