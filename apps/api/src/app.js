const express = require("express");
const cors = require("cors");
const authRoutes = require("./modules/auth/auth.routes")

const app = express();

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);


app.get("/health", function (req, res) {
  res.json({ status: "OK" });
});

module.exports = app;