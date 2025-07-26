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
    mutualCount: 'Vzájemných'
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
    mutualCount: 'Mutual'
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
    icon: '🌊',
    className: 'theme-chill',
    category: 'premium',
    description: 'Relaxing ocean blues'
  },
  chaos: {
    name: 'Chaos',
    icon: '💥',
    className: 'theme-chaos',
    category: 'premium',
    description: 'Wild multicolor madness'
  },
  phantom: {
    name: 'Phantom',
    icon: '👻',
    className: 'theme-phantom',
    category: 'premium',
    description: 'Ethereal ghostly presence'
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
  
  return theme.category === 'free' || hasPremiumAccess;
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
  }
  
  // Apply color variations for themes that support them
  if (themeName === 'goth' || themeName === 'phantom') {
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
    'retroNeonOverlay', 'digitalVoidOverlay'
  ];
  overlays.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.remove();
    }
  });
  
  // Remove Hello Kitty effects when switching themes
  removeHelloKittyEffects();
}

// Create retro neon effects
function createRetroNeonEffects() {
  const body = document.body;
  
  const retroOverlay = document.createElement('div');
  retroOverlay.className = 'retro-neon-overlay';
  retroOverlay.id = 'retroNeonOverlay';
  body.appendChild(retroOverlay);
}

// Create digital void effects  
function createDigitalVoidEffects() {
  const body = document.body;
  
  const digitalOverlay = document.createElement('div');
  digitalOverlay.className = 'digital-void-overlay';
  digitalOverlay.id = 'digitalVoidOverlay';
  body.appendChild(digitalOverlay);
}

// ===== HELLO KITTY LUXURY THEME FUNCTIONS =====

// Global variables for Hello Kitty theme
let sparklesEnabled = localStorage.getItem('kitty_sparkles') !== 'false'; // Default to enabled
let currentKittyPosition = 'random';
let helloKittyCharacter = null;
let sparkleContainer = null;
let sparkleToggleBtn = null;

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
  if (helloKittyCharacter) {
    helloKittyCharacter.remove();
  }
  
  helloKittyCharacter = document.createElement('div');
  helloKittyCharacter.className = 'hello-kitty-character';
  helloKittyCharacter.id = 'helloKittyCharacter';
  
  // Load SVG content
  helloKittyCharacter.innerHTML = `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
      <!-- Head -->
      <ellipse cx="100" cy="110" rx="65" ry="55" fill="#ffffff" stroke="#ff69b4" stroke-width="2"/>
      
      <!-- Left ear -->
      <ellipse cx="65" cy="75" rx="20" ry="25" fill="#ffffff" stroke="#ff69b4" stroke-width="2"/>
      
      <!-- Right ear -->
      <ellipse cx="135" cy="75" rx="20" ry="25" fill="#ffffff" stroke="#ff69b4" stroke-width="2"/>
      
      <!-- Left ear inner -->
      <ellipse cx="65" cy="80" rx="10" ry="12" fill="#ffb6c1"/>
      
      <!-- Right ear inner -->
      <ellipse cx="135" cy="80" rx="10" ry="12" fill="#ffb6c1"/>
      
      <!-- Eyes -->
      <circle cx="85" cy="105" r="4" fill="#000000" class="kitty-eye-left"/>
      <circle cx="115" cy="105" r="4" fill="#000000" class="kitty-eye-right"/>
      
      <!-- Eye highlights -->
      <circle cx="86" cy="103" r="1.5" fill="#ffffff"/>
      <circle cx="116" cy="103" r="1.5" fill="#ffffff"/>
      
      <!-- Nose -->
      <ellipse cx="100" cy="115" rx="2" ry="1.5" fill="#ff69b4"/>
      
      <!-- Bow -->
      <path d="M 120 70 Q 130 60 140 70 Q 130 80 120 70 Q 110 60 120 70" fill="#ff1493"/>
      <ellipse cx="130" cy="70" rx="3" ry="5" fill="#ff69b4"/>
      
      <!-- Whiskers -->
      <line x1="60" y1="110" x2="40" y2="108" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="60" y1="120" x2="40" y2="122" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
      
      <line x1="140" y1="110" x2="160" y2="108" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="140" y1="120" x2="160" y2="122" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
      
      <!-- Body (hidden by default) -->
      <ellipse cx="100" cy="170" rx="40" ry="30" fill="#ffffff" stroke="#ff69b4" stroke-width="2" class="kitty-body" style="display:none;"/>
      
      <!-- Arms -->
      <ellipse cx="70" cy="155" rx="15" ry="20" fill="#ffffff" stroke="#ff69b4" stroke-width="2" class="kitty-arm-left" style="display:none;"/>
      <ellipse cx="130" cy="155" rx="15" ry="20" fill="#ffffff" stroke="#ff69b4" stroke-width="2" class="kitty-arm-right" style="display:none;"/>
    </svg>
  `;
  
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
    // Main page variants
    const mainVariants = ['kitty-main-hug', 'kitty-main-lay'];
    const randomVariant = mainVariants[Math.floor(Math.random() * mainVariants.length)];
    helloKittyCharacter.classList.add(randomVariant);
    currentKittyPosition = randomVariant;
    
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
    
    // Hide body for chat positions (head only)
    const body = helloKittyCharacter.querySelector('.kitty-body');
    const armLeft = helloKittyCharacter.querySelector('.kitty-arm-left');
    const armRight = helloKittyCharacter.querySelector('.kitty-arm-right');
    if (body) body.style.display = 'none';
    if (armLeft) armLeft.style.display = 'none';
    if (armRight) armRight.style.display = 'none';
  }
}

