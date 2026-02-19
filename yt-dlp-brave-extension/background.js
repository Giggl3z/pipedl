const taskStatusCache = new Map();
let taskStatusCacheReady = false;

async function getBackendUrl() {
  const data = await chrome.storage.local.get(['pipedl_backend']);
  return data.pipedl_backend || 'http://localhost:5000';
}

function maybeNotifyCompletions(tasks) {
  if (!Array.isArray(tasks)) return;

  if (!taskStatusCacheReady) {
    tasks.forEach((t) => {
      if (t?.task_id && t?.status) taskStatusCache.set(t.task_id, t.status);
    });
    taskStatusCacheReady = true;
    return;
  }

  tasks.forEach((t) => {
    if (!t?.task_id || !t?.status) return;
    const prev = taskStatusCache.get(t.task_id);
    const now = t.status;

    if ((prev === 'queued' || prev === 'running') && (now === 'done' || now === 'error' || now === 'canceled')) {
      const title = now === 'done' ? 'PipeDL: Download complete' : `PipeDL: Task ${now}`;
      const message = `${(t.url || 'task').slice(0, 90)}${(t.url || '').length > 90 ? '…' : ''}`;
      chrome.notifications.create(`pipedl-${t.task_id}-${Date.now()}`, {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icon128.png'),
        title,
        message,
        priority: 1,
      });
    }

    taskStatusCache.set(t.task_id, now);
  });
}

async function updateBadge() {
  try {
    const backend = await getBackendUrl();
    const res = await fetch(`${backend}/api/tasks`);
    const tasks = await res.json().catch(() => []);

    if (!res.ok || !Array.isArray(tasks)) {
      chrome.action.setBadgeText({ text: '' });
      return;
    }

    maybeNotifyCompletions(tasks);

    const active = tasks.filter((t) => t && (t.status === 'queued' || t.status === 'running')).length;

    if (active > 0) {
      chrome.action.setBadgeText({ text: active > 99 ? '99+' : String(active) });
      chrome.action.setBadgeBackgroundColor({ color: '#2563eb' });
      chrome.action.setBadgeTextColor?.({ color: '#ffffff' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  } catch {
    chrome.action.setBadgeText({ text: '' });
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('pipedlBadge', { periodInMinutes: 1 });
  updateBadge();
});

chrome.runtime.onStartup?.addListener(() => {
  chrome.alarms.create('pipedlBadge', { periodInMinutes: 1 });
  updateBadge();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'pipedlBadge') updateBadge();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.pipedl_backend) updateBadge();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message) return;

  if (message.type === 'PIPEDL_OPEN_POPUP') {
    chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
    sendResponse({ ok: true });
    return;
  }

  if (message.type === 'PIPEDL_BADGE_REFRESH') {
    updateBadge().finally(() => sendResponse({ ok: true }));
    return true;
  }

  if (message.type !== 'PIPEDL_FETCH') return;

  (async () => {
    try {
      const res = await fetch(message.url, message.options || {});
      const text = await res.text();
      let json = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        json = { raw: text };
      }

      sendResponse({
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
        data: json,
      });
    } catch (err) {
      sendResponse({
        ok: false,
        status: 0,
        statusText: 'FETCH_ERROR',
        data: { error: err?.message || 'Fetch failed' },
      });
    }
  })();

  return true;
});
