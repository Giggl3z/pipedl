# PipeDL Setup Guide

Use this guide for a clean first-time setup on Windows.

---

## Requirements

> Run PowerShell as **Administrator** for setup/startup scripts.

- Windows 10/11
- Python 3.10+
- Git
- Brave Browser
- Internet access

Quick checks:

```powershell
python --version
git --version
```

If Python or Git is missing:
- Python: https://www.python.org/downloads/
- Git: https://git-scm.com/download/win

---

## 0) Clone repository

```powershell
git clone https://github.com/Giggl3z/pipedl.git
cd pipedl
```

To update later:

```powershell
git pull
```

---

## 1) Install dependencies

```powershell
.\setup.ps1
```

During setup, PipeDL asks whether `pipedl-server` should auto-start at login (Y/N prompt).

Manual path:

```powershell
cd yt-dlp-gui
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

---

## 2) Choose how to run

### Option A: Standard backend (terminal)

```powershell
.\run.ps1
```

### Option B: `pipedl-server` app (recommended)

```powershell
.\run-tray.ps1
```

What `pipedl-server` gives you:
- always-on tray icon
- server online/offline status
- start/shutdown server button
- console log viewer

Auto-start controls:

```powershell
.\install-tray-autostart.ps1
.\uninstall-tray-autostart.ps1
```

---

## 3) Load extension in Brave

1. Open `brave://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select folder: `yt-dlp-brave-extension`

Optional: pin extension icon in Brave toolbar.

---

## 4) Configure extension

- Open popup
- Click ⚙ Options
- Backend URL should be `http://localhost:5000`

The popup now shows live backend status:
- `server: online`
- `server: offline`

When offline, backend actions are disabled until server is up.

---

## 5) First download test

### Test from web UI
1. Open `http://localhost:5000`
2. Paste URL
3. Click **Start Download**

### Test from YouTube page
1. Open a video page (`/watch` or `/shorts`)
2. Click **PipeDL** in action row
3. Pick format and download

Success signs:
- task status moves `queued -> running -> done`
- console logs update live
- file appears in `C:\Users\<you>\Downloads\PipeDL`

---

## 6) Common operations

### Restart backend
```powershell
# if running in terminal
Ctrl + C
.\run.ps1
```

### Reload extension after code changes
- Open `brave://extensions`
- Click **Reload** on PipeDL
- Refresh YouTube tab

---

## 7) Verification checklist

After setup, verify these quickly:
- `http://localhost:5000` loads
- extension popup shows `server: online`
- starting a test URL creates `queued -> running -> done`
- output appears in `Downloads\\PipeDL`

---

## 8) API quick reference

- `POST /api/download`
- `POST /api/formats`
- `GET /api/status/<task_id>`
- `GET /api/tasks`
- `POST /api/cancel/<task_id>`
- `POST /api/retry-failed`
- `GET/POST /api/settings`
- `POST /api/open-downloads`

---

If something fails, use: [`docs/TROUBLESHOOTING.md`](TROUBLESHOOTING.md)
