const express = require("express");
require("dotenv").config();
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/shifts", require("./routes/shifts"));

const PORT = process.env.PORT || 4000;
db.init();
app.listen(PORT, () => console.log(`Server listening ${PORT}`));
