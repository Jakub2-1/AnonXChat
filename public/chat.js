/*
 * Developer Mode: Premium Theme Unlock
 * 
 * For development and testing purposes, you can unlock all premium themes locally by running:
 * localStorage.setItem('devKey', 'MY_SECRET_KEY')
 * 
 * This works only locally in your browser and is intended for development/testing.
 * Refresh the page after setting the key to see premium themes unlocked.
 */

// proměnné
let socket;
let mySide = 'right';
let partnerActive = true;
let typingTimeout;
let soundEnabled = localStorage.getItem('soundEnabled') !== 'false'; // Default to true
let currentTheme = localStorage.getItem('selectedTheme') || 'glow'; // Default to glow theme (free)
const devAccessKey = localStorage.getItem('devKey');
let hasPremiumAccess = localStorage.getItem('anonx_premium') === 'true' || devAccessKey === 'MY_SECRET_KEY'; // Premium access flag

// Individual premium theme unlocks - new system
let premiumThemesUnlocked = JSON.parse(localStorage.getItem('premiumThemesUnlocked') || '[]');

let currentThemeData = null;
let currentPartnerId = null; // Store current partner ID for favorites

// Page visibility state for handling tab switching
let isPageVisible = true;
let wasDisconnectedWhileHidden = false;
let reconnectOnVisible = false;
let disconnectTime = null;
let pageVisibilityAtDisconnect = true;
let justBecameVisible = false;
let hiddenStartTime = null;

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

// Language definitions
let currentLanguage = localStorage.getItem('selectedLanguage') || 'cs';

const languageDefinitions = {
  cs: {
    // Main page
    appTitle: 'AnonX Chat',
    startChat: 'Začít chat',
    soundOn: 'Zvuk ZAP',
    soundOff: 'Zvuk VYP',
    
    // Chat page
    typeMessage: 'Napište svou zprávu...',
    send: 'Odeslat',
    skip: 'Přeskočit',
    endChat: 'Ukončit chat',
    
    // Status messages
    lookingForPartner: 'Hledám partnera...',
    partnerFound: '✅ Partner nalezen!',
    favoritePartnerFound: '💫 Spojení s oblíbeným partnerem!',
    partnerLeft: 'Partner opustil chat',
    connectionLost: 'Připojení ztraceno. Zkuste se znovu připojit.',
    connectionRestored: 'Připojení obnoveno.',
    
    // Rating modal
    ratingTitle: 'Jaký byl tvůj pokec?',
    ratingLiked: 'Líbilo se mi',
    ratingBad: 'Byla to bída',
    ratingRandom: 'Jen náhodný pokec',
    favoriteText: 'Ten chat byl super? Přidej do oblíbených!',
    addToFavorites: 'Přidat do oblíbených',
    
    // Statistics
    myStats: 'Moje statistiky',
    totalChats: 'Celkem chatů',
    avgLength: 'Průměrná délka',
    currentStreak: 'Dnešní streak',
    karmaLevel: 'Karma úroveň',
    heartRating: '❤️ hodnocení',
    poopRating: '💩 hodnocení',
    showPublicBadge: 'Zobrazit veřejný odznak',
    favoritePartners: 'Oblíbení partneři',
    mutualFavorites: 'Vzájemných',
    connectWithFavorite: 'Spojit s oblíbeným',
    currentChallenges: 'Aktuální výzvy',
    totalPoints: 'Celkem bodů:',
    
    // Level names
    levelNames: {
      1: 'Nováček',
      2: 'Pokecník', 
      3: 'Komunikátor',
      4: 'Společník',
      5: 'Chatmaster',
      6: 'Konverzační mistr',
      7: 'Sociální guru',
      8: 'Legendární partner',
      9: 'Chat veterán',
      10: 'Mistr anonymity'
    },
    
    // Karma levels
    karmaLevels: {
      novice: 'Nováček',
      problematic: 'Problematik',
      angel: 'Anděl',
      pleasant: 'Příjemný',
      average: 'Průměrný'
    },
    
    // Notifications
    findNewPartner: 'Najít nového partnera',
    goBack: 'Zpět',
    exitSearch: 'Odejít',
    favoriteAdded: '⭐ Partner přidán do oblíbených!',
    mutualFavorite: '💫 Skvělé! Máte vzájemně oblíbeného partnera! Nyní se můžete spojit mimo běžné párování.',
    favoriteAddError: '❌ Nepodařilo se přidat partnera do oblíbených.',
    noMutualFavorites: '🤷 Nemáte žádné vzájemně oblíbené partnery online.',
    behaviorTip: '💡 Tip: Zkus být více přátelský v chatech. Kvalitní konverzace přináší lepší zážitky!',
    welcome: '🎉 Vítej v AnonX Chat! Dokončuj chaty, získávej hodnocení a plň výzvy pro odblokování speciálních odměn. Začni svůj první pokec! 📊',
    
    // Time units
    minutes: 'm',
    
    // Misc
    online: 'Online:',
    max: 'MAX',
    maxLevel: '(Maximální level!)',
    toNextLevel: 'do dalšího levelu',
    favoriteCount: 'Oblíbených',
    mutualCount: 'Vzájemných',
    
    // Settings dropdown
    settings: 'Nastavení',
    theme: 'Motiv',
    language: 'Jazyk',
    statistics: 'Statistiky',
    premiumThemes: 'Premium motivy'
  },
  
  en: {
    // Main page
    appTitle: 'AnonX Chat',
    startChat: 'Start Chat',
    soundOn: 'Sound ON',
    soundOff: 'Sound OFF',
    
    // Chat page
    typeMessage: 'Type your message...',
    send: 'Send',
    skip: 'Skip',
    endChat: 'End Chat',
    
    // Status messages
    lookingForPartner: 'Looking for a partner...',
    partnerFound: '✅ Partner found!',
    favoritePartnerFound: '💫 Connected with favorite partner!',
    partnerLeft: 'Partner left the chat',
    connectionLost: 'Connection lost. Please try to reconnect.',
    connectionRestored: 'Connection restored.',
    
    // Rating modal
    ratingTitle: 'How was your chat?',
    ratingLiked: 'I liked it',
    ratingBad: 'It was bad',
    ratingRandom: 'Just random chat',
    favoriteText: 'That chat was great? Add to favorites!',
    addToFavorites: 'Add to favorites',
    
    // Statistics
    myStats: 'My Statistics',
    totalChats: 'Total Chats',
    avgLength: 'Average Length',
    currentStreak: 'Current Streak',
    karmaLevel: 'Karma Level',
    heartRating: '❤️ ratings',
    poopRating: '💩 ratings',
    showPublicBadge: 'Show public badge',
    favoritePartners: 'Favorite Partners',
    mutualFavorites: 'Mutual',
    connectWithFavorite: 'Connect with favorite',
    currentChallenges: 'Current Challenges',
    totalPoints: 'Total Points:',
    
    // Level names
    levelNames: {
      1: 'Newcomer',
      2: 'Chatter',
      3: 'Communicator', 
      4: 'Companion',
      5: 'Chatmaster',
      6: 'Conversation Expert',
      7: 'Social Guru',
      8: 'Legendary Partner',
      9: 'Chat Veteran',
      10: 'Master of Anonymity'
    },
    
    // Karma levels
    karmaLevels: {
      novice: 'Novice',
      problematic: 'Problematic',
      angel: 'Angel',
      pleasant: 'Pleasant',
      average: 'Average'
    },
    
    // Notifications
    findNewPartner: 'Find New Partner',
    goBack: 'Go Back',
    exitSearch: 'Exit',
    favoriteAdded: '⭐ Partner added to favorites!',
    mutualFavorite: '💫 Great! You have a mutual favorite partner! You can now connect outside regular pairing.',
    favoriteAddError: '❌ Failed to add partner to favorites.',
    noMutualFavorites: '🤷 You have no mutual favorite partners online.',
    behaviorTip: '💡 Tip: Try to be more friendly in chats. Quality conversations bring better experiences!',
    welcome: '🎉 Welcome to AnonX Chat! Complete chats, get ratings and fulfill challenges to unlock special rewards. Start your first chat! 📊',
    
    // Time units
    minutes: 'm',
    
    // Misc
    online: 'Online:',
    max: 'MAX',
    maxLevel: '(Maximum level!)',
    toNextLevel: 'to next level',
    favoriteCount: 'Favorites',
    mutualCount: 'Mutual',
    
    // Settings dropdown
    settings: 'Settings',
    theme: 'Theme',
    language: 'Language',
    statistics: 'Statistics',
    premiumThemes: 'Premium Themes'
  }
};

// Theme definitions with FREE/PREMIUM categorization - Updated per requirements
const themeDefinitions = {
  // FREE THEMES - Only Glow and Goth remain free
  glow: {
    name: 'Glow',
    icon: '🌟',
    className: 'theme-glow',
    category: 'free',
    description: 'Bright and cheerful light theme'
  },
  goth: {
    name: 'Goth',
    icon: '💀',
    className: 'theme-goth',
    category: 'free', 
    description: 'Dark gothic atmosphere'
  },
  pixelquest: {
    name: 'Pixel Quest',
    icon: '🎮',
    className: 'theme-pixelquest',
    category: 'premium',
    description: 'Retro 8-bit Gameboy style adventure'
  },
  
  // PREMIUM THEMES - Poltergeist moved here + new themes added
  poltergeist: {
    name: 'Poltergeist',
    icon: '👁️‍🗨️',
    className: 'theme-poltergeist',
    category: 'premium',
    description: 'Disturbing supernatural energy'
  },
  hellokitty: {
    name: 'Hello Kitty',
    icon: '🎀',
    className: 'theme-hellokitty',
    category: 'premium',
    description: 'Kawaii pink and cute vibes'
  },
  chill: {
    name: 'Chill',
    icon: '🌸',
    className: 'theme-chill',
    category: 'premium',
    description: 'Relaxing gradient with floating elements'
  },
  chaos: {
    name: 'Chaos',
    icon: '💥',
    className: 'theme-chaos',
    category: 'premium',
    description: 'Wild multicolor madness'
  },

  retroneon: {
    name: 'Retro Neon',
    icon: '🌈',
    className: 'theme-retroneon',
    category: 'premium',
    description: '80s cyberpunk neon lights'
  },
  digitalvoid: {
    name: 'Digital Void',
    icon: '🕳️',
    className: 'theme-digitalvoid',
    category: 'premium',
    description: 'Matrix-like digital darkness'
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
  if (totalRatings === 0) return getText('karmaLevels.novice');
  
  const poopRatio = userStats.poopCount / totalRatings;
  const heartRatio = userStats.heartCount / totalRatings;
  
  if (poopRatio > 0.3) return getText('karmaLevels.problematic');
  if (heartRatio > 0.7) return getText('karmaLevels.angel');
  if (heartRatio > 0.5) return getText('karmaLevels.pleasant');
  return getText('karmaLevels.average');
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
    Math.round(userStats.totalTime / userStats.totalChats / 60) + getText('minutes') : '0' + getText('minutes');
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
    { level: 1, name: getText('levelNames.1'), xpRequired: 0 },
    { level: 2, name: getText('levelNames.2'), xpRequired: 50 },
    { level: 3, name: getText('levelNames.3'), xpRequired: 150 },
    { level: 4, name: getText('levelNames.4'), xpRequired: 300 },
    { level: 5, name: getText('levelNames.5'), xpRequired: 500 },
    { level: 6, name: getText('levelNames.6'), xpRequired: 800 },
    { level: 7, name: getText('levelNames.7'), xpRequired: 1200 },
    { level: 8, name: getText('levelNames.8'), xpRequired: 1700 },
    { level: 9, name: getText('levelNames.9'), xpRequired: 2500 },
    { level: 10, name: getText('levelNames.10'), xpRequired: 3500 }
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
    document.getElementById('xpToNext').textContent = `(${nextLevel.xpRequired - (userStats.totalXP || 0)} ${getText('toNextLevel')})`;
    
    const progress = Math.min(100, ((userStats.totalXP || 0) - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired) * 100);
    document.getElementById('xpProgress').style.width = progress + '%';
  } else {
    document.getElementById('nextLevelXP').textContent = getText('max');
    document.getElementById('xpToNext').textContent = `(${getText('maxLevel')})`;
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
        showNotif(getText('mutualFavorite'), false);
      } else {
        showNotif(getText('favoriteAdded'), false);
      }
      
      saveUserStats();
      updateFavoritesDisplay();
    }
  } catch (error) {
    console.error('Error adding favorite:', error);
    showNotif(getText('favoriteAddError'), false);
  }
}

