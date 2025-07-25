// proměnné
let socket;
let mySide = 'right';
let partnerActive = true;
let typingTimeout;
let soundEnabled = localStorage.getItem('soundEnabled') !== 'false'; // Default to true
let currentTheme = null;

// Sound system
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Theme palettes
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

// Theme randomization
function randomizeTheme() {
  const randomIndex = Math.floor(Math.random() * themes.length);
  currentTheme = themes[randomIndex];
  applyTheme(currentTheme);
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
socket.disconnect();

    // Play chat end sound
    playChatEnd();

    // Vyčistit chat zprávy
    document.getElementById('messages').innerHTML = '';

    // Randomize theme for new chat
    randomizeTheme();

    // Show loading overlay while looking for new partner
    showLoadingOverlay();

    // Spustí nový chat po krátké pauze
    setTimeout(() => {
        startSocket();
    }, 700);
};

// END CHAT BTN = konec chatu, návrat na hlavní
document.getElementById('endBtn').onclick = function() {
    if (socket) socket.emit('leave_chat');
socket.disconnect();

    // Play chat end sound
    playChatEnd();

    // Vyčistí zprávy a vrátí na hlavní stránku
    document.getElementById('messages').innerHTML = '';
    showMainPage();
};
// SOCKET.IO
function startSocket() {
  // Disconnect existing socket if it exists
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  
  socket = io();
  socket.on('connect', ()=> {
    // Overlay is already showing, no need for additional message
  });
  socket.on('online', (count)=>{
    document.getElementById('onlineCount').textContent = "Online: " + count;
  });
  socket.on('partner', ()=> {
    showChatPage();
    addMsg('✅ Partner found!', mySide);
    
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
    showNotif('Partner left', true);
    partnerActive = false;
    
    // Play chat end sound
    playChatEnd();
  });
  socket.on('disconnect', ()=> {
    showNotif('Disconnected from server.', false);
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
  
  // Set initial theme
  randomizeTheme();
});
