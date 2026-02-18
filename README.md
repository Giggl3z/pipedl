# 🧪 PipeDL

![PipeDL](https://img.shields.io/badge/Name-PipeDL-6D28D9)
![Python](https://img.shields.io/badge/Python-3.10%2B-2563EB)
![Brave Extension](https://img.shields.io/badge/Brave-MV3-F97316)
![License: MIT](https://img.shields.io/badge/License-MIT-16A34A)

> A smooth, modern `yt-dlp` experience — website UI + Brave extension + YouTube action button.

PipeDL brings CLI power into a cleaner workflow: choose preset, tweak options, launch, and monitor output in real time.

---

## 🌊 PipeDL Flow

1. Paste / open a YouTube video
2. Pick format preset (Best, MP4, WebM, MP3, Opus, WAV)
3. Start download
4. Watch live logs + task history
5. Grab files from `Downloads\PipeDL`

---

## ✨ Features

- 🎬 Download presets: Best / MP4 / WebM / MP3 / Opus / WAV
- ⚙️ Advanced options: subtitles, metadata, thumbnail, retries, rate limit
- 📜 Live console output
- 🧾 Task history tracking
- ▶️ YouTube action-row **PipeDL** button + quick menu
- 🧩 Brave popup controller + settings page

---

## 🧱 Project Structure

```text
.
├─ yt-dlp-gui/                 # Flask backend + full website UI
│  ├─ app.py
│  ├─ README.md
│  └─ static/
├─ yt-dlp-brave-extension/     # Brave MV3 extension
│  ├─ manifest.json
│  ├─ popup.html
│  ├─ popup.js
│  ├─ youtube-button.js
│  ├─ options.html
│  └─ README.md
└─ docs/
   ├─ SETUP.md
   └─ TROUBLESHOOTING.md
```

---

## ⚡ Quick Start

### 1) One-time setup (one-liner)

```powershell
powershell -ExecutionPolicy Bypass -File .\setup.ps1
```

### 2) Start PipeDL (one-liner)

```powershell
powershell -ExecutionPolicy Bypass -File .\run.ps1
```

Manual one-liner:

```powershell
cd yt-dlp-gui; python -m pip install flask yt-dlp; python app.py
```

- 🌐 GUI: `http://localhost:5000`
- 📂 Output folder: `C:\Users\<you>\Downloads\PipeDL`

---

## 🧩 Load Brave Extension

1. Open `brave://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select `yt-dlp-brave-extension/`

Then on YouTube:
1. Open a video page
2. Click **PipeDL** near Like/Share
3. Pick format + download

---

## 📚 Docs

- 🛠 Setup guide → [`docs/SETUP.md`](docs/SETUP.md)
- 🩺 Troubleshooting → [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md)
- ✅ Public release checklist → [`docs/PUBLIC_RELEASE_CHECKLIST.md`](docs/PUBLIC_RELEASE_CHECKLIST.md)
- 🧾 Release notes template → [`docs/RELEASE_TEMPLATE.md`](docs/RELEASE_TEMPLATE.md)
- 🗒 Changelog → [`CHANGELOG.md`](CHANGELOG.md)
- 🧩 Extension notes → [`yt-dlp-brave-extension/README.md`](yt-dlp-brave-extension/README.md)
- 🖥 GUI notes → [`yt-dlp-gui/README.md`](yt-dlp-gui/README.md)
- 🔐 Security/Privacy → [`SECURITY.md`](SECURITY.md)

---

## ⚠️ Limitations

- Browser extensions cannot run `yt-dlp` directly (sandbox restriction).
- Local backend (`yt-dlp-gui`) must be running for extension actions.

## 🤝 Contributing

- Use issue templates for bugs/features.
- Keep PRs focused and testable.
- Do not commit generated media or local machine artifacts.

## ⚖️ License

MIT — see [`LICENSE`](LICENSE).

## ⚠️ Responsible Use

Use PipeDL in compliance with platform Terms of Service and local laws.
