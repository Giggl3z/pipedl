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
  retryFailedBtn: el('retryFailedBtn'),
  openOptions: el('openOptions'),
  openFolderBtn: el('openFolderBtn'),
  tasks: el('tasks'),
  console: el('console'),
  status: el('status'),
  hint: el('hint'),
  swatches: Array.from(document.querySelectorAll('.swatch')),
  serverChip: el('serverChip'),
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

function setServerChip(state, text) {
  ui.serverChip.classList.remove('online', 'offline', 'checking');
  ui.serverChip.classList.add(state);
  ui.serverChip.textContent = text;
}

function setBackendControlsEnabled(enabled) {
  ui.downloadBtn.disabled = !enabled;
  ui.refreshBtn.disabled = !enabled;
  ui.openFolderBtn.disabled = !enabled;
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

async function cancelTask(taskId) {
  await api(`/api/cancel/${taskId}`, { method: 'POST' });
  if (state.currentTaskId === taskId) {
    setStatus('canceled');
    ui.downloadBtn.disabled = false;
    ui.downloadBtn.textContent = 'Start Download';
  }
  setHint(`Canceled ${taskId.slice(0, 8)}.`);
  refreshTasks();
  refreshBadgeSoon();
}

async function retryFailed() {
  const online = await checkServerStatus();
  if (!online) return;

  try {
    const data = await api('/api/retry-failed', { method: 'POST' });
    setHint(data.created ? `Retried ${data.created} failed tasks.` : 'No failed tasks to retry.');
    refreshTasks();
    refreshBadgeSoon();
  } catch (err) {
    setHint(`Retry failed: ${err.message}`);
  }
}

function gatherOptions() {
  return {
    writeSubs: ui.writeSubs.checked,
    embedMetadata: ui.embedMeta.checked,
    embedThumbnail: ui.embedThumb.checked,
    autoOpenFolder: ui.autoOpen.checked,
  };
}

async function getYouTubeCookiesText() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'PIPEDL_GET_YT_COOKIES' }, (res) => {
      if (!res || !res.ok) {
        resolve('');
        return;
      }
      resolve(res.cookiesText || '');
    });
  });
}

async function api(path, options = {}) {
  const url = `${state.backend}${path}`;
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `${res.status} ${res.statusText}`);
  return data;
}

async function checkServerStatus() {
  try {
    await api('/api/settings');
    setServerChip('online', 'server: online');
    setBackendControlsEnabled(true);
    return true;
  } catch {
    setServerChip('offline', 'server: offline');
    setBackendControlsEnabled(false);
    setHint('pipedl-server is offline. Start the server app first.');
    return false;
  }
}

async function refreshTasks() {
  const online = await checkServerStatus();
  if (!online) {
    ui.tasks.innerHTML = '<div class="task">Server offline</div>';
    return;
  }

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
      const p = task.progress?.percent;
      const pct = typeof p === 'number' ? ` · ${p.toFixed(1)}%` : '';
      const speed = task.progress?.speed ? ` · ${task.progress.speed}` : '';

      const canCancel = task.status === 'queued' || task.status === 'running';
      const canRetry = task.status === 'error' || task.status === 'canceled';

      row.innerHTML = `
        <div class="task-top">
          <div title="${task.url}">${task.url}</div>
          <div class="task-actions">
            ${canCancel ? `<button class="task-btn cancel" data-action="cancel">cancel</button>` : ''}
            ${canRetry ? `<button class="task-btn retry" data-action="retry">retry</button>` : ''}
          </div>
        </div>
        <div class="meta">${task.format} · ${task.status}${pct}${speed}</div>
      `;

      row.addEventListener('click', () => {
        state.currentTaskId = task.task_id;
        pollStatus();
      });

      const cancelBtn = row.querySelector('[data-action="cancel"]');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          await cancelTask(task.task_id);
        });
      }

      const retryBtn = row.querySelector('[data-action="retry"]');
      if (retryBtn) {
        retryBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          try {
            const data = await api('/api/download', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                url: task.url,
                format: task.format,
                options: gatherOptions(),
              }),
            });
            setHint(`Retried as ${data.task_id.slice(0, 8)}.`);
            refreshTasks();
            refreshBadgeSoon();
          } catch (err) {
            setHint(`Retry failed: ${err.message}`);
          }
        });
      }

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
      const p = data.progress?.percent;
      const pct = typeof p === 'number' ? ` (${p.toFixed(1)}%)` : '';
      const speed = data.progress?.speed ? ` · ${data.progress.speed}` : '';
      const eta = data.progress?.eta ? ` · ETA ${data.progress.eta}` : '';
      setHint(`Task ${state.currentTaskId.slice(0, 8)} running${pct}${speed}${eta}`);
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
  const online = await checkServerStatus();
  if (!online) return;

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
    const options = gatherOptions();
    const isYouTube = /youtube\.com|youtu\.be/i.test(url);
    if (isYouTube) {
      const cookiesText = await getYouTubeCookiesText();
      if (cookiesText) {
        options.cookiesText = cookiesText;
      }
    }

    const data = await api('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        format: ui.format.value,
        options,
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
  const online = await checkServerStatus();
  if (!online) return;

  try {
    await api('/api/open-downloads', { method: 'POST' });
  } catch (err) {
    setHint(`Open folder failed: ${err.message}`);
  }
}

ui.downloadBtn.addEventListener('click', startDownload);
ui.refreshBtn.addEventListener('click', refreshTasks);
ui.retryFailedBtn.addEventListener('click', retryFailed);
ui.openOptions.addEventListener('click', () => chrome.runtime.openOptionsPage());
ui.swatches.forEach((s) => s.addEventListener('click', () => applyTheme(s.dataset.theme)));
ui.openFolderBtn.addEventListener('click', openDownloads);

(async function init() {
  await loadSettings();
  setServerChip('checking', 'server: checking');
  await checkServerStatus();
  await autofillFromActiveTab();
  await refreshTasks();
  refreshBadgeSoon();

  setInterval(() => {
    checkServerStatus();
  }, 4000);
})();
