/* ============================================================================
   CK SHELF — Secure Paperless File System (shares Firebase with CDMS)
   ============================================================================ */

/* ---- Firebase (same project as CDMS) ---- */
const CK_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCuUKCxYx0jYKqWOQaN82K5zFGlQsKQsK0",
  authDomain: "ck-manager-1abdc.firebaseapp.com",
  projectId: "ck-manager-1abdc",
  storageBucket: "ck-manager-1abdc.firebasestorage.app",
  messagingSenderId: "890017473158",
  appId: "1:890017473158:web:528e1eebc4b67bd54ca707",
};
const fb = firebase.initializeApp(CK_FIREBASE_CONFIG, 'ck-shelf');
const auth = fb.auth();
const db = fb.firestore();
const storage = fb.storage();

/* ---- Collections ---- */
const COL = {
  settings: 'ck_shelf_settings',
  users: 'ck_shelf_users',
  folders: 'ck_shelf_folders',
  files: 'ck_shelf_files',
  approvals: 'ck_shelf_approval_requests',
  audit: 'ck_shelf_audit_logs',
};
const SETTINGS_DOC = 'main';

/* ---- State ---- */
const state = {
  user: null,
  role: null,
  settings: null,
  pinVerified: sessionStorage.getItem('ckShelfPinVerified') === '1',
  currentFolderId: 'root',
  folders: new Map(),
  files: new Map(),
  search: '',
  selectedId: null,
  pinAttempts: 0,
  pinLockUntil: 0,
};

/* ============================================================================
   UTILITIES
   ============================================================================ */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[c]));
const fmtSize = (b) => {
  if (b == null) return '—';
  if (b < 1024) return b + ' B';
  const u = ['KB','MB','GB','TB']; let i = -1;
  do { b /= 1024; i++; } while (b >= 1024 && i < u.length - 1);
  return b.toFixed(b < 10 ? 1 : 0) + ' ' + u[i];
};
const fmtDate = (ts) => {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
       + ' ' + d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
};
const show = (id) => document.getElementById(id)?.classList.remove('hidden');
const hide = (id) => document.getElementById(id)?.classList.add('hidden');

function toast(msg, type = 'info') {
  const colors = { success:'bg-emerald-600', error:'bg-secondary-red', info:'bg-primary-blue' };
  const el = document.createElement('div');
  el.className = `${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg animate-slide-up max-w-sm`;
  el.textContent = msg;
  $('#toast-root').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 3500);
}

