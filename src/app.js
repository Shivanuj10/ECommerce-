const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth.routes");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", "./src/views");

app.get("/", (req, res) => {
  res.send("Server is ready to open");
});

app.use("/api/auth", authRouter);

module.exports = app;
