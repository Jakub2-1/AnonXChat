// proměnné
let socket;
let mySide = 'right';
let partnerActive = true;
let typingTimeout;
let soundEnabled = localStorage.getItem('soundEnabled') !== 'false'; // Default to true
let currentTheme = localStorage.getItem('selectedTheme') || 'phantom'; // Default to phantom theme
let currentThemeData = null;
let currentPartnerId = null; // Store current partner ID for favorites

// Anonymous user ID management
let anonUserId = localStorage.getItem('anonx_user_id');
if (!anonUserId) {
  anonUserId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('anonx_user_id', anonUserId);
}

// User statistics management
let userStats = JSON.parse(localStorage.getItem('anonx_stats') || '{}');
let currentChatStart = null;
let lastRatingDate = null;

// Initialize user stats if not exists
if (!userStats.totalChats) userStats.totalChats = 0;
if (!userStats.totalTime) userStats.totalTime = 0;
if (!userStats.heartCount) userStats.heartCount = 0;
if (!userStats.poopCount) userStats.poopCount = 0;
if (!userStats.ghostCount) userStats.ghostCount = 0;
if (!userStats.currentStreak) userStats.currentStreak = 0;
if (!userStats.lastStreakDate) userStats.lastStreakDate = null;
if (!userStats.showPublicBadge) userStats.showPublicBadge = false;
if (!userStats.cleanChats) userStats.cleanChats = 0;
if (!userStats.totalXP) userStats.totalXP = 0;
if (!userStats.favoritePartners) userStats.favoritePartners = [];
if (!userStats.mutualFavorites) userStats.mutualFavorites = [];

// Sound system
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Theme definitions
const themeDefinitions = {
  phantom: {
    name: 'Phantom',
    icon: '👻',
    className: 'theme-phantom'
  },
  glow: {
    name: 'Glow', 
    icon: '🌟',
    className: 'theme-glow'
  }
};

// Theme palettes - keeping existing system for backward compatibility
const themes = [
  {
    name: 'Blue Dream',
    primary: '#3b82f6',
    secondary: '#1d4ed8', 
    accent: '#60a5fa',
    glow: 'rgba(59, 130, 246, 0.8)',
    shadow: 'rgba(59, 130, 246, 0.4)'
  },
  {
    name: 'Purple Magic', 
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    accent: '#c084fc', 
    glow: 'rgba(139, 92, 246, 0.8)',
    shadow: 'rgba(139, 92, 246, 0.4)'
  },
  {
    name: 'Turquoise Ocean',
    primary: '#06b6d4',
    secondary: '#0891b2',
    accent: '#67e8f9',
    glow: 'rgba(6, 182, 212, 0.8)', 
    shadow: 'rgba(6, 182, 212, 0.4)'
  },
  {
    name: 'Pink Sunset',
    primary: '#ec4899',
    secondary: '#db2777',
    accent: '#f9a8d4',
    glow: 'rgba(236, 72, 153, 0.8)',
    shadow: 'rgba(236, 72, 153, 0.4)'
  },
  {
    name: 'Pastel Mint',
    primary: '#34d399',
    secondary: '#10b981', 
    accent: '#a7f3d0',
    glow: 'rgba(52, 211, 153, 0.8)',
    shadow: 'rgba(52, 211, 153, 0.4)'
  },
  {
    name: 'Pastel Lavender',
    primary: '#a78bfa', 
    secondary: '#8b5cf6',
    accent: '#ddd6fe',
    glow: 'rgba(167, 139, 250, 0.8)',
    shadow: 'rgba(167, 139, 250, 0.4)'
  }
];

// Simple sound generation using Web Audio API
function createSound(frequency, duration, type = 'sine') {
  if (!soundEnabled) return;
  
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    console.log('Audio not available:', error);
  }
}

// Sound effects
function playMessageSend() {
  createSound(800, 0.1, 'sine');
}

function playPartnerFound() {
  // Pleasant chord-like sound
  createSound(600, 0.3, 'sine');
  setTimeout(() => createSound(800, 0.2, 'sine'), 100);
}

function playChatEnd() {
  createSound(400, 0.2, 'sine');
}

// Statistics and Rating System
function saveUserStats() {
  localStorage.setItem('anonx_stats', JSON.stringify(userStats));
}

