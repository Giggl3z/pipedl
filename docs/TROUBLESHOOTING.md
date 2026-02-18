# Troubleshooting

## "Fetch failed" from YouTube button

- Make sure backend is running:
  ```bash
  cd yt-dlp-gui
  python app.py
  ```
- Check extension options backend URL (`http://localhost:5000`)
- Reload extension in `brave://extensions`
- Refresh YouTube page

## AeroDL button not visible on YouTube

- Confirm extension is enabled
- Reload extension and YouTube tab
- Verify you are on a video page (`/watch` or `/shorts`)

## Push to GitHub fails due to large files

Add/update `.gitignore` to exclude media/downloads and re-commit cleanly:

```gitignore
yt-dlp-gui/downloads/
*.mp4
*.wav
*.mkv
*.webm
```

If large files were committed previously, rewrite history or create a clean repo history before push.

## yt-dlp not found

Install via pip and restart backend:

```bash
python -m pip install yt-dlp
python app.py
```

## Downloads path

Current project default:

`C:\Users\<you>\Downloads\AeroDL`

If needed, edit `yt-dlp-gui/app.py` (`DOWNLOAD_DIR`).
