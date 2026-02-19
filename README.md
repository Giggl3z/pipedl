# PipeDL

<p align="left">
  <img src="docs/assets/pipedl-logo-bold.svg" alt="PipeDL logo" width="620" />
</p>

![Python](https://img.shields.io/badge/Python-3.10%2B-2563EB) ![Brave Extension](https://img.shields.io/badge/Brave-MV3-F97316) ![License](https://img.shields.io/badge/License-MIT-16A34A) ![Status](https://img.shields.io/badge/Status-Active-22C55E)

> **PipeDL** is a framework to run, manage, and automate `yt-dlp` downloads through a unified UI and extension workflow.

---

## 🚀 Launch in 60 Seconds

```powershell
git clone https://github.com/Giggl3z/pipedl.git
cd pipedl
.\setup.ps1
.\run.ps1
```

`run.ps1` launches `pipedl-server` tray mode by default.

If `run.ps1` still opens Flask terminal logs, update your local copy first:

```powershell
git pull
```

Then run `.\run.ps1` again.

Then open **http://localhost:5000** and drop your first URL.

### Optional: pipedl-server app (recommended for non-technical users)

PipeDL also includes a server controller app with:
- always-on system tray icon
- live server status (online/offline)
- start/shutdown button
- console log viewer

Run it:

```powershell
.\run-tray.ps1
```

Enable auto-start on login:

```powershell
.\install-tray-autostart.ps1
```

Disable auto-start:

```powershell
.\uninstall-tray-autostart.ps1
```

---

## ✨ Why PipeDL

### ⚡ Fast lane by default
- Paste URL → run immediately
- Presets built in: **Best / MP4 / WebM / MP3 / Opus / WAV**

### 🎛️ Pro controls when you want them
- Exact quality picker (`yt-dlp -F` style)
- Advanced options (subs, metadata, thumbnail, retries, rate limit, cookies)

### 📦 Queue-first workflow
- Live **queued/running** visibility
- Runtime **concurrency** control
- Cancel queued or running tasks

### 🧠 Feedback-first UI
- Real-time logs
- Task history panel
- Status chips + queue/timing tooltips

---

## 🧩 Product Surface

- **Web Studio** (`yt-dlp-gui`) → full command center
- **Brave Popup** (`yt-dlp-brave-extension`) → compact quick-control
- **YouTube Action Button** → run downloads directly from watch pages

---

## 📦 Install Options

### Option A - Recommended scripts

```powershell
.\setup.ps1
.\run.ps1
```

Fallback (if script execution is blocked):

```powershell
powershell -ExecutionPolicy Bypass -File .\setup.ps1
powershell -ExecutionPolicy Bypass -File .\run.ps1
```

### Option B - Manual

```powershell
cd yt-dlp-gui
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python app.py
```

---

## 🧭 First-Time Setup Checklist

### 1) Start backend
Run `.\run.ps1` to start `pipedl-server` (tray mode).

Optional terminal mode:
- `.\run.ps1 -Terminal`
- or `python app.py` inside `yt-dlp-gui`

### 2) Load extension in Brave
1. Open `brave://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select `yt-dlp-brave-extension/`

### 3) Test from YouTube
1. Open a video page (`/watch` or `/shorts`)
2. Click **PipeDL** near Like/Share
3. Pick format and download

Default output folder:
- `C:\Users\<you>\Downloads\PipeDL`

---

## 🖥️ UI Modes

### Simple Mode
- Minimal controls
- Fastest path to download

### Pro Mode
- Exact quality picker
- Queue controls (stats / concurrency / cancel)
- Advanced options panel

---

## 📚 Documentation

- Setup → [`docs/SETUP.md`](docs/SETUP.md)
- Troubleshooting → [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md)
- Architecture → [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- FAQ → [`docs/FAQ.md`](docs/FAQ.md)
- Changelog → [`CHANGELOG.md`](CHANGELOG.md)
- Release template → [`docs/RELEASE_TEMPLATE.md`](docs/RELEASE_TEMPLATE.md)
- Public release checklist → [`docs/PUBLIC_RELEASE_CHECKLIST.md`](docs/PUBLIC_RELEASE_CHECKLIST.md)
- Security notes → [`SECURITY.md`](SECURITY.md)

---

## 🤝 Contributing

- Use issue templates for bug/feature reports
- Keep PRs focused and testable
- Do not commit generated media or machine-specific artifacts

---

## ✅ Responsible Use

Use PipeDL in compliance with platform Terms of Service and applicable laws.

---

## ℹ️ Compact Reference

### API endpoints

- `POST /api/download`
- `POST /api/formats`
- `GET /api/status/<task_id>`
- `GET /api/tasks`
- `POST /api/cancel/<task_id>`
- `POST /api/retry-failed`
- `GET/POST /api/settings`
- `POST /api/open-downloads`

### Repository structure

```text
.
├─ yt-dlp-gui/                 # Flask backend + web UI
│  ├─ app.py
│  ├─ requirements.txt
│  └─ static/
├─ yt-dlp-brave-extension/     # Brave MV3 extension
│  ├─ manifest.json
│  ├─ popup.html
│  ├─ popup.js
│  ├─ youtube-button.js
│  ├─ options.html
│  └─ README.md
├─ docs/
│  ├─ SETUP.md
│  ├─ TROUBLESHOOTING.md
│  ├─ ARCHITECTURE.md
│  ├─ FAQ.md
│  ├─ PUBLIC_RELEASE_CHECKLIST.md
│  └─ RELEASE_TEMPLATE.md
├─ CHANGELOG.md
└─ LICENSE
```

### Important limitations

- Browser extensions cannot execute `yt-dlp` directly (sandbox restriction).
- Local backend (`yt-dlp-gui`) must be running for extension actions.

---

## ⚖️ License

MIT - see [`LICENSE`](LICENSE)