function updateStreak() {
  const today = new Date().toDateString();
  if (userStats.lastStreakDate !== today) {
    userStats.currentStreak = userStats.lastStreakDate === new Date(Date.now() - 86400000).toDateString() ? userStats.currentStreak + 1 : 1;
    userStats.lastStreakDate = today;
    saveUserStats();
  }
}

function getKarmaLevel() {
  const totalRatings = userStats.heartCount + userStats.poopCount;
  if (totalRatings === 0) return "Nováček";
  
  const poopRatio = userStats.poopCount / totalRatings;
  const heartRatio = userStats.heartCount / totalRatings;
  
  if (poopRatio > 0.3) return "Problematik";
  if (heartRatio > 0.7) return "Anděl";
  if (heartRatio > 0.5) return "Příjemný";
  return "Průměrný";
}

function shouldShowBehaviorWarning() {
  const totalRatings = userStats.heartCount + userStats.poopCount;
  if (totalRatings < 5) return false;
  
  const poopRatio = userStats.poopCount / totalRatings;
  return poopRatio > 0.3;
}

function updateStatsDisplay() {
  document.getElementById('totalChats').textContent = userStats.totalChats;
  document.getElementById('avgLength').textContent = userStats.totalChats > 0 ? 
    Math.round(userStats.totalTime / userStats.totalChats / 60) + 'm' : '0m';
  document.getElementById('heartCount').textContent = userStats.heartCount;
  document.getElementById('poopCount').textContent = userStats.poopCount;
  document.getElementById('currentStreak').textContent = userStats.currentStreak;
  document.getElementById('karmaLevel').textContent = getKarmaLevel();
  document.getElementById('showPublicBadge').checked = userStats.showPublicBadge;
  
  // Update level display
  updateLevelDisplay();
  
  // Update favorites display
  updateFavoritesDisplay();
  
  // Update challenges display
  updateChallengesDisplay();
}

// Leveling system functions
function getLevelData(xp) {
  const levels = [
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
  ];
  
  let currentLevel = levels[0];
  let nextLevel = levels[1];
  
  for (let i = 0; i < levels.length; i++) {
    if (xp >= levels[i].xpRequired) {
      currentLevel = levels[i];
      nextLevel = levels[i + 1] || null;
    } else {
      break;
    }
  }
  
  return { currentLevel, nextLevel };
}

function updateLevelDisplay() {
  const { currentLevel, nextLevel } = getLevelData(userStats.totalXP || 0);
  
  document.getElementById('currentLevelName').textContent = currentLevel.name;
  document.getElementById('currentLevelNumber').textContent = currentLevel.level;
  document.getElementById('currentXP').textContent = userStats.totalXP || 0;
  
  if (nextLevel) {
    document.getElementById('nextLevelXP').textContent = nextLevel.xpRequired;
    document.getElementById('xpToNext').textContent = `(${nextLevel.xpRequired - (userStats.totalXP || 0)} do dalšího levelu)`;
    
    const progress = Math.min(100, ((userStats.totalXP || 0) - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired) * 100);
    document.getElementById('xpProgress').style.width = progress + '%';
  } else {
    document.getElementById('nextLevelXP').textContent = 'MAX';
    document.getElementById('xpToNext').textContent = '(Maximální level!)';
    document.getElementById('xpProgress').style.width = '100%';
  }
}

function updateFavoritesDisplay() {
  document.getElementById('favoritePartnersCount').textContent = (userStats.favoritePartners || []).length;
  document.getElementById('mutualFavoritesCount').textContent = (userStats.mutualFavorites || []).length;
  
  const connectBtn = document.getElementById('connectWithFavoriteBtn');
  if ((userStats.mutualFavorites || []).length > 0) {
    connectBtn.style.display = 'block';
  } else {
    connectBtn.style.display = 'none';
  }
}

// Favorite partners functions
async function addToFavorites(partnerId) {
  try {
    const response = await fetch('/favorites/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: anonUserId,
        partnerId: partnerId
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Update local storage
      if (!userStats.favoritePartners) userStats.favoritePartners = [];
      if (!userStats.favoritePartners.includes(partnerId)) {
        userStats.favoritePartners.push(partnerId);
      }
      
      if (result.mutualFavorite) {
        if (!userStats.mutualFavorites) userStats.mutualFavorites = [];
        if (!userStats.mutualFavorites.includes(partnerId)) {
          userStats.mutualFavorites.push(partnerId);
        }
        showNotif('💫 Skvělé! Máte vzájemně oblíbeného partnera! Nyní se můžete spojit mimo běžné párování.', false);
      } else {
        showNotif('⭐ Partner přidán do oblíbených!', false);
      }
      
      saveUserStats();
      updateFavoritesDisplay();
    }
  } catch (error) {
    console.error('Error adding favorite:', error);
    showNotif('❌ Nepodařilo se přidat partnera do oblíbených.', false);
  }
}