async function connectWithFavorite() {
  if ((userStats.mutualFavorites || []).length === 0) {
    showNotif(getText('noMutualFavorites'), false);
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

// Theme management with premium access control
function getAvailableThemes() {
  const freeThemes = Object.keys(themeDefinitions).filter(key => 
    themeDefinitions[key].category === 'free'
  );
  
  if (hasPremiumAccess) {
    return Object.keys(themeDefinitions);
  }
  
  return freeThemes;
}

function canUseTheme(themeName) {
  const theme = themeDefinitions[themeName];
  if (!theme) return false;
  
  // Free themes are always available
  if (theme.category === 'free') return true;
  
  // Premium themes: check individual unlock OR legacy premium access OR dev access
  if (theme.category === 'premium') {
    return premiumThemesUnlocked.includes(themeName) || 
           hasPremiumAccess || 
           devAccessKey === 'MY_SECRET_KEY';
  }
  
  return false;
}

// Function to unlock a specific premium theme
function unlockPremiumTheme(themeName) {
  const theme = themeDefinitions[themeName];
  if (!theme || theme.category !== 'premium') return false;
  
  if (!premiumThemesUnlocked.includes(themeName)) {
    premiumThemesUnlocked.push(themeName);
    localStorage.setItem('premiumThemesUnlocked', JSON.stringify(premiumThemesUnlocked));
    
    // Show unlock notification
    showNotif(`🎉 ${theme.name} theme unlocked!`, false);
    return true;
  }
  
  return false; // Already unlocked
}

// Function to check if a specific premium theme is unlocked
function isThemeUnlocked(themeName) {
  return canUseTheme(themeName);
}

function switchTheme() {
  const availableThemes = getAvailableThemes();
  const currentIndex = availableThemes.indexOf(currentTheme);
  const nextIndex = (currentIndex + 1) % availableThemes.length;
  const nextTheme = availableThemes[nextIndex];
  
  if (canUseTheme(nextTheme)) {
    currentTheme = nextTheme;
    applyMainTheme(currentTheme);
    localStorage.setItem('selectedTheme', currentTheme);
  }
}

function setTheme(themeName) {
  if (canUseTheme(themeName)) {
    currentTheme = themeName;
    applyMainTheme(currentTheme);
    localStorage.setItem('selectedTheme', currentTheme);
    return true;
  }
  return false;
}

// Theme management - Updated to support modal selection
function switchTheme() {
  // Open theme selection modal instead of cycling
  showThemeModal();
}

function showThemeModal() {
  const themeModal = document.getElementById('themeModal');
  if (!themeModal) return;
  
  // Update modal text based on current language
  updateThemeModalTexts();
  
  // Mark current theme as selected
  updateThemeSelection();
  
  themeModal.style.display = 'flex';
  themeModal.style.opacity = '0';
  setTimeout(() => {
    themeModal.style.opacity = '1';
  }, 10);
}

function hideThemeModal() {
  const themeModal = document.getElementById('themeModal');
  if (!themeModal) return;
  
  themeModal.style.opacity = '0';
  setTimeout(() => {
    themeModal.style.display = 'none';
  }, 300);
}

function updateThemeModalTexts() {
  const title = document.querySelector('.theme-modal-title');
  if (title) {
    title.textContent = currentLanguage === 'cs' ? 'Vyberte motiv' : 'Select Theme';
  }
  
  const categoryTitles = document.querySelectorAll('.theme-category-title');
  if (categoryTitles.length >= 2) {
    categoryTitles[0].textContent = 'Free';
    categoryTitles[1].textContent = currentLanguage === 'cs' ? 'Premium 🔒' : 'Premium 🔒';
  }
}

function updateThemeSelection() {
  const options = document.querySelectorAll('.theme-option');
  options.forEach(option => {
    option.classList.remove('selected');
    if (option.dataset.theme === currentTheme) {
      option.classList.add('selected');
    }
  });
}

function selectTheme(themeName) {
  if (themeName === 'premium') {
    // Show premium message
    showNotif(currentLanguage === 'cs' ? 
      '🔒 Premium motivy budou dostupné v budoucí verzi!' : 
      '🔒 Premium themes will be available in future version!', false);
    return;
  }
  
  // Apply the selected theme
  currentTheme = themeName;
  applyMainTheme(currentTheme);
  localStorage.setItem('selectedTheme', currentTheme);
  
  // Update theme icon
  updateThemeSwitcher();
  
  // Hide modal
  hideThemeModal();
  
  // Apply random color variation
  randomizeTheme();
main
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
  
  // Show/hide retro neon logo based on theme
  updateRetroNeonLogo(themeName);
  
  // Add special effects for specific themes
  if (themeName === 'goth') {
    createDeepGothOverlays();
  } else if (themeName === 'poltergeist') {
    createPoltergeistEffects();
  } else if (themeName === 'retroneon') {
    createRetroNeonEffects();
  } else if (themeName === 'digitalvoid') {
    createDigitalVoidEffects();
  } else if (themeName === 'hellokitty') {
    createHelloKittyEffects();
  } else if (themeName === 'chill') {
    createChillEffects();
  } else if (themeName === 'chaos') {
    createChaosEffects();
  } else if (themeName === 'pixelquest') {
    createPixelQuestEffects();
  }
  
  // Apply color variations for themes that support them
  if (themeName === 'goth') {
    randomizeTheme(); 
  } else if (themeName === 'poltergeist') {
    randomizePoltergeistTheme();
  } else if (themeName === 'chaos') {
    randomizeChaosTheme();
  } else {
    randomizeTheme();
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
  const overlays = [
    'fogOverlay', 'sparklesOverlay', 'shadowsOverlay', 
    'poltergeistGlitchOverlay', 'poltergeistStaticOverlay',
    'retroNeonOverlay', 'digitalVoidOverlay', 'pixelQuestBanner'
  ];
  overlays.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.remove();
    }
  });
  
  // Remove Hello Kitty effects when switching themes
  removeHelloKittyEffects();
  
  // Remove Chill effects when switching themes
  removeChillEffects();
  
  // Remove Chaos effects when switching themes
  removeChaosEffects();
  
  // Remove Pixel Quest effects when switching themes
  removePixelQuestEffects();
  
  // Remove Digital Void Matrix rain effects when switching themes
  removeDigitalVoidEffects();
  
  // Remove retro neon logo electrical effects when switching themes
  removeElectricalSparks();
}

// Create retro neon effects
function createRetroNeonEffects() {
  const body = document.body;
  
  const retroOverlay = document.createElement('div');
  retroOverlay.className = 'retro-neon-overlay';
  retroOverlay.id = 'retroNeonOverlay';
  body.appendChild(retroOverlay);
  
  // Add random neon blinking effects
  setInterval(() => {
    if (currentTheme === 'retroneon') {
      // Random blink effect for neon elements
      const neonElements = document.querySelectorAll('.theme-retroneon .msg-bubble, .theme-retroneon .send-btn, .theme-retroneon .chat-input');
      neonElements.forEach(element => {
        if (Math.random() < 0.1) { // 10% chance to blink
          element.style.animation = 'neon-quick-blink 0.3s ease-in-out';
          setTimeout(() => {
            element.style.animation = '';
          }, 300);
        }
      });
    }
  }, 2000); // Check every 2 seconds
}

// Update retro neon logo visibility based on theme
function updateRetroNeonLogo(themeName) {
  const logoElement = document.getElementById('retroNeonLogo');
  const body = document.body;
  
  if (!logoElement) return;
  
  if (themeName === 'retroneon') {
    // Show the logo with animation
    logoElement.style.display = 'block';
    body.classList.add('logo-active');
    
    // Trigger entrance animation
    logoElement.style.opacity = '0';
    logoElement.style.transform = 'translateY(20px) scale(0.8)';
    
    // Use requestAnimationFrame to ensure CSS is applied before animation
    requestAnimationFrame(() => {
      logoElement.style.transition = 'all 0.8s ease-out';
      logoElement.style.opacity = '1';
      logoElement.style.transform = 'translateY(0) scale(1)';
    });
    
    // Add electrical spark effects
    createElectricalSparks();
    
  } else {
    // Hide the logo with fade out animation
    if (logoElement.style.display !== 'none') {
      logoElement.style.transition = 'all 0.5s ease-in';
      logoElement.style.opacity = '0';
      logoElement.style.transform = 'translateY(-10px) scale(0.9)';
      
      setTimeout(() => {
        logoElement.style.display = 'none';
        body.classList.remove('logo-active');
      }, 500);
    }
    
    // Remove electrical effects
    removeElectricalSparks();
  }
}

// Create electrical spark effects around the logo
function createElectricalSparks() {
  // Remove existing sparks first
  removeElectricalSparks();
  
  const logoElement = document.getElementById('retroNeonLogo');
  if (!logoElement) return;
  
  // Create spark container
  const sparksContainer = document.createElement('div');
  sparksContainer.className = 'electrical-sparks-container';
  sparksContainer.id = 'electricalSparks';
  logoElement.appendChild(sparksContainer);
  
  // Create multiple spark points
  for (let i = 0; i < 6; i++) {
    const spark = document.createElement('div');
    spark.className = 'electrical-spark';
    spark.style.cssText = `
      position: absolute;
      width: 2px;
      height: 2px;
      background: #00ffff;
      border-radius: 50%;
      box-shadow: 0 0 10px #00ffff, 0 0 20px #ff69b4;
      animation: sparkFlicker ${0.5 + Math.random() * 1}s ease-in-out infinite;
      animation-delay: ${Math.random() * 2}s;
    `;
    
    // Random positioning around the logo
    const angle = (i / 6) * 360 + Math.random() * 60;
    const distance = 120 + Math.random() * 40;
    const x = Math.cos(angle * Math.PI / 180) * distance;
    const y = Math.sin(angle * Math.PI / 180) * distance;
    
    spark.style.left = `calc(50% + ${x}px)`;
    spark.style.top = `calc(50% + ${y}px)`;
    
    sparksContainer.appendChild(spark);
  }
  
  // Add CSS for spark animation if not already present
  if (!document.getElementById('sparkAnimationStyles')) {
    const sparkStyles = document.createElement('style');
    sparkStyles.id = 'sparkAnimationStyles';
    sparkStyles.textContent = `
      .electrical-sparks-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10;
      }
      
      @keyframes sparkFlicker {
        0%, 70%, 100% { opacity: 0; transform: scale(1); }
        71% { opacity: 0.3; transform: scale(0.8); }
        72% { opacity: 1; transform: scale(1.2); }
        73% { opacity: 0.5; transform: scale(1); }
        74% { opacity: 0.8; transform: scale(1.1); }
        75% { opacity: 0.1; transform: scale(0.9); }
        76% { opacity: 0.9; transform: scale(1.3); }
        80% { opacity: 0; transform: scale(1); }
      }
    `;
    document.head.appendChild(sparkStyles);
  }
}

// Remove electrical spark effects
function removeElectricalSparks() {
  const sparksContainer = document.getElementById('electricalSparks');
  if (sparksContainer) {
    sparksContainer.remove();
  }
}

// Create digital void effects  
function createDigitalVoidEffects() {
  const body = document.body;
  
  const digitalOverlay = document.createElement('div');
  digitalOverlay.className = 'digital-void-overlay';
  digitalOverlay.id = 'digitalVoidOverlay';
  body.appendChild(digitalOverlay);
  
  // Start Matrix rain effect
  startMatrixRain(digitalOverlay);
}

// Matrix rain effect implementation
function startMatrixRain(container) {
  // Characters for the Matrix rain
  const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  // Create columns based on screen width
  const columnWidth = 20;
  const columns = Math.floor(window.innerWidth / columnWidth);
  
  // Store active rain drops
  const rainDrops = [];
  
  function createRainDrop() {
    const column = Math.floor(Math.random() * columns);
    const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
    
    const drop = document.createElement('div');
    drop.className = 'matrix-rain';
    
    // Random brightness for variety
    const brightness = Math.random();
    if (brightness > 0.8) {
      drop.classList.add('bright');
    } else if (brightness < 0.3) {
      drop.classList.add('dim');
    }
    
    drop.textContent = char;
    drop.style.left = column * columnWidth + 'px';
    drop.style.animationDuration = (Math.random() * 3 + 2) + 's'; // 2-5 seconds
    drop.style.animationDelay = Math.random() * 2 + 's'; // 0-2 seconds delay
    
    container.appendChild(drop);
    rainDrops.push(drop);
    
    // Remove drop after animation completes
    setTimeout(() => {
      if (drop.parentNode) {
        drop.parentNode.removeChild(drop);
      }
      const index = rainDrops.indexOf(drop);
      if (index > -1) {
        rainDrops.splice(index, 1);
      }
    }, 7000); // Max animation time + buffer
  }
  
  function createMatrixRainPattern() {
    // Create multiple drops at once for denser effect
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        createRainDrop();
      }, i * 100);
    }
  }
  
  // Start the rain pattern
  const matrixInterval = setInterval(createMatrixRainPattern, 200);
  
  // Store interval reference for cleanup
  if (!window.matrixIntervals) {
    window.matrixIntervals = [];
  }
  window.matrixIntervals.push(matrixInterval);
  
  // Handle window resize
  const resizeHandler = () => {
    const newColumns = Math.floor(window.innerWidth / columnWidth);
    // Columns count updated automatically for new drops
  };
  
  window.addEventListener('resize', resizeHandler);
  
  // Store resize handler for cleanup
  if (!window.matrixResizeHandlers) {
    window.matrixResizeHandlers = [];
  }
  window.matrixResizeHandlers.push(resizeHandler);
}

// ===== PIXEL QUEST RETRO THEME FUNCTIONS =====

// Pixel Quest theme constants
const pixelQuestMessages = [
  "Choose your fighter!",
  "Insert coin",
  "Press Start to continue",
  "Player 1 ready!",
  "Game Over... Try again?",
  "Level Up!",
  "New High Score!",
  "Achievement unlocked!",
  "Boss battle incoming!",
  "Power up collected!"
];

let pixelQuestBannerInterval = null;
let pixelQuestMessageIndex = 0;

// Create Pixel Quest effects when theme is activated
function createPixelQuestEffects() {
  const body = document.body;
  
  // Create retro game banner
  createPixelQuestBanner();
  
  // Override message send/receive sounds for this theme
  setupPixelQuestSounds();
  
  // Setup character animation for new messages
  setupPixelQuestMessageAnimations();
}

// Create the retro game banner at the top
function createPixelQuestBanner() {
  const existingBanner = document.getElementById('pixelQuestBanner');
  if (existingBanner) {
    existingBanner.remove();
  }
  
  const banner = document.createElement('div');
  banner.className = 'pixel-quest-banner';
  banner.id = 'pixelQuestBanner';
  banner.textContent = pixelQuestMessages[0];
  
  document.body.appendChild(banner);
  
  // Rotate messages every 5 seconds
  pixelQuestBannerInterval = setInterval(() => {
    pixelQuestMessageIndex = (pixelQuestMessageIndex + 1) % pixelQuestMessages.length;
    banner.textContent = pixelQuestMessages[pixelQuestMessageIndex];
  }, 5000);
}

// Setup pixel quest specific sounds
function setupPixelQuestSounds() {
  // Override the default sound functions for this theme
  window.pixelQuestSendSound = function() {
    playPixelQuestSound('inventory_open');
  };
  
  window.pixelQuestReceiveSound = function() {
    playPixelQuestSound('coin');
  };
}

// Play pixel quest specific sounds
function playPixelQuestSound(soundType) {
  if (!soundEnabled) return;
  
  try {
    let audioFile = '';
    let fallbackConfig = {};
    
    if (soundType === 'inventory_open') {
      audioFile = '/sounds/inventory_open.wav';
      // Fallback sound for inventory open (ascending tones)
      fallbackConfig = {
        frequencies: [200, 400, 600],
        duration: 0.3,
        type: 'square'
      };
    } else if (soundType === 'coin') {
      audioFile = '/sounds/coin.wav';
      // Fallback sound for coin (classic coin sound)
      fallbackConfig = {
        frequencies: [800, 1000, 1200, 1000],
        duration: 0.4,
        type: 'sine'
      };
    }
    
    // Try to play audio file first, fallback to generated sound
    const audio = new Audio(audioFile);
    audio.volume = 0.3;
    audio.play().catch(error => {
      console.log('Could not play pixel quest sound file, using generated sound');
      createPixelQuestSound(fallbackConfig);
    });
  } catch (error) {
    createPixelQuestSound(fallbackConfig);
  }
}

