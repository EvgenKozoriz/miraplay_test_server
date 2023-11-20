const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const cors = require("cors");
const authRouter = require("./routers/auth.routes");

const app = express();
const PORT = config.get("serverPort");

app.use(
  cors({
    allowedHeaders: "Content-Type, Authorization",
    methods: ["GET", "POST"],
  })
);
app.use(express.json());
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.send("server work");
});

const start = async () => {
  try {
    await mongoose.connect(config.get("dbUrl"));

    app.listen(PORT, () => {
      console.log("server started on port ", PORT);
    });
  } catch (e) {
    console.log(e);
  }
};

start();
