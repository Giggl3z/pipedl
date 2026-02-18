# AeroDL

AeroDL is a user-friendly YouTube downloader toolkit powered by `yt-dlp`.

This repository contains two parts:

1. **`yt-dlp-gui/`** — local web app backend + full website UI
2. **`yt-dlp-brave-extension/`** — Brave extension with YouTube in-page button/menu

---

## What you get

- Download presets (Best/MP4/WebM/MP3/Opus/WAV)
- Advanced `yt-dlp` options
- Live console log preview
- Task history
- YouTube action-row button (AeroDL)
- Brave popup controller

---

## Repository structure

```text
.
├─ yt-dlp-gui/                 # Flask app + website UI
│  ├─ app.py
│  └─ static/
├─ yt-dlp-brave-extension/     # MV3 extension
│  ├─ manifest.json
│  ├─ popup.html
│  ├─ popup.js
│  ├─ youtube-button.js
│  └─ options.html
└─ docs/
   ├─ SETUP.md
   └─ TROUBLESHOOTING.md
```

---

## Quick start

### 1) Install dependencies

```bash
cd yt-dlp-gui
python -m pip install flask yt-dlp
```

### 2) Run local backend

```bash
python app.py
```

By default, GUI is at:

- `http://localhost:5000`

Downloads are saved to:

- `C:\Users\<you>\Downloads\AeroDL`

### 3) Load Brave extension

1. Open `brave://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select `yt-dlp-brave-extension/`

### 4) Use it

- Open YouTube video page
- Click **AeroDL** button near action row
- Choose format and press **Download**

---

## Documentation

- Setup guide: [`docs/SETUP.md`](docs/SETUP.md)
- Troubleshooting: [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md)
- Extension notes: [`yt-dlp-brave-extension/README.md`](yt-dlp-brave-extension/README.md)

---

## Safety / legal

Use responsibly and comply with platform Terms of Service and local laws.
