const socket      = io();
const welcomeEl   = document.getElementById('welcome');
const startBtn    = document.getElementById('startBtn');
const colorPicker = document.getElementById('colorPicker');
const chatEl      = document.getElementById('chat');
const statusEl    = document.getElementById('status');
const messagesEl  = document.getElementById('messages');
const typingEl    = document.getElementById('typing');
const form        = document.getElementById('form');
const input       = document.getElementById('input');
const skipBtn     = document.getElementById('skipBtn');
const stopBtn     = document.getElementById('stopBtn');

let myColor    = colorPicker.value;
let theirColor = '#888';
let typingTimeout;

function clearChat() {
  messagesEl.innerHTML = '';
  typingEl.textContent = '';
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function applyColors() {
  const [yr, yg, yb] = hexToRgb(myColor);
  const [tr, tg, tb] = hexToRgb(theirColor);
  document.querySelectorAll('.message.you')
    .forEach(el => el.style.background = `rgba(${yr},${yg},${yb},0.2)`);
  document.querySelectorAll('.message.partner')
    .forEach(el => el.style.background = `rgba(${tr},${tg},${tb},0.1)`);
}

// **Okamžité přepnutí UI po kliknutí**
startBtn.addEventListener('click', () => {
  myColor = colorPicker.value;
  socket.emit('start', { color: myColor });

  welcomeEl.classList.add('hidden');
  chatEl.classList.remove('hidden');
  statusEl.textContent = '⏳ Looking for partner…';
  clearChat();
});

socket.on('showChat', () => {
  statusEl.textContent = '✅ Partner found!';
  applyColors();
});

socket.on('status', txt => {
  statusEl.textContent = txt;
});

socket.on('setColors', ({ you, them }) => {
  myColor    = you;
  theirColor = them;
  applyColors();
});

skipBtn.addEventListener('click', () => {
  socket.emit('skip');
  clearChat();
  statusEl.textContent = '⏳ Looking for someone new…';
});

stopBtn.addEventListener('click', () => {
  socket.emit('stop');
  welcomeEl.classList.remove('hidden');
  chatEl.classList.add('hidden');
  clearChat();
});

socket.on('msg', ({ text, time }) => {
  const div = document.createElement('div');
  div.className = 'message partner';
  const t = new Date(time);
  div.innerHTML = `<strong>Partner:</strong> ${text}
    <span class="time">${t.getHours()}:${String(t.getMinutes()).padStart(2,'0')}</span>`;
  messagesEl.appendChild(div);
  applyColors();
  messagesEl.scrollTop = messagesEl.scrollHeight;
});

form.addEventListener('submit', e => {
  e.preventDefault();
  const txt = input.value.trim();
  if (!txt) return;
  const now = new Date();
  const div = document.createElement('div');
  div.className = 'message you';
  div.innerHTML = `<strong>You:</strong> ${txt}
    <span class="time">${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}</span>`;
  messagesEl.appendChild(div);
  applyColors();
  messagesEl.scrollTop = messagesEl.scrollHeight;
  socket.emit('msg', txt);
  input.value = '';
});

input.addEventListener('input', () => {
  socket.emit('typing', true);
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => socket.emit('typing', false), 800);
});
socket.on('typing', isTyping => {
  if (isTyping) {
    typingEl.textContent = 'Partner is typing…';
    typingEl.classList.add('active');
  } else {
    typingEl.classList.remove('active');
  }
});
socket.on('clearChat', () => {
  clearChat();
});