// Create pixel quest sound using Web Audio API
function createPixelQuestSound(soundConfig) {
  if (!soundEnabled) return;
  
  try {
    const { frequencies, duration, type } = soundConfig;
    const totalDuration = duration;
    const noteDuration = totalDuration / frequencies.length;
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + noteDuration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + noteDuration);
      }, noteDuration * index * 1000);
    });
  } catch (error) {
    console.log('Pixel quest sound not available:', error);
  }
}

// Setup character-by-character animations for messages
function setupPixelQuestMessageAnimations() {
  // This will be called when new messages are added
  window.pixelQuestAnimateMessage = function(messageElement) {
    if (currentTheme !== 'pixelquest') return;
    
    const messageText = messageElement.querySelector('.message-text');
    if (!messageText) return;
    
    const originalText = messageText.textContent;
    messageText.innerHTML = '';
    
    // Add char-animation class to trigger CSS animations
    messageElement.classList.add('char-animation');
    
    // Animate each character appearing
    Array.from(originalText).forEach((char, index) => {
      setTimeout(() => {
        const charSpan = document.createElement('span');
        charSpan.className = 'char';
        charSpan.textContent = char;
        charSpan.style.animationDelay = `${index * 0.05}s`;
        messageText.appendChild(charSpan);
      }, index * 50); // 50ms delay between characters
    });
  };
}

// Remove pixel quest effects when switching themes
function removePixelQuestEffects() {
  // Remove banner
  const banner = document.getElementById('pixelQuestBanner');
  if (banner) {
    banner.remove();
  }
  
  // Clear banner interval
  if (pixelQuestBannerInterval) {
    clearInterval(pixelQuestBannerInterval);
    pixelQuestBannerInterval = null;
  }
  
  // Reset sound functions
  if (window.pixelQuestSendSound) {
    delete window.pixelQuestSendSound;
  }
  if (window.pixelQuestReceiveSound) {
    delete window.pixelQuestReceiveSound;
  }
  if (window.pixelQuestAnimateMessage) {
    delete window.pixelQuestAnimateMessage;
  }
  
  // Reset message index
  pixelQuestMessageIndex = 0;
}

// ===== HELLO KITTY LUXURY THEME FUNCTIONS =====

// Global variables for Hello Kitty theme
let sparklesEnabled = localStorage.getItem('kitty_sparkles') !== 'false'; // Default to enabled
let currentKittyPosition = 'random';
let helloKittyCharacter = null;
let sparkleContainer = null;
let sparkleToggleBtn = null;
let autoWaveInterval = null;
let kittyClickHandler = null;

// Create Hello Kitty effects when theme is activated
function createHelloKittyEffects() {
  const body = document.body;
  
  // Create sparkles container
  createSparklesContainer();
  
  // Create Hello Kitty character
  createHelloKittyCharacter();
  
  // Create sparkle toggle button
  createSparkleToggle();
  
  // Set random positioning based on current page
  setRandomKittyPosition();
  
  // Add message interaction listeners
  setupKittyInteractions();
  
  // Add chat bubble click listeners for heart effect
  setupChatBubbleHearts();
}

// Create animated sparkles background
function createSparklesContainer() {
  // Check if sparkles container already exists in HTML
  const existingSparkles = document.getElementById('kittySparkles');
  if (existingSparkles) {
    sparkleContainer = existingSparkles;
    // Add additional sparkles if container is empty
    if (sparkleContainer.children.length === 0) {
      // Create multiple sparkles
      for (let i = 0; i < 20; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = `sparkle sparkle-${(i % 6) + 1}`;
        sparkle.textContent = Math.random() > 0.5 ? '✨' : '💎';
        
        // Random positioning
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        
        // Add drift animation randomly
        if (Math.random() > 0.5) {
          sparkle.classList.add('drift');
        }
        
        sparkleContainer.appendChild(sparkle);
      }
    }
    return;
  }
  
  if (sparkleContainer) {
    sparkleContainer.remove();
  }
  
  sparkleContainer = document.createElement('div');
  sparkleContainer.className = 'kitty-sparkles';
  sparkleContainer.id = 'kittySparkles';
  
  // Create multiple sparkles
  for (let i = 0; i < 20; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = `sparkle sparkle-${(i % 6) + 1}`;
    sparkle.textContent = Math.random() > 0.5 ? '✨' : '💎';
    
    // Random positioning
    sparkle.style.left = Math.random() * 100 + '%';
    sparkle.style.top = Math.random() * 100 + '%';
    
    // Add drift animation randomly
    if (Math.random() > 0.5) {
      sparkle.classList.add('drift');
    }
    
    sparkleContainer.appendChild(sparkle);
  }
  
  // Show/hide based on user preference
  if (!sparklesEnabled) {
    sparkleContainer.style.display = 'none';
  }
  
  document.body.appendChild(sparkleContainer);
}

// Create Hello Kitty character element
function createHelloKittyCharacter() {
  // Check if character already exists in HTML
  const existingCharacter = document.getElementById('helloKittyCharacter');
  if (existingCharacter) {
    helloKittyCharacter = existingCharacter;
    setupKittyInteractions();
    startKittyBlinking();
    return;
  }
  
  if (helloKittyCharacter) {
    helloKittyCharacter.remove();
  }
  
  helloKittyCharacter = document.createElement('div');
  helloKittyCharacter.className = 'hello-kitty-character';
  helloKittyCharacter.id = 'helloKittyCharacter';
  
  // Load improved SVG content from file
  fetch('/images/hellokitty.svg')
    .then(response => response.text())
    .then(svgContent => {
      helloKittyCharacter.innerHTML = svgContent;
      setupKittyInteractions();
      startKittyBlinking();
    })
    .catch(() => {
      // Fallback to inline SVG if file loading fails
      helloKittyCharacter.innerHTML = `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
          <!-- Enhanced Hello Kitty SVG - More authentic design -->
          
          <!-- Head with more authentic shape -->
          <ellipse cx="100" cy="110" rx="68" ry="58" fill="#ffffff" stroke="#ff69b4" stroke-width="1.5"/>
          
          <!-- Left ear with proper proportions -->
          <ellipse cx="62" cy="72" rx="22" ry="28" fill="#ffffff" stroke="#ff69b4" stroke-width="1.5"/>
          
          <!-- Right ear with proper proportions -->
          <ellipse cx="138" cy="72" rx="22" ry="28" fill="#ffffff" stroke="#ff69b4" stroke-width="1.5"/>
          
          <!-- Left ear inner -->
          <ellipse cx="62" cy="78" rx="12" ry="15" fill="#ffb6c1"/>
          
          <!-- Right ear inner -->
          <ellipse cx="138" cy="78" rx="12" ry="15" fill="#ffb6c1"/>
          
          <!-- Eyes with authentic oval shape -->
          <ellipse cx="85" cy="105" rx="6" ry="8" fill="#000000" class="kitty-eye-left"/>
          <ellipse cx="115" cy="105" rx="6" ry="8" fill="#000000" class="kitty-eye-right"/>
          
          <!-- Eye highlights for sparkle -->
          <ellipse cx="87" cy="102" rx="2" ry="3" fill="#ffffff" class="eye-highlight-left"/>
          <ellipse cx="117" cy="102" rx="2" ry="3" fill="#ffffff" class="eye-highlight-right"/>
          
          <!-- Nose with authentic yellow color -->
          <ellipse cx="100" cy="118" rx="3" ry="2" fill="#ffeb3b" stroke="#ff8f00" stroke-width="0.5"/>
          
          <!-- Iconic bow - more detailed and authentic -->
          <g class="kitty-bow">
            <!-- Left bow part -->
            <path d="M 115 65 Q 125 50 135 65 Q 125 75 115 65" fill="#ff1493" stroke="#c2185b" stroke-width="1"/>
            <!-- Right bow part -->
            <path d="M 135 65 Q 145 50 155 65 Q 145 75 135 65" fill="#ff1493" stroke="#c2185b" stroke-width="1"/>
            <!-- Center knot -->
            <ellipse cx="135" cy="65" rx="5" ry="8" fill="#e91e63" stroke="#c2185b" stroke-width="1"/>
            <!-- Bow highlights -->
            <ellipse cx="125" cy="60" rx="2" ry="3" fill="#ff69b4" opacity="0.7"/>
            <ellipse cx="145" cy="60" rx="2" ry="3" fill="#ff69b4" opacity="0.7"/>
          </g>
          
          <!-- Whiskers with proper spacing -->
          <line x1="55" y1="105" x2="30" y2="103" stroke="#000000" stroke-width="1.5" stroke-linecap="round" class="whisker-left-top"/>
          <line x1="55" y1="115" x2="30" y2="115" stroke="#000000" stroke-width="1.5" stroke-linecap="round" class="whisker-left-middle"/>
          <line x1="55" y1="125" x2="30" y2="127" stroke="#000000" stroke-width="1.5" stroke-linecap="round" class="whisker-left-bottom"/>
          
          <line x1="145" y1="105" x2="170" y2="103" stroke="#000000" stroke-width="1.5" stroke-linecap="round" class="whisker-right-top"/>
          <line x1="145" y1="115" x2="170" y2="115" stroke="#000000" stroke-width="1.5" stroke-linecap="round" class="whisker-right-middle"/>
          <line x1="145" y1="125" x2="170" y2="127" stroke="#000000" stroke-width="1.5" stroke-linecap="round" class="whisker-right-bottom"/>
          
          <!-- Body for when positioned -->
          <ellipse cx="100" cy="170" rx="42" ry="32" fill="#ffffff" stroke="#ff69b4" stroke-width="1.5" class="kitty-body" style="display:none;"/>
          
          <!-- Arms for interactions -->
          <ellipse cx="68" cy="155" rx="18" ry="22" fill="#ffffff" stroke="#ff69b4" stroke-width="1.5" class="kitty-arm-left" style="display:none;"/>
          <ellipse cx="132" cy="155" rx="18" ry="22" fill="#ffffff" stroke="#ff69b4" stroke-width="1.5" class="kitty-arm-right" style="display:none;"/>
          
          <!-- Hands for covering eyes interaction -->
          <circle cx="85" cy="105" r="12" fill="#ffffff" stroke="#ff69b4" stroke-width="1.5" class="kitty-hand-left" style="display:none;"/>
          <circle cx="115" cy="105" r="12" fill="#ffffff" stroke="#ff69b4" stroke-width="1.5" class="kitty-hand-right" style="display:none;"/>
          
          <!-- Blush spots for shy animation -->
          <ellipse cx="70" cy="115" rx="8" ry="6" fill="#ff69b4" opacity="0" class="blush-left"/>
          <ellipse cx="130" cy="115" rx="8" ry="6" fill="#ff69b4" opacity="0" class="blush-right"/>
          
          <!-- Mouth for smiling animations -->
          <path d="M 92 130 Q 100 138 108 130" stroke="#ff69b4" stroke-width="2" fill="none" stroke-linecap="round" class="kitty-mouth" style="display:none;"/>
        </svg>
      `;
      setupKittyInteractions();
      startKittyBlinking();
    });
  
  document.body.appendChild(helloKittyCharacter);
}

// Create sparkle toggle button
function createSparkleToggle() {
  if (sparkleToggleBtn) {
    sparkleToggleBtn.remove();
  }
  
  sparkleToggleBtn = document.createElement('button');
  sparkleToggleBtn.className = 'sparkle-toggle';
  sparkleToggleBtn.id = 'sparkleToggle';
  sparkleToggleBtn.innerHTML = sparklesEnabled ? '✨' : '🌫️';
  sparkleToggleBtn.title = sparklesEnabled ? 'Disable sparkles' : 'Enable sparkles';
  
  if (!sparklesEnabled) {
    sparkleToggleBtn.classList.add('disabled');
  }
  
  sparkleToggleBtn.addEventListener('click', toggleSparkles);
  
  document.body.appendChild(sparkleToggleBtn);
}

// Toggle sparkles on/off for performance
function toggleSparkles() {
  sparklesEnabled = !sparklesEnabled;
  localStorage.setItem('kitty_sparkles', sparklesEnabled.toString());
  
  if (sparkleContainer) {
    sparkleContainer.style.display = sparklesEnabled ? 'block' : 'none';
  }
  
  if (sparkleToggleBtn) {
    sparkleToggleBtn.innerHTML = sparklesEnabled ? '✨' : '🌫️';
    sparkleToggleBtn.title = sparklesEnabled ? 'Disable sparkles' : 'Enable sparkles';
    sparkleToggleBtn.classList.toggle('disabled', !sparklesEnabled);
  }
}

// Set random Hello Kitty positioning based on current page
function setRandomKittyPosition() {
  if (!helloKittyCharacter) return;
  
  const isMainPage = document.getElementById('mainPage').style.display !== 'none';
  const isChatPage = document.getElementById('chatPage').style.display !== 'none';
  
  // Clear existing position classes
  helloKittyCharacter.className = 'hello-kitty-character';
  
  if (isMainPage) {
    // Always place Hello Kitty on the Start Chat button for better visibility
    setKittyHugButton();
    helloKittyCharacter.dataset.positionType = 'hug';
    currentKittyPosition = 'kitty-main-hug-button';
    
    // Show body and arms for main page positions
    const body = helloKittyCharacter.querySelector('.kitty-body');
    const armLeft = helloKittyCharacter.querySelector('.kitty-arm-left');
    const armRight = helloKittyCharacter.querySelector('.kitty-arm-right');
    if (body) body.style.display = 'block';
    if (armLeft) armLeft.style.display = 'block';
    if (armRight) armRight.style.display = 'block';
    
  } else if (isChatPage) {
    // Chat page variants
    const chatVariants = ['kitty-chat-wave', 'kitty-chat-jump', 'kitty-assistant'];
    const randomVariant = chatVariants[Math.floor(Math.random() * chatVariants.length)];
    helloKittyCharacter.classList.add(randomVariant);
    currentKittyPosition = randomVariant;
    
    // Store position type for click interactions
    helloKittyCharacter.dataset.positionType = 'chat';
    
    // Hide body for chat positions (head only)
    const body = helloKittyCharacter.querySelector('.kitty-body');
    const armLeft = helloKittyCharacter.querySelector('.kitty-arm-left');
    const armRight = helloKittyCharacter.querySelector('.kitty-arm-right');
    if (body) body.style.display = 'none';
    if (armLeft) armLeft.style.display = 'none';
    if (armRight) armRight.style.display = 'none';
  }
  
  // Make character clickable and add click handler
  if (helloKittyCharacter) {
    helloKittyCharacter.style.cursor = 'pointer';
    helloKittyCharacter.style.pointerEvents = 'auto';
  }
}