async function connectWithFavorite() {
  if ((userStats.mutualFavorites || []).length === 0) {
    showNotif('🤷 Nemáte žádné vzájemně oblíbené partnery online.', false);
    return;
  }
  
  // Hide stats panel and start searching for favorite
  hideStatsPanel();
  showLoadingOverlay();
  
  // Use special favorite pairing
  startSocket(true); // true = prefer favorites
}

function updateChallengesDisplay() {
  if (!window.challengesSystem) return;
  
  const challengesList = document.getElementById('challengesList');
  const totalPointsEl = document.getElementById('totalPoints');
  
  // Get available challenges (not completed, max 5)
  const availableChallenges = window.challengesSystem.getAvailableChallenges().slice(0, 5);
  
  challengesList.innerHTML = '';
  
  availableChallenges.forEach(challenge => {
    const progress = window.challengesSystem.getChallengeProgress(challenge.id);
    if (!progress) return;
    
    const challengeEl = document.createElement('div');
    challengeEl.className = `challenge-item ${progress.completed ? 'completed' : ''}`;
    
    const percentage = Math.min((progress.progress / challenge.target) * 100, 100);
    
    challengeEl.innerHTML = `
      <div class="challenge-header">
        <div class="challenge-name">${challenge.name}</div>
        <div class="challenge-points">${challenge.points} bodů</div>
      </div>
      <div class="challenge-description">${challenge.description}</div>
      <div class="challenge-progress">
        <div class="challenge-progress-bar" style="width: ${percentage}%"></div>
      </div>
      <div class="challenge-progress-text">${progress.progress}/${challenge.target}</div>
    `;
    
    challengesList.appendChild(challengeEl);
  });
  
  // Update total points
  totalPointsEl.textContent = window.challengesSystem.getTotalPoints();
}

function showRatingModal() {
  const ratingModal = document.getElementById('ratingModal');
  const favoriteOption = document.getElementById('favoriteOption');
  
  // Show favorite option only if we have a current partner and rating was positive
  if (currentPartnerId) {
    favoriteOption.style.display = 'block';
  } else {
    favoriteOption.style.display = 'none';
  }
  
  ratingModal.style.display = 'flex';
  ratingModal.style.opacity = '0';
  setTimeout(() => {
    ratingModal.style.opacity = '1';
  }, 10);
}

function hideRatingModal() {
  const ratingModal = document.getElementById('ratingModal');
  ratingModal.style.opacity = '0';
  setTimeout(() => {
    ratingModal.style.display = 'none';
  }, 300);
}

// Handle rating modal close events
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const ratingModal = document.getElementById('ratingModal');
    if (ratingModal.style.display === 'flex') {
      hideRatingModal();
      handlePostRating(); // Continue with default action
    }
    
    const statsPanel = document.getElementById('statsPanel');
    if (statsPanel.style.display === 'flex') {
      hideStatsPanel();
    }
  }
});

// Handle clicking outside modals
document.addEventListener('click', function(e) {
  const ratingModal = document.getElementById('ratingModal');
  if (ratingModal.style.display === 'flex' && e.target === ratingModal) {
    hideRatingModal();
    handlePostRating(); // Continue with default action
  }
  
  const statsPanel = document.getElementById('statsPanel');
  if (statsPanel.style.display === 'flex' && e.target === statsPanel) {
    hideStatsPanel();
  }
});