// Setup Hello Kitty interactions for messages
function setupKittyInteractions() {
  // Remove existing listeners to prevent duplicates
  if (window.kittyMessageListener) {
    document.removeEventListener('kitty:newMessage', window.kittyMessageListener);
  }
  
  // Create new listener for message reactions
  window.kittyMessageListener = function(event) {
    if (!helloKittyCharacter || currentTheme !== 'hellokitty') return;
    
    const reactions = ['wink', 'clap'];
    const reaction = reactions[Math.floor(Math.random() * reactions.length)];
    
    // Remove existing reaction classes
    helloKittyCharacter.classList.remove('kitty-wink', 'kitty-clap');
    
    // Add reaction class
    helloKittyCharacter.classList.add(`kitty-${reaction}`);
    
    // Remove class after animation
    setTimeout(() => {
      helloKittyCharacter.classList.remove(`kitty-${reaction}`);
    }, 1000);
  };
  
  document.addEventListener('kitty:newMessage', window.kittyMessageListener);
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

// Remove Hello Kitty effects when theme changes
function removeHelloKittyEffects() {
  if (sparkleContainer) {
    sparkleContainer.remove();
    sparkleContainer = null;
  }
  
  if (helloKittyCharacter) {
    helloKittyCharacter.remove();
    helloKittyCharacter = null;
  }
  
  if (sparkleToggleBtn) {
    sparkleToggleBtn.remove();
    sparkleToggleBtn = null;
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
  
  // Trigger Hello Kitty reaction for incoming messages (left side)
  if (side === 'left' && currentTheme === 'hellokitty') {
    triggerKittyMessageReaction();
  }
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
  
  // Populate free themes
  Object.entries(themeDefinitions).forEach(([key, theme]) => {
    if (theme.category === 'free') {
      const themeItem = createThemeItem(key, theme, true);
      freeGrid.appendChild(themeItem);
    }
  });
  
  // Populate premium themes
  Object.entries(themeDefinitions).forEach(([key, theme]) => {
    if (theme.category === 'premium') {
      const themeItem = createThemeItem(key, theme, hasPremiumAccess);
      premiumGrid.appendChild(themeItem);
    }
  });
  
  // Show/hide premium hint and update text
  premiumHint.style.display = hasPremiumAccess ? 'none' : 'flex';
  const unlockText = document.getElementById('unlockText');
  if (unlockText) {
    unlockText.textContent = currentLanguage === 'cs' ? 'Odemkni všechny motivy' : 'Unlock all themes';
  }
}

function createThemeItem(themeKey, theme, canUse) {
  const item = document.createElement('div');
  item.className = `theme-item ${currentTheme === themeKey ? 'active' : ''} ${!canUse ? 'locked' : ''}`;
  
  item.innerHTML = `
    <span class="theme-icon">${theme.icon}</span>
    <div class="theme-name">${theme.name}</div>
    <div class="theme-description">${theme.description}</div>
    ${!canUse ? '<div class="theme-lock-overlay"><span class="theme-lock-icon">🔒</span></div>' : ''}
  `;
  
  if (canUse) {
    item.onclick = () => {
      selectTheme(themeKey);
    };
  } else {
    item.title = currentLanguage === 'cs' ? 'Odemkni všechny motivy' : 'Unlock all themes';
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
    // Show premium message for locked themes
    const theme = themeDefinitions[themeKey];
    if (theme && theme.category === 'premium' && !hasPremiumAccess) {
      // Create tooltip/notification about premium access
      showNotif(currentLanguage === 'cs' ? 
        '🔒 Premium motiv! Tato funkce bude dostupná v budoucí verzi.' : 
        '🔒 Premium theme! This feature will be available in future version.', false);
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
