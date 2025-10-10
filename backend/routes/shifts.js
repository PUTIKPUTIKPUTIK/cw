const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const db = require("../db");

router.get("/", auth, (req, res) => {
  if (req.query.mine === "1") {
    return res.json(db.getShiftsByUser(req.user.id));
  }
  res.json(db.getAllShifts());
});

router.post("/", auth, (req, res) => {
  const { username, shift_date, start_time, end_time, note } = req.body;

  let assignUserId;
  if (req.user.role !== "admin" && username) {
    const user = db.getUserByUsername(username);
    if (!user) {
      return res.status(400).json({ error: "Пользователь не найден" });
    }
    assignUserId = user.id;
  } else {
    assignUserId = req.user.id;
  }

  if (!shift_date || !start_time || !end_time) {
    return res.status(400).json({ error: "Не все поля заполнены" });
  }

  const shift = db.createShift(
    assignUserId,
    shift_date,
    start_time,
    end_time,
    note || ""
  );
  res.status(201).json(shift);
});

module.exports = router;
