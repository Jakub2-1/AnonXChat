const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const fs = require("fs").promises;
const path = require("path");

const PORT = process.env.PORT || 3000;
const USERS_FILE = path.join(__dirname, 'users.json');

// Middleware
app.use(express.static("public"));
app.use(express.json());

// Users data management
async function loadUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist or is invalid, return empty object
    return {};
  }
}

async function saveUsers(users) {
  try {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving users data:', error);
  }
}

async function updateUserStats(userId, rating, chatDuration) {
  const users = await loadUsers();
  
  if (!users[userId]) {
    users[userId] = {
      totalChats: 0,
      totalTime: 0,
      heartCount: 0,
      poopCount: 0,
      ghostCount: 0,
      lastRatingDate: null,
      createdAt: new Date().toISOString()
    };
  }
  
  const user = users[userId];
  const today = new Date().toDateString();
  
  // Prevent multiple ratings per day
  if (user.lastRatingDate === today) {
    return false; // Already rated today
  }
  
  // Update statistics
  user.totalChats++;
  user.totalTime += chatDuration;
  user.lastRatingDate = today;
  
  if (rating === 'heart') user.heartCount++;
  else if (rating === 'poop') user.poopCount++;
  else if (rating === 'ghost') user.ghostCount++;
  
  await saveUsers(users);
  return true;
}

// Rating API endpoint
app.post('/rate', async (req, res) => {
  try {
    const { userId, rating, chatDuration } = req.body;
    
    // Validate input
    if (!userId || !rating || typeof chatDuration !== 'number') {
      return res.status(400).json({ error: 'Invalid input data' });
    }
    
    if (!['heart', 'poop', 'ghost'].includes(rating)) {
      return res.status(400).json({ error: 'Invalid rating value' });
    }
    
    const success = await updateUserStats(userId, rating, chatDuration);
    
    if (!success) {
      return res.status(429).json({ error: 'Already rated today' });
    }
    
    res.json({ success: true, message: 'Rating submitted successfully' });
  } catch (error) {
    console.error('Error processing rating:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user statistics endpoint (optional, for future use)
app.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const users = await loadUsers();
    
    if (!users[userId]) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[userId];
    res.json({
      totalChats: user.totalChats,
      averageLength: user.totalChats > 0 ? Math.round(user.totalTime / user.totalChats / 60) : 0,
      heartCount: user.heartCount,
      poopCount: user.poopCount,
      ghostCount: user.ghostCount
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
