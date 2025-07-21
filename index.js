const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

let waiting = null;
let onlineCount = 0;

io.on("connection", (socket) => {
  onlineCount++;
  io.emit("online", onlineCount);

  socket.partner = null;
  socket.lastActive = Date.now();

  // Párování
  if (waiting && waiting !== socket) {
    socket.partner = waiting;
    waiting.partner = socket;

    socket.join(socket.id + "#" + waiting.id);
    waiting.join(socket.id + "#" + waiting.id);

    socket.room = socket.id + "#" + waiting.id;
    waiting.room = socket.room;

    socket.emit("partner");
    waiting.emit("partner");

    waiting = null;
  } else {
    waiting = socket;
    socket.emit("status", "⏳ Looking for partner...");
  }

  // Zpráva
  socket.on("msg", (text) => {
    socket.lastActive = Date.now();
    if (socket.partner && socket.room) {
      socket.to(socket.room).emit("msg", text);
    }
  });

  // Indikace psaní
  socket.on("typing", () => {
    if (socket.partner && socket.room) {
      socket.to(socket.room).emit("typing");
    }
  });
// Oznámení od uživatele že opouští chat (např. přes skip nebo end chat)
socket.on("leave_chat", () => {
    if (socket.room) {
        socket.to(socket.room).emit("partner_left");
    }
});
  // Skip / Disconnect
  socket.on("disconnect", () => {
    onlineCount--;
    io.emit("online", onlineCount);

    if (waiting === socket) {
      waiting = null;
    }
    if (socket.partner) {
      socket.to(socket.room).emit("partner_left");
      if (socket.partner) {
        socket.partner.partner = null;
        socket.partner.room = null;
      }
    }
  });

  // Ochrana proti neaktivitě (10 minut)
  const timeout = setInterval(() => {
    if (Date.now() - socket.lastActive > 10 * 60 * 1000) {
      socket.disconnect(true);
      clearInterval(timeout);
    }
  }, 60000);
});

http.listen(PORT, () =>
  console.log(`AnonX Chat backend running at http://localhost:${PORT}`)
);
