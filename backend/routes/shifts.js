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
  const { user_id, shift_date, start_time, end_time, note } = req.body;

  let assignUser = user_id;
  if (req.user.role !== "admin") assignUser = req.user.id;
  if (!assignUser || !shift_date || !start_time || !end_time) {
    return res.status(400).json({ error: "missing fields" });
  }

  const shift = db.createShift(
    assignUser,
    shift_date,
    start_time,
    end_time,
    note || ""
  );
  res.status(201).json(shift);
});

module.exports = router;
