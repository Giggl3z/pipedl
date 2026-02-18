# Setup Guide

## Requirements

- Windows 10/11
- Python 3.10+
- Brave Browser
- Internet connection

## 1) Backend setup (`yt-dlp-gui`)

```bash
cd yt-dlp-gui
python -m pip install flask yt-dlp
python app.py
```

Expected output: Flask running on `http://localhost:5000`.

## 2) Extension setup (`yt-dlp-brave-extension`)

1. Open `brave://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → choose `yt-dlp-brave-extension`
4. Pin extension if desired

## 3) Optional: Set backend URL in extension

- Open extension popup
- Click gear icon (Options)
- Set backend to `http://localhost:5000`

## 4) First test

1. Open any YouTube watch page
2. Click the **AeroDL** button
3. Pick format and click **Download**

If successful:
- Download task starts
- Files save to `Downloads\AeroDL`

## 5) Update dependencies

```bash
cd yt-dlp-gui
python -m pip install --upgrade yt-dlp flask
```