// Setup Hello Kitty interactions for messages and clicks
function setupKittyInteractions() {
  // Remove existing listeners to prevent duplicates
  if (window.kittyMessageListener) {
    document.removeEventListener('kitty:newMessage', window.kittyMessageListener);
  }
  
  // Create new listener for message reactions
  window.kittyMessageListener = function(event) {
    if (!helloKittyCharacter || currentTheme !== 'hellokitty') return;
    
    const reactions = ['wink', 'clap', 'excited'];
    const reaction = reactions[Math.floor(Math.random() * reactions.length)];
    
    // Remove existing reaction classes
    clearKittyAnimations();
    
    // Add reaction class
    helloKittyCharacter.classList.add(`kitty-${reaction}`);
    
    // Remove class after animation
    setTimeout(() => {
      helloKittyCharacter.classList.remove(`kitty-${reaction}`);
    }, 1500);
  };
  
  document.addEventListener('kitty:newMessage', window.kittyMessageListener);
  
  // Setup click interactions
  setupKittyClickInteractions();
  
  // Setup automatic waving
  setupAutoWaving();
}

// Setup click interactions for Hello Kitty character
function setupKittyClickInteractions() {
  // Remove existing click handler
  if (kittyClickHandler && helloKittyCharacter) {
    helloKittyCharacter.removeEventListener('click', kittyClickHandler);
  }
  
  // Create new click handler
  kittyClickHandler = function(event) {
    event.stopPropagation();
    
    if (!helloKittyCharacter || currentTheme !== 'hellokitty') return;
    
    const positionType = helloKittyCharacter.dataset.positionType || 'above';
    
    // Clear any existing animations
    clearKittyAnimations();
    
    // Choose animation based on position type and add new interactive animations
    let animation;
    if (positionType === 'above') {
      const aboveAnimations = ['excited', 'spin', 'wink', 'clap'];
      animation = aboveAnimations[Math.floor(Math.random() * aboveAnimations.length)];
    } else if (positionType === 'side') {
      const sideAnimations = ['hide', 'wink', 'excited', 'clap'];
      animation = sideAnimations[Math.floor(Math.random() * sideAnimations.length)];
    } else {
      const chatAnimations = ['wink', 'clap', 'excited'];
      animation = chatAnimations[Math.floor(Math.random() * chatAnimations.length)];
    }
    
    // Apply animation
    helloKittyCharacter.classList.add(`kitty-${animation}`);
    
    // Add random interactive animations with the main animation
    const interactiveAnimations = [
      () => triggerKittyBlush(),
      () => triggerKittyCoverEyes(),
      () => triggerKittySmile(),
      () => triggerKittyHappy()
    ];
    
    // 40% chance to trigger an interactive animation
    if (Math.random() < 0.4) {
      const randomInteractive = interactiveAnimations[Math.floor(Math.random() * interactiveAnimations.length)];
      setTimeout(randomInteractive, 500); // Slight delay for layered effect
    }
    
    // Remove animation class after completion
    setTimeout(() => {
      helloKittyCharacter.classList.remove(`kitty-${animation}`);
    }, 1500);
    
    // Create heart animation at click position
    createHeartAnimation(event.clientX || window.innerWidth/2, event.clientY || window.innerHeight/2);
  };
  
  // Add click listener to character
  if (helloKittyCharacter) {
    helloKittyCharacter.addEventListener('click', kittyClickHandler);
  }
}

// Setup automatic waving at random intervals
function setupAutoWaving() {
  // Clear existing interval
  if (autoWaveInterval) {
    clearInterval(autoWaveInterval);
  }
  
  // Set up new interval for automatic waving
  autoWaveInterval = setInterval(() => {
    if (!helloKittyCharacter || currentTheme !== 'hellokitty') return;
    
    // Random chance to wave (30% chance every interval)
    if (Math.random() < 0.3) {
      // Clear existing animations
      clearKittyAnimations();
      
      // Apply auto-wave animation
      helloKittyCharacter.classList.add('kitty-auto-wave');
      
      // Remove after animation
      setTimeout(() => {
        helloKittyCharacter.classList.remove('kitty-auto-wave');
      }, 2000);
    }
  }, 8000 + Math.random() * 12000); // Random interval between 8-20 seconds
}

// Helper function to clear all animation classes
function clearKittyAnimations() {
  if (!helloKittyCharacter) return;
  
  const animationClasses = [
    'kitty-wink', 'kitty-clap', 'kitty-excited', 'kitty-spin', 
    'kitty-hide', 'kitty-auto-wave'
  ];
  
  animationClasses.forEach(className => {
    helloKittyCharacter.classList.remove(className);
  });
}

// Setup chat bubble heart effects
function setupChatBubbleHearts() {
  // Remove existing listeners
  if (window.kittyBubbleListener) {
    document.removeEventListener('click', window.kittyBubbleListener);
  }
  
  window.kittyBubbleListener = function(event) {
    if (currentTheme !== 'hellokitty') return;
    
    const message = event.target.closest('.msg-bubble');
    if (!message) return;
    
    // Create heart animation
    createHeartAnimation(event.clientX, event.clientY);
    
    // Trigger Hello Kitty reaction
    if (window.kittyMessageListener) {
      document.dispatchEvent(new CustomEvent('kitty:newMessage'));
    }
  };
  
  document.addEventListener('click', window.kittyBubbleListener);
}

// Create floating heart animation at click position
function createHeartAnimation(x, y) {
  const heart = document.createElement('div');
  heart.className = 'chat-heart';
  heart.innerHTML = '💕';
  
  // Position at click location
  heart.style.left = x + 'px';
  heart.style.top = y + 'px';
  
  document.body.appendChild(heart);
  
  // Remove heart after animation
  setTimeout(() => {
    heart.remove();
  }, 1000);
}

// Trigger Hello Kitty reaction when new message arrives (called from existing message handling)
function triggerKittyMessageReaction() {
  if (currentTheme === 'hellokitty') {
    document.dispatchEvent(new CustomEvent('kitty:newMessage'));
  }
}

// Start automatic blinking animation
function startKittyBlinking() {
  if (!helloKittyCharacter || currentTheme !== 'hellokitty') return;
  
  // Add blinking class periodically
  const blinkInterval = setInterval(() => {
    if (!helloKittyCharacter || currentTheme !== 'hellokitty') {
      clearInterval(blinkInterval);
      return;
    }
    
    helloKittyCharacter.classList.add('kitty-blinking');
    setTimeout(() => {
      if (helloKittyCharacter) {
        helloKittyCharacter.classList.remove('kitty-blinking');
      }
    }, 3000);
  }, 5000 + Math.random() * 3000); // Random blinking between 5-8 seconds
}

// Trigger blushing animation
function triggerKittyBlush() {
  if (!helloKittyCharacter || currentTheme !== 'hellokitty') return;
  
  helloKittyCharacter.classList.add('kitty-blushing');
  setTimeout(() => {
    if (helloKittyCharacter) {
      helloKittyCharacter.classList.remove('kitty-blushing');
    }
  }, 2000);
}

// Trigger eye covering animation (when shy/surprised)
function triggerKittyCoverEyes() {
  if (!helloKittyCharacter || currentTheme !== 'hellokitty') return;
  
  helloKittyCharacter.classList.add('kitty-covering-eyes');
  setTimeout(() => {
    if (helloKittyCharacter) {
      helloKittyCharacter.classList.remove('kitty-covering-eyes');
    }
  }, 2000);
}

// Trigger smiling animation
function triggerKittySmile() {
  if (!helloKittyCharacter || currentTheme !== 'hellokitty') return;
  
  helloKittyCharacter.classList.add('kitty-smiling');
  setTimeout(() => {
    if (helloKittyCharacter) {
      helloKittyCharacter.classList.remove('kitty-smiling');
    }
  }, 2000);
}

// Trigger happy animation (bow wiggle)
function triggerKittyHappy() {
  if (!helloKittyCharacter || currentTheme !== 'hellokitty') return;
  
  helloKittyCharacter.classList.add('kitty-happy');
  setTimeout(() => {
    if (helloKittyCharacter) {
      helloKittyCharacter.classList.remove('kitty-happy');
    }
  }, 1000);
}

// Set Hello Kitty to hug button position
function setKittyHugButton() {
  if (!helloKittyCharacter || currentTheme !== 'hellokitty') return;
  
  // Clear existing position classes
  helloKittyCharacter.className = 'hello-kitty-character';
  helloKittyCharacter.classList.add('kitty-main-hug-button');
  
  // Show body and arms for hugging pose
  const svg = helloKittyCharacter.querySelector('svg');
  if (svg) {
    const body = svg.querySelector('.kitty-body');
    const leftArm = svg.querySelector('.kitty-arm-left');
    const rightArm = svg.querySelector('.kitty-arm-right');
    
    if (body) body.style.display = 'block';
    if (leftArm) leftArm.style.display = 'block';
    if (rightArm) rightArm.style.display = 'block';
  }
}

// Remove Hello Kitty effects when theme changes
function removeHelloKittyEffects() {
  if (sparkleContainer) {
    sparkleContainer.remove();
    sparkleContainer = null;
  }
  
  if (helloKittyCharacter) {
    // Remove click listener before removing element
    if (kittyClickHandler) {
      helloKittyCharacter.removeEventListener('click', kittyClickHandler);
      kittyClickHandler = null;
    }
    
    helloKittyCharacter.remove();
    helloKittyCharacter = null;
  }
  
  if (sparkleToggleBtn) {
    sparkleToggleBtn.remove();
    sparkleToggleBtn = null;
  }
  
  // Clear auto wave interval
  if (autoWaveInterval) {
    clearInterval(autoWaveInterval);
    autoWaveInterval = null;
  }
  
  // Remove event listeners
  if (window.kittyMessageListener) {
    document.removeEventListener('kitty:newMessage', window.kittyMessageListener);
    window.kittyMessageListener = null;
  }
  
  if (window.kittyBubbleListener) {
    document.removeEventListener('click', window.kittyBubbleListener);
    window.kittyBubbleListener = null;
  }
}

// ===== END HELLO KITTY FUNCTIONS =====

// ===== CHILL THEME FUNCTIONS =====

// Global variables for Chill theme
let chillAssistant = null;
let chillFloatingElements = null;
let chillAnimationIntervals = [];


// Enhanced relaxing sound files with icons for individual selection


// Create chill theme effects
function createChillEffects() {
  initializeChillAssistant();
  initializeFloatingElements();
  setupChillInteractions();
}

// Initialize the chill assistant (zen stone, teapot, or cloud)
function initializeChillAssistant() {
  chillAssistant = document.getElementById('chillAssistant');
  if (!chillAssistant) return;
  
  // Set random assistant character
  const assistants = ['☁️', '🫖', '🪨'];
  const randomAssistant = assistants[Math.floor(Math.random() * assistants.length)];
  chillAssistant.textContent = randomAssistant;
  
  // Setup winking animation (every 8-15 seconds)
  const winkInterval = setInterval(() => {
    if (currentTheme === 'chill') {
      chillAssistant.classList.add('winking');
      setTimeout(() => {
        chillAssistant.classList.remove('winking');
      }, 500);
      
      // Show occasional speech bubble
      if (Math.random() < 0.3) {
        showAssistantSpeech();
      }
    } else {
      clearInterval(winkInterval);
    }
  }, Math.random() * 7000 + 8000);
  
  chillAnimationIntervals.push(winkInterval);
  
  // Click interaction
  chillAssistant.addEventListener('click', handleAssistantClick);
}

// Initialize floating elements (leaves, bubbles, clouds)
function initializeFloatingElements() {
  chillFloatingElements = document.getElementById('chillFloatingElements');
  if (!chillFloatingElements) return;
  
  // Create falling leaves
  const leafInterval = setInterval(() => {
    if (currentTheme === 'chill') {
      createFallingLeaf();
    } else {
      clearInterval(leafInterval);
    }
  }, 3000);
  
  // Create floating bubbles
  const bubbleInterval = setInterval(() => {
    if (currentTheme === 'chill') {
      createFloatingBubble();
    } else {
      clearInterval(bubbleInterval);
    }
  }, 2000);
  
  // Create small clouds
  const cloudInterval = setInterval(() => {
    if (currentTheme === 'chill') {
      createSmallCloud();
    } else {
      clearInterval(cloudInterval);
    }
  }, 8000);
  
  chillAnimationIntervals.push(leafInterval, bubbleInterval, cloudInterval);
}

// Create individual floating elements
function createFallingLeaf() {
  const leaf = document.createElement('div');
  leaf.className = 'falling-leaf';
  leaf.textContent = ['🍃', '🍂', '🌿'][Math.floor(Math.random() * 3)];
  leaf.style.left = Math.random() * 100 + '%';
  leaf.style.animationDelay = Math.random() * 2 + 's';
  leaf.style.animationDuration = (Math.random() * 4 + 8) + 's';
  
  chillFloatingElements.appendChild(leaf);
  
  // Remove after animation
  setTimeout(() => {
    if (leaf.parentNode) {
      leaf.parentNode.removeChild(leaf);
    }
  }, 14000);
}

function createFloatingBubble() {
  const bubble = document.createElement('div');
  bubble.className = 'floating-bubble';
  bubble.style.left = Math.random() * 100 + '%';
  bubble.style.width = bubble.style.height = (Math.random() * 15 + 10) + 'px';
  bubble.style.animationDelay = Math.random() * 2 + 's';
  bubble.style.animationDuration = (Math.random() * 3 + 6) + 's';
  
  chillFloatingElements.appendChild(bubble);
  
  // Remove after animation
  setTimeout(() => {
    if (bubble.parentNode) {
      bubble.parentNode.removeChild(bubble);
    }
  }, 10000);
}

