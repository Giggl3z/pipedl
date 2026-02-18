# PipeDL Architecture

This document explains how PipeDL components work together.

## Components

1. **Backend (`yt-dlp-gui/app.py`)**
   - Flask API + web UI host
   - Queue manager and worker pool
   - Spawns `python -m yt_dlp` processes
   - Maintains task state/logs in memory

2. **Web UI (`yt-dlp-gui/static/index.html`)**
   - Main dashboard for download workflows
   - Polls API for task status and logs
   - Provides presets, exact format picker, queue controls

3. **Brave Extension (`yt-dlp-brave-extension/`)**
   - Popup controls for quick enqueue
   - YouTube in-page button/menu for direct page actions
   - Checks backend availability and reflects online/offline state

4. **`pipedl-server` (`yt-dlp-gui/tray_app.py`)**
   - Tray-based local server controller
   - Starts/stops backend process
   - Shows server state and local logs

## Runtime Flow

1. User submits URL from web UI or extension.
2. Request hits `POST /api/download`.
3. Backend creates a task with status `queued`.
4. Worker picks task when concurrency slot is free.
5. Backend runs `yt_dlp` subprocess and streams output to task log.
6. UI/extension poll `status/tasks` endpoints until terminal state (`done`, `error`, `canceled`).

## Queue Model

- `TASK_QUEUE`: ordered list of queued task IDs
- `TASKS`: task map containing metadata, status, logs, timestamps
- `ACTIVE_PROCS`: running subprocess by task ID
- Concurrency controlled by `/api/settings`

## Key Endpoints

- `POST /api/download` enqueue task
- `POST /api/formats` fetch available formats for URL
- `GET /api/status/<task_id>` task detail + logs + progress
- `GET /api/tasks` task list + progress metadata
- `POST /api/cancel/<task_id>` cancel queued/running task
- `POST /api/retry-failed` requeue errored/canceled tasks
- `GET/POST /api/settings` runtime settings / queue stats
- `POST /api/open-downloads` open output folder (Windows)

## Constraints

- Extension cannot run `yt-dlp` directly due to browser sandboxing.
- Backend must run locally for popup and YouTube button actions.
- Task history is in-memory (not persistent DB yet).
