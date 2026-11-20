const express = require("express");
const cors = require("cors");
const cryptoRoutes = require("./src/routes/crypto.routes");
const { errorHandler } = require("./src/middleware/errorHandler.middleware");

const app = express();

app.set("trust proxy", 1);

// Allowed browser origins. Override on Render with:
// CORS_ORIGINS=https://www.veilcrypt.me,https://veilcrypt.me,http://localhost:5173
const DEFAULT_ORIGINS = [
  "https://www.veilcrypt.me",
  "https://veilcrypt.me",
  "http://localhost:5173",
];

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
      .map((o) => o.trim())
      .filter(Boolean)
  : DEFAULT_ORIGINS;

console.log("CORS allowed origins:", allowedOrigins);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no Origin header (curl, server-to-server, health checks)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Disallowed origin: no CORS headers, so the browser blocks it
      return callback(null, false);
    },
    credentials: true,
    exposedHeaders: ["Content-Disposition"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", cryptoRoutes);

app.use(errorHandler);

module.exports = app;
