const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const fs = require("fs").promises;
const path = require("path");

// Premium Theme System
const PremiumThemeManager = require('./src/PremiumThemeManager');
const themeManager = new PremiumThemeManager();

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

// Leveling system configuration
const LEVEL_CONFIG = {
  xpPerChat: 10,
  xpPerMinute: 2,
  xpBonus: {
    heart: 15,
    ghost: 5,
    poop: 0
  },
  levels: [
    { level: 1, name: "Nováček", xpRequired: 0 },
    { level: 2, name: "Pokecník", xpRequired: 50 },
    { level: 3, name: "Komunikátor", xpRequired: 150 },
    { level: 4, name: "Společník", xpRequired: 300 },
    { level: 5, name: "Chatmaster", xpRequired: 500 },
    { level: 6, name: "Konverzační mistr", xpRequired: 800 },
    { level: 7, name: "Sociální guru", xpRequired: 1200 },
    { level: 8, name: "Legendární partner", xpRequired: 1700 },
    { level: 9, name: "Chat veterán", xpRequired: 2500 },
    { level: 10, name: "Mistr anonymity", xpRequired: 3500 }
  ]
};

function calculateXP(chatDuration, rating) {
  let xp = LEVEL_CONFIG.xpPerChat; // Base XP for completing a chat
  xp += Math.floor(chatDuration / 60) * LEVEL_CONFIG.xpPerMinute; // XP per minute
  xp += LEVEL_CONFIG.xpBonus[rating] || 0; // Rating bonus
  return xp;
}

function getUserLevel(totalXP) {
  let currentLevel = LEVEL_CONFIG.levels[0];
  for (const level of LEVEL_CONFIG.levels) {
    if (totalXP >= level.xpRequired) {
      currentLevel = level;
    } else {
      break;
    }
  }
  return currentLevel;
}