function createSmallCloud() {
  const cloud = document.createElement('div');
  cloud.className = 'small-cloud';
  cloud.textContent = ['☁️', '🌤️', '⛅'][Math.floor(Math.random() * 3)];
  cloud.style.top = Math.random() * 60 + 10 + '%';
  cloud.style.animationDuration = (Math.random() * 10 + 15) + 's';
  
  chillFloatingElements.appendChild(cloud);
  
  // Remove after animation
  setTimeout(() => {
    if (cloud.parentNode) {
      cloud.parentNode.removeChild(cloud);
    }
  }, 25000);
}

// Setup interactive features
function setupChillInteractions() {
  // Setup message bubble click interactions
  setupChillMessageClicks();
}

// Handle message bubble clicks for pulse and emoji reactions
function setupChillMessageClicks() {
  // Remove existing listeners
  if (window.chillBubbleListener) {
    document.removeEventListener('click', window.chillBubbleListener);
  }
  
  window.chillBubbleListener = function(event) {
    if (currentTheme !== 'chill') return;
    
    const message = event.target.closest('.message');
    if (!message) return;
    
    // Add pulse animation
    message.classList.add('pulse-animation');
    setTimeout(() => {
      message.classList.remove('pulse-animation');
    }, 600);
    
    // Create emoji reaction
    createChillEmojiReaction(message, event.clientX, event.clientY);
  };
  
  document.addEventListener('click', window.chillBubbleListener);
}

// Create emoji reaction on message click
function createChillEmojiReaction(messageElement, x, y) {
  const emojis = ['💖', '✨', '🌸', '💫', '🦋', '🌺'];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
  
  const emojiElement = document.createElement('div');
  emojiElement.className = 'chill-emoji-reaction';
  emojiElement.textContent = randomEmoji;
  
  messageElement.style.position = 'relative';
  messageElement.appendChild(emojiElement);
  
  emojiElement.classList.add('show');
  
  // Remove after animation
  setTimeout(() => {
    if (emojiElement.parentNode) {
      emojiElement.parentNode.removeChild(emojiElement);
    }
  }, 1500);
}

// Assistant interactions
function handleAssistantClick() {
  if (currentTheme !== 'chill') return;
  
  // Trigger wink
  chillAssistant.classList.add('winking');
  setTimeout(() => {
    chillAssistant.classList.remove('winking');
  }, 500);
  
  // Show speech bubble
  showAssistantSpeech();
}

function showAssistantSpeech() {
  const messages = [
    'Stay chill! 🌸',
    'Take a deep breath 🫧',
    'You\'re doing great! ✨',
    'Relax and enjoy 🦋',
    'Breathe in calm 🌿'
  ];
  
  const existingSpeech = document.querySelector('.assistant-speech');
  if (existingSpeech) {
    existingSpeech.remove();
  }
  
  const speech = document.createElement('div');
  speech.className = 'assistant-speech';
  speech.textContent = messages[Math.floor(Math.random() * messages.length)];
  
  chillAssistant.appendChild(speech);
  
  setTimeout(() => {
    speech.classList.add('show');
  }, 10);
  
  // Hide after 3 seconds
  setTimeout(() => {
    speech.classList.remove('show');
    setTimeout(() => {
      if (speech.parentNode) {
        speech.parentNode.removeChild(speech);
      }
    }, 300);
  }, 3000);
}
















// Remove chill effects when theme changes
function removeChillEffects() {
  // Clear all animation intervals
  chillAnimationIntervals.forEach(interval => clearInterval(interval));
  chillAnimationIntervals = [];
  
  // Remove floating elements
  if (chillFloatingElements) {
    chillFloatingElements.innerHTML = '';
  }
  
  // Remove event listeners
  if (window.chillBubbleListener) {
    document.removeEventListener('click', window.chillBubbleListener);
    window.chillBubbleListener = null;
  }
  
  // Remove assistant speech bubbles
  const existingSpeech = document.querySelector('.assistant-speech');
  if (existingSpeech) {
    existingSpeech.remove();
  }
  
  // Reset assistant
  if (chillAssistant) {
    chillAssistant.removeEventListener('click', handleAssistantClick);
    chillAssistant.title = '';
  }
}

// ===== CHAOS THEME FUNCTIONALITY =====

// Global chaos variables
let chaosBoostMode = localStorage.getItem('chaos_boost_mode') === 'true';
let chaosDemon = null;
let chaosDemonInterval = null;
let chaosGlitchOverlay = null;
let chaosBoostButton = null;

// Chaos Demon emojis and behaviors
const chaosDemonEmojis = ['😈', '👹', '💀', '👺', '🔥', '⚡', '💥', '🌪️'];
const chaosDemonPositions = [
  'top-left', 'top-right', 'bottom-left', 'bottom-right', 
  'center', 'edge-left', 'edge-right', 'edge-top'
];

// Chaos sound effects using Web Audio API and real files
const chaosSounds = [
  { name: 'glitch', file: 'chaos-glitch.mp3', frequency: [200, 800, 400], duration: 0.3, type: 'sawtooth' },
  { name: 'laugh', file: 'chaos-laugh.mp3', frequency: [300, 600, 900], duration: 0.5, type: 'triangle' },
  { name: 'explosion', file: 'chaos-explosion.mp3', frequency: [100, 50, 25], duration: 0.8, type: 'square' },
  { name: 'scream', file: 'chaos-scream.mp3', frequency: [800, 1200, 600], duration: 0.4, type: 'sine' },
  { name: 'zap', file: 'chaos-zap.mp3', frequency: [1000, 2000, 500], duration: 0.2, type: 'sawtooth' }
];

// Create chaos theme effects when activated
function createChaosEffects() {
  const body = document.body;
  
  // Create glitch overlay
  createChaosGlitchOverlay();
  
  // Create Chaos Demon character
  createChaosDemon();
  
  // Create Boost Chaos button (only for premium users)
  if (hasPremiumAccess) {
    createBoostChaosButton();
  }
  
  // Setup chaos message interactions
  setupChaosMessageInteractions();
  
  // Start chaos demon random appearances
  startChaosDemonBehavior();
  
  // Apply chaos boost mode if enabled
  if (chaosBoostMode) {
    enableChaosBoost();
  }
}

// Create chaos glitch overlay
function createChaosGlitchOverlay() {
  if (chaosGlitchOverlay) {
    chaosGlitchOverlay.remove();
  }
  
  chaosGlitchOverlay = document.createElement('div');
  chaosGlitchOverlay.className = 'chaos-glitch-overlay';
  chaosGlitchOverlay.id = 'chaosGlitchOverlay';
  
  document.body.appendChild(chaosGlitchOverlay);
}

// Create Chaos Demon character
function createChaosDemon() {
  if (chaosDemon) {
    chaosDemon.remove();
  }
  
  chaosDemon = document.createElement('div');
  chaosDemon.className = 'chaos-demon';
  chaosDemon.id = 'chaosDemon';
  chaosDemon.style.display = 'none';
  
  // Set initial demon emoji
  chaosDemon.textContent = getRandomChaosDemonEmoji();
  
  document.body.appendChild(chaosDemon);
}

// Create Boost Chaos button
function createBoostChaosButton() {
  if (chaosBoostButton) {
    chaosBoostButton.remove();
  }
  
  chaosBoostButton = document.createElement('button');
  chaosBoostButton.className = 'boost-chaos-btn';
  chaosBoostButton.id = 'boostChaosBtn';
  chaosBoostButton.innerHTML = '🔥 Boost Chaos';
  chaosBoostButton.title = 'Activate extreme chaos mode!';
  
  if (chaosBoostMode) {
    chaosBoostButton.classList.add('active');
    chaosBoostButton.innerHTML = '🌪️ CHAOS MAX';
  }
  
  chaosBoostButton.addEventListener('click', toggleChaosBoost);
  
  document.body.appendChild(chaosBoostButton);
}

// Toggle chaos boost mode
function toggleChaosBoost() {
  chaosBoostMode = !chaosBoostMode;
  localStorage.setItem('chaos_boost_mode', chaosBoostMode.toString());
  
  if (chaosBoostMode) {
    enableChaosBoost();
  } else {
    disableChaosBoost();
  }
  
  updateBoostChaosButton();
}

// Enable chaos boost mode
function enableChaosBoost() {
  document.body.classList.add('boost-chaos');
  
  // Increase demon activity
  if (chaosDemonInterval) {
    clearInterval(chaosDemonInterval);
  }
  startChaosDemonBehavior(true); // boost mode
  
  // Create additional chaos effects
  createBoostChaosEffects();
}

// Disable chaos boost mode
function disableChaosBoost() {
  document.body.classList.remove('boost-chaos');
  
  // Return to normal demon activity
  if (chaosDemonInterval) {
    clearInterval(chaosDemonInterval);
  }
  startChaosDemonBehavior(false); // normal mode
  
  // Remove boost effects
  removeBoostChaosEffects();
}

// Update boost chaos button
function updateBoostChaosButton() {
  if (!chaosBoostButton) return;
  
  if (chaosBoostMode) {
    chaosBoostButton.classList.add('active');
    chaosBoostButton.innerHTML = '🌪️ CHAOS MAX';
    chaosBoostButton.title = 'Disable extreme chaos mode';
  } else {
    chaosBoostButton.classList.remove('active');
    chaosBoostButton.innerHTML = '🔥 Boost Chaos';
    chaosBoostButton.title = 'Activate extreme chaos mode!';
  }
}

// Create additional boost chaos effects
function createBoostChaosEffects() {
  // Create multiple chaos demons for boost mode
  for (let i = 1; i < 3; i++) {
    const extraDemon = document.createElement('div');
    extraDemon.className = 'chaos-demon chaos-demon-extra';
    extraDemon.id = `chaosDemon${i}`;
    extraDemon.textContent = getRandomChaosDemonEmoji();
    extraDemon.style.display = 'none';
    extraDemon.style.fontSize = '40px';
    extraDemon.style.width = '60px';
    extraDemon.style.height = '60px';
    
    document.body.appendChild(extraDemon);
  }
}

// Remove boost chaos effects
function removeBoostChaosEffects() {
  // Remove extra demons
  const extraDemons = document.querySelectorAll('.chaos-demon-extra');
  extraDemons.forEach(demon => demon.remove());
}

// Start chaos demon random behavior
function startChaosDemonBehavior(boostMode = false) {
  const baseInterval = boostMode ? 3000 : 8000; // More frequent in boost mode
  const randomVariation = boostMode ? 2000 : 5000;
  
  if (chaosDemonInterval) {
    clearInterval(chaosDemonInterval);
  }
  
  chaosDemonInterval = setInterval(() => {
    if (currentTheme === 'chaos') {
      // Random chance to show demon
      if (Math.random() < (boostMode ? 0.8 : 0.4)) {
        showChaosDemon();
      }
      
      // In boost mode, also animate extra demons
      if (boostMode) {
        const extraDemons = document.querySelectorAll('.chaos-demon-extra');
        extraDemons.forEach(demon => {
          if (Math.random() < 0.3) {
            showChaosDemon(demon);
          }
        });
      }
    }
  }, baseInterval + Math.random() * randomVariation);
}

// Show chaos demon with random behavior
function showChaosDemon(demonElement = null) {
  const demon = demonElement || chaosDemon;
  if (!demon || currentTheme !== 'chaos') return;
  
  // Set random emoji and position
  demon.textContent = getRandomChaosDemonEmoji();
  setRandomDemonPosition(demon);
  
  // Show demon with appearing animation
  demon.style.display = 'block';
  demon.classList.add('appearing');
  
  // Random behavior after appearing
  setTimeout(() => {
    demon.classList.remove('appearing');
    
    // Random chance for special behaviors
    const behavior = Math.random();
    if (behavior < 0.3) {
      triggerDemonWink(demon);
    } else if (behavior < 0.6) {
      triggerDemonGesture(demon);
    }
  }, 1000);
  
  // Hide demon after random duration
  const visibleDuration = chaosBoostMode ? 2000 + Math.random() * 2000 : 3000 + Math.random() * 4000;
  setTimeout(() => {
    hideChaosDemon(demon);
  }, visibleDuration);
}

// Hide chaos demon
function hideChaosDemon(demonElement = null) {
  const demon = demonElement || chaosDemon;
  if (!demon) return;
  
  demon.classList.add('disappearing');
  
  setTimeout(() => {
    demon.style.display = 'none';
    demon.classList.remove('disappearing', 'winking', 'middle-finger');
  }, 1000);
}

// Set random position for chaos demon
function setRandomDemonPosition(demon) {
  const position = chaosDemonPositions[Math.floor(Math.random() * chaosDemonPositions.length)];
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  let left, top;
  
  switch (position) {
    case 'top-left':
      left = Math.random() * 100;
      top = Math.random() * 100;
      break;
    case 'top-right':
      left = windowWidth - 100 - Math.random() * 100;
      top = Math.random() * 100;
      break;
    case 'bottom-left':
      left = Math.random() * 100;
      top = windowHeight - 100 - Math.random() * 100;
      break;
    case 'bottom-right':
      left = windowWidth - 100 - Math.random() * 100;
      top = windowHeight - 100 - Math.random() * 100;
      break;
    case 'center':
      left = windowWidth / 2 + (Math.random() - 0.5) * 200;
      top = windowHeight / 2 + (Math.random() - 0.5) * 200;
      break;
    case 'edge-left':
      left = -40 + Math.random() * 40;
      top = Math.random() * windowHeight;
      break;
    case 'edge-right':
      left = windowWidth - Math.random() * 40;
      top = Math.random() * windowHeight;
      break;
    case 'edge-top':
      left = Math.random() * windowWidth;
      top = -40 + Math.random() * 40;
      break;
  }
  
  demon.style.left = Math.max(0, Math.min(windowWidth - 80, left)) + 'px';
  demon.style.top = Math.max(0, Math.min(windowHeight - 80, top)) + 'px';
}

// Trigger demon wink animation
function triggerDemonWink(demon) {
  demon.classList.add('winking');
  setTimeout(() => {
    demon.classList.remove('winking');
  }, 500);
}

// Trigger demon gesture animation
function triggerDemonGesture(demon) {
  const originalEmoji = demon.textContent;
  demon.textContent = '🖕'; // Middle finger emoji
  demon.classList.add('middle-finger');
  
  setTimeout(() => {
    demon.textContent = originalEmoji;
    demon.classList.remove('middle-finger');
  }, 2000);
}

// Get random chaos demon emoji
function getRandomChaosDemonEmoji() {
  return chaosDemonEmojis[Math.floor(Math.random() * chaosDemonEmojis.length)];
}

