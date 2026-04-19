const noteForm = document.getElementById('noteForm');
const noteInput = document.getElementById('noteInput');
const noteList = document.getElementById('noteList');
const emptyState = document.getElementById('emptyState');
const statusBadge = document.getElementById('status');
const installBtn = document.getElementById('installBtn');

const STORAGE_KEY = 'quicknotes-data';

// Load notes from localStorage
function getNotes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function render() {
  const notes = getNotes();
  noteList.innerHTML = '';

  if (notes.length === 0) {
    emptyState.classList.remove('hidden');
    noteList.style.display = 'none';
    return;
  }

  emptyState.classList.add('hidden');
  noteList.style.display = 'flex';

  notes.forEach((note) => {
    const li = document.createElement('li');
    li.className = 'note-item';
    li.innerHTML = `
      <span class="note-text">${escapeHtml(note.text)}</span>
      <span class="note-date">${formatTime(note.created)}</span>
      <button class="btn-delete" aria-label="Delete note" data-id="${note.id}">🗑️</button>
    `;
    noteList.appendChild(li);
  });
}

function addNote(text) {
  const notes = getNotes();
  notes.unshift({ id: Date.now(), text, created: Date.now() });
  saveNotes(notes);
  render();
}

function deleteNote(id) {
  let notes = getNotes();
  notes = notes.filter((n) => String(n.id) !== String(id));
  saveNotes(notes);
  render();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Events
noteForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = noteInput.value.trim();
  if (!text) return;
  addNote(text);
  noteInput.value = '';
  noteInput.focus();
});

noteList.addEventListener('click', (e) => {
  if (e.target.closest('.btn-delete')) {
    const id = e.target.closest('.btn-delete').dataset.id;
    deleteNote(id);
  }
});

// Online / Offline status
function updateStatus() {
  if (navigator.onLine) {
    statusBadge.textContent = 'Online';
    statusBadge.classList.remove('offline');
  } else {
    statusBadge.textContent = 'Offline — changes saved locally';
    statusBadge.classList.add('offline');
  }
}

window.addEventListener('online', updateStatus);
window.addEventListener('offline', updateStatus);
updateStatus();

// Install prompt
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    installBtn.hidden = true;
  }
  deferredPrompt = null;
});

window.addEventListener('appinstalled', () => {
  installBtn.hidden = true;
  deferredPrompt = null;
});

// Init
render();