/* ---- Device fingerprint for audit ---- */
function deviceInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform || (navigator.userAgentData?.platform) || 'unknown',
    language: navigator.language,
    screen: `${screen.width}x${screen.height}`,
    viewport: `${innerWidth}x${innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    referrer: document.referrer || '',
    url: location.href,
    online: navigator.onLine,
    cores: navigator.hardwareConcurrency || null,
    memoryGB: navigator.deviceMemory || null,
    cookiesEnabled: navigator.cookieEnabled,
  };
}

/* ---- SHA-256 for PIN ---- */
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
async function hashPin(pin, salt) { return sha256(pin + '|' + salt); }
function newSalt() {
  const a = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(a).map(b => b.toString(16).padStart(2, '0')).join('');
}

/* ============================================================================
   AUDIT LOG
   ============================================================================ */
async function writeAudit(action, target = {}, details = {}) {
  if (!state.user) return;
  try {
    await db.collection(COL.audit).add({
      action,
      actor: state.user.email,
      actorUid: state.user.uid,
      actorRole: state.role || 'member',
      targetType: target.type || null,
      targetId: target.id || null,
      targetName: target.name || null,
      details,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      device: deviceInfo(),
    });
  } catch (e) { console.error('audit write failed', e); }
}

/* ============================================================================
   SETTINGS + USER
   ============================================================================ */
async function loadSettings() {
  const snap = await db.collection(COL.settings).doc(SETTINGS_DOC).get();
  state.settings = snap.exists ? { id: snap.id, ...snap.data() } : null;
}

async function loadUserRole() {
  if (!state.user) return null;
  const snap = await db.collection(COL.users).doc(state.user.email.toLowerCase()).get();
  if (!snap.exists) return null;
  const data = snap.data();
  if (data.active === false) return null;
  return data.role || 'member';
}

const APPROVER_ROLES = () => state.settings?.approverRoles || ['admin', 'approver'];
const isApprover = () => APPROVER_ROLES().includes(state.role);
const isAdmin = () => state.role === 'admin';

const needsApproval = (actionKey) => {
  if (!state.settings) return true;
  if (!state.settings.requireApprovalFor?.[actionKey]) return false;
  const autoApprove = state.settings.autoApproveRoles || ['admin', 'approver'];
  return !autoApprove.includes(state.role);
};

/* ============================================================================
   FIRST-RUN SETUP
   ============================================================================ */
async function createFirstRunSettings(pin) {
  const salt = newSalt();
  const pinHash = await hashPin(pin, salt);
  await db.collection(COL.settings).doc(SETTINGS_DOC).set({
    pinHash,
    pinSalt: salt,
    pinSetAt: firebase.firestore.FieldValue.serverTimestamp(),
    pinSetBy: state.user.email,
    requireApprovalFor: {
      delete_file: true,
      delete_folder: true,
      rename_file: true,
      rename_folder: true,
      move_file: true,
      move_folder: true,
      create_folder: false,
      upload_file: false,
    },
    autoApproveRoles: ['admin', 'approver'],
    approverRoles: ['admin', 'approver'],
    maxFileSizeMB: 100,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
  await db.collection(COL.users).doc(state.user.email.toLowerCase()).set({
    email: state.user.email,
    role: 'admin',
    active: true,
    addedAt: firebase.firestore.FieldValue.serverTimestamp(),
    addedBy: 'first-run',
  });
  await loadSettings();
  state.role = 'admin';
  await writeAudit('settings_initialized', {}, { firstAdmin: state.user.email });
}

/* ============================================================================
   PIN VERIFICATION
   ============================================================================ */
async function verifyPin(pin) {
  if (!state.settings?.pinHash || !state.settings?.pinSalt) return false;
  const h = await hashPin(pin, state.settings.pinSalt);
  return h === state.settings.pinHash;
}

/* ============================================================================
   AUTH FLOW
   ============================================================================ */
auth.onAuthStateChanged(async (user) => {
  hide('login-screen'); hide('pin-screen'); hide('setup-screen'); hide('denied-screen'); hide('app-shell');
  state.user = user;
  if (!user) { show('login-screen'); return; }

  await loadSettings();

  if (!state.settings) {
    show('setup-screen');
    return;
  }

  const role = await loadUserRole();
  if (!role) {
    $('#denied-email').textContent = user.email;
    show('denied-screen');
    await writeAudit('access_denied_no_user_record', {}, { email: user.email });
    return;
  }
  state.role = role;

  if (!state.pinVerified) {
    show('pin-screen');
    return;
  }

  bootApp();
});

/* ---- Login screen ---- */
$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = $('#login-email').value.trim();
  const pwd = $('#login-password').value;
  $('#login-error').classList.add('hidden');
  try {
    await auth.signInWithEmailAndPassword(email, pwd);
  } catch (err) {
    $('#login-error').textContent = err.message;
    $('#login-error').classList.remove('hidden');
  }
});

/* ---- PIN screen ---- */
$('#pin-submit').addEventListener('click', submitPin);
$('#pin-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') submitPin(); });
$('#pin-logout').addEventListener('click', () => auth.signOut());

async function submitPin() {
  const now = Date.now();
  if (now < state.pinLockUntil) {
    const secs = Math.ceil((state.pinLockUntil - now) / 1000);
    $('#pin-error').textContent = `Too many attempts. Wait ${secs}s.`;
    $('#pin-error').classList.remove('hidden');
    return;
  }
  const pin = $('#pin-input').value;
  if (!/^\d{4,8}$/.test(pin)) {
    $('#pin-error').textContent = 'PIN must be 4–8 digits.';
    $('#pin-error').classList.remove('hidden');
    return;
  }
  const ok = await verifyPin(pin);
  if (!ok) {
    state.pinAttempts++;
    await writeAudit('pin_failed', {}, { attempt: state.pinAttempts });
    if (state.pinAttempts >= 3) {
      state.pinLockUntil = Date.now() + 60000;
      state.pinAttempts = 0;
      $('#pin-error').textContent = 'Too many wrong attempts. Locked for 60s.';
    } else {
      $('#pin-error').textContent = `Incorrect PIN (${state.pinAttempts}/3).`;
    }
    $('#pin-error').classList.remove('hidden');
    $('#pin-input').value = '';
    return;
  }
  state.pinAttempts = 0;
  state.pinVerified = true;
  sessionStorage.setItem('ckShelfPinVerified', '1');
  await writeAudit('pin_verified', {}, {});
  hide('pin-screen');
  bootApp();
}

/* ---- First run setup ---- */
$('#setup-submit').addEventListener('click', async () => {
  const p1 = $('#setup-pin').value;
  const p2 = $('#setup-pin2').value;
  const errEl = $('#setup-error');
  errEl.classList.add('hidden');
  if (!/^\d{4,8}$/.test(p1)) { errEl.textContent = 'PIN must be 4–8 digits.'; errEl.classList.remove('hidden'); return; }
  if (p1 !== p2) { errEl.textContent = 'PINs do not match.'; errEl.classList.remove('hidden'); return; }
  try {
    await createFirstRunSettings(p1);
    state.pinVerified = true;
    sessionStorage.setItem('ckShelfPinVerified', '1');
    hide('setup-screen');
    await loadSettings();
    bootApp();
  } catch (e) {
    errEl.textContent = e.message; errEl.classList.remove('hidden');
  }
});

/* ---- Denied logout ---- */
$('#denied-logout').addEventListener('click', () => auth.signOut());

/* ============================================================================
   DATA LOADING (live listeners)
   ============================================================================ */
const unsubs = [];
function attachListeners() {
  unsubs.push(db.collection(COL.folders).onSnapshot((snap) => {
    state.folders.clear();
    snap.forEach(d => state.folders.set(d.id, { id: d.id, ...d.data() }));
    renderTree(); renderContent(); renderBreadcrumb();
  }));
  unsubs.push(db.collection(COL.files).onSnapshot((snap) => {
    state.files.clear();
    snap.forEach(d => state.files.set(d.id, { id: d.id, ...d.data() }));
    renderContent();
  }));
  unsubs.push(db.collection(COL.approvals).where('status', '==', 'pending').onSnapshot((snap) => {
    const badge = $('#approvals-badge');
    if (snap.size > 0) { badge.textContent = snap.size; badge.classList.remove('hidden'); }
    else badge.classList.add('hidden');
  }));
}

/* ============================================================================
   RENDER — TREE
   ============================================================================ */
function renderTree() {
  const build = (parentId, depth) => {
    const folders = [...state.folders.values()]
      .filter(f => (f.parentId || 'root') === parentId && !f.trashed)
      .sort((a, b) => a.name.localeCompare(b.name));
    if (!folders.length) return '';
    return folders.map(f => `
      <div>
        <div class="tree-row px-2 py-1.5 rounded text-sm cursor-pointer flex items-center gap-2 ${state.currentFolderId === f.id ? 'active' : ''}"
             data-folder-id="${f.id}" style="padding-left:${8 + depth * 12}px">
          <i class="fas fa-folder text-amber-500 text-xs"></i>
          <span class="truncate flex-1">${escapeHtml(f.name)}</span>
        </div>
        ${build(f.id, depth + 1)}
      </div>
    `).join('');
  };
  $('#folder-tree').innerHTML = `
    <div class="tree-row px-2 py-1.5 rounded text-sm cursor-pointer flex items-center gap-2 ${state.currentFolderId === 'root' ? 'active' : ''}"
         data-folder-id="root">
      <i class="fas fa-house text-primary-blue text-xs"></i>
      <span class="truncate flex-1">All Files</span>
    </div>
    ${build('root', 0)}
  `;
}

$('#folder-tree').addEventListener('click', (e) => {
  const row = e.target.closest('[data-folder-id]');
  if (!row) return;
  state.currentFolderId = row.dataset.folderId;
  state.selectedId = null;
  renderTree(); renderContent(); renderBreadcrumb(); hideDetails();
});

/* ============================================================================
   RENDER — BREADCRUMB
   ============================================================================ */
function renderBreadcrumb() {
  const path = [];
  let cur = state.currentFolderId;
  const guard = new Set();
  while (cur && cur !== 'root' && !guard.has(cur)) {
    guard.add(cur);
    const f = state.folders.get(cur);
    if (!f) break;
    path.unshift(f);
    cur = f.parentId || 'root';
  }
  const parts = [
    `<a class="hover:text-primary-blue cursor-pointer" data-crumb="root">All Files</a>`,
    ...path.map(p => `<span class="text-slate-400">›</span><a class="hover:text-primary-blue cursor-pointer" data-crumb="${p.id}">${escapeHtml(p.name)}</a>`),
  ];
  $('#breadcrumb').innerHTML = parts.join(' ');
}
$('#breadcrumb').addEventListener('click', (e) => {
  const a = e.target.closest('[data-crumb]');
  if (!a) return;
  state.currentFolderId = a.dataset.crumb;
  state.selectedId = null;
  renderTree(); renderContent(); renderBreadcrumb(); hideDetails();
});

/* ============================================================================
   RENDER — CONTENT GRID
   ============================================================================ */
function fileIconClass(mime = '', name = '') {
  if (mime.startsWith('image/')) return { icon: 'fa-image', color: 'text-purple-500', bg: 'bg-purple-50' };
  if (mime === 'application/pdf') return { icon: 'fa-file-pdf', color: 'text-red-500', bg: 'bg-red-50' };
  if (mime.startsWith('text/') || name.match(/\.(txt|md|csv)$/i)) return { icon: 'fa-file-lines', color: 'text-slate-600', bg: 'bg-slate-100' };
  if (mime.startsWith('video/')) return { icon: 'fa-file-video', color: 'text-blue-500', bg: 'bg-blue-50' };
  if (mime.startsWith('audio/')) return { icon: 'fa-file-audio', color: 'text-indigo-500', bg: 'bg-indigo-50' };
  if (name.match(/\.(zip|rar|7z|tar|gz)$/i)) return { icon: 'fa-file-zipper', color: 'text-amber-600', bg: 'bg-amber-50' };
  if (name.match(/\.(doc|docx|odt)$/i)) return { icon: 'fa-file-word', color: 'text-blue-600', bg: 'bg-blue-50' };
  if (name.match(/\.(xls|xlsx|csv|ods)$/i)) return { icon: 'fa-file-excel', color: 'text-emerald-600', bg: 'bg-emerald-50' };
  if (name.match(/\.(ppt|pptx)$/i)) return { icon: 'fa-file-powerpoint', color: 'text-orange-500', bg: 'bg-orange-50' };
  return { icon: 'fa-file', color: 'text-slate-500', bg: 'bg-slate-100' };
}

function renderContent() {
  const q = state.search.trim().toLowerCase();
  const folders = [...state.folders.values()]
    .filter(f => (f.parentId || 'root') === state.currentFolderId && !f.trashed)
    .filter(f => !q || f.name.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name));
  const files = [...state.files.values()]
    .filter(f => f.folderId === state.currentFolderId && !f.trashed)
    .filter(f => !q || f.name.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (!folders.length && !files.length) {
    $('#empty-state').classList.remove('hidden');
    $('#grid-view').innerHTML = '';
    return;
  }
  $('#empty-state').classList.add('hidden');

  const tiles = [
    ...folders.map(f => `
      <div class="file-tile relative bg-white border border-slate-200 rounded-lg p-3 cursor-pointer hover:shadow-md hover:border-primary-blue transition"
           data-folder-id="${f.id}">
        <div class="text-center mb-2"><i class="fas fa-folder text-amber-500 text-4xl"></i></div>
        <div class="text-sm font-medium truncate text-center" title="${escapeHtml(f.name)}">${escapeHtml(f.name)}</div>
        <div class="text-[11px] text-slate-500 text-center mt-1">Folder</div>
      </div>
    `),
    ...files.map(f => {
      const ic = fileIconClass(f.type, f.name);
      return `
      <div class="file-tile relative bg-white border border-slate-200 rounded-lg p-3 cursor-pointer hover:shadow-md hover:border-primary-blue transition ${state.selectedId === f.id ? 'ring-2 ring-primary-blue' : ''}"
           data-file-id="${f.id}">
        <div class="text-center mb-2 ${ic.bg} rounded-md py-2"><i class="fas ${ic.icon} ${ic.color} text-3xl"></i></div>
        <div class="text-sm font-medium truncate text-center" title="${escapeHtml(f.name)}">${escapeHtml(f.name)}</div>
        <div class="text-[11px] text-slate-500 text-center mt-1">${fmtSize(f.size)}</div>
      </div>`;
    })
  ];
  $('#grid-view').innerHTML = tiles.join('');
}

/* ---- Tile clicks ---- */
$('#grid-view').addEventListener('click', (e) => {
  const folderTile = e.target.closest('[data-folder-id]');
  if (folderTile) {
    state.currentFolderId = folderTile.dataset.folderId;
    state.selectedId = null;
    renderTree(); renderContent(); renderBreadcrumb(); hideDetails();
    return;
  }
  const fileTile = e.target.closest('[data-file-id]');
  if (fileTile) {
    state.selectedId = fileTile.dataset.fileId;
    renderContent();
    renderDetails(state.selectedId);
  }
});
$('#grid-view').addEventListener('dblclick', (e) => {
  const fileTile = e.target.closest('[data-file-id]');
  if (fileTile) openPreview(fileTile.dataset.fileId);
});

/* ============================================================================
   SEARCH
   ============================================================================ */
$('#search-input').addEventListener('input', (e) => {
  state.search = e.target.value;
  renderContent();
});

/* ============================================================================
   DETAILS PANEL
   ============================================================================ */
function hideDetails() { $('#details-panel').classList.add('hidden'); }

function renderDetails(fileId) {
  const f = state.files.get(fileId);
  if (!f) { hideDetails(); return; }
  const ic = fileIconClass(f.type, f.name);
  const panel = $('#details-panel');
  panel.innerHTML = `
    <div class="p-4 border-b border-slate-200 flex items-start justify-between gap-2">
      <div class="flex items-start gap-3 min-w-0">
        <div class="${ic.bg} rounded-md p-3 flex-shrink-0"><i class="fas ${ic.icon} ${ic.color} text-xl"></i></div>
        <div class="min-w-0">
          <div class="text-sm font-bold break-words">${escapeHtml(f.name)}</div>
          <div class="text-xs text-slate-500 mt-1">${escapeHtml(f.type || 'unknown')}</div>
        </div>
      </div>
      <button onclick="hideDetails()" class="text-slate-400 hover:text-slate-700"><i class="fas fa-times"></i></button>
    </div>
    <div class="p-4 space-y-2">
      <button onclick="openPreview('${f.id}')" class="w-full bg-primary-blue hover:bg-blue-900 text-white py-2 rounded-md text-sm font-bold">
        <i class="fas fa-eye"></i> Preview
      </button>
      <a href="${escapeHtml(f.downloadURL || '#')}" target="_blank" download
         class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2">
        <i class="fas fa-download"></i> Download
      </a>
      <button onclick="requestRename('${f.id}')" class="w-full bg-white border border-slate-300 hover:bg-slate-50 py-2 rounded-md text-sm font-medium">
        <i class="fas fa-pen"></i> Rename
      </button>
      <button onclick="requestMove('${f.id}')" class="w-full bg-white border border-slate-300 hover:bg-slate-50 py-2 rounded-md text-sm font-medium">
        <i class="fas fa-arrows-turn-to-dots"></i> Move
      </button>
      <button onclick="requestDelete('${f.id}')" class="w-full bg-secondary-red hover:bg-red-700 text-white py-2 rounded-md text-sm font-bold">
        <i class="fas fa-trash"></i> Delete
      </button>
    </div>
    <div class="p-4 border-t border-slate-200">
      <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Details</h4>
      <dl class="text-xs space-y-1.5">
        <div class="flex justify-between"><dt class="text-slate-500">Size</dt><dd>${fmtSize(f.size)}</dd></div>
        <div class="flex justify-between"><dt class="text-slate-500">Uploaded by</dt><dd class="truncate ml-2">${escapeHtml(f.uploadedBy || '—')}</dd></div>
        <div class="flex justify-between"><dt class="text-slate-500">Uploaded</dt><dd>${fmtDate(f.uploadedAt)}</dd></div>
        <div class="flex justify-between"><dt class="text-slate-500">Modified</dt><dd>${fmtDate(f.modifiedAt)}</dd></div>
      </dl>
    </div>
  `;
  panel.classList.remove('hidden');
}
window.hideDetails = hideDetails;

/* ============================================================================
   PREVIEW
   ============================================================================ */
function openPreview(fileId) {
  const f = state.files.get(fileId);
  if (!f) return;
  const url = f.downloadURL || '';
  const mime = f.type || '';
  const name = f.name || '';
  let body = '';

  if (!url) {
    body = `<div class="text-center py-12 text-slate-500"><i class="fas fa-triangle-exclamation text-5xl mb-3 text-amber-500"></i><p>No download URL available.</p></div>`;
  } else if (mime.startsWith('image/')) {
    body = `<img src="${escapeHtml(url)}" alt="${escapeHtml(name)}" class="max-w-full max-h-[70vh] mx-auto rounded-lg shadow">`;
  } else if (mime === 'application/pdf') {
    body = `<iframe src="${escapeHtml(url)}" class="w-full h-[75vh] rounded border border-slate-200"></iframe>`;
  } else if (mime.startsWith('text/') || name.match(/\.(txt|md|csv|json|log|xml)$/i)) {
    body = `<pre id="preview-text" class="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-auto max-h-[70vh]">Loading…</pre>`;
    fetch(url).then(r => r.text()).then(t => {
      const el = document.getElementById('preview-text');
      if (el) el.textContent = t.slice(0, 200000);
    }).catch(() => {
      const el = document.getElementById('preview-text');
      if (el) el.textContent = 'Could not load text preview.';
    });
  } else {
    const ic = fileIconClass(mime, name);
    body = `<div class="text-center py-12 text-slate-500">
      <i class="fas ${ic.icon} text-6xl mb-3 ${ic.color}"></i>
      <p class="font-medium">Preview not available for this type</p>
      <a href="${escapeHtml(url)}" target="_blank" download
         class="inline-block mt-4 bg-primary-blue hover:bg-blue-900 text-white px-4 py-2 rounded-md text-sm font-bold">
        <i class="fas fa-download"></i> Download to view
      </a>
    </div>`;
  }

  openModal(`
    <div class="bg-white rounded-xl shadow-2xl w-[92vw] max-w-4xl overflow-hidden animate-slide-up">
      <div class="flex items-center justify-between p-3 border-b border-slate-200">
        <div class="text-sm font-bold truncate">${escapeHtml(name)}</div>
        <button class="text-slate-500 hover:text-slate-800 text-xl" onclick="closeModal()">&times;</button>
      </div>
      <div class="p-4">${body}</div>
    </div>
  `);
  writeAudit('file_previewed', { type: 'file', id: f.id, name: f.name }, {});
}
window.openPreview = openPreview;

/* ============================================================================
   MODAL SYSTEM
   ============================================================================ */
function openModal(html) {
  $('#modal-root').innerHTML = `<div class="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50" onclick="if(event.target===this)closeModal()">${html}</div>`;
}
function closeModal() { $('#modal-root').innerHTML = ''; }
window.closeModal = closeModal;

/* ============================================================================
   NEW FOLDER
   ============================================================================ */
$('#btn-new-folder').addEventListener('click', () => {
  const action = 'create_folder';
  const needs = needsApproval(action);
  if (needs) {
    createApprovalRequest(action, { type: 'folder', name: '—' }, { parentId: state.currentFolderId, name: '' }, () => {});
    return;
  }
  promptNewFolder();
});

function promptNewFolder() {
  openModal(`
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
      <h3 class="text-lg font-bold text-primary-blue mb-4">New Folder</h3>
      <input id="new-folder-name" type="text" placeholder="Folder name"
        class="w-full p-3 border border-slate-300 rounded-lg focus:border-primary-blue outline-none">
      <div class="flex justify-end gap-2 mt-4">
        <button class="px-4 py-2 rounded-md border border-slate-300" onclick="closeModal()">Cancel</button>
        <button class="px-4 py-2 rounded-md bg-primary-blue text-white font-bold" onclick="createFolder()">Create</button>
      </div>
    </div>
  `);
  setTimeout(() => $('#new-folder-name').focus(), 50);
}
window.promptNewFolder = promptNewFolder;

window.createFolder = async () => {
  const name = $('#new-folder-name').value.trim();
  if (!name) { toast('Folder name is required', 'error'); return; }
  try {
    const ref = await db.collection(COL.folders).add({
      name,
      parentId: state.currentFolderId,
      createdBy: state.user.email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      trashed: false,
    });
    await writeAudit('folder_created', { type: 'folder', id: ref.id, name }, { parentId: state.currentFolderId });
    closeModal();
    toast('Folder created', 'success');
  } catch (e) { toast(e.message, 'error'); }
};

/* ============================================================================
   UPLOAD
   ============================================================================ */
$('#file-input').addEventListener('change', (e) => {
  const files = [...e.target.files];
  e.target.value = '';
  if (files.length) handleUpload(files);
});

async function handleUpload(files) {
  const maxMB = state.settings?.maxFileSizeMB || 100;
  for (const f of files) {
    if (f.size > maxMB * 1024 * 1024) {
      toast(`${f.name} exceeds ${maxMB}MB — skipped`, 'error');
      continue;
    }
    await uploadOne(f);
  }
}

async function uploadOne(file) {
  const needs = needsApproval('upload_file');
  if (needs) {
    // Approvals can't carry binary blobs to Firestore, so we let the user
    // know their upload requires approval by email — for now we simply block.
    // (For full approval of uploads you'd store files in a staging bucket.)
    toast('Uploads require approval — ask an admin to enable direct upload.', 'error');
    return;
  }
  const safeName = file.name.replace(/[^\w.\-() ]+/g, '_');
  const storagePath = `ck_shelf/${state.currentFolderId}/${Date.now()}_${crypto.randomUUID().slice(0,8)}_${safeName}`;
  toast(`Uploading ${file.name}…`, 'info');
  try {
    const snap = await storage.ref(storagePath).put(file);
    const downloadURL = await snap.ref.getDownloadURL();
    const ref = await db.collection(COL.files).add({
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
      folderId: state.currentFolderId,
      storagePath,
      downloadURL,
      uploadedBy: state.user.email,
      uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
      modifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
      trashed: false,
    });
    await writeAudit('file_uploaded', { type: 'file', id: ref.id, name: file.name }, { size: file.size, storagePath });
    toast(`${file.name} uploaded`, 'success');
  } catch (e) {
    console.error(e); toast(`Upload failed: ${e.message}`, 'error');
  }
}

/* Drag & drop */
const dropZone = $('#file-area');
['dragenter','dragover'].forEach(ev => dropZone.addEventListener(ev, e => {
  e.preventDefault(); dropZone.classList.add('dragover');
}));
['dragleave','drop'].forEach(ev => dropZone.addEventListener(ev, e => {
  e.preventDefault(); dropZone.classList.remove('dragover');
}));
dropZone.addEventListener('drop', (e) => {
  const files = [...(e.dataTransfer?.files || [])];
  if (files.length) handleUpload(files);
});

/* ============================================================================
   APPROVAL WORKFLOW
   ============================================================================ */
async function createApprovalRequest(actionKey, target, details, onApprovedFn) {
  try {
    const ref = await db.collection(COL.approvals).add({
      action: actionKey,
      target,
      details,
      requestedBy: state.user.email,
      requestedByUid: state.user.uid,
      requestedRole: state.role,
      requestedAt: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'pending',
      device: deviceInfo(),
    });
    await writeAudit('approval_requested', target, { action: actionKey, requestId: ref.id });
    toast('Approval request sent to approvers', 'success');
    // Keep the pending callback in memory; executed when approved in this session
    window.__pendingApprovals = window.__pendingApprovals || {};
    window.__pendingApprovals[ref.id] = onApprovedFn;
  } catch (e) { toast(e.message, 'error'); }
}

/* ============================================================================
   DELETE / RENAME / MOVE — each one checks approval rules
   ============================================================================ */
window.requestDelete = async (fileId) => {
  const f = state.files.get(fileId);
  if (!f) return;
  const needs = needsApproval('delete_file');
  if (needs) {
    await createApprovalRequest('delete_file',
      { type: 'file', id: fileId, name: f.name },
      { storagePath: f.storagePath },
      () => {}
    );
    return;
  }
  if (!confirm(`Delete "${f.name}" permanently?`)) return;
  try {
    if (f.storagePath) { try { await storage.ref(f.storagePath).delete(); } catch (err) { console.warn('Storage delete failed:', err); } }
    await db.collection(COL.files).doc(fileId).delete();
    await writeAudit('file_deleted', { type: 'file', id: fileId, name: f.name }, {});
    hideDetails();
    toast('File deleted', 'success');
  } catch (e) { toast(e.message, 'error'); }
};

window.requestRename = async (fileId) => {
  const f = state.files.get(fileId);
  if (!f) return;
  const needs = needsApproval('rename_file');
  if (needs) {
    promptApprovalRename(fileId, f);
    return;
  }
  promptRename(fileId, f);
};

function promptRename(fileId, f) {
  openModal(`
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
      <h3 class="text-lg font-bold text-primary-blue mb-4">Rename File</h3>
      <input id="rename-input" type="text" value="${escapeHtml(f.name)}"
        class="w-full p-3 border border-slate-300 rounded-lg focus:border-primary-blue outline-none">
      <div class="flex justify-end gap-2 mt-4">
        <button class="px-4 py-2 rounded-md border border-slate-300" onclick="closeModal()">Cancel</button>
        <button class="px-4 py-2 rounded-md bg-primary-blue text-white font-bold" onclick="doRename('${fileId}')">Save</button>
      </div>
    </div>
  `);
}
window.promptRename = promptRename;

function promptApprovalRename(fileId, f) {
  openModal(`
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
      <h3 class="text-lg font-bold text-primary-blue mb-1">Request Approval to Rename</h3>
      <p class="text-sm text-slate-500 mb-4">Your request will be sent to approvers.</p>
      <input id="rename-input" type="text" value="${escapeHtml(f.name)}"
        class="w-full p-3 border border-slate-300 rounded-lg focus:border-primary-blue outline-none">
      <div class="flex justify-end gap-2 mt-4">
        <button class="px-4 py-2 rounded-md border border-slate-300" onclick="closeModal()">Cancel</button>
        <button class="px-4 py-2 rounded-md bg-secondary-red text-white font-bold" onclick="doApprovalRename('${fileId}')">Request</button>
      </div>
    </div>
  `);
}
window.promptApprovalRename = promptApprovalRename;

window.doRename = async (fileId) => {
  const name = $('#rename-input').value.trim();
  if (!name) return;
  try {
    await db.collection(COL.files).doc(fileId).update({ name, modifiedAt: firebase.firestore.FieldValue.serverTimestamp() });
    await writeAudit('file_renamed', { type: 'file', id: fileId, name }, {});
    closeModal();
    renderDetails(fileId);
    toast('Renamed', 'success');
  } catch (e) { toast(e.message, 'error'); }
};

window.doApprovalRename = async (fileId) => {
  const newName = $('#rename-input').value.trim();
  const f = state.files.get(fileId);
  if (!newName || !f) return;
  await createApprovalRequest('rename_file',
    { type: 'file', id: fileId, name: f.name },
    { newName },
    () => {}
  );
  closeModal();
};

window.requestMove = async (fileId) => {
  const f = state.files.get(fileId);
  if (!f) return;
  const needs = needsApproval('move_file');
  if (needs) {
    toast('Move requires approval. Please contact an admin to enable direct moves.', 'error');
    return;
  }
  promptMove(fileId, f);
};

function promptMove(fileId, f) {
  const folders = [...state.folders.values()].sort((a, b) => a.name.localeCompare(b.name));
  openModal(`
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
      <h3 class="text-lg font-bold text-primary-blue mb-4">Move File</h3>
      <select id="move-select" class="w-full p-3 border border-slate-300 rounded-lg">
        <option value="root">All Files (root)</option>
        ${folders.map(fo => `<option value="${fo.id}">${escapeHtml(fo.name)}</option>`).join('')}
      </select>
      <div class="flex justify-end gap-2 mt-4">
        <button class="px-4 py-2 rounded-md border border-slate-300" onclick="closeModal()">Cancel</button>
        <button class="px-4 py-2 rounded-md bg-primary-blue text-white font-bold" onclick="doMove('${fileId}')">Move</button>
      </div>
    </div>
  `);
}
window.promptMove = promptMove;

window.doMove = async (fileId) => {
  const newFolderId = $('#move-select').value;
  try {
    await db.collection(COL.files).doc(fileId).update({ folderId: newFolderId, modifiedAt: firebase.firestore.FieldValue.serverTimestamp() });
    await writeAudit('file_moved', { type: 'file', id: fileId }, { newFolderId });
    closeModal(); hideDetails();
    toast('Moved', 'success');
  } catch (e) { toast(e.message, 'error'); }
};

/* ============================================================================
   APPROVALS MODAL
   ============================================================================ */
$('#btn-approvals').addEventListener('click', openApprovalsModal);

async function openApprovalsModal() {
  const snap = await db.collection(COL.approvals).orderBy('requestedAt', 'desc').limit(50).get();
  const rows = snap.docs.map(d => {
    const r = { id: d.id, ...d.data() };
    const pending = r.status === 'pending';
    const canAct = pending && isApprover();
    return `
      <div class="border border-slate-200 rounded-lg p-3 mb-2">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1">
            <div class="text-sm font-bold text-primary-blue">${escapeHtml(r.action.replace(/_/g,' '))}</div>
            <div class="text-xs text-slate-600 mt-1">
              Target: <strong>${escapeHtml(r.target?.name || r.target?.id || '')}</strong>
            </div>
            <div class="text-xs text-slate-500">By ${escapeHtml(r.requestedBy)} · ${fmtDate(r.requestedAt)}</div>
            ${r.details?.newName ? `<div class="text-xs text-slate-600 mt-1">New name: ${escapeHtml(r.details.newName)}</div>` : ''}
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
            r.status === 'pending' ? 'bg-amber-100 text-amber-800' :
            r.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
          }">${escapeHtml(r.status)}</span>
        </div>
        ${canAct ? `
          <div class="flex gap-2 mt-3">
            <button class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded text-xs font-bold" onclick="approveRequest('${r.id}')">Approve</button>
            <button class="flex-1 bg-secondary-red hover:bg-red-700 text-white py-1.5 rounded text-xs font-bold" onclick="rejectRequest('${r.id}')">Reject</button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('') || `<p class="text-sm text-slate-500 text-center py-6">No approval requests yet.</p>`;

  openModal(`
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-slide-up">
      <div class="flex items-center justify-between p-4 border-b border-slate-200">
        <h3 class="text-lg font-bold text-primary-blue"><i class="fas fa-check-double"></i> Approval Requests</h3>
        <button class="text-slate-500 hover:text-slate-800 text-xl" onclick="closeModal()">&times;</button>
      </div>
      <div class="p-4 overflow-y-auto">${rows}</div>
    </div>
  `);
}
window.openApprovalsModal = openApprovalsModal;

window.approveRequest = async (requestId) => {
  if (!isApprover()) { toast('Not authorised to approve', 'error'); return; }
  try {
    const ref = db.collection(COL.approvals).doc(requestId);
    const snap = await ref.get();
    if (!snap.exists) { toast('Request not found', 'error'); return; }
    const req = snap.data();
    if (req.status !== 'pending') { toast('Already handled', 'error'); return; }

    // Execute the underlying action
    await executeApprovedAction(req);

    await ref.update({
      status: 'approved',
      reviewedBy: state.user.email,
      reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
      executedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    await writeAudit('approval_approved', { type: 'approval', id: requestId, name: req.action }, { request: req });
    toast('Request approved & action executed', 'success');
    closeModal();
  } catch (e) { toast(e.message, 'error'); }
};

window.rejectRequest = async (requestId) => {
  if (!isApprover()) { toast('Not authorised', 'error'); return; }
  const note = prompt('Reason for rejection (optional):') || '';
  try {
    await db.collection(COL.approvals).doc(requestId).update({
      status: 'rejected',
      reviewedBy: state.user.email,
      reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
      reviewNote: note,
    });
    await writeAudit('approval_rejected', { type: 'approval', id: requestId }, { note });
    toast('Request rejected', 'success');
    closeModal();
  } catch (e) { toast(e.message, 'error'); }
};

async function executeApprovedAction(req) {
  const action = req.action;
  const t = req.target || {};
  const d = req.details || {};

  switch (action) {
    case 'delete_file': {
      if (d.storagePath) { try { await storage.ref(d.storagePath).delete(); } catch (e) { console.warn(e); } }
      await db.collection(COL.files).doc(t.id).delete();
      break;
    }
    case 'delete_folder': {
      await db.collection(COL.folders).doc(t.id).delete();
      break;
    }
    case 'rename_file': {
      await db.collection(COL.files).doc(t.id).update({
        name: d.newName,
        modifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      break;
    }
    case 'rename_folder': {
      await db.collection(COL.folders).doc(t.id).update({ name: d.newName });
      break;
    }
    case 'move_file': {
      await db.collection(COL.files).doc(t.id).update({
        folderId: d.newFolderId,
        modifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      break;
    }
    case 'create_folder': {
      await db.collection(COL.folders).add({
        name: d.name,
        parentId: d.parentId || 'root',
        createdBy: req.requestedBy,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        trashed: false,
      });
      break;
    }
    default:
      console.warn('Unknown approval action', action);
  }
}

/* ============================================================================
   AUDIT LOG MODAL
   ============================================================================ */
$('#btn-audit').addEventListener('click', openAuditModal);

async function openAuditModal() {
  if (!isApprover()) { toast('Only approvers and admins can view audit logs', 'error'); return; }
  const snap = await db.collection(COL.audit).orderBy('timestamp', 'desc').limit(200).get();
  const rows = snap.docs.map(d => {
    const r = d.data();
    return `
      <tr class="audit-row text-xs border-b border-slate-100">
        <td class="px-2 py-1.5 whitespace-nowrap">${fmtDate(r.timestamp)}</td>
        <td class="px-2 py-1.5 whitespace-nowrap font-medium">${escapeHtml(r.actor || '')}</td>
        <td class="px-2 py-1.5 whitespace-nowrap"><span class="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold">${escapeHtml(r.action || '')}</span></td>
        <td class="px-2 py-1.5">${escapeHtml(r.targetName || r.targetId || '')}</td>
        <td class="px-2 py-1.5 text-[10px] text-slate-500 max-w-[200px] truncate" title="${escapeHtml(r.device?.userAgent || '')}">
          ${escapeHtml((r.device?.platform || '') + ' · ' + (r.device?.screen || ''))}
        </td>
      </tr>
    `;
  }).join('') || `<tr><td colspan="5" class="text-center py-8 text-slate-500">No audit entries.</td></tr>`;

  openModal(`
    <div class="bg-white rounded-xl shadow-2xl w-[95vw] max-w-6xl max-h-[85vh] flex flex-col animate-slide-up">
      <div class="flex items-center justify-between p-4 border-b border-slate-200">
        <h3 class="text-lg font-bold text-primary-blue"><i class="fas fa-shield-halved"></i> Audit Log</h3>
        <button class="text-slate-500 hover:text-slate-800 text-xl" onclick="closeModal()">&times;</button>
      </div>
      <div class="flex-1 overflow-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50 sticky top-0">
            <tr class="text-[10px] uppercase text-slate-500 font-bold">
              <th class="px-2 py-2">When</th>
              <th class="px-2 py-2">Actor</th>
              <th class="px-2 py-2">Action</th>
              <th class="px-2 py-2">Target</th>
              <th class="px-2 py-2">Device</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `);
}
window.openAuditModal = openAuditModal;

/* ============================================================================
   SETTINGS MODAL
   ============================================================================ */
$('#btn-settings').addEventListener('click', openSettingsModal);

async function openSettingsModal() {
  if (!isAdmin()) { toast('Only admins can access settings', 'error'); return; }
  const usersSnap = await db.collection(COL.users).get();
  const userRows = usersSnap.docs.map(d => {
    const u = d.data();
    return `
      <tr class="text-xs border-b border-slate-100">
        <td class="px-2 py-1.5">${escapeHtml(u.email)}</td>
        <td class="px-2 py-1.5">
          <select onchange="updateUserRole('${escapeHtml(d.id)}', this.value)" class="border border-slate-300 rounded px-1 py-0.5 text-xs">
            ${['member','approver','admin'].map(r => `<option value="${r}" ${u.role === r ? 'selected' : ''}>${r}</option>`).join('')}
          </select>
        </td>
        <td class="px-2 py-1.5">
          <button onclick="removeUser('${escapeHtml(d.id)}')" class="text-secondary-red hover:underline text-xs">Remove</button>
        </td>
      </tr>
    `;
  }).join('') || `<tr><td colspan="3" class="text-center py-3 text-slate-500">No users yet.</td></tr>`;

  const approvalRules = state.settings?.requireApprovalFor || {};
  const ruleRows = Object.entries(approvalRules).map(([k, v]) => `
    <label class="flex items-center justify-between text-xs py-1 border-b border-slate-100">
      <span>${escapeHtml(k.replace(/_/g,' '))}</span>
      <input type="checkbox" ${v ? 'checked' : ''} onchange="toggleApprovalRule('${k}', this.checked)" class="accent-primary-blue">
    </label>
  `).join('');

  openModal(`
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col animate-slide-up">
      <div class="flex items-center justify-between p-4 border-b border-slate-200">
        <h3 class="text-lg font-bold text-primary-blue"><i class="fas fa-cog"></i> Settings</h3>
        <button class="text-slate-500 hover:text-slate-800 text-xl" onclick="closeModal()">&times;</button>
      </div>
      <div class="flex-1 overflow-y-auto p-4 space-y-6">
        <section>
          <h4 class="text-xs font-bold uppercase text-slate-500 mb-2">Change PIN</h4>
          <div class="flex flex-wrap gap-2">
            <input id="new-pin" type="password" inputmode="numeric" maxlength="8" placeholder="New PIN (4–8 digits)" class="flex-1 min-w-[150px] p-2 border border-slate-300 rounded text-sm">
            <button onclick="changePin()" class="bg-primary-blue text-white px-4 py-2 rounded text-sm font-bold">Update PIN</button>
          </div>
        </section>
        <section>
          <h4 class="text-xs font-bold uppercase text-slate-500 mb-2">Approval Rules</h4>
          <div>${ruleRows}</div>
        </section>
        <section>
          <h4 class="text-xs font-bold uppercase text-slate-500 mb-2">Add User</h4>
          <div class="flex flex-wrap gap-2">
            <input id="new-user-email" type="email" placeholder="user@example.com" class="flex-1 min-w-[180px] p-2 border border-slate-300 rounded text-sm">
            <select id="new-user-role" class="p-2 border border-slate-300 rounded text-sm">
              <option value="member">member</option>
              <option value="approver">approver</option>
              <option value="admin">admin</option>
            </select>
            <button onclick="addUser()" class="bg-emerald-600 text-white px-4 py-2 rounded text-sm font-bold">Add</button>
          </div>
        </section>
        <section>
          <h4 class="text-xs font-bold uppercase text-slate-500 mb-2">Users</h4>
          <table class="w-full text-left">
            <thead><tr class="text-[10px] uppercase text-slate-500">
              <th class="px-2 py-1">Email</th><th class="px-2 py-1">Role</th><th class="px-2 py-1"></th>
            </tr></thead>
            <tbody>${userRows}</tbody>
          </table>
        </section>
        <section>
          <h4 class="text-xs font-bold uppercase text-slate-500 mb-2">File Size Limit</h4>
          <div class="flex items-center gap-2">
            <input id="max-size" type="number" min="1" value="${state.settings?.maxFileSizeMB || 100}" class="w-24 p-2 border border-slate-300 rounded text-sm">
            <span class="text-sm">MB</span>
            <button onclick="updateMaxSize()" class="bg-primary-blue text-white px-3 py-1.5 rounded text-xs font-bold">Save</button>
          </div>
        </section>
      </div>
    </div>
  `);
}
window.openSettingsModal = openSettingsModal;

window.changePin = async () => {
  const pin = $('#new-pin').value;
  if (!/^\d{4,8}$/.test(pin)) { toast('PIN must be 4–8 digits', 'error'); return; }
  const salt = newSalt();
  const pinHash = await hashPin(pin, salt);
  await db.collection(COL.settings).doc(SETTINGS_DOC).update({
    pinHash, pinSalt: salt,
    pinSetAt: firebase.firestore.FieldValue.serverTimestamp(),
    pinSetBy: state.user.email,
  });
  await writeAudit('pin_changed', {}, {});
  toast('PIN updated', 'success');
};

window.toggleApprovalRule = async (key, value) => {
  const ref = db.collection(COL.settings).doc(SETTINGS_DOC);
  await ref.update({ [`requireApprovalFor.${key}`]: value });
  await writeAudit('approval_rule_changed', {}, { key, value });
  state.settings.requireApprovalFor[key] = value;
  toast(`Rule "${key}" → ${value ? 'on' : 'off'}`, 'success');
};

window.addUser = async () => {
  const email = $('#new-user-email').value.trim().toLowerCase();
  const role = $('#new-user-role').value;
  if (!email) { toast('Email required', 'error'); return; }
  await db.collection(COL.users).doc(email).set({
    email, role, active: true,
    addedAt: firebase.firestore.FieldValue.serverTimestamp(),
    addedBy: state.user.email,
  });
  await writeAudit('user_added', { type: 'user', id: email, name: email }, { role });
  toast('User added', 'success');
  openSettingsModal();
};

window.updateUserRole = async (email, role) => {
  await db.collection(COL.users).doc(email).update({ role });
  await writeAudit('user_role_changed', { type: 'user', id: email, name: email }, { role });
  toast('Role updated', 'success');
};

window.removeUser = async (email) => {
  if (!confirm(`Remove ${email}?`)) return;
  await db.collection(COL.users).doc(email).delete();
  await writeAudit('user_removed', { type: 'user', id: email, name: email }, {});
  toast('User removed', 'success');
  openSettingsModal();
};

window.updateMaxSize = async () => {
  const mb = parseInt($('#max-size').value, 10);
  if (!mb || mb < 1) { toast('Invalid value', 'error'); return; }
  await db.collection(COL.settings).doc(SETTINGS_DOC).update({ maxFileSizeMB: mb });
  state.settings.maxFileSizeMB = mb;
  await writeAudit('max_size_changed', {}, { mb });
  toast('File size limit updated', 'success');
};

/* ============================================================================
   LOGOUT + BOOT
   ============================================================================ */
$('#btn-logout').addEventListener('click', async () => {
  await writeAudit('logout', {}, {});
  sessionStorage.removeItem('ckShelfPinVerified');
  state.pinVerified = false;
  auth.signOut();
});

function bootApp() {
  $('#user-email').textContent = state.user.email;
  $('#user-role').textContent = state.role;
  hide('login-screen'); hide('pin-screen'); hide('setup-screen'); hide('denied-screen');
  $('#app-shell').classList.remove('hidden');
  attachListeners();
  writeAudit('app_opened', {}, {});
}

/* ============================================================================
   GLOBAL EXPORTS
   ============================================================================ */
window.createFolder = window.createFolder;
window.closeModal = window.closeModal;
window.hideDetails = window.hideDetails;
window.openPreview = window.openPreview;
window.requestDelete = window.requestDelete;
window.requestRename = window.requestRename;
window.requestMove = window.requestMove;
window.doRename = window.doRename;
window.doApprovalRename = window.doApprovalRename;
window.doMove = window.doMove;
window.approveRequest = window.approveRequest;
window.rejectRequest = window.rejectRequest;
window.openApprovalsModal = window.openApprovalsModal;
window.openAuditModal = window.openAuditModal;
window.openSettingsModal = window.openSettingsModal;
window.changePin = window.changePin;
window.toggleApprovalRule = window.toggleApprovalRule;
window.addUser = window.addUser;
window.updateUserRole = window.updateUserRole;
window.removeUser = window.removeUser;
window.updateMaxSize = window.updateMaxSize;

console.log('[CK Shelf] loaded — shares Firebase project with CDMS');
