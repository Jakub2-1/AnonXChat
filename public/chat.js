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

// Přepínání stránek
function showChatPage() {
  document.getElementById('mainPage').style.display = 'none';
  document.getElementById('chatPage').style.display = 'flex';
  document.getElementById('onlineCount').style.display = '';
  document.getElementById('notification').style.display = 'none';
}
function showMainPage() {
  document.getElementById('mainPage').style.display = 'flex';
  document.getElementById('chatPage').style.display = 'none';
  document.getElementById('notification').style.display = 'none';
}
function showNotif(msg, btns = false) {
  document.getElementById('notifMsg').textContent = msg;
  document.getElementById('notification').style.display = '';
  document.getElementById('notifBtns').style.display = btns ? '' : 'none';
  document.getElementById('chatPage').style.display = 'none';
  document.getElementById('mainPage').style.display = 'none';
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
  showChatPage();
  startSocket();
}

// CHAT FORM SUBMIT
document.getElementById('chatForm').onsubmit = function(e) {
  e.preventDefault();
  sendMsg();
};

// CONTINUE/RETURN BTN
document.getElementById('continueBtn').onclick = function() {
  showNotif('Looking for a new partner...');
  setTimeout(()=>location.reload(),800); // Prototypově reload (lepší řešení: socket.io leave+rejoin)
};
document.getElementById('returnBtn').onclick = function() {
  showMainPage();
  setTimeout(()=>location.reload(),500); // Restart stránky na homepage
};
// SKIP BTN = najde nového partnera bez návratu na hlavní
document.getElementById('skipBtn').onclick = function() {
    if (socket) socket.emit('leave_chat');
socket.disconnect();

    // Vyčistit chat zprávy
    document.getElementById('messages').innerHTML = '';

    // Info že hledá nového partnera
    showNotif('🔄 Looking for a new partner...');

    // Spustí nový chat po krátké pauze
    setTimeout(() => {
        showChatPage();
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
  socket = io();
  socket.on('connect', ()=> {
    addMsg('⏳ Looking for a partner...', mySide);
  });
  socket.on('online', (count)=>{
    document.getElementById('onlineCount').textContent = "Online: " + count;
  });
  socket.on('partner', ()=> {
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
    showNotif('Partner has left the chat.', true);
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
