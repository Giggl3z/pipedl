# 🩺 PipeDL Troubleshooting

Common issues and quick fixes.

---

## ❌ "Fetch failed" from YouTube button or popup

1. Make sure backend is running:
   ```powershell
   cd yt-dlp-gui
   python app.py
   ```
2. Open extension options and verify backend URL (`http://localhost:5000`)
3. Reload extension in `brave://extensions`
4. Refresh YouTube tab

---

## 👀 PipeDL button not visible on YouTube

- Ensure extension is enabled
- Reload extension + refresh video tab
- Test on valid routes: `/watch` or `/shorts`

---

## ⏳ Task stuck in queued

- Increase concurrency in web UI (Queue Controls)
- Check if a running task is hung, then cancel it
- Restart backend if needed

---

## 🐍 `yt-dlp` not found / command fails

```powershell
python -m pip install --upgrade yt-dlp
```

Restart backend after update.

---

## 🚫 GitHub push rejected (large media files)

Do not commit downloaded media.
Ensure `.gitignore` includes:

```gitignore
yt-dlp-gui/downloads/
*.mp4
*.wav
*.mkv
*.webm
```

If large files were already committed, clean history before pushing.

---

## 📂 Wrong output folder

Default output path:

`C:\Users\<you>\Downloads\PipeDL`

To change it, edit `yt-dlp-gui/app.py` (`DOWNLOAD_DIR`) and restart backend.
