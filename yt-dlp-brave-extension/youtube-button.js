(() => {
  const BUTTON_ID = 'aerodl-yt-action-btn';
  const MENU_ID = 'aerodl-yt-menu';
  const STYLE_ID = 'aerodl-yt-style';

  let selectedFormat = 'best_video';
  let highlightedIndex = 0;

  const formats = [
    { v: 'best_video', label: 'Best mixed', meta: 'video+audio', icon: '⬇' },
    { v: 'mp4', label: 'MP4 priority', meta: 'h264', icon: '🎬' },
    { v: 'webm', label: 'WebM priority', meta: 'vp9', icon: '📹' },
    { v: 'audio_best', label: 'Audio MP3', meta: 'extract', icon: '🎵' },
    { v: 'audio_opus', label: 'Audio Opus', meta: 'extract', icon: '🎧' },
    { v: 'audio_wav', label: 'Audio WAV', meta: 'lossless', icon: '🔊' },
  ];

  function getWatchUrl() {
    try {
      const u = new URL(location.href);
      if (u.pathname.startsWith('/shorts/')) {
        const id = u.pathname.split('/')[2];
        return id ? `https://www.youtube.com/watch?v=${id}` : location.href;
      }
      return location.href;
    } catch {
      return location.href;
    }
  }

  async function getBackend() {
    const data = await chrome.storage.local.get(['pipedl_backend']);
    return data.pipedl_backend || 'http://localhost:5000';
  }

  function extFetch(url, options) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'PIPEDL_FETCH', url, options }, (response) => {
        if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message || 'Extension fetch failed'));
        if (!response) return reject(new Error('No response from extension background'));
        resolve(response);
      });
    });
  }

  function showToast(text, isError = false) {
    const id = 'aerodl-toast';
    let toast = document.getElementById(id);
    if (!toast) {
      toast = document.createElement('div');
      toast.id = id;
      Object.assign(toast.style, {
        position: 'fixed',
        right: '16px',
        bottom: '16px',
        zIndex: '2147483647',
        background: isError ? '#7f1d1d' : '#0f172a',
        color: '#e2e8f0',
        border: '1px solid #334155',
        borderRadius: '10px',
        padding: '10px 12px',
        fontSize: '12px',
        fontFamily: 'Roboto, Arial, sans-serif',
        boxShadow: '0 10px 28px rgba(2,6,23,.45)',
      });
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.style.background = isError ? '#7f1d1d' : '#0f172a';
    clearTimeout(toast.__timer);
    toast.__timer = setTimeout(() => toast.remove(), 2600);
  }

  async function startDownload(format = 'best_video') {
    const backend = await getBackend();
    const url = getWatchUrl();
    const res = await extFetch(`${backend}/api/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, format, options: { autoOpenFolder: true } }),
    });
    if (!res.ok) throw new Error(res?.data?.error || `${res.status} ${res.statusText}`);
    return res.data.task_id;
  }

  function getVideoContext() {
    const titleEl = document.querySelector('ytd-watch-metadata h1 yt-formatted-string')
      || document.querySelector('h1.ytd-watch-metadata yt-formatted-string')
      || document.querySelector('h1.title yt-formatted-string');

    const channelEl = document.querySelector('ytd-watch-metadata #channel-name a')
      || document.querySelector('#owner #channel-name a')
      || document.querySelector('ytd-video-owner-renderer a.yt-simple-endpoint');

    const imgEl = document.querySelector('ytd-watch-metadata #avatar img')
      || document.querySelector('#owner #avatar img');

    return {
      title: (titleEl?.textContent || '').trim() || 'Current video',
      channel: (channelEl?.textContent || '').trim() || 'YouTube',
      avatar: imgEl?.src || '',
    };
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${BUTTON_ID} {
        margin-left: 8px;
        border-radius: 18px;
        border: 1px solid rgba(255,255,255,.18);
        padding: 0 12px;
        height: 36px;
        min-width: 92px;
        cursor: pointer;
        background: rgba(255,255,255,.08);
        color: #f1f1f1;
        font-weight: 500;
        font-size: 14px;
        font-family: Roboto, Arial, sans-serif;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: transform .18s ease, background .15s ease, box-shadow .18s ease;
        animation: aerodlBtnIn .22s ease;
      }
      #${BUTTON_ID} .aerodl-btn-icon {
        width: 16px;
        height: 16px;
        display: inline-block;
      }
      #${BUTTON_ID} .aerodl-btn-icon svg {
        width: 16px;
        height: 16px;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
        opacity: .95;
      }
      #${BUTTON_ID}:hover { background: rgba(255,255,255,.15); transform: translateY(-1px); box-shadow: 0 8px 18px rgba(0,0,0,.26); }
      #${BUTTON_ID}.active { transform: translateY(-1px) scale(1.02); }

      @keyframes aerodlBtnIn {
        from { opacity: 0; transform: translateX(10px); }
        to { opacity: 1; transform: translateX(0); }
      }

      #${MENU_ID} {
        position: fixed;
        z-index: 2147483647;
        width: 280px;
        max-height: min(78vh, 520px);
        background: #282828;
        color: #f1f1f1;
        border: 1px solid rgba(255,255,255,.12);
        border-radius: 12px;
        box-shadow: 0 12px 28px rgba(0,0,0,.4);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        font-family: Roboto, Arial, sans-serif;
        transform-origin: top right;
        animation: aerodlMenuIn .14s ease;
      }
      @keyframes aerodlMenuIn {
        from { opacity: 0; transform: translateY(-4px) scale(.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      #${MENU_ID} .aerodl-head {
        padding: 10px 12px;
        border-bottom: 1px solid rgba(255,255,255,.08);
        flex: 0 0 auto;
      }
      #${MENU_ID} .aerodl-context {
        display: grid;
        grid-template-columns: 28px 1fr;
        gap: 8px;
        align-items: center;
        margin-bottom: 8px;
      }
      #${MENU_ID} .aerodl-context img {
        width: 28px;
        height: 28px;
        border-radius: 999px;
        object-fit: cover;
      }
      #${MENU_ID} .aerodl-context .title {
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      #${MENU_ID} .aerodl-context .channel {
        font-size: 11px;
        color: #aaa;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      #${MENU_ID} .aerodl-title { font-size: 13px; font-weight: 600; }
      #${MENU_ID} .aerodl-sub { margin-top: 2px; color: #aaa; font-size: 12px; }

      #${MENU_ID} .aerodl-list {
        padding: 6px 0;
        overflow-y: auto;
        min-height: 0;
        flex: 1 1 auto;
      }
      #${MENU_ID} .aerodl-item {
        display: grid;
        grid-template-columns: 28px 1fr auto 18px;
        align-items: center;
        gap: 8px;
        width: 100%;
        height: 40px;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: #f1f1f1;
        text-align: left;
        padding: 0 12px;
        cursor: pointer;
        font-size: 14px;
      }
      #${MENU_ID} .aerodl-item:hover,
      #${MENU_ID} .aerodl-item.highlight { background: rgba(255,255,255,.1); }
      #${MENU_ID} .aerodl-item .icon { width: 22px; text-align: center; opacity: .88; }
      #${MENU_ID} .aerodl-item .meta { font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: .04em; }
      #${MENU_ID} .aerodl-item .check { color: #3ea6ff; opacity: 0; font-weight: 700; }
      #${MENU_ID} .aerodl-item.active .check { opacity: 1; }

      #${MENU_ID} .aerodl-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        padding: 10px;
        border-top: 1px solid rgba(255,255,255,.08);
        flex: 0 0 auto;
      }
      #${MENU_ID} .aerodl-btn {
        border: 1px solid rgba(255,255,255,.16);
        border-radius: 18px;
        background: #3f3f3f;
        color: #f1f1f1;
        height: 36px;
        padding: 0 12px;
        cursor: pointer;
        font-size: 13px;
      }
      #${MENU_ID} .aerodl-btn.primary {
        background: #3ea6ff;
        border-color: #3ea6ff;
        color: #0f0f0f;
        font-weight: 600;
      }
    `;
    document.head.appendChild(style);
  }

  function closeMenu() {
    const existing = document.getElementById(MENU_ID);
    if (existing) existing.remove();
    const btn = document.getElementById(BUTTON_ID);
    btn?.classList.remove('active');
    document.removeEventListener('keydown', onMenuKeydown, true);
  }

  function setActiveInMenu(menu, formatVal) {
    menu.querySelectorAll('.aerodl-item').forEach((x, i) => {
      const isActive = x.dataset.format === formatVal;
      x.classList.toggle('active', isActive);
      x.classList.toggle('highlight', i === highlightedIndex);
    });
  }

  function onMenuKeydown(e) {
    const menu = document.getElementById(MENU_ID);
    if (!menu) return;
    const items = Array.from(menu.querySelectorAll('.aerodl-item'));
    if (!items.length) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu();
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const dir = e.key === 'ArrowDown' ? 1 : -1;
      highlightedIndex = (highlightedIndex + dir + items.length) % items.length;
      selectedFormat = items[highlightedIndex].dataset.format;
      setActiveInMenu(menu, selectedFormat);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const start = menu.querySelector('#aerodl-start');
      start?.click();
    }
  }

  function createMenu(buttonEl) {
    closeMenu();

    highlightedIndex = Math.max(0, formats.findIndex((f) => f.v === selectedFormat));

    const menu = document.createElement('div');
    menu.id = MENU_ID;
    menu.setAttribute('role', 'menu');

    const ctx = getVideoContext();

    menu.innerHTML = `
      <div class="aerodl-head">
        <div class="aerodl-context">
          <img src="${ctx.avatar || 'https://www.youtube.com/s/desktop/f506bd45/img/favicon_144x144.png'}" alt="channel" />
          <div>
            <div class="title">${ctx.title.replace(/</g, '&lt;')}</div>
            <div class="channel">${ctx.channel.replace(/</g, '&lt;')}</div>
          </div>
        </div>
        <div class="aerodl-title">PipeDL</div>
        <div class="aerodl-sub">Quick download menu</div>
      </div>
      <div class="aerodl-list">
        ${formats.map((f) => `
          <button class="aerodl-item ${selectedFormat === f.v ? 'active' : ''}" data-format="${f.v}" role="menuitemradio" aria-checked="${selectedFormat === f.v}">
            <span class="icon">${f.icon}</span>
            <span>${f.label}</span>
            <span class="meta">${f.meta}</span>
            <span class="check">✓</span>
          </button>
        `).join('')}
      </div>
      <div class="aerodl-actions">
        <button class="aerodl-btn" id="aerodl-open-popup">Open panel</button>
        <button class="aerodl-btn primary" id="aerodl-start">Download</button>
      </div>
    `;

    document.body.appendChild(menu);

    const r = buttonEl.getBoundingClientRect();
    const menuWidth = 280;
    const estimatedHeight = Math.min(window.innerHeight * 0.78, 520);
    const spaceBelow = window.innerHeight - r.bottom;
    const spaceAbove = r.top;

    // Prefer below button, but flip above if there isn't enough room.
    let top;
    if (spaceBelow >= 220 || spaceBelow >= spaceAbove) {
      top = r.bottom + 8;
    } else {
      top = r.top - estimatedHeight - 8;
    }

    const preferRight = r.right - menuWidth;
    const left = preferRight < 8 ? Math.min(window.innerWidth - menuWidth - 8, r.left) : preferRight;

    menu.style.top = `${Math.max(8, Math.min(window.innerHeight - 8 - estimatedHeight, top))}px`;
    menu.style.left = `${Math.max(8, left)}px`;

    setActiveInMenu(menu, selectedFormat);

    menu.querySelectorAll('.aerodl-item').forEach((item, i) => {
      item.addEventListener('mouseenter', () => {
        highlightedIndex = i;
        setActiveInMenu(menu, selectedFormat);
      });

      item.addEventListener('click', () => {
        selectedFormat = item.dataset.format;
        highlightedIndex = i;
        setActiveInMenu(menu, selectedFormat);
      });
    });

    menu.querySelector('#aerodl-open-popup').addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'PIPEDL_OPEN_POPUP' });
    });

    menu.querySelector('#aerodl-start').addEventListener('click', async () => {
      const startBtn = menu.querySelector('#aerodl-start');
      const old = startBtn.textContent;
      startBtn.textContent = 'Starting...';
      startBtn.disabled = true;
      try {
        const taskId = await startDownload(selectedFormat);
        chrome.runtime.sendMessage({ type: 'PIPEDL_BADGE_REFRESH' }, () => {});
        showToast(`PipeDL queued (${taskId.slice(0, 8)})`);
        closeMenu();
      } catch (err) {
        showToast(`PipeDL error: ${err.message}`, true);
        startBtn.disabled = false;
        startBtn.textContent = old;
      }
    });

    setTimeout(() => {
      const outside = (e) => {
        if (!menu.contains(e.target) && e.target.id !== BUTTON_ID) {
          closeMenu();
          document.removeEventListener('click', outside, true);
        }
      };
      document.addEventListener('click', outside, true);
    }, 0);

    document.addEventListener('keydown', onMenuKeydown, true);
  }

  function createButton() {
    const btn = document.createElement('button');
    btn.id = BUTTON_ID;
    btn.type = 'button';
    btn.innerHTML = `
      <span class="aerodl-btn-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="M12 4v10"></path>
          <path d="M8.5 10.8 12 14.3l3.5-3.5"></path>
          <path d="M4.5 18h15"></path>
        </svg>
      </span>
      <span>PipeDL</span>
    `;

    btn.addEventListener('click', () => {
      const existing = document.getElementById(MENU_ID);
      if (existing) {
        closeMenu();
      } else {
        btn.classList.add('active');
        createMenu(btn);
      }
    });
    return btn;
  }

  function findTarget() {
    return (
      document.querySelector('ytd-watch-metadata #top-level-buttons-computed') ||
      document.querySelector('ytd-menu-renderer #top-level-buttons-computed') ||
      document.querySelector('#menu-container #top-level-buttons-computed') ||
      document.querySelector('ytd-reel-player-overlay-renderer #actions') ||
      document.querySelector('#actions-inner') ||
      document.querySelector('#actions')
    );
  }

  function injectButton() {
    const isWatchLike = location.pathname.startsWith('/watch') || location.pathname.startsWith('/shorts/');
    if (!isWatchLike) {
      closeMenu();
      return;
    }

    const target = findTarget();
    if (!target) return;
    if (document.getElementById(BUTTON_ID)) return;

    target.appendChild(createButton());
  }

  injectStyles();

  const observer = new MutationObserver(() => injectButton());
  observer.observe(document.documentElement, { subtree: true, childList: true });

  window.addEventListener('yt-navigate-finish', () => {
    closeMenu();
    setTimeout(injectButton, 150);
  });

  window.addEventListener('resize', () => {
    if (document.getElementById(MENU_ID)) closeMenu();
  });

  injectButton();
})();
