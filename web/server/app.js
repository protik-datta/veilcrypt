const express = require("express");
const cors = require("cors");
const cryptoRoutes = require("./src/routes/crypto.routes");
const { errorHandler } = require("./src/middleware/errorHandler.middleware");

const app = express();

app.use(
  cors({
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