function submitRating(rating) {
  if (lastRatingDate === new Date().toDateString()) {
    hideRatingModal();
    handlePostRating();
    return; // Already rated today
  }
  
  // Update statistics
  if (rating === 'heart') userStats.heartCount++;
  else if (rating === 'poop') userStats.poopCount++;
  else if (rating === 'ghost') userStats.ghostCount++;
  
  // Track clean chats (heart or ghost, but not poop)
  if (rating === 'heart' || rating === 'ghost') {
    userStats.cleanChats++;
  }
  
  lastRatingDate = new Date().toDateString();
  updateStreak();
  
  // Record chat end time and update total time
  let chatDuration = 0;
  if (currentChatStart) {
    chatDuration = (Date.now() - currentChatStart) / 1000;
    userStats.totalTime += chatDuration;
  }
  
  userStats.totalChats++;
  saveUserStats();
  
  // Submit rating to backend
  submitRatingToBackend(rating, chatDuration);
  
  // Update challenges
  if (window.challengesSystem) {
    window.challengesSystem.updateChallengeProgress('rating_given', { rating });
    window.challengesSystem.updateChallengeProgress('chat_completed', { 
      duration: chatDuration,
      theme: currentTheme 
    });
    window.challengesSystem.updateChallengeProgress('streak_updated', { streak: userStats.currentStreak });
    window.challengesSystem.trackThemeUsage(currentTheme);
  }
  
  hideRatingModal();
  
  // Show behavior warning if needed
  if (shouldShowBehaviorWarning()) {
    setTimeout(() => {
      showNotif('💡 Tip: Zkus být více přátelský v chatech. Kvalitní konverzace přináší lepší zážitky!', false);
    }, 1000);
  } else {
    handlePostRating();
  }
}

function showStatsPanel() {
  updateStatsDisplay();
  const statsPanel = document.getElementById('statsPanel');
  statsPanel.style.display = 'flex';
  statsPanel.style.opacity = '0';
  setTimeout(() => {
    statsPanel.style.opacity = '1';
  }, 10);
}

function hideStatsPanel() {
  const statsPanel = document.getElementById('statsPanel');
  statsPanel.style.opacity = '0';
  setTimeout(() => {
    statsPanel.style.display = 'none';
  }, 300);
}

function generatePublicBadge() {
  if (!userStats.showPublicBadge || userStats.totalChats === 0) {
    return null;
  }
  
  const totalRatings = userStats.heartCount + userStats.poopCount;
  if (totalRatings < 3) return null; // Need at least 3 ratings to show badge
  
  return `Tahle duše má ${userStats.totalChats} pokeců, ${userStats.heartCount}x ❤️, ${userStats.poopCount}x 💩`;
}

function showPublicBadge() {
  const badge = generatePublicBadge();
  const publicBadge = document.getElementById('publicBadge');
  const badgeText = document.getElementById('badgeText');
  
  if (badge) {
    badgeText.textContent = badge;
    publicBadge.style.display = 'block';
  } else {
    publicBadge.style.display = 'none';
  }
}

// Theme management
function switchTheme() {
  // Toggle between phantom and glow
  currentTheme = currentTheme === 'phantom' ? 'glow' : 'phantom';
  applyMainTheme(currentTheme);
  localStorage.setItem('selectedTheme', currentTheme);
}

function applyMainTheme(themeName) {
  const themeData = themeDefinitions[themeName];
  if (!themeData) return;
  
  const body = document.body;
  const themeIcon = document.getElementById('themeIcon');
  
  // Remove existing theme classes
  Object.values(themeDefinitions).forEach(theme => {
    body.classList.remove(theme.className);
  });
  
  // Remove existing overlays
  removeThemeOverlays();
  
  // Apply new theme
  body.classList.add(themeData.className);
  themeIcon.textContent = themeData.icon;
  
  // Add deep goth overlays for phantom theme
  if (themeName === 'phantom') {
    createDeepGothOverlays();
  }
  
  // Still apply color variations for variety within the theme
  if (themeName === 'phantom') {
    randomizeTheme(); // Keep color variety for phantom
  } else {
    randomizeTheme(); // Keep color variety for glow
  }
}

// Create deep goth atmospheric overlays
function createDeepGothOverlays() {
  const body = document.body;
  
  // Create fog overlay
  const fogOverlay = document.createElement('div');
  fogOverlay.className = 'fog-overlay';
  fogOverlay.id = 'fogOverlay';
  body.appendChild(fogOverlay);
  
  // Create sparkles overlay
  const sparklesOverlay = document.createElement('div');
  sparklesOverlay.className = 'sparkles-overlay';
  sparklesOverlay.id = 'sparklesOverlay';
  body.appendChild(sparklesOverlay);
  
  // Create shadows overlay
  const shadowsOverlay = document.createElement('div');
  shadowsOverlay.className = 'shadows-overlay';
  shadowsOverlay.id = 'shadowsOverlay';
  body.appendChild(shadowsOverlay);
}