function getNextLevel(totalXP) {
  const currentLevel = getUserLevel(totalXP);
  const nextLevelIndex = LEVEL_CONFIG.levels.findIndex(l => l.level === currentLevel.level) + 1;
  return nextLevelIndex < LEVEL_CONFIG.levels.length ? LEVEL_CONFIG.levels[nextLevelIndex] : null;
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
      createdAt: new Date().toISOString(),
      // New fields for favorite partners and leveling
      totalXP: 0,
      favoritePartners: [],
      mutualFavorites: [],
      premiumThemes: []
    };
  }
  
  const user = users[userId];
  const today = new Date().toDateString();
  
  // Prevent multiple ratings per day
  if (user.lastRatingDate === today) {
    return false; // Already rated today
  }
  
  // Calculate XP gained
  const xpGained = calculateXP(chatDuration, rating);
  
  // Update statistics
  user.totalChats++;
  user.totalTime += chatDuration;
  user.lastRatingDate = today;
  user.totalXP = (user.totalXP || 0) + xpGained;
  
  if (rating === 'heart') user.heartCount++;
  else if (rating === 'poop') user.poopCount++;
  else if (rating === 'ghost') user.ghostCount++;
  
  // Initialize new fields for existing users
  if (!user.favoritePartners) user.favoritePartners = [];
  if (!user.mutualFavorites) user.mutualFavorites = [];
  if (user.totalXP === undefined) user.totalXP = 0;
  if (!user.premiumThemes) user.premiumThemes = [];

  await saveUsers(users);
  return { success: true, xpGained, level: getUserLevel(user.totalXP) };
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
    
    const result = await updateUserStats(userId, rating, chatDuration);
    
    if (!result) {
      return res.status(429).json({ error: 'Already rated today' });
    }
    
    res.json({ 
      success: true, 
      message: 'Rating submitted successfully',
      xpGained: result.xpGained,
      level: result.level
    });
  } catch (error) {
    console.error('Error processing rating:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add partner to favorites
app.post('/favorites/add', async (req, res) => {
  try {
    const { userId, partnerId } = req.body;
    
    if (!userId || !partnerId || userId === partnerId) {
      return res.status(400).json({ error: 'Invalid user or partner ID' });
    }
    
    const users = await loadUsers();
    
    if (!users[userId]) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[userId];
    if (!user.favoritePartners) user.favoritePartners = [];
    if (!user.mutualFavorites) user.mutualFavorites = [];
    
    // Add to favorites if not already there
    if (!user.favoritePartners.includes(partnerId)) {
      user.favoritePartners.push(partnerId);
    }
    
    // Check if this creates a mutual favorite
    if (users[partnerId] && users[partnerId].favoritePartners && 
        users[partnerId].favoritePartners.includes(userId)) {
      // Mutual favorite detected
      if (!user.mutualFavorites.includes(partnerId)) {
        user.mutualFavorites.push(partnerId);
      }
      if (!users[partnerId].mutualFavorites) users[partnerId].mutualFavorites = [];
      if (!users[partnerId].mutualFavorites.includes(userId)) {
        users[partnerId].mutualFavorites.push(userId);
      }
    }
    
    await saveUsers(users);
    
    res.json({ 
      success: true, 
      message: 'Partner added to favorites',
      mutualFavorite: user.mutualFavorites.includes(partnerId)
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove partner from favorites
app.post('/favorites/remove', async (req, res) => {
  try {
    const { userId, partnerId } = req.body;
    
    if (!userId || !partnerId) {
      return res.status(400).json({ error: 'Invalid user or partner ID' });
    }
    
    const users = await loadUsers();
    
    if (!users[userId]) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[userId];
    if (!user.favoritePartners) user.favoritePartners = [];
    if (!user.mutualFavorites) user.mutualFavorites = [];
    
    // Remove from favorites
    user.favoritePartners = user.favoritePartners.filter(id => id !== partnerId);
    user.mutualFavorites = user.mutualFavorites.filter(id => id !== partnerId);
    
    // Remove mutual favorite status from partner
    if (users[partnerId] && users[partnerId].mutualFavorites) {
      users[partnerId].mutualFavorites = users[partnerId].mutualFavorites.filter(id => id !== userId);
    }
    
    await saveUsers(users);
    
    res.json({ success: true, message: 'Partner removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user favorites
app.get('/favorites/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const users = await loadUsers();
    
    if (!users[userId]) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[userId];
    res.json({
      favoritePartners: user.favoritePartners || [],
      mutualFavorites: user.mutualFavorites || []
    });
  } catch (error) {
    console.error('Error getting favorites:', error);
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
    const currentLevel = getUserLevel(user.totalXP || 0);
    const nextLevel = getNextLevel(user.totalXP || 0);
    
    res.json({
      totalChats: user.totalChats,
      averageLength: user.totalChats > 0 ? Math.round(user.totalTime / user.totalChats / 60) : 0,
      heartCount: user.heartCount,
      poopCount: user.poopCount,
      ghostCount: user.ghostCount,
      totalXP: user.totalXP || 0,
      level: currentLevel,
      nextLevel: nextLevel,
      xpToNextLevel: nextLevel ? nextLevel.xpRequired - (user.totalXP || 0) : 0,
      favoritePartnersCount: (user.favoritePartners || []).length,
      mutualFavoritesCount: (user.mutualFavorites || []).length
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Premium Themes API Endpoints

// Get all available themes
app.get('/api/themes', async (req, res) => {
  try {
    await themeManager.initialize();
    const themes = themeManager.getAllThemes();
    res.json({ themes: themes.map(theme => theme.toJSON()) });
  } catch (error) {
    console.error('Error getting themes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get themes available to a specific user (unified API)
app.get('/api/themes/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await themeManager.initialize();
    
    const users = await loadUsers();
    const user = users[userId];
    
    const allThemes = themeManager.getAllThemes();
    const purchasedThemes = themeManager.getUserPurchasedThemes(userId);
    
    // Mark each theme with ownership status
    const themesWithOwnership = allThemes.map(theme => ({
      ...theme.toJSON(),
      owned: !theme.is_premium || purchasedThemes.includes(theme.theme_id),
      priceCZK: theme.price
    }));
    
    res.json({ 
      themes: themesWithOwnership
    });
  } catch (error) {
    console.error('Error getting user themes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Buy theme with real payment (Stripe integration)
async function buyTheme(themeId, userId) {
  try {
    await themeManager.initialize();
    
    const theme = themeManager.getTheme(themeId);
    if (!theme) {
      throw new Error('Theme not found');
    }
    
    if (!theme.is_premium) {
      throw new Error('Theme is already free');
    }
    
    // Check if user already owns the theme
    if (themeManager.userOwnsTheme(userId, themeId)) {
      throw new Error('Theme already purchased');
    }
    
    // TODO: Integrate with Stripe payment processing
    // For now, we'll simulate successful payment
    // In production, this would create a Stripe checkout session
    
    // Process the purchase
    const result = await themeManager.purchaseTheme(userId, themeId);
    
    // Update user's purchased themes
    const users = await loadUsers();
    const user = users[userId];
    if (user) {
      if (!user.premiumThemes) user.premiumThemes = [];
      if (!user.premiumThemes.includes(themeId)) {
        user.premiumThemes.push(themeId);
      }
      await saveUsers(users);
    }
    
    return result;
  } catch (error) {
    throw error;
  }
}

// Purchase a premium theme with real payment
app.post('/api/themes/purchase', async (req, res) => {
  try {
    const { userId, themeId } = req.body;
    
    if (!userId || !themeId) {
      return res.status(400).json({ error: 'userId and themeId are required' });
    }
    
    const result = await buyTheme(themeId, userId);
    
    res.json({
      success: true,
      message: 'Theme purchased successfully',
      theme: result.theme,
      priceCZK: result.priceCZK
    });
  } catch (error) {
    console.error('Error purchasing theme:', error);
    
    if (error.message.includes('not found') || 
        error.message.includes('already purchased') || 
        error.message.includes('already free')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's theme purchase status
app.get('/api/themes/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await themeManager.initialize();
    
    const users = await loadUsers();
    const user = users[userId];
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const purchasedThemes = themeManager.getUserPurchasedThemes(userId);
    const allThemes = themeManager.getAllThemes();
    const premiumThemes = themeManager.getPremiumThemes();
    
    res.json({
      purchasedThemes,
      totalPurchases: purchasedThemes.length,
      availablePremiumThemes: premiumThemes.length,
      allThemes: allThemes.map(theme => ({
        id: theme.theme_id,
        name: theme.name,
        price: theme.price,
        priceCZK: theme.price,
        owned: !theme.is_premium || purchasedThemes.includes(theme.theme_id),
        isPremium: theme.is_premium
      }))
    });
  } catch (error) {
    console.error('Error getting theme status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get theme statistics (admin endpoint)
app.get('/api/admin/themes/stats', async (req, res) => {
  try {
    await themeManager.initialize();
    const stats = themeManager.getThemeStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting theme stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

let waiting = null;
let onlineCount = 0;
let connectedUsers = new Map(); // Store socket to userId mapping

// Function to find mutual favorite partner
async function findMutualFavoritePartner(userId) {
  const users = await loadUsers();
  const user = users[userId];
  
  if (!user || !user.mutualFavorites || user.mutualFavorites.length === 0) {
    return null;
  }
  
  // Check if any mutual favorites are online and available
  for (const [socket, socketUserId] of connectedUsers) {
    if (user.mutualFavorites.includes(socketUserId) && 
        socket.partner === null && 
        socket !== waiting) {
      return socket;
    }
  }
  
  return null;
}

io.on("connection", (socket) => {
  onlineCount++;
  io.emit("online", onlineCount);

  socket.partner = null;
  socket.lastActive = Date.now();
  socket.currentPartnerId = null; // Store partner's user ID for favorites

  // Generate or receive user ID
  socket.on('set_user_id', (userId) => {
    socket.userId = userId;
    connectedUsers.set(socket, userId);
  });

  // Párování with favorite partners priority
  socket.on('start_pairing', async () => {
    if (socket.userId) {
      // First try to find a mutual favorite partner
      const favoritePartner = await findMutualFavoritePartner(socket.userId);
      
      if (favoritePartner && favoritePartner !== socket) {
        // Pair with mutual favorite
        socket.partner = favoritePartner;
        favoritePartner.partner = socket;
        socket.currentPartnerId = favoritePartner.userId;
        favoritePartner.currentPartnerId = socket.userId;

        const roomName = socket.id + "#" + favoritePartner.id;
        socket.join(roomName);
        favoritePartner.join(roomName);

        socket.room = roomName;
        favoritePartner.room = roomName;

        socket.emit("partner", { type: "favorite", partnerId: favoritePartner.userId });
        favoritePartner.emit("partner", { type: "favorite", partnerId: socket.userId });

        // Remove from waiting if applicable
        if (waiting === favoritePartner) {
          waiting = null;
        }
        
        return;
      }
    }
    
    // Standard pairing logic
    if (waiting && waiting !== socket) {
      socket.partner = waiting;
      waiting.partner = socket;
      if (socket.userId) socket.currentPartnerId = waiting.userId;
      if (waiting.userId) waiting.currentPartnerId = socket.userId;

      socket.join(socket.id + "#" + waiting.id);
      waiting.join(socket.id + "#" + waiting.id);

      socket.room = socket.id + "#" + waiting.id;
      waiting.room = socket.room;

      socket.emit("partner", { type: "random", partnerId: waiting.userId });
      waiting.emit("partner", { type: "random", partnerId: socket.userId });

      waiting = null;
    } else {
      waiting = socket;
      socket.emit("status", "⏳ Looking for partner...");
    }
  });

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

    // Remove from connected users map
    connectedUsers.delete(socket);

    if (waiting === socket) {
      waiting = null;
    }
    if (socket.partner) {
      socket.to(socket.room).emit("partner_left");
      if (socket.partner) {
        socket.partner.partner = null;
        socket.partner.room = null;
        socket.partner.currentPartnerId = null;
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
