# 🛠 PipeDL Setup Guide

Use this guide for a clean first-time setup on Windows.

---

## ✅ Requirements

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

```bash
git clone https://github.com/Giggl3z/pipedl.git
cd pipedl
```

To update later:

```bash
git pull
```

---

## 1) Install backend dependencies

```powershell
cd yt-dlp-gui
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

---

## 2) Start backend

```powershell
python app.py
```

Expected:
- Web app at `http://localhost:5000`
- Downloads saved to `C:\Users\<you>\Downloads\PipeDL`

Keep this terminal running while using extension/YouTube button.

---

## 3) Load extension in Brave

1. Open `brave://extensions`
2. Turn on **Developer mode**
3. Click **Load unpacked**
4. Select folder: `yt-dlp-brave-extension`

Optional: Pin extension icon in Brave toolbar.

---

## 4) Configure extension

- Open extension popup
- Click ⚙ Options
- Backend URL should be: `http://localhost:5000`

If backend runs elsewhere, update URL accordingly.

---

## 5) First download test

### Test from web UI
1. Open `http://localhost:5000`
2. Paste YouTube URL
3. Click **Start Download**

### Test from YouTube page
1. Open any YouTube video (`/watch` or `/shorts`)
2. Click **PipeDL** in action row
3. Pick format, click **Download**

Success signs:
- Task status changes `queued → running → done`
- Console logs update in real-time
- File appears in `Downloads\PipeDL`

---

## 6) Common operations

### Restart backend
```powershell
# in backend terminal
Ctrl + C
python app.py
```

### Update dependencies later
```powershell
cd yt-dlp-gui
python -m pip install --upgrade -r requirements.txt
```

### Re-load extension after code changes
- Go to `brave://extensions`
- Click **Reload** on PipeDL extension
- Refresh YouTube tab

---

## 🧯 If something fails

Use: [`docs/TROUBLESHOOTING.md`](TROUBLESHOOTING.md)
