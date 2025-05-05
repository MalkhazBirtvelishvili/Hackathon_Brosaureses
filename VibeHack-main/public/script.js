// public/script.js
// Generate or retrieve a persistent sessionId for context continuity
let sessionId = localStorage.getItem('sessionId');
if (!sessionId) {
  sessionId = crypto.randomUUID();
  localStorage.setItem('sessionId', sessionId);
}

const form = document.getElementById('moveForm');
const playerMove = document.getElementById('playerMove');
const log = document.getElementById('log');
const userHP = document.getElementById('userHP');
const aiHP = document.getElementById('aiHP');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const move = playerMove.value.trim();
  if (!move) return;

  // Append player's move to the log
  log.innerHTML += `\n🗡️ You: ${move}`;
  playerMove.value = '';

  // Send move and sessionId to backend
  const res = await fetch('/api/move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerMove: move, sessionId })
  });
  const data = await res.json();

  // Append AI response and update HP values
  log.innerHTML += `\n⚔️ Tariel: ${data.aiResponse}`;
  userHP.textContent = data.userHP;
  aiHP.textContent = data.aiHP;

  // Check for end-of-game
  if (data.userHP <= 0) {
    log.innerHTML += `\n💀 You have been defeated.`;
    form.querySelector('button').disabled = true;
  } else if (data.aiHP <= 0) {
    log.innerHTML += `\n🏆 You are victorious!`;
    form.querySelector('button').disabled = true;
  }

  // Scroll log to bottom
  log.scrollTop = log.scrollHeight;
});