// Setup chaos message interactions
function setupChaosMessageInteractions() {
  // Remove existing listeners
  if (window.chaosMessageListener) {
    document.removeEventListener('click', window.chaosMessageListener);
  }
  
  window.chaosMessageListener = function(event) {
    if (currentTheme !== 'chaos') return;
    
    const message = event.target.closest('.msg-bubble');
    if (!message) return;
    
    // Apply random hover effects
    applyChaosHoverEffect(message, event);
  };
  
  document.addEventListener('click', window.chaosMessageListener);
  
  // Setup hover effects
  if (window.chaosHoverListener) {
    document.removeEventListener('mouseover', window.chaosHoverListener);
  }
  
  window.chaosHoverListener = function(event) {
    if (currentTheme !== 'chaos') return;
    
    const message = event.target.closest('.msg-bubble');
    if (!message) return;
    
    // Apply subtle hover effects
    applySubtleChaosHover(message);
  };
  
  document.addEventListener('mouseover', window.chaosHoverListener);
}

// Apply chaos hover effect to message
function applyChaosHoverEffect(message, event) {
  const effects = ['tick', 'shake', 'glitch', 'flash'];
  const effect = effects[Math.floor(Math.random() * effects.length)];
  
  switch (effect) {
    case 'tick':
      playChaosTickSound();
      message.style.transform = 'scale(1.02)';
      setTimeout(() => {
        message.style.transform = '';
      }, 200);
      break;
      
    case 'shake':
      message.style.animation = 'chaos-bubble-hover 0.3s ease infinite';
      setTimeout(() => {
        message.style.animation = '';
      }, 900);
      break;
      
    case 'glitch':
      message.style.animation = 'chaos-bubble-glitch 0.2s infinite';
      message.style.filter = 'hue-rotate(180deg)';
      setTimeout(() => {
        message.style.animation = '';
        message.style.filter = '';
      }, 600);
      break;
      
    case 'flash':
      message.style.background = `linear-gradient(45deg, 
        ${getRandomChaosColor()}, 
        ${getRandomChaosColor()})`;
      setTimeout(() => {
        message.style.background = '';
      }, 300);
      break;
  }
}

// Apply subtle chaos hover effect
function applySubtleChaosHover(message) {
  if (Math.random() < 0.3) { // 30% chance
    message.style.transform = 'translateY(-1px)';
    message.style.boxShadow = '0 0 15px var(--chaos-glow)';
    
    setTimeout(() => {
      message.style.transform = '';
      message.style.boxShadow = '';
    }, 500);
  }
}

// Get random chaos color
function getRandomChaosColor() {
  const colors = [
    'var(--chaos-primary)',
    'var(--chaos-secondary)', 
    'var(--chaos-accent)',
    'var(--chaos-yellow)',
    'var(--chaos-cyan)',
    'var(--chaos-orange)'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Play chaos sound effect for message send
function playChaosMessageSound() {
  if (!soundEnabled) return;
  
  const sound = chaosSounds[Math.floor(Math.random() * chaosSounds.length)];
  
  // Try to play audio file first, fallback to generated sound
  try {
    const audio = new Audio(`/sounds/${sound.file}`);
    audio.volume = 0.3;
    audio.play().catch(error => {
      console.log('Could not play chaos sound file, using generated sound');
      createChaosSound(sound);
    });
  } catch (error) {
    createChaosSound(sound);
  }
}

// Play chaos tick sound
function playChaosTickSound() {
  if (!soundEnabled) return;
  
  createSound(800, 0.1, 'square');
}

// Create chaos sound using Web Audio API
function createChaosSound(soundConfig) {
  if (!soundEnabled) return;
  
  try {
    const { frequency, duration, type } = soundConfig;
    
    for (let i = 0; i < frequency.length; i++) {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency[i], audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / frequency.length);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / frequency.length);
      }, (duration / frequency.length) * i * 1000);
    }
  } catch (error) {
    console.log('Chaos sound not available:', error);
  }
}

// Apply random chaos styling to chat bubble
function applyChaosStyleToMessage(messageElement) {
  if (currentTheme !== 'chaos') return;
  
  // Random font
  const fontClass = `chaos-font-${Math.floor(Math.random() * 5) + 1}`;
  messageElement.classList.add(fontClass);
  
  // Random shape (less frequent)
  if (Math.random() < 0.3) {
    const shapeClass = `chaos-shape-${Math.floor(Math.random() * 5) + 1}`;
    messageElement.classList.add(shapeClass);
  }
  
  // Random color (for own messages)
  if (messageElement.classList.contains('msg-right')) {
    const colorClass = `chaos-color-${Math.floor(Math.random() * 5) + 1}`;
    messageElement.classList.add(colorClass);
  }
  
  // Random entrance animation
  const entranceAnimations = [
    'animate__bounceIn',
    'animate__rotateIn', 
    'animate__zoomIn',
    'animate__flipInX',
    'animate__slideInUp'
  ];
  
  if (Math.random() < 0.5) {
    const animation = entranceAnimations[Math.floor(Math.random() * entranceAnimations.length)];
    messageElement.style.animation = 'chaos-bubble-entry 0.8s ease-out';
  }
}

// Remove chaos effects when theme changes
function removeChaosEffects() {
  // Clear intervals
  if (chaosDemonInterval) {
    clearInterval(chaosDemonInterval);
    chaosDemonInterval = null;
  }
  
  // Remove chaos elements
  if (chaosDemon) {
    chaosDemon.remove();
    chaosDemon = null;
  }
  
  if (chaosGlitchOverlay) {
    chaosGlitchOverlay.remove();
    chaosGlitchOverlay = null;
  }
  
  if (chaosBoostButton) {
    chaosBoostButton.remove();
    chaosBoostButton = null;
  }
  
  // Remove extra demons
  const extraDemons = document.querySelectorAll('.chaos-demon-extra');
  extraDemons.forEach(demon => demon.remove());
  
  // Remove event listeners
  if (window.chaosMessageListener) {
    document.removeEventListener('click', window.chaosMessageListener);
    window.chaosMessageListener = null;
  }
  
  if (window.chaosHoverListener) {
    document.removeEventListener('mouseover', window.chaosHoverListener);
    window.chaosHoverListener = null;
  }
  
  // Remove boost mode
  document.body.classList.remove('boost-chaos');
}

// ===== END CHAOS THEME FUNCTIONALITY =====

// ===== DIGITAL VOID THEME CLEANUP =====

// Remove Digital Void Matrix rain effects when switching themes
function removeDigitalVoidEffects() {
  // Clear Matrix rain intervals
  if (window.matrixIntervals) {
    window.matrixIntervals.forEach(interval => {
      clearInterval(interval);
    });
    window.matrixIntervals = [];
  }
  
  // Remove resize handlers
  if (window.matrixResizeHandlers) {
    window.matrixResizeHandlers.forEach(handler => {
      window.removeEventListener('resize', handler);
    });
    window.matrixResizeHandlers = [];
  }
  
  // Remove any remaining matrix rain elements
  const matrixElements = document.querySelectorAll('.matrix-rain');
  matrixElements.forEach(element => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });
}

// ===== END DIGITAL VOID THEME FUNCTIONALITY =====

// Chaos theme color variations
function randomizeChaosTheme() {
  const chaosVariations = [
    {
      name: 'Rainbow Explosion',
      primary: '#ff0080',
      secondary: '#00ff80', 
      accent: '#8000ff',
      glow: 'rgba(255, 0, 128, 0.8)',
      shadow: 'rgba(255, 0, 128, 0.4)'
    },
    {
      name: 'Electric Storm', 
      primary: '#ffff00',
      secondary: '#ff4000',
      accent: '#0080ff', 
      glow: 'rgba(255, 255, 0, 0.8)',
      shadow: 'rgba(255, 255, 0, 0.4)'
    },
    {
      name: 'Cosmic Chaos',
      primary: '#ff8000',
      secondary: '#8000ff',
      accent: '#00ff40',
      glow: 'rgba(255, 128, 0, 0.8)', 
      shadow: 'rgba(255, 128, 0, 0.4)'
    }
  ];
  
  const randomIndex = Math.floor(Math.random() * chaosVariations.length);
  currentThemeData = chaosVariations[randomIndex];
  applyTheme(currentThemeData);
}

// Create poltergeist atmospheric effects
function createPoltergeistEffects() {
  const body = document.body;
  
  // Create glitch overlay for poltergeist disturbance
  const glitchOverlay = document.createElement('div');
  glitchOverlay.className = 'poltergeist-glitch-overlay';
  glitchOverlay.id = 'poltergeistGlitchOverlay';
  body.appendChild(glitchOverlay);
  
  // Create static noise overlay
  const staticOverlay = document.createElement('div');
  staticOverlay.className = 'poltergeist-static-overlay';
  staticOverlay.id = 'poltergeistStaticOverlay';
  body.appendChild(staticOverlay);
}

// Premium access management (for testing)
function togglePremiumAccess() {
  hasPremiumAccess = !hasPremiumAccess;
  localStorage.setItem('anonx_premium', hasPremiumAccess);
  
  // If current theme becomes unavailable, switch to a free theme
  if (!canUseTheme(currentTheme)) {
    currentTheme = 'glow';
    applyMainTheme(currentTheme);
    localStorage.setItem('selectedTheme', currentTheme);
  }
  
  // Show notification
  showNotif(hasPremiumAccess ? '💎 Premium access activated!' : '🔒 Premium access deactivated', false);
}

// Helper function for testing individual theme unlocks (dev/testing only)
function unlockThemeForTesting(themeName) {
  if (unlockPremiumTheme(themeName)) {
    console.log(`${themeName} theme unlocked for testing`);
    // Refresh theme selector if it's open
    if (document.getElementById('themeSelectorModal').style.display === 'flex') {
      populateThemeSelector();
    }
  } else {
    console.log(`${themeName} theme is already unlocked or doesn't exist`);
  }
}
function randomizePoltergeistTheme() {
  const poltergeistVariations = [
    {
      name: 'Blood Glitch',
      primary: '#ff2e2e',
      secondary: '#8b0000', 
      accent: '#00cfff',
      glow: 'rgba(255, 46, 46, 0.8)',
      shadow: 'rgba(255, 46, 46, 0.4)'
    },
    {
      name: 'Electric Disturbance', 
      primary: '#00cfff',
      secondary: '#0080ff',
      accent: '#ff2e2e', 
      glow: 'rgba(0, 207, 255, 0.8)',
      shadow: 'rgba(0, 207, 255, 0.4)'
    },
    {
      name: 'Corrupted Signal',
      primary: '#ff00ff',
      secondary: '#8000ff',
      accent: '#00ff00',
      glow: 'rgba(255, 0, 255, 0.8)', 
      shadow: 'rgba(255, 0, 255, 0.4)'
    },
    {
      name: 'Dead Zone',
      primary: '#666666',
      secondary: '#333333',
      accent: '#ff2e2e',
      glow: 'rgba(102, 102, 102, 0.8)',
      shadow: 'rgba(102, 102, 102, 0.4)'
    }
  ];
  
  const randomIndex = Math.floor(Math.random() * poltergeistVariations.length);
  currentThemeData = poltergeistVariations[randomIndex];
  applyTheme(currentThemeData);
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

// Language system object
const lang = {
  setLanguage: function(langCode) {
    if (langCode === 'cz') langCode = 'cs'; // Handle both 'cz' and 'cs'
    if (languageDefinitions[langCode]) {
      currentLanguage = langCode;
      localStorage.setItem('selectedLanguage', currentLanguage);
      updateAllTexts();
      updateLanguageToggle();
    }
  },
  
  getText: function(key) {
    return getText(key);
  }
};

// Language switching functionality
function switchLanguage() {
  const newLang = currentLanguage === 'cs' ? 'en' : 'cs';
  lang.setLanguage(newLang);
}

function updateLanguageToggle() {
  const languageIcon = document.getElementById('languageIcon');
  if (languageIcon) {
    languageIcon.textContent = currentLanguage === 'cs' ? '🇬🇧' : '🇨🇿';
  }
  
  // Update settings dropdown language display
  updateCurrentLanguageDisplay();
}

function getText(key) {
  const keys = key.split('.');
  let value = languageDefinitions[currentLanguage];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key; // Return the key if translation not found
    }
  }
  
  return value || key;
}

