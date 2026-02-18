const el = (id) => document.getElementById(id);

const state = {
  backend: 'http://localhost:5000',
  selectedFormat: 'best_video',
  currentTaskId: null,
  pollTimer: null,
};

const ui = {
  url: el('url'),
  format: el('format'),
  writeSubs: el('writeSubs'),
  embedMeta: el('embedMeta'),
  embedThumb: el('embedThumb'),
  autoOpen: el('autoOpen'),
  downloadBtn: el('downloadBtn'),
  refreshBtn: el('refreshBtn'),
  openOptions: el('openOptions'),
  openFolderBtn: el('openFolderBtn'),
  tasks: el('tasks'),
  console: el('console'),
  status: el('status'),
  hint: el('hint'),
  swatches: Array.from(document.querySelectorAll('.swatch')),
};

function setStatus(text) {
  ui.status.textContent = text;
}

function setHint(text) {
  ui.hint.textContent = text;
}

function setConsole(text) {
  ui.console.textContent = text;
  ui.console.scrollTop = ui.console.scrollHeight;
}

function applyTheme(theme, save = true) {
  document.body.setAttribute('data-theme', theme);
  ui.swatches.forEach((s) => s.classList.toggle('active', s.dataset.theme === theme));
  if (save) chrome.storage.local.set({ pipedl_theme: theme });
}

async function loadSettings() {
  const stored = await chrome.storage.local.get(['pipedl_backend', 'pipedl_theme']);
  state.backend = stored.pipedl_backend || 'http://localhost:5000';
  applyTheme(stored.pipedl_theme || 'ocean', false);
}

async function autofillFromActiveTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const tabUrl = tab?.url || '';
    if (!tabUrl) return;

    const isYouTube = tabUrl.includes('youtube.com/watch') || tabUrl.includes('youtube.com/shorts/');
    if (!isYouTube) return;

    if (!ui.url.value.trim()) {
      ui.url.value = tabUrl;
      setHint('Autofilled from current YouTube tab.');
    }
  } catch {
    // ignore autofill failures
  }
}

function refreshBadgeSoon() {
  chrome.runtime.sendMessage({ type: 'PIPEDL_BADGE_REFRESH' }, () => {
    // best effort
  });
}

function gatherOptions() {
  return {
    writeSubs: ui.writeSubs.checked,
    embedMetadata: ui.embedMeta.checked,
    embedThumbnail: ui.embedThumb.checked,
    autoOpenFolder: ui.autoOpen.checked,
  };
}

async function api(path, options = {}) {
  const url = `${state.backend}${path}`;
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `${res.status} ${res.statusText}`);
  return data;
}

async function refreshTasks() {
  try {
    const items = await api('/api/tasks');
    ui.tasks.innerHTML = '';

    if (!items.length) {
      ui.tasks.innerHTML = '<div class="task">No tasks yet</div>';
      return;
    }

    items.slice(0, 20).forEach((task) => {
      const row = document.createElement('div');
      row.className = 'task';
      row.innerHTML = `
        <div title="${task.url}">${task.url}</div>
        <div class="meta">${task.format} · ${task.status}</div>
      `;
      row.addEventListener('click', () => {
        state.currentTaskId = task.task_id;
        pollStatus();
      });
      ui.tasks.appendChild(row);
    });
  } catch (err) {
    setHint(`Tasks error: ${err.message}`);
  }
}

async function pollStatus() {
  if (!state.currentTaskId) return;

  try {
    const data = await api(`/api/status/${state.currentTaskId}`);
    setStatus(data.status || 'idle');
    if (Array.isArray(data.log)) setConsole(data.log.join('\n'));

    if (data.status === 'queued') {
      const qp = data.queue_position ? ` (#${data.queue_position})` : '';
      setHint(`Task ${state.currentTaskId.slice(0, 8)} queued${qp}...`);
      return;
    }

    if (data.status === 'running') {
      setHint(`Task ${state.currentTaskId.slice(0, 8)} running...`);
      return;
    }

    if (data.status === 'done' || data.status === 'error' || data.status === 'canceled') {
      ui.downloadBtn.disabled = false;
      ui.downloadBtn.textContent = 'Start Download';
      setHint(`Task ${state.currentTaskId.slice(0, 8)} ${data.status}.`);
      clearInterval(state.pollTimer);
      state.pollTimer = null;
      refreshTasks();
      refreshBadgeSoon();
    }
  } catch (err) {
    setHint(`Status error: ${err.message}`);
    ui.downloadBtn.disabled = false;
    ui.downloadBtn.textContent = 'Start Download';
    clearInterval(state.pollTimer);
    state.pollTimer = null;
  }
}

async function startDownload() {
  const url = ui.url.value.trim();
  if (!url) {
    setHint('Paste a URL first.');
    return;
  }

  ui.downloadBtn.disabled = true;
  ui.downloadBtn.textContent = 'Starting...';
  setStatus('running');
  setConsole('Starting yt-dlp task...');

  try {
    const data = await api('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        format: ui.format.value,
        options: gatherOptions(),
      }),
    });

    state.currentTaskId = data.task_id;
    setHint(`Task ${state.currentTaskId.slice(0, 8)} queued.`);
    ui.downloadBtn.textContent = 'Downloading...';
    refreshBadgeSoon();

    if (state.pollTimer) clearInterval(state.pollTimer);
    state.pollTimer = setInterval(pollStatus, 1000);
    pollStatus();
    refreshTasks();
  } catch (err) {
    setStatus('error');
    setHint(`Start failed: ${err.message}`);
    ui.downloadBtn.disabled = false;
    ui.downloadBtn.textContent = 'Start Download';
  }
}

async function openDownloads() {
  try {
    await api('/api/open-downloads', { method: 'POST' });
  } catch (err) {
    setHint(`Open folder failed: ${err.message}`);
  }
}

ui.downloadBtn.addEventListener('click', startDownload);
ui.refreshBtn.addEventListener('click', refreshTasks);
ui.openOptions.addEventListener('click', () => chrome.runtime.openOptionsPage());
ui.swatches.forEach((s) => s.addEventListener('click', () => applyTheme(s.dataset.theme)));
ui.openFolderBtn.addEventListener('click', openDownloads);

(async function init() {
  await loadSettings();
  await autofillFromActiveTab();
  await refreshTasks();
  refreshBadgeSoon();
})();
