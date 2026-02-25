const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./modules/auth/auth.routes")

const app = express();

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

const corsOptions = {
  origin: "http://localhost:5173", // <-- your frontend origin
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRoutes);


app.get("/health", function (req, res) {
  res.json({ status: "OK" });
});

module.exports = app;