function updateAllTexts() {
  // Main page elements
  const startBtn = document.getElementById('startBtn');
  if (startBtn) startBtn.textContent = getText('startChat');
  
  // Chat input placeholder
  const chatInput = document.getElementById('chatInput');
  if (chatInput) chatInput.placeholder = getText('typeMessage');
  
  // Buttons
  const sendBtn = document.querySelector('.send-btn');
  if (sendBtn) sendBtn.textContent = getText('send');
  
  const skipBtn = document.getElementById('skipBtn');
  if (skipBtn) skipBtn.textContent = getText('skip');
  
  const endBtn = document.getElementById('endBtn');
  if (endBtn) endBtn.textContent = getText('endChat');
  
  const exitBtn = document.getElementById('exitBtn');
  if (exitBtn) exitBtn.textContent = getText('exitSearch');
  
  // Sound toggle
  updateSoundToggle();
  
  // Rating modal
  const ratingTitle = document.querySelector('.rating-title');
  if (ratingTitle) ratingTitle.textContent = getText('ratingTitle');
  
  const ratingTexts = document.querySelectorAll('.rating-text');
  if (ratingTexts.length >= 3) {
    ratingTexts[0].textContent = getText('ratingLiked');
    ratingTexts[1].textContent = getText('ratingBad');
    ratingTexts[2].textContent = getText('ratingRandom');
  }
  
  const favoriteText = document.querySelector('.favorite-text');
  if (favoriteText) favoriteText.textContent = getText('favoriteText');
  
  const addToFavoritesBtn = document.getElementById('addToFavoritesBtn');
  if (addToFavoritesBtn) {
    const favoriteTextSpan = addToFavoritesBtn.querySelector('.favorite-text');
    if (favoriteTextSpan) favoriteTextSpan.textContent = getText('addToFavorites');
  }
  
  // Statistics panel
  const statsTitle = document.querySelector('.stats-title');
  if (statsTitle) statsTitle.textContent = getText('myStats');
  
  const statLabels = document.querySelectorAll('.stat-label');
  if (statLabels.length >= 6) {
    statLabels[0].textContent = getText('totalChats');
    statLabels[1].textContent = getText('avgLength');
    statLabels[2].textContent = getText('heartRating');
    statLabels[3].textContent = getText('poopRating');
    statLabels[4].textContent = getText('currentStreak');
    statLabels[5].textContent = getText('karmaLevel');
  }
  
  // Update level display
  updateLevelDisplay();
  
  // Update favorites section
  const favoritesTitle = document.querySelector('.favorites-title');
  if (favoritesTitle) favoritesTitle.textContent = getText('favoritePartners');
  
  const favoriteLabels = document.querySelectorAll('.favorite-label');
  if (favoriteLabels.length >= 2) {
    favoriteLabels[0].textContent = getText('favoriteCount');
    favoriteLabels[1].textContent = getText('mutualCount');
  }
  
  const connectWithFavoriteBtn = document.getElementById('connectWithFavoriteBtn');
  if (connectWithFavoriteBtn) {
    const connectText = connectWithFavoriteBtn.textContent.replace(/💫\s*/, '');
    connectWithFavoriteBtn.innerHTML = '💫 ' + getText('connectWithFavorite');
  }
  
  // Challenges section
  const challengesTitle = document.querySelector('.challenges-title');
  if (challengesTitle) challengesTitle.textContent = getText('currentChallenges');
  
  const pointsLabel = document.querySelector('.points-label');
  if (pointsLabel) pointsLabel.textContent = getText('totalPoints');
  
  // Notification buttons
  const continueBtn = document.getElementById('continueBtn');
  if (continueBtn) continueBtn.textContent = getText('findNewPartner');
  
  const returnBtn = document.getElementById('returnBtn');
  if (returnBtn) returnBtn.textContent = getText('goBack');
  
  // Checkbox label
  const checkboxLabel = document.querySelector('.stats-checkbox');
  if (checkboxLabel) {
    const labelText = checkboxLabel.lastChild;
    if (labelText && labelText.nodeType === Node.TEXT_NODE) {
      labelText.textContent = getText('showPublicBadge');
    }
  }
  
  // Settings dropdown
  const settingsTexts = document.querySelectorAll('[data-translate]');
  settingsTexts.forEach(element => {
    const key = element.getAttribute('data-translate');
    if (key) {
      element.textContent = getText(key);
    }
  });
}

// Sound toggle functionality
function updateSoundToggle() {
  const soundToggle = document.getElementById('soundToggle');
  const soundIcon = document.getElementById('soundIcon');
  const soundText = soundToggle.querySelector('.sound-text');
  
  if (soundEnabled) {
    soundIcon.textContent = '🔊';
    soundText.textContent = getText('soundOn');
    soundToggle.classList.remove('muted');
  } else {
    soundIcon.textContent = '🔇'; 
    soundText.textContent = getText('soundOff');
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
    
    // Note: floating button functionality updated - now using bug feedback button
    
    setTimeout(() => {
      chatPage.style.opacity = '1';
      loadingOverlay.style.opacity = '1';
      
      // Update Hello Kitty positioning for chat page
      if (currentTheme === 'hellokitty') {
        setRandomKittyPosition();
      }
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
      
      // Note: floating button functionality updated - now using bug feedback button
      
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
        
        // Update Hello Kitty positioning for main page
        if (currentTheme === 'hellokitty') {
          setRandomKittyPosition();
        }
      }, 10);
    }, 150);
  } else {
    chatPage.style.display = 'none';
    notification.style.display = 'none';
    loadingOverlay.style.display = 'none';
    mainPage.style.display = 'flex';
    
    // Note: floating button functionality updated - now using bug feedback button
    
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
    
    // Update Hello Kitty positioning for main page
    if (currentTheme === 'hellokitty') {
      setRandomKittyPosition();
    }
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
    
    // Note: floating button functionality updated - now using bug feedback button
    
    // Show notification with animation
    notification.style.display = '';
    notification.style.opacity = '0';
    
    setTimeout(() => {
      notification.style.opacity = '1';
    }, 10);
  }, 150);
  
  // Auto-dismiss notification without buttons after 5 seconds
  if (!btns) {
    setTimeout(() => {
      hideNotification();
    }, 5000);
  }
}

function hideNotification() {
  const notification = document.getElementById('notification');
  const mainPage = document.getElementById('mainPage');
  
  if (notification.style.display !== 'none') {
    notification.style.opacity = '0';
    setTimeout(() => {
      notification.style.display = 'none';
      // Return to main page
      mainPage.style.display = 'flex';
      mainPage.style.opacity = '0';
      setTimeout(() => {
        mainPage.style.opacity = '1';
      }, 10);
    }, 300);
  }
}

function showLoadingOverlay() {
  const mainPage = document.getElementById('mainPage');
  const chatPage = document.getElementById('chatPage');
  const notification = document.getElementById('notification');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const loadingText = document.querySelector('.loading-text');
  
  // Add searching background effect
  document.body.classList.add('searching-partner');
  
  // Set loading text to current language
  if (loadingText) {
    loadingText.textContent = getText('lookingForPartner');
  }
  
  // Fade out current page
  if (mainPage.style.display !== 'none') {
    mainPage.style.opacity = '0';
  }
  
  setTimeout(() => {
    mainPage.style.display = 'none';
    chatPage.style.display = 'none';
    notification.style.display = 'none';
    
    // Note: floating button functionality updated - now using bug feedback button
    
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
  
  // Apply chaos styling if chaos theme is active
  if (currentTheme === 'chaos') {
    applyChaosStyleToMessage(el);
  }
  
  // Trigger Hello Kitty reaction for incoming messages (left side)
  if (side === 'left' && currentTheme === 'hellokitty') {
    triggerKittyMessageReaction();
  }
  
  // Pixel Quest theme effects
  if (currentTheme === 'pixelquest') {
    // Play receive sound for incoming messages (left side)
    if (side === 'left' && window.pixelQuestReceiveSound) {
      window.pixelQuestReceiveSound();
    }
    
    // Apply character animation
    if (window.pixelQuestAnimateMessage) {
      // Add message-text wrapper for animation
      const textContent = el.innerHTML;
      const timeMatch = textContent.match(/<span class="msg-time">.*<\/span>$/);
      const messageText = textContent.replace(/<span class="msg-time">.*<\/span>$/, '');
      const timeSpan = timeMatch ? timeMatch[0] : '';
      
      el.innerHTML = `<span class="message-text">${messageText}</span>${timeSpan}`;
      window.pixelQuestAnimateMessage(el);
    }
  }
  
  return el; // Return the element for further manipulation
}

// Odeslání zprávy
function sendMsg() {
  const inp = document.getElementById('chatInput');
  const text = inp.value.trim();
  if (!text) return;
  const messageElement = addMsg(text, mySide);
  socket.emit('msg', text);
  inp.value = '';
  
  // Play theme-specific sound
  if (currentTheme === 'chaos') {
    playChaosMessageSound();
  } else if (currentTheme === 'pixelquest') {
    if (window.pixelQuestSendSound) {
      window.pixelQuestSendSound();
    }
  } else {
    playMessageSend();
  }
  
  // Apply chaos styling if chaos theme is active
  if (currentTheme === 'chaos' && messageElement) {
    applyChaosStyleToMessage(messageElement);
  }
}

// START BTN
document.getElementById('startBtn').onclick = function() {
  // Randomize theme for new chat
  randomizeTheme();
  
  showLoadingOverlay();
  startSocket();
}

// THEME SWITCHER BTN - Now opens theme selector modal
document.getElementById('themeSwitcher').onclick = function() {
  showThemeSelector();
}

// Theme Selector Modal Functions
function showThemeSelector() {
  populateThemeSelector();
  const modal = document.getElementById('themeSelectorModal');
  modal.style.display = 'flex';
  modal.style.opacity = '0';
  setTimeout(() => {
    modal.style.opacity = '1';
  }, 10);
}

function hideThemeSelector() {
  const modal = document.getElementById('themeSelectorModal');
  modal.style.opacity = '0';
  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
}

function populateThemeSelector() {
  const freeGrid = document.getElementById('freeThemesGrid');
  const premiumGrid = document.getElementById('premiumThemesGrid');
  const premiumHint = document.getElementById('premiumHint');
  
  // Clear existing items
  freeGrid.innerHTML = '';
  premiumGrid.innerHTML = '';
  
  // Separate themes by category and unlock status
  const freeThemes = [];
  const unlockedPremiumThemes = [];
  const lockedPremiumThemes = [];
  
  Object.entries(themeDefinitions).forEach(([key, theme]) => {
    if (theme.category === 'free') {
      freeThemes.push({ key, theme });
    } else if (theme.category === 'premium') {
      if (isThemeUnlocked(key)) {
        unlockedPremiumThemes.push({ key, theme });
      } else {
        lockedPremiumThemes.push({ key, theme });
      }
    }
  });
  
  // Populate free themes with status indicator
  freeThemes.forEach(({ key, theme }) => {
    const themeItem = createThemeItem(key, theme, true);
    freeGrid.appendChild(themeItem);
  });
  
  // Add unlocked premium themes to the free grid if any exist
  if (unlockedPremiumThemes.length > 0) {
    // Add a separator if we have both free and unlocked premium themes
    if (freeThemes.length > 0) {
      const separator = document.createElement('div');
      separator.className = 'theme-separator';
      separator.innerHTML = `
        <div class="separator-line"></div>
        <div class="separator-text">
          <span class="status-indicator unlocked-indicator">🔓</span>
          ${currentLanguage === 'cs' ? 'Odemčené' : 'Unlocked'}
        </div>
        <div class="separator-line"></div>
      `;
      freeGrid.appendChild(separator);
    }
    
    unlockedPremiumThemes.forEach(({ key, theme }) => {
      const themeItem = createThemeItem(key, theme, true);
      freeGrid.appendChild(themeItem);
    });
  }
  
  // Populate locked premium themes only
  lockedPremiumThemes.forEach(({ key, theme }) => {
    const themeItem = createThemeItem(key, theme, false);
    premiumGrid.appendChild(themeItem);
  });
  
  // Hide the premium hint since we now have individual purchase options
  if (premiumHint) {
    premiumHint.style.display = 'none';
  }
  
  // Update premium section title to reflect locked themes only
  const premiumTitle = document.querySelector('.theme-section:last-child .theme-section-title');
  if (premiumTitle && lockedPremiumThemes.length > 0) {
    premiumTitle.innerHTML = `
      Premium Themes 
      <span class="premium-badge" id="premiumBadge">💎</span>
      <span class="locked-count">(${lockedPremiumThemes.length} locked)</span>
    `;
  } else if (premiumTitle && lockedPremiumThemes.length === 0) {
    // Hide the premium section if all themes are unlocked
    premiumTitle.parentElement.style.display = 'none';
  }
}

function createThemeItem(themeKey, theme, canUse) {
  const item = document.createElement('div');
  item.className = `theme-item ${currentTheme === themeKey ? 'active' : ''} ${!canUse ? 'locked' : ''}`;
  
  // Determine visual status indicator
  let statusIndicator = '';
  let statusClass = '';
  
  if (theme.category === 'free') {
    statusIndicator = '✅';
    statusClass = 'free-theme';
  } else if (theme.category === 'premium') {
    if (canUse) {
      statusIndicator = '🔓';
      statusClass = 'unlocked-theme';
    } else {
      statusIndicator = '🔒';
      statusClass = 'locked-theme';
    }
  }
  
  // Add price information for locked premium themes
  const themePrices = {
    'pixelquest': 100,
    'poltergeist': 150,
    'hellokitty': 200,
    'chill': 120,
    'chaos': 180,
    'retroneon': 250,
    'digitalvoid': 300
  };
  
  const price = themePrices[themeKey] || 100;
  const priceInfo = !canUse && theme.category === 'premium' ? 
    `<div class="theme-price-info">${price} AnonCoins</div>` : '';
  
  // Purchase button for locked premium themes
  const purchaseButton = !canUse && theme.category === 'premium' ? 
    `<div class="theme-purchase-button" onclick="event.stopPropagation(); showPremiumThemePurchaseDialog('${themeKey}');">
      🛒 ${currentLanguage === 'cs' ? 'Koupit' : 'Purchase'}
    </div>` : '';
  
  // Determine unlock text based on theme category and unlock status
  let unlockText = '';
  if (!canUse && theme.category === 'premium') {
    unlockText = currentLanguage === 'cs' ? 'Klikněte pro nákup' : 'Click to purchase';
  }
  
  item.classList.add(statusClass);
  
  item.innerHTML = `
    <div class="theme-status-indicator">${statusIndicator}</div>
    <span class="theme-icon">${theme.icon}</span>
    <div class="theme-name">${theme.name}</div>
    <div class="theme-description">${theme.description}</div>
    ${priceInfo}
    ${purchaseButton}
    ${!canUse ? `<div class="theme-lock-overlay"><span class="theme-lock-icon">🔒</span></div>` : ''}
  `;
  
  if (canUse) {
    item.onclick = () => {
      selectTheme(themeKey);
    };
  } else {
    item.title = unlockText;
    item.onclick = () => {
      selectTheme(themeKey); // This will show the premium purchase dialog
    };
  }
  
  return item;
}

function selectTheme(themeKey) {
  if (setTheme(themeKey)) {
    // Update active state in modal
    document.querySelectorAll('.theme-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Find and activate the selected theme item
    const themeItems = document.querySelectorAll('.theme-item');
    themeItems.forEach(item => {
      if (item.querySelector('.theme-name').textContent === themeDefinitions[themeKey].name) {
        item.classList.add('active');
      }
    });
    
    // Update theme switcher icon
    updateThemeSwitcher();
    
    // Close modal after selection
    setTimeout(() => {
      hideThemeSelector();
    }, 500);
  } else {
    // Enhanced premium theme purchase logic
    const theme = themeDefinitions[themeKey];
    if (theme && theme.category === 'premium' && !isThemeUnlocked(themeKey)) {
      showPremiumThemePurchaseDialog(themeKey);
    }
  }
}

// THEME SELECTOR CLOSE
document.getElementById('themeSelectorClose').onclick = function() {
  hideThemeSelector();
}

// Handle theme selector modal close with escape key and outside click
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const themeSelectorModal = document.getElementById('themeSelectorModal');
    if (themeSelectorModal.style.display === 'flex') {
      hideThemeSelector();
    }
  }
});

document.addEventListener('click', function(e) {
  const themeSelectorModal = document.getElementById('themeSelectorModal');
  if (themeSelectorModal.style.display === 'flex' && e.target === themeSelectorModal) {
    hideThemeSelector();
  }
});

