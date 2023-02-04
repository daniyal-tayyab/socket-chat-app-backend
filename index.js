const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");

const app = express();
const httpServer = http.createServer(app);
const PORT = 5000;

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.use(cors());

let users = [];

io.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected`);

  socket.on("message", (payload) => {
    io.emit("message response", payload);
  });

  //Listens when a new user joins the server
  socket.on("new user", (payload) => {
    //Adds the new user to the list of users
    users.push(payload);
    //Sends the list of users to the client
    io.emit("new user response", users);
  });

  socket.on("typing", (payload) =>
    socket.broadcast.emit("typing response", payload)
  );

  socket.on("disconnect", () => {
    console.log("🔥: A user disconnected");
    //Updates the list of users when a user disconnects from the server
    users = users.filter((user) => user.socketId !== socket.id);
    //Sends the list of users to the client
    io.emit("new user response", users);
    socket.disconnect();
  });
});

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello world" });
});

httpServer.listen(PORT, () =>
  console.log(`server running at http://localhost:${PORT}`)
);
