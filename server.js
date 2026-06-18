require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const rateLimit = require("express-rate-limit");
const keyRoutes = require("./routes/keys");

const app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({ windowMs: 60 * 1000, max: 60 });
app.use("/issue", limiter);
app.use("/validate", limiter);

app.use(express.static(path.join(__dirname, "public")));
app.use("/", keyRoutes);

const PORT = process.env.PORT || 3000;
const URI = process.env.MONGODB_URI;

mongoose
  .connect(URI)
  .then(() => {
    console.log("Mongo connected");
    app.listen(PORT, () => console.log(`Listening on ${PORT}`));
  })
  .catch((err) => {
    console.error("Mongo connection failed:", err.message);
    process.exit(1);
  });
