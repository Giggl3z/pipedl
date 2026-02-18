# yt-dlp-gui

Local web backend and website UI for AeroDL.

## Run

```bash
python -m pip install flask yt-dlp
python app.py
```

Open: `http://localhost:5000`

## Features

- Format presets
- Advanced options for `yt-dlp`
- Live logs
- Task history endpoint
- Open downloads folder endpoint

## API endpoints

- `POST /api/download`
- `GET /api/status/<task_id>`
- `GET /api/tasks`
- `POST /api/open-downloads`

## Download location

`C:\Users\<you>\Downloads\AeroDL`
