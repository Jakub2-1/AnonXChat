const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let waiting = null;
const updateOnlineCount = () => {
  io.emit('onlineCount', io.engine.clientsCount);
};
io.on('connection', socket => {
  socket.emit('showWelcome');
updateOnlineCount();
  socket.on('start', ({ color }) => {
    socket.chosenColor = color;
    socket.emit('status', '⏳ Looking for partner…');

    if (waiting && waiting.id !== socket.id) {
      const partner = waiting;
      waiting = null;
      const room = socket.id + '#' + partner.id;

      socket.join(room);
      partner.join(room);
      socket.room = partner.room = room;

      io.to(socket.id).emit('setColors', {
        you: socket.chosenColor,
        them: partner.chosenColor
      });
      io.to(partner.id).emit('setColors', {
        you: partner.chosenColor,
        them: socket.chosenColor
      });

      io.to(room).emit('status', '✅ Partner found!');
      io.to(room).emit('showChat');
    } else {
      waiting = socket;
    }
  });

  socket.on('skip', () => {
    if (socket.room) {
      socket.to(socket.room).emit('status', '🔄 Partner skipped.');
      const ids = Array.from(io.sockets.adapter.rooms.get(socket.room) || []);
      ids.forEach(id => {
        const s = io.sockets.sockets.get(id);
        if (s.id !== socket.id) {
          s.leave(socket.room);
          delete s.room;
          if (!waiting) waiting = s;
        }
      });
      socket.leave(socket.room);
      delete socket.room;
    }
    socket.emit('status', '⏳ Looking for new partner…');
    if (waiting && waiting.id !== socket.id) {
      const partner = waiting;
      waiting = null;
      const room = socket.id + '#' + partner.id;
      socket.join(room);
      partner.join(room);
      socket.room = partner.room = room;

      io.to(socket.id).emit('setColors', {
        you: socket.chosenColor,
        them: partner.chosenColor
      });
      io.to(partner.id).emit('setColors', {
        you: partner.chosenColor,
        them: socket.chosenColor
      });

      io.to(room).emit('status', '✅ Partner found!');
      io.to(room).emit('showChat');
    } else {
      waiting = socket;
    }
  });

  socket.on('stop', () => {
    if (socket.room) {
      socket.to(socket.room).emit('status', '🚨 Partner disconnected.');
      const ids = Array.from(io.sockets.adapter.rooms.get(socket.room) || []);
      ids.forEach(id => {
        const s = io.sockets.sockets.get(id);
        s.leave(socket.room);
        delete s.room;
        if (!waiting) waiting = s;
      });
      socket.leave(socket.room);
      delete socket.room;
    }
    socket.emit('showWelcome');
  });

  socket.on('msg', text => {
    if (socket.room) {
      socket.to(socket.room).emit('msg', { text, time: Date.now() });
    }
  });

  socket.on('typing', isTyping => {
    if (socket.room) {
      socket.to(socket.room).emit('typing', isTyping);
    }
  });

  socket.on('disconnect', () => {
updateOnlineCount();
if (socket === waiting) waiting = null;
    if (socket.room) {
      socket.to(socket.room).emit('status', '🚨 Partner disconnected.');
      const ids = Array.from(io.sockets.adapter.rooms.get(socket.room) || []);
      ids.forEach(id => {
        const s = io.sockets.sockets.get(id);
        s.leave(socket.room);
        delete s.room;
        if (!waiting) waiting = s;
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Running on port ${PORT}`));
