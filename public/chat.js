// proměnné
let socket;
let mySide = 'right';
let partnerActive = true;
let typingTimeout;

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
      
      setTimeout(() => {
        mainPage.style.opacity = '1';
      }, 10);
    }, 150);
  } else {
    chatPage.style.display = 'none';
    notification.style.display = 'none';
    loadingOverlay.style.display = 'none';
    mainPage.style.display = 'flex';
  }
}

function showNotif(msg, btns = false) {
  const notification = document.getElementById('notification');
  const notifMsg = document.getElementById('notifMsg');
  const notifBtns = document.getElementById('notifBtns');
  const chatPage = document.getElementById('chatPage');
  const mainPage = document.getElementById('mainPage');
  const loadingOverlay = document.getElementById('loadingOverlay');
  
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
}

// START BTN
document.getElementById('startBtn').onclick = function() {
  showLoadingOverlay();
  startSocket();
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

    // Vyčistit chat zprávy
    document.getElementById('messages').innerHTML = '';

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
  });
  socket.on('disconnect', ()=> {
    showNotif('Disconnected from server.', false);
  });

  // Indikace psaní
  document.getElementById('chatInput').addEventListener('input', ()=>{
    if (partnerActive) socket.emit('typing');
  });
}
