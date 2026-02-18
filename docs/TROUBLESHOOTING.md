# 🩺 Troubleshooting

Common issues and quick fixes.

---

## ❌ "Fetch failed" when clicking PipeDL on YouTube

1. Confirm backend is running:
   ```bash
   cd yt-dlp-gui
   python app.py
   ```
2. In extension options, verify backend URL (`http://localhost:5000`)
3. Reload extension in `brave://extensions`
4. Refresh YouTube page

---

## 👀 PipeDL button not visible on YouTube

- Ensure extension is enabled
- Reload extension + refresh tab
- Test on a valid video route (`/watch` or `/shorts`)

---

## 🚫 GitHub push rejected (large files)

GitHub blocks big media files in commits/history.

Make sure `.gitignore` includes:

```gitignore
yt-dlp-gui/downloads/
*.mp4
*.wav
*.mkv
*.webm
```

If files were already committed, rewrite history or create a clean repo history before pushing.

---

## 🐍 `yt-dlp` not found

Install and restart backend:

```bash
python -m pip install yt-dlp
python app.py
```

---

## 📂 Download location check

Current default path:

`C:\Users\<you>\Downloads\PipeDL`

Change it in `yt-dlp-gui/app.py` (`DOWNLOAD_DIR`) if needed.
