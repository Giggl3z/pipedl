# 🛠 Setup Guide

Follow this once to get PipeDL running end-to-end.

---

## ✅ Requirements

- Windows 10/11
- Python 3.10+
- Brave Browser
- Internet connection

---

## 1) Start backend (`yt-dlp-gui`)

```bash
cd yt-dlp-gui
python -m pip install flask yt-dlp
python app.py
```

Expected: Flask server running at `http://localhost:5000`.

---

## 2) Load extension (`yt-dlp-brave-extension`)

1. Open `brave://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Choose `yt-dlp-brave-extension`
5. (Optional) Pin the extension

---

## 3) Configure backend URL (optional)

- Open extension popup
- Click ⚙ (Options)
- Set backend URL (default: `http://localhost:5000`)

---

## 4) First download test

1. Open a YouTube video (`/watch` or `/shorts`)
2. Click **PipeDL** near the action buttons
3. Choose format
4. Press **Download**

Success behavior:
- Task is queued
- File saves to `Downloads\PipeDL`

---

## 5) Keep dependencies fresh

```bash
cd yt-dlp-gui
python -m pip install --upgrade yt-dlp flask
```
