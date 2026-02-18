# 🛠 PipeDL Setup Guide

Use this guide for a clean first-time setup.

---

## ✅ Requirements

- Windows 10/11
- Python 3.10+
- Brave Browser
- Internet access

---

## 1) Install backend dependencies

```powershell
cd yt-dlp-gui
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

---

## 3) Load extension in Brave

1. Open `brave://extensions`
2. Turn on **Developer mode**
3. Click **Load unpacked**
4. Select folder: `yt-dlp-brave-extension`

---

## 4) Configure extension (optional)

- Open PipeDL extension popup
- Click ⚙ Options
- Confirm backend URL is `http://localhost:5000`

---

## 5) First download test

1. Open any YouTube video page (`/watch` or `/shorts`)
2. Click **PipeDL** in action row
3. Pick format and click **Download**

If successful:
- Task appears in PipeDL UI
- Status moves `queued -> running -> done`
- File appears in `Downloads\PipeDL`

---

## 🔄 Update dependencies

```powershell
cd yt-dlp-gui
python -m pip install --upgrade -r requirements.txt
```
