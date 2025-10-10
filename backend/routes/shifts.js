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
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Только админ может добавлять смены" });
  }

  const { username, shift_date, start_time, end_time, note } = req.body;

  if (!shift_date || !start_time || !end_time) {
    return res.status(400).json({ error: "Не все поля заполнены" });
  }

  const shift = db.createShift(
    username,
    shift_date,
    start_time,
    end_time,
    note || ""
  );
  res.status(201).json(shift);
});

router.put("/:id", auth, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Только админ может удалять смены" });
  }

  const { id } = req.params;
  const { username, shift_date, start_time, end_time, note } = req.body;
  const shift = db.updateShift(
    id,
    username,
    shift_date,
    start_time,
    end_time,
    note
  );
  res.json(shift);
});

router.delete("/:id", auth, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Только админ может удалять смены" });
  }

  const { id } = req.params;
  db.deleteShift(id);
  res.json({ success: true });
});

module.exports = router;