// Remove theme overlays
function removeThemeOverlays() {
  const overlays = ['fogOverlay', 'sparklesOverlay', 'shadowsOverlay'];
  overlays.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.remove();
    }
  });
}

function updateThemeSwitcher() {
  const themeData = themeDefinitions[currentTheme];
  const themeIcon = document.getElementById('themeIcon');
  if (themeData && themeIcon) {
    themeIcon.textContent = themeData.icon;
  }
}

// Theme randomization - enhanced to work with main themes
function randomizeTheme() {
  const randomIndex = Math.floor(Math.random() * themes.length);
  currentThemeData = themes[randomIndex];
  applyTheme(currentThemeData);
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty('--theme-primary', theme.primary);
  root.style.setProperty('--theme-secondary', theme.secondary); 
  root.style.setProperty('--theme-accent', theme.accent);
  root.style.setProperty('--theme-glow', theme.glow);
  root.style.setProperty('--theme-shadow', theme.shadow);
}

// Sound toggle functionality
function updateSoundToggle() {
  const soundToggle = document.getElementById('soundToggle');
  const soundIcon = document.getElementById('soundIcon');
  const soundText = soundToggle.querySelector('.sound-text');
  
  if (soundEnabled) {
    soundIcon.textContent = '🔊';
    soundText.textContent = 'Sound ON';
    soundToggle.classList.remove('muted');
  } else {
    soundIcon.textContent = '🔇'; 
    soundText.textContent = 'Sound OFF';
    soundToggle.classList.add('muted');
  }
}