// Enhanced premium theme purchase dialog
function showPremiumThemePurchaseDialog(themeKey) {
  const theme = themeDefinitions[themeKey];
  if (!theme || theme.category !== 'premium') return;

  const themePrices = {
    'pixelquest': 100,
    'poltergeist': 150,
    'hellokitty': 200,
    'chill': 120,
    'chaos': 180,
    'retroneon': 250,
    'digitalvoid': 300
  };

  const price = themePrices[themeKey] || 100;
  const currency = 'AnonCoins';

  const confirmMessage = currentLanguage === 'cs' ? 
    `🛒 Chcete koupit motiv "${theme.name}" za ${price} ${currency}?\n\n` +
    `Toto je demonstrační nákup pro ukázku funkce.\n\n` +
    `Motiv bude odemčen a můžete jej používat.` :
    `🛒 Purchase "${theme.name}" theme for ${price} ${currency}?\n\n` +
    `This is a demo purchase for feature demonstration.\n\n` +
    `The theme will be unlocked and available for use.`;

  if (confirm(confirmMessage)) {
    if (unlockPremiumTheme(themeKey)) {
      const successMessage = currentLanguage === 'cs' ? 
        `🎉 Motiv "${theme.name}" byl úspěšně odemčen!` : 
        `🎉 "${theme.name}" theme unlocked successfully!`;
      
      showNotif(successMessage, false);

      // Ask if user wants to apply the theme immediately
      const applyMessage = currentLanguage === 'cs' ? 
        `Chcete motiv "${theme.name}" aplikovat nyní?` : 
        `Would you like to apply the "${theme.name}" theme now?`;
      
      if (confirm(applyMessage)) {
        selectTheme(themeKey);
      } else {
        // Just refresh the theme selector to show the newly unlocked theme
        if (document.getElementById('themeSelectorModal').style.display === 'flex') {
          populateThemeSelector();
        }
      }
    } else {
      const alreadyUnlockedMessage = currentLanguage === 'cs' ? 
        `Motiv "${theme.name}" je již odemčen!` : 
        `"${theme.name}" theme is already unlocked!`;
      
      showNotif(alreadyUnlockedMessage, false);
    }
  }
}

// SETTINGS DROPDOWN FUNCTIONALITY
let settingsDropdownOpen = false;

// Settings button click handler
document.getElementById('settingsButton').onclick = function(e) {
  e.stopPropagation();
  toggleSettingsDropdown();
}

function toggleSettingsDropdown() {
  const dropdown = document.getElementById('settingsDropdown');
  const settingsButton = document.getElementById('settingsButton');
  
  if (settingsDropdownOpen) {
    hideSettingsDropdown();
  } else {
    showSettingsDropdown();
  }
}

function showSettingsDropdown() {
  const dropdown = document.getElementById('settingsDropdown');
  const settingsButton = document.getElementById('settingsButton');
  
  // Update language display
  updateCurrentLanguageDisplay();
  
  dropdown.style.display = 'block';
  setTimeout(() => {
    dropdown.classList.add('show');
  }, 10);
  
  settingsDropdownOpen = true;
  
  // Add rotation to settings icon
  const settingsIcon = settingsButton.querySelector('.settings-icon');
  if (settingsIcon) {
    settingsIcon.style.transform = 'scale(1.1) rotate(90deg)';
  }
}

function hideSettingsDropdown() {
  const dropdown = document.getElementById('settingsDropdown');
  const settingsButton = document.getElementById('settingsButton');
  
  dropdown.classList.remove('show');
  
  setTimeout(() => {
    dropdown.style.display = 'none';
  }, 300);
  
  settingsDropdownOpen = false;
  
  // Reset settings icon rotation
  const settingsIcon = settingsButton.querySelector('.settings-icon');
  if (settingsIcon) {
    settingsIcon.style.transform = '';
  }
}

function updateCurrentLanguageDisplay() {
  const languageDisplay = document.getElementById('currentLanguageDisplay');
  
  if (languageDisplay) {
    languageDisplay.textContent = currentLanguage === 'cs' ? '🇨🇿' : '🇬🇧';
  }
}

// Settings dropdown item click handlers
document.getElementById('settingsTheme').onclick = function() {
  hideSettingsDropdown();
  showThemeSelector();
}

document.getElementById('settingsLanguage').onclick = function() {
  hideSettingsDropdown();
  switchLanguage();
}

document.getElementById('settingsStats').onclick = function() {
  hideSettingsDropdown();
  showStatsPanel();
}

document.getElementById('settingsPremium').onclick = function() {
  hideSettingsDropdown();
  showThemeSelector(); // Opens theme selector which includes premium themes
}

// Close settings dropdown when clicking outside
document.addEventListener('click', function(e) {
  const settingsDropdown = document.getElementById('settingsDropdown');
  const settingsButton = document.getElementById('settingsButton');
  
  if (settingsDropdownOpen && 
      !settingsDropdown.contains(e.target) && 
      !settingsButton.contains(e.target)) {
    hideSettingsDropdown();
  }
});

// Close settings dropdown on escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && settingsDropdownOpen) {
    hideSettingsDropdown();
  }
});

// LANGUAGE SWITCHER BTN
document.getElementById('languageSwitcher').onclick = function() {
  switchLanguage();
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
      showNotif(getText('behaviorTip'), false);
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

// EXIT BTN = exit from partner search and return to main page
document.getElementById('exitBtn').onclick = function() {
  // Disconnect from search
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  
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
  
  // Reset reconnection flags since we're starting a new connection intentionally
  wasDisconnectedWhileHidden = false;
  reconnectOnVisible = false;
  
  socket = io();
  
  socket.on('connect', ()=> {
    console.log('Socket connected successfully');
    // Send user ID to server for favorite matching
    socket.emit('set_user_id', anonUserId);
    
    // Start pairing process
    socket.emit('start_pairing');
  });
  
  socket.on('online', (count)=>{
    document.getElementById('onlineCount').textContent = getText('online') + " " + count;
  });
  
  socket.on('partner', (data)=> {
    currentChatStart = Date.now(); // Track chat start time
    showChatPage();
    
    // Extract partner ID from socket event if available
    if (data && data.partnerId) {
      currentPartnerId = data.partnerId;
    }
    
    if (data && data.type === 'favorite') {
      addMsg(getText('favoritePartnerFound'), mySide);
    } else {
      addMsg(getText('partnerFound'), mySide);
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
  socket.on('status', (message) => {
    // Update loading overlay with status message - using getText for translations
    const loadingText = document.querySelector('.loading-text');
    if (loadingText) {
      // If message is the default looking message, use our translation
      if (message === '⏳ Looking for partner...') {
        loadingText.textContent = getText('lookingForPartner');
      } else {
        loadingText.textContent = message; // Use the message as-is for other status updates
      }
    }
  });
  
  socket.on('partner_left', ()=> {
    setRatingAction('continue'); // Default to continue when partner leaves
    showRatingModal(); // Show rating modal when partner leaves
    partnerActive = false;
    
    // Play chat end sound
    playChatEnd();
  });
  

  
  socket.on('disconnect', (reason)=> {
    console.log('Socket disconnected:', reason, 'Page visible:', isPageVisible);
    disconnectTime = Date.now();
    
    // Calculate if we were recently hidden
    const wasRecentlyHidden = hiddenStartTime && (Date.now() - hiddenStartTime) < 10000; // within 10 seconds
    
    // If page is currently hidden OR we were recently hidden, don't show error
    if (!isPageVisible || wasRecentlyHidden) {
      console.log('Disconnected while hidden or recently hidden - suppressing error');
      return; // Don't show disconnect messages
    }
    
    // Only show disconnect message for genuine network issues while actively using
    if (reason !== 'io client disconnect' && reason !== 'client namespace disconnect') {
      if (isPageVisible && (reason === 'transport close' || reason === 'transport error' || reason === 'ping timeout')) {
        // Only show error if user has been actively on the page
        showNotif(getText('connectionLost'), true);
      }
    }
    
    // Always clean up state on disconnect
    currentPartnerId = null;
    partnerActive = false;
    currentChatStart = null;
    
    // Clear typing indicator
    document.getElementById('typingIndicator').style.display = 'none';
  });
  
  // Handle reconnection - keep it simple
  socket.on('reconnect', () => {
    console.log('Socket reconnected');
    
    // If we're currently visible and reconnected, show brief confirmation
    // But only if the page has been visible for a while (not just switched back)
    const wasRecentlyHidden = hiddenStartTime && (Date.now() - hiddenStartTime) < 5000;
    
    if (isPageVisible && !wasRecentlyHidden) {
      setTimeout(() => {
        if (isPageVisible) { // Double-check we're still visible
          showNotif(getText('connectionRestored'), false);
        }
      }, 1000);
    }
  });

  // Indikace psaní
  document.getElementById('chatInput').addEventListener('input', ()=>{
    if (partnerActive) socket.emit('typing');
  });
}


// Initialize app
document.addEventListener('DOMContentLoaded', function() {
  // Validate current theme and switch if necessary
  if (!canUseTheme(currentTheme)) {
    currentTheme = 'glow'; // Default to free theme
    localStorage.setItem('selectedTheme', currentTheme);
  }
  
  // Set up sound toggle
  updateSoundToggle();
  
  // Set up theme switcher
  updateThemeSwitcher();
  applyMainTheme(currentTheme);
  
  // Set up language switcher
  updateLanguageToggle();
  updateAllTexts();
  
  // Set initial theme variation
  randomizeTheme();
  
  // Set up page visibility handling for tab switching
  setupPageVisibilityHandling();
  
  // Set up bug feedback button
  setupBugFeedbackButton();
  
  // Set up theme modal
  setupThemeModal();
  
  // Set up notification click-to-dismiss
  setupNotificationHandlers();
  
  // Show welcome message for new users
  if (userStats.totalChats === 0 && !localStorage.getItem('anonx_welcome_shown')) {
    setTimeout(() => {
      showNotif(getText('welcome'), false);
      localStorage.setItem('anonx_welcome_shown', 'true');
    }, 2000);
  }
  
  // Add double-click on theme switcher to toggle premium (for testing)
  let clickCount = 0;
  document.getElementById('themeSwitcher').addEventListener('dblclick', function() {
    togglePremiumAccess();
  });
});

// Notification Handlers Setup
function setupNotificationHandlers() {
  const notification = document.getElementById('notification');
  
  if (!notification) return;
  
  // Click to dismiss notifications without buttons
  notification.addEventListener('click', function(e) {
    const notifBtns = document.getElementById('notifBtns');
    // Only allow click-to-dismiss if no buttons are shown
    if (notifBtns && notifBtns.style.display === 'none') {
      hideNotification();
    }
  });
}

// Bug Feedback Button Setup
function setupBugFeedbackButton() {
  const bugButton = document.getElementById('bugFeedbackButton');
  const tooltip = document.getElementById('feedbackTooltip');
  const instagramBtn = document.getElementById('openInstagramBtn');
  
  if (!bugButton || !tooltip || !instagramBtn) return;
  
  // Show/hide tooltip on click
  bugButton.addEventListener('click', function() {
    if (tooltip.style.display === 'none' || !tooltip.style.display) {
      tooltip.style.display = 'block';
    } else {
      tooltip.style.display = 'none';
    }
  });
  
  // Open Instagram when button is clicked - Updated link per requirements
  instagramBtn.addEventListener('click', function() {
    window.open('https://www.instagram.com/anonx_chat', '_blank', 'noopener,noreferrer');
    tooltip.style.display = 'none';
  });
  
  // Hide tooltip when clicking outside
  document.addEventListener('click', function(e) {
    if (!bugButton.contains(e.target) && !tooltip.contains(e.target)) {
      tooltip.style.display = 'none';
    }
  });
}

// Theme Modal Setup
function setupThemeModal() {
  const themeModal = document.getElementById('themeModal');
  const themeModalClose = document.getElementById('themeModalClose');
  const themeOptions = document.querySelectorAll('.theme-option');
  
  if (!themeModal || !themeModalClose) return;
  
  // Close modal when close button is clicked
  themeModalClose.addEventListener('click', hideThemeModal);
  
  // Close modal when clicking outside
  themeModal.addEventListener('click', function(e) {
    if (e.target === themeModal) {
      hideThemeModal();
    }
  });
  
  // Handle theme selection
  themeOptions.forEach(option => {
    option.addEventListener('click', function() {
      const themeName = this.dataset.theme;
      selectTheme(themeName);
    });
  });
  
  // Handle ESC key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && themeModal.style.display === 'flex') {
      hideThemeModal();
    }
  });
}

// Page Visibility API handling for graceful tab switching
function setupPageVisibilityHandling() {
  // Handle page visibility changes (tab switching, minimizing window)
  document.addEventListener('visibilitychange', function() {
    isPageVisible = !document.hidden;
    
    if (isPageVisible) {
      // User returned to tab
      handlePageVisible();
    } else {
      // User left tab (switched or minimized)
      handlePageHidden();
    }
  });
  
  // Handle browser focus/blur events as backup
  window.addEventListener('focus', function() {
    if (!isPageVisible) {
      isPageVisible = true;
      handlePageVisible();
    }
  });
  
  window.addEventListener('blur', function() {
    if (isPageVisible) {
      isPageVisible = false;
      handlePageHidden();
    }
  });
}

function handlePageHidden() {
  console.log('Page hidden - user switched tab or minimized window');
  hiddenStartTime = Date.now();
}

function handlePageVisible() {
  console.log('Page visible - user returned to tab');
  
  const wasHiddenFor = hiddenStartTime ? Date.now() - hiddenStartTime : 0;
  console.log('Page was hidden for', wasHiddenFor, 'ms');
  
  // If user was away for more than 1 second and socket is disconnected,
  // assume disconnect happened while away and handle gracefully
  if (wasHiddenFor > 1000 && socket && !socket.connected) {
    console.log('Socket disconnected while tab was hidden - cleaning up gracefully');
    handleReconnectionOnVisible();
  }
  
  hiddenStartTime = null;
}

function handleReconnectionOnVisible() {
  console.log('Handling reconnection after returning to tab');
  
  // Clean up any existing socket
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  
  // Reset state and show main page
  currentPartnerId = null;
  partnerActive = false;
  currentChatStart = null;
  
  // Clear any error notifications and show main page cleanly
  showMainPage();
}
