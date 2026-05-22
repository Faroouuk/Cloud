const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("OK");
});

const server = app.listen(5050, () => {
  console.log("Server running");
});

server.on("error", (err) => {
  console.error("SERVER ERROR:", err);
});

server.on("close", () => {
  console.log("SERVER CLOSED");
});