// helper na čas
function getTimeNow() {
  let d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Přepínání stránek s animacemi
function showChatPage() {
  const mainPage = document.getElementById('mainPage');
  const chatPage = document.getElementById('chatPage');
  const onlineCount = document.getElementById('onlineCount');
  const notification = document.getElementById('notification');
  const loadingOverlay = document.getElementById('loadingOverlay');
  
  // Remove searching background effect
  document.body.classList.remove('searching-partner');
  
  // Fade out current page
  loadingOverlay.style.opacity = '0';
  setTimeout(() => {
    mainPage.style.display = 'none';
    notification.style.display = 'none';
    loadingOverlay.style.display = 'none';
    
    // Show chat page with animation
    chatPage.style.display = 'flex';
    chatPage.style.opacity = '0';
    onlineCount.style.display = '';
    
    setTimeout(() => {
      chatPage.style.opacity = '1';
      loadingOverlay.style.opacity = '1';
    }, 10);
  }, 150);
}

function showMainPage() {
  const mainPage = document.getElementById('mainPage');
  const chatPage = document.getElementById('chatPage');
  const notification = document.getElementById('notification');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const logo = document.querySelector('.glow');
  const startBtn = document.getElementById('startBtn');
  
  // Clean up any existing socket connection
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  
  // Reset chat state
  partnerActive = true;
  currentPartnerId = null;
  currentChatStart = null;
  
  // Clear chat messages
  document.getElementById('messages').innerHTML = '';
  
  // Clear typing indicator
  document.getElementById('typingIndicator').style.display = 'none';
  
  // Clear chat input
  document.getElementById('chatInput').value = '';
  
  // Remove searching background effect
  document.body.classList.remove('searching-partner');
  
  // Fade out current page
  if (chatPage.style.display !== 'none') {
    chatPage.style.opacity = '0';
    setTimeout(() => {
      chatPage.style.display = 'none';
      notification.style.display = 'none';
      loadingOverlay.style.display = 'none';
      
      // Show main page with animation
      mainPage.style.display = 'flex';
      mainPage.style.opacity = '0';
      
      // Explicitly ensure logo and start button are visible
      if (logo) {
        logo.style.display = '';
        logo.style.opacity = '1';
      }
      if (startBtn) {
        startBtn.style.display = '';
        startBtn.style.opacity = '1';
      }
      
      setTimeout(() => {
        mainPage.style.opacity = '1';
      }, 10);
    }, 150);
  } else {
    chatPage.style.display = 'none';
    notification.style.display = 'none';
    loadingOverlay.style.display = 'none';
    mainPage.style.display = 'flex';
    
    // Explicitly ensure logo and start button are visible
    if (logo) {
      logo.style.display = '';
      logo.style.opacity = '1';
    }
    if (startBtn) {
      startBtn.style.display = '';
      startBtn.style.opacity = '1';
    }
    
    // Ensure main page is visible
    mainPage.style.opacity = '1';
  }
}

function showNotif(msg, btns = false) {
  const notification = document.getElementById('notification');
  const notifMsg = document.getElementById('notifMsg');
  const notifBtns = document.getElementById('notifBtns');
  const chatPage = document.getElementById('chatPage');
  const mainPage = document.getElementById('mainPage');
  const loadingOverlay = document.getElementById('loadingOverlay');
  
  // Remove searching background effect
  document.body.classList.remove('searching-partner');
  
  notifMsg.textContent = msg;
  notifBtns.style.display = btns ? '' : 'none';
  
  // Fade out current page
  if (chatPage.style.display !== 'none') {
    chatPage.style.opacity = '0';
  }
  
  setTimeout(() => {
    chatPage.style.display = 'none';
    mainPage.style.display = 'none';
    loadingOverlay.style.display = 'none';
    
    // Show notification with animation
    notification.style.display = '';
    notification.style.opacity = '0';
    
    setTimeout(() => {
      notification.style.opacity = '1';
    }, 10);
  }, 150);
}

function showLoadingOverlay() {
  const mainPage = document.getElementById('mainPage');
  const chatPage = document.getElementById('chatPage');
  const notification = document.getElementById('notification');
  const loadingOverlay = document.getElementById('loadingOverlay');
  
  // Add searching background effect
  document.body.classList.add('searching-partner');
  
  // Fade out current page
  if (mainPage.style.display !== 'none') {
    mainPage.style.opacity = '0';
  }
  
  setTimeout(() => {
    mainPage.style.display = 'none';
    chatPage.style.display = 'none';
    notification.style.display = 'none';
    
    // Show loading overlay with animation
    loadingOverlay.style.display = 'flex';
    loadingOverlay.style.opacity = '0';
    
    setTimeout(() => {
      loadingOverlay.style.opacity = '1';
    }, 10);
  }, 150);
}

// Přidání zprávy
function addMsg(text, side, time) {
  const el = document.createElement('div');
  el.className = 'msg-bubble msg-' + side;
  el.innerHTML = text + '<span class="msg-time">' + (time || getTimeNow()) + '</span>';
  document.getElementById('messages').appendChild(el);
  document.getElementById('messages').scrollTop = 99999;
}

// Odeslání zprávy
function sendMsg() {
  const inp = document.getElementById('chatInput');
  const text = inp.value.trim();
  if (!text) return;
  addMsg(text, mySide);
  socket.emit('msg', text);
  inp.value = '';
  
  // Play message send sound
  playMessageSend();
}

// START BTN
document.getElementById('startBtn').onclick = function() {
  // Randomize theme for new chat
  randomizeTheme();
  
  showLoadingOverlay();
  startSocket();
}

// THEME SWITCHER BTN
document.getElementById('themeSwitcher').onclick = function() {
  switchTheme();
}

// STATS BUTTON
document.getElementById('statsButton').onclick = function() {
  showStatsPanel();
}

// STATS PANEL CLOSE
document.getElementById('statsClose').onclick = function() {
  hideStatsPanel();
}

// PUBLIC BADGE CHECKBOX
document.getElementById('showPublicBadge').onchange = function() {
  userStats.showPublicBadge = this.checked;
  saveUserStats();
}

// ADD TO FAVORITES BUTTON
document.getElementById('addToFavoritesBtn').onclick = function() {
  if (currentPartnerId) {
    addToFavorites(currentPartnerId);
  }
}

// CONNECT WITH FAVORITE BUTTON
document.getElementById('connectWithFavoriteBtn').onclick = function() {
  connectWithFavorite();
}

// RATING BUTTONS
let ratingAction = 'continue'; // 'continue' for skip, 'return' for end

document.getElementById('ratingHeart').onclick = function() {
  submitRating('heart');
}

document.getElementById('ratingPoop').onclick = function() {
  submitRating('poop');
}

document.getElementById('ratingGhost').onclick = function() {
  submitRating('ghost');
}

function setRatingAction(action) {
  ratingAction = action;
}

// Submit rating to backend API
async function submitRatingToBackend(rating, chatDuration) {
  try {
    const response = await fetch('/rate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: anonUserId,
        rating: rating,
        chatDuration: chatDuration
      })
    });
    
    const result = await response.json();
    
    if (result.success && result.xpGained) {
      // Update local XP and show notification
      userStats.totalXP = (userStats.totalXP || 0) + result.xpGained;
      saveUserStats();
      updateLevelDisplay();
      
      // Show XP gained notification
      showXPNotification(result.xpGained, result.level);
    }
    
    if (!response.ok) {
      console.error('Failed to submit rating to backend');
    }
  } catch (error) {
    console.error('Error submitting rating:', error);
  }
}

function showXPNotification(xpGained, level) {
  // Create XP notification popup
  const popup = document.createElement('div');
  popup.className = 'xp-popup';
  popup.innerHTML = `
    <div class="xp-popup-content">
      <div class="xp-icon">✨</div>
      <div class="xp-gained">+${xpGained} XP</div>
      <div class="xp-level">${level.name} (Lvl ${level.level})</div>
    </div>
  `;
  
  document.body.appendChild(popup);
  
  // Animate and remove
  setTimeout(() => popup.classList.add('show'), 100);
  setTimeout(() => {
    popup.classList.remove('show');
    setTimeout(() => document.body.removeChild(popup), 300);
  }, 3000);
}

function submitRating(rating) {
  if (lastRatingDate === new Date().toDateString()) {
    hideRatingModal();
    handlePostRating();
    return; // Already rated today
  }
  
  // Update statistics
  if (rating === 'heart') userStats.heartCount++;
  else if (rating === 'poop') userStats.poopCount++;
  else if (rating === 'ghost') userStats.ghostCount++;
  
  // Track clean chats (heart or ghost, but not poop)
  if (rating === 'heart' || rating === 'ghost') {
    userStats.cleanChats++;
  }
  
  lastRatingDate = new Date().toDateString();
  updateStreak();
  
  // Record chat end time and update total time
  let chatDuration = 0;
  if (currentChatStart) {
    chatDuration = (Date.now() - currentChatStart) / 1000;
    userStats.totalTime += chatDuration;
  }
  
  userStats.totalChats++;
  saveUserStats();
  
  // Submit rating to backend
  submitRatingToBackend(rating, chatDuration);
  
  // Update challenges
  if (window.challengesSystem) {
    window.challengesSystem.updateChallengeProgress('rating_given', { rating });
    window.challengesSystem.updateChallengeProgress('chat_completed', { 
      duration: chatDuration,
      theme: currentTheme 
    });
    window.challengesSystem.updateChallengeProgress('streak_updated', { streak: userStats.currentStreak });
    window.challengesSystem.trackThemeUsage(currentTheme);
  }
  
  hideRatingModal();
  
  // Show behavior warning if needed
  if (shouldShowBehaviorWarning()) {
    setTimeout(() => {
      showNotif('💡 Tip: Zkus být více přátelský v chatech. Kvalitní konverzace přináší lepší zážitky!', false);
    }, 1000);
  } else {
    handlePostRating();
  }
}

function handlePostRating() {
  // Clear chat messages
  document.getElementById('messages').innerHTML = '';
  
  // Clear current partner ID after rating is done
  currentPartnerId = null;
  
  if (ratingAction === 'continue') {
    // Randomize theme for new chat
    randomizeTheme();
    
    // Show loading overlay while looking for new partner
    showLoadingOverlay();
    
    // Start new chat after short pause
    setTimeout(() => {
      startSocket();
    }, 700);
  } else {
    // Return to main page
    showMainPage();
  }
}

// SOUND TOGGLE BTN
document.getElementById('soundToggle').onclick = function() {
  soundEnabled = !soundEnabled;
  localStorage.setItem('soundEnabled', soundEnabled);
  updateSoundToggle();
  
  // Test sound when enabling
  if (soundEnabled) {
    playMessageSend();
  }
}

// CHAT FORM SUBMIT
document.getElementById('chatForm').onsubmit = function(e) {
  e.preventDefault();
  sendMsg();
};

// CONTINUE/RETURN BTN
document.getElementById('continueBtn').onclick = function() {
  // Clear chat messages
  document.getElementById('messages').innerHTML = '';
  
  // Randomize theme for new chat
  randomizeTheme();
  
  // Show loading overlay while looking for new partner
  showLoadingOverlay();
  
  // Start new chat after short pause
  setTimeout(() => {
    startSocket();
  }, 700);
};
document.getElementById('returnBtn').onclick = function() {
  // Clear chat messages
  document.getElementById('messages').innerHTML = '';
  
  // Return to main page
  showMainPage();
};
// SKIP BTN = najde nového partnera bez návratu na hlavní
document.getElementById('skipBtn').onclick = function() {
    if (socket) socket.emit('leave_chat');
    
    // Store partner ID before disconnecting (to preserve it for rating modal)
    const partnerIdForRating = currentPartnerId;
    
    socket.disconnect();

    // Play chat end sound
    playChatEnd();

    // Set action for rating
    setRatingAction('continue');
    
    // Restore partner ID for rating modal
    currentPartnerId = partnerIdForRating;
    
    // Show rating modal first
    showRatingModal();
};

// END CHAT BTN = konec chatu, návrat na hlavní
document.getElementById('endBtn').onclick = function() {
    if (socket) socket.emit('leave_chat');
    
    // Store partner ID before disconnecting (to preserve it for rating modal)
    const partnerIdForRating = currentPartnerId;
    
    socket.disconnect();

    // Play chat end sound
    playChatEnd();

    // Set action for rating
    setRatingAction('return');
    
    // Restore partner ID for rating modal
    currentPartnerId = partnerIdForRating;
    
    // Show rating modal first
    showRatingModal();
};
// SOCKET.IO
function startSocket(preferFavorites = false) {
  // Disconnect existing socket if it exists and clean up properly
  if (socket) {
    socket.removeAllListeners(); // Remove all event listeners to prevent memory leaks
    socket.disconnect();
    socket = null;
  }
  
  // Reset connection state
  partnerActive = true;
  currentPartnerId = null;
  
  socket = io();
  
  socket.on('connect', ()=> {
    // Send user ID to server for favorite matching
    socket.emit('set_user_id', anonUserId);
    
    // Start pairing process
    socket.emit('start_pairing');
  });
  
  socket.on('online', (count)=>{
    document.getElementById('onlineCount').textContent = "Online: " + count;
  });
  
  socket.on('partner', (data)=> {
    currentChatStart = Date.now(); // Track chat start time
    showChatPage();
    
    // Extract partner ID from socket event if available
    if (data && data.partnerId) {
      currentPartnerId = data.partnerId;
    }
    
    if (data && data.type === 'favorite') {
      addMsg('💫 Spojení s oblíbeným partnerem!', mySide);
    } else {
      addMsg('✅ Partner found!', mySide);
    }
    
    showPublicBadge(); // Show public badge if enabled
    
    // Play partner found sound
    playPartnerFound();
  });
  socket.on('msg', (data)=>{
    addMsg(data, mySide==='right' ? 'left' : 'right');
  });
  socket.on('typing', ()=> {
    document.getElementById('typingIndicator').style.display = '';
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(()=> {
      document.getElementById('typingIndicator').style.display = 'none';
    }, 2000);
  });
  socket.on('partner_left', ()=> {
    setRatingAction('continue'); // Default to continue when partner leaves
    showRatingModal(); // Show rating modal when partner leaves
    partnerActive = false;
    
    // Play chat end sound
    playChatEnd();
  });
  
  socket.on('disconnect', (reason)=> {
    // Only show disconnect message if it's an unexpected disconnect
    // Don't show it when user intentionally ends chat or navigates away
    if (reason !== 'io client disconnect' && reason !== 'client namespace disconnect') {
      showNotif('Disconnected from server.', true);
    }
    
    // Always clean up state on disconnect
    currentPartnerId = null;
    partnerActive = false;
    currentChatStart = null;
    
    // Clear typing indicator
    document.getElementById('typingIndicator').style.display = 'none';
  });

  // Indikace psaní
  document.getElementById('chatInput').addEventListener('input', ()=>{
    if (partnerActive) socket.emit('typing');
  });
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
  // Set up sound toggle
  updateSoundToggle();
  
  // Set up theme switcher
  updateThemeSwitcher();
  applyMainTheme(currentTheme);
  
  // Set initial theme variation
  randomizeTheme();
  
  // Show welcome message for new users
  if (userStats.totalChats === 0 && !localStorage.getItem('anonx_welcome_shown')) {
    setTimeout(() => {
      showNotif('🎉 Vítej v AnonX Chat! Dokončuj chaty, získávej hodnocení a plň výzvy pro odblokování speciálních odměn. Začni svůj první pokec! 📊', false);
      localStorage.setItem('anonx_welcome_shown', 'true');
    }, 2000);
  }
});
