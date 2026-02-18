import os
import re
import sys
import subprocess
import threading
import uuid
from datetime import datetime
from urllib.parse import urlparse

from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder="static")

LOG_MAX_LINES = 700
MAX_TASKS = 200
MAX_CONCURRENCY_CAP = 4
DEFAULT_CONCURRENCY = 2

# Save downloads to local machine Downloads folder (outside workspace)
DOWNLOAD_DIR = os.path.join(os.path.expanduser("~"), "Downloads", "PipeDL")
os.makedirs(DOWNLOAD_DIR, exist_ok=True)
ARCHIVE_FILE = os.path.join(DOWNLOAD_DIR, "pipedl_archive.txt")

TASKS: dict[str, dict] = {}
TASK_QUEUE: list[str] = []
ACTIVE_PROCS: dict[str, subprocess.Popen] = {}

TASKS_LOCK = threading.Lock()
QUEUE_COND = threading.Condition(TASKS_LOCK)

WORKER_THREADS: list[threading.Thread] = []
SHUTDOWN = False
CURRENT_CONCURRENCY = DEFAULT_CONCURRENCY

ALLOWED_FORMATS = {
    "best_video",
    "mp4",
    "webm",
    "audio_best",
    "audio_opus",
    "audio_wav",
}


# ---------- Helpers ----------

def now_iso() -> str:
    return datetime.now().isoformat(timespec="seconds")


def is_probably_url(url: str) -> bool:
    try:
        parsed = urlparse(url)
        return parsed.scheme in ("http", "https") and bool(parsed.netloc)
    except Exception:
        return False


def queue_position(task_id: str) -> int | None:
    try:
        return TASK_QUEUE.index(task_id) + 1
    except ValueError:
        return None


def trim_tasks_if_needed_locked() -> None:
    # Caller must hold TASKS_LOCK/QUEUE_COND lock.
    if len(TASKS) <= MAX_TASKS:
        return

    ordered = sorted(TASKS.items(), key=lambda kv: kv[1].get("created_at", ""))
    for task_id, task in ordered:
        if len(TASKS) <= MAX_TASKS:
            break
        if task.get("status") in ("done", "error", "canceled"):
            TASKS.pop(task_id, None)
            if task_id in TASK_QUEUE:
                TASK_QUEUE.remove(task_id)


def append_log(task: dict, line: str) -> None:
    task["log"].append(line)
    if len(task["log"]) > LOG_MAX_LINES:
        del task["log"][0 : len(task["log"]) - LOG_MAX_LINES]


def to_rate_limit(rate: str) -> str:
    # Accept values like 500K, 2M, 1.5M
    rate = (rate or "").strip().upper()
    if not rate:
        return ""
    if re.fullmatch(r"\d+(\.\d+)?[KMG]?", rate):
        return rate
    return ""


def running_count() -> int:
    return sum(1 for t in TASKS.values() if t.get("status") == "running")


def parse_progress_from_log(lines: list[str]) -> dict:
    percent = None
    speed = None
    eta = None
    size = None

    for line in reversed(lines or []):
      if "[download]" not in line:
          continue

      m_pct = re.search(r"(\d{1,3}(?:\.\d+)?)%", line)
      if m_pct and percent is None:
          try:
              percent = max(0.0, min(100.0, float(m_pct.group(1))))
          except Exception:
              percent = None

      m_speed = re.search(r"at\s+([^\s]+/s)", line)
      if m_speed and speed is None:
          speed = m_speed.group(1)

      m_eta = re.search(r"ETA\s+([^\s]+)", line)
      if m_eta and eta is None:
          eta = m_eta.group(1)

      m_size = re.search(r"of\s+([^\s]+)", line)
      if m_size and size is None:
          size = m_size.group(1)

      if percent is not None and (speed is not None or eta is not None or size is not None):
          break

    return {
        "percent": percent,
        "speed": speed,
        "eta": eta,
        "size": size,
    }


def build_command(url: str, fmt: str, options: dict) -> list[str]:
    base_cmd = [sys.executable, "-m", "yt_dlp"]

    exact_format = (options.get("exactFormat") or "").strip()
    if exact_format:
        cmd = base_cmd + ["-f", exact_format]
    elif fmt == "best_video":
        cmd = base_cmd + ["-f", "bestvideo+bestaudio/best"]
    elif fmt == "mp4":
        cmd = base_cmd + ["-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best"]
    elif fmt == "webm":
        cmd = base_cmd + ["-f", "bestvideo[ext=webm]+bestaudio/best[ext=webm]/best"]
    elif fmt == "audio_best":
        cmd = base_cmd + ["-f", "bestaudio/best", "-x", "--audio-format", "mp3"]
    elif fmt == "audio_opus":
        cmd = base_cmd + ["-f", "bestaudio/best", "-x", "--audio-format", "opus"]
    elif fmt == "audio_wav":
        cmd = base_cmd + ["-f", "bestaudio/best", "-x", "--audio-format", "wav"]
    else:
        cmd = base_cmd

    output_template = (options.get("outputTemplate") or "").strip()
    if output_template:
        cmd += ["-o", output_template]

    if bool(options.get("writeSubs")):
        cmd += ["--write-auto-sub", "--sub-langs", "all"]

    if bool(options.get("embedMetadata")):
        cmd += ["--embed-metadata"]

    if bool(options.get("embedThumbnail")):
        cmd += ["--embed-thumbnail"]

    cookies_path = (options.get("cookiesPath") or "").strip()
    if cookies_path:
        cmd += ["--cookies", cookies_path]

    rate_limit = to_rate_limit(options.get("rateLimit") or "")
    if rate_limit:
        cmd += ["--limit-rate", rate_limit]

    retries = str(options.get("retries") or "").strip()
    if retries.isdigit():
        cmd += ["--retries", retries]

    # Dedupe previously downloaded IDs
    if bool(options.get("useArchive", True)):
        cmd += ["--download-archive", ARCHIVE_FILE]

    cmd += [url]
    return cmd


def run_yt_dlp(task_id: str):
    with TASKS_LOCK:
        task = TASKS.get(task_id)
        if not task:
            return
        url = task["url"]
        fmt = task["format"]
        options = task["options"]

    cmd = build_command(url, fmt, options)

    with TASKS_LOCK:
        append_log(task, f"$ {' '.join(cmd)}")

    try:
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            cwd=DOWNLOAD_DIR,
        )

        with TASKS_LOCK:
            task = TASKS.get(task_id)
            if not task:
                proc.terminate()
                return
            task["pid"] = proc.pid
            ACTIVE_PROCS[task_id] = proc

        assert proc.stdout is not None
        for line in proc.stdout:
            with TASKS_LOCK:
                task = TASKS.get(task_id)
                if not task:
                    continue
                append_log(task, line.rstrip("\n"))

        proc.wait()

        with TASKS_LOCK:
            ACTIVE_PROCS.pop(task_id, None)
            task = TASKS.get(task_id)
            if not task:
                return

            if task.get("status") == "canceled":
                # Already marked by cancel endpoint
                append_log(task, "")
                append_log(task, "Task canceled by user.")
            elif proc.returncode == 0:
                task["status"] = "done"
                task["finished_at"] = now_iso()
                append_log(task, "")
                append_log(task, "Download finished successfully.")
            else:
                task["status"] = "error"
                task["finished_at"] = now_iso()
                append_log(task, "")
                append_log(task, f"yt-dlp exited with code {proc.returncode}.")

        if proc.returncode == 0 and bool(options.get("autoOpenFolder", True)) and sys.platform.startswith("win"):
            try:
                os.startfile(DOWNLOAD_DIR)
            except Exception as e:
                with TASKS_LOCK:
                    task = TASKS.get(task_id)
                    if task:
                        append_log(task, f"Could not open download folder: {e}")

    except Exception as e:
        with TASKS_LOCK:
            ACTIVE_PROCS.pop(task_id, None)
            task = TASKS.get(task_id)
            if not task:
                return
            if task.get("status") != "canceled":
                task["status"] = "error"
            task["finished_at"] = now_iso()
            append_log(task, "")
            append_log(task, f"Error running yt-dlp: {e}")


# ---------- Queue workers ----------

def queue_worker(worker_idx: int):
    while True:
        with QUEUE_COND:
            while True:
                if SHUTDOWN:
                    return

                if TASK_QUEUE and running_count() < CURRENT_CONCURRENCY:
                    task_id = TASK_QUEUE.pop(0)
                    task = TASKS.get(task_id)
                    if not task:
                        continue
                    if task.get("status") != "queued":
                        continue

                    task["status"] = "running"
                    task["started_at"] = now_iso()
                    append_log(task, f"Worker {worker_idx} picked task.")
                    break

                QUEUE_COND.wait()

        run_yt_dlp(task_id)

        with QUEUE_COND:
            QUEUE_COND.notify_all()


def start_workers():
    if WORKER_THREADS:
        return
    for i in range(MAX_CONCURRENCY_CAP):
        t = threading.Thread(target=queue_worker, args=(i + 1,), daemon=True)
        t.start()
        WORKER_THREADS.append(t)


start_workers()


# ---------- API ----------

@app.route("/")
def index():
    return send_from_directory("static", "index.html")


@app.route("/api/download", methods=["POST"])
def api_download():
    data = request.get_json(force=True) or {}
    url = (data.get("url") or "").strip()
    fmt = (data.get("format") or "best_video").strip()
    options = data.get("options") or {}

    if not url or not is_probably_url(url):
        return jsonify({"error": "Valid URL is required"}), 400

    if fmt not in ALLOWED_FORMATS:
        fmt = "best_video"

    task_id = str(uuid.uuid4())
    task = {
        "task_id": task_id,
        "status": "queued",
        "log": ["Task queued."],
        "url": url,
        "format": fmt,
        "created_at": now_iso(),
        "started_at": None,
        "finished_at": None,
        "pid": None,
        "options": {
            "writeSubs": bool(options.get("writeSubs")),
            "embedMetadata": bool(options.get("embedMetadata")),
            "embedThumbnail": bool(options.get("embedThumbnail")),
            "autoOpenFolder": bool(options.get("autoOpenFolder", True)),
            "useArchive": bool(options.get("useArchive", True)),
            "exactFormat": (options.get("exactFormat") or "").strip(),
            "outputTemplate": (options.get("outputTemplate") or "").strip(),
            "cookiesPath": (options.get("cookiesPath") or "").strip(),
            "rateLimit": (options.get("rateLimit") or "").strip(),
            "retries": str(options.get("retries") or "").strip(),
        },
    }

    with QUEUE_COND:
        TASKS[task_id] = task
        TASK_QUEUE.append(task_id)
        trim_tasks_if_needed_locked()
        QUEUE_COND.notify_all()

    return jsonify({"task_id": task_id, "status": "queued", "queue_position": queue_position(task_id)})


@app.route("/api/status/<task_id>", methods=["GET"])
def api_status(task_id):
    with TASKS_LOCK:
        task = TASKS.get(task_id)
        if not task:
            return jsonify({"error": "Task not found"}), 404

        progress = parse_progress_from_log(task.get("log") or [])
        return jsonify(
            {
                "task_id": task["task_id"],
                "status": task["status"],
                "queue_position": queue_position(task_id) if task["status"] == "queued" else None,
                "log": task["log"],
                "url": task["url"],
                "format": task["format"],
                "created_at": task["created_at"],
                "started_at": task.get("started_at"),
                "finished_at": task["finished_at"],
                "pid": task["pid"],
                "progress": progress,
            }
        )


@app.route("/api/tasks", methods=["GET"])
def api_tasks():
    with TASKS_LOCK:
        items = list(TASKS.values())

    items.sort(key=lambda t: t.get("created_at", ""), reverse=True)
    out = []
    for t in items[:80]:
        progress = parse_progress_from_log(t.get("log") or [])
        out.append(
            {
                "task_id": t["task_id"],
                "status": t["status"],
                "queue_position": queue_position(t["task_id"]) if t["status"] == "queued" else None,
                "url": t["url"],
                "format": t["format"],
                "created_at": t["created_at"],
                "started_at": t.get("started_at"),
                "finished_at": t["finished_at"],
                "progress": progress,
            }
        )
    return jsonify(out)


@app.route("/api/cancel/<task_id>", methods=["POST"])
def api_cancel(task_id):
    with QUEUE_COND:
        task = TASKS.get(task_id)
        if not task:
            return jsonify({"error": "Task not found"}), 404

        status = task.get("status")
        if status in ("done", "error", "canceled"):
            return jsonify({"ok": True, "status": status})

        if status == "queued":
            if task_id in TASK_QUEUE:
                TASK_QUEUE.remove(task_id)
            task["status"] = "canceled"
            task["finished_at"] = now_iso()
            append_log(task, "Task canceled before start.")
            QUEUE_COND.notify_all()
            return jsonify({"ok": True, "status": "canceled"})

        # running
        task["status"] = "canceled"
        task["finished_at"] = now_iso()
        append_log(task, "Cancel requested. Stopping process...")

        proc = ACTIVE_PROCS.get(task_id)
        if proc and proc.poll() is None:
            try:
                proc.terminate()
            except Exception:
                pass

        QUEUE_COND.notify_all()
        return jsonify({"ok": True, "status": "canceled"})


@app.route("/api/retry-failed", methods=["POST"])
def api_retry_failed():
    created = []

    with QUEUE_COND:
        failed_tasks = [
            t for t in TASKS.values()
            if t.get("status") in ("error", "canceled")
        ]

        for source in failed_tasks:
            task_id = str(uuid.uuid4())
            task = {
                "task_id": task_id,
                "status": "queued",
                "log": [f"Task queued (retry of {source['task_id'][:8]})."],
                "url": source["url"],
                "format": source["format"],
                "created_at": now_iso(),
                "started_at": None,
                "finished_at": None,
                "pid": None,
                "options": dict(source.get("options") or {}),
            }
            TASKS[task_id] = task
            TASK_QUEUE.append(task_id)
            created.append(task_id)

        trim_tasks_if_needed_locked()
        QUEUE_COND.notify_all()

    return jsonify({"ok": True, "created": len(created), "task_ids": created})


@app.route("/api/settings", methods=["GET", "POST"])
def api_settings():
    global CURRENT_CONCURRENCY

    if request.method == "GET":
        with TASKS_LOCK:
            return jsonify(
                {
                    "concurrency": CURRENT_CONCURRENCY,
                    "maxConcurrencyCap": MAX_CONCURRENCY_CAP,
                    "running": running_count(),
                    "queued": len(TASK_QUEUE),
                    "downloadDir": DOWNLOAD_DIR,
                    "archiveFile": ARCHIVE_FILE,
                }
            )

    data = request.get_json(force=True) or {}
    raw = data.get("concurrency")
    try:
        value = int(raw)
    except Exception:
        return jsonify({"error": "concurrency must be an integer"}), 400

    if value < 1 or value > MAX_CONCURRENCY_CAP:
        return jsonify({"error": f"concurrency must be between 1 and {MAX_CONCURRENCY_CAP}"}), 400

    with QUEUE_COND:
        CURRENT_CONCURRENCY = value
        QUEUE_COND.notify_all()

    return jsonify({"ok": True, "concurrency": CURRENT_CONCURRENCY})


@app.route("/api/formats", methods=["POST"])
def api_formats():
    data = request.get_json(force=True) or {}
    url = (data.get("url") or "").strip()

    if not url or not is_probably_url(url):
        return jsonify({"error": "Valid URL is required"}), 400

    cmd = [
        sys.executable,
        "-m",
        "yt_dlp",
        "--dump-json",
        "--skip-download",
        "--no-warnings",
        "--no-playlist",
        url,
    ]

    try:
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            cwd=DOWNLOAD_DIR,
            timeout=90,
        )
    except Exception as e:
        return jsonify({"error": f"Failed to fetch formats: {e}"}), 500

    if proc.returncode != 0:
        err = (proc.stderr or proc.stdout or "yt-dlp failed").strip()
        return jsonify({"error": err[:1000]}), 400

    raw = (proc.stdout or "").strip().splitlines()
    if not raw:
        return jsonify({"error": "No format data returned"}), 400

    import json as _json

    try:
        info = _json.loads(raw[0])
    except Exception:
        return jsonify({"error": "Could not parse format data"}), 500

    formats = []
    for f in info.get("formats", []):
        fid = str(f.get("format_id") or "").strip()
        if not fid:
            continue
        filesize = f.get("filesize") or f.get("filesize_approx")
        formats.append(
            {
                "format_id": fid,
                "ext": f.get("ext") or "",
                "resolution": f.get("resolution") or (f"{f.get('width')}x{f.get('height')}" if f.get("width") and f.get("height") else "audio"),
                "vcodec": f.get("vcodec") or "",
                "acodec": f.get("acodec") or "",
                "fps": f.get("fps"),
                "tbr": f.get("tbr"),
                "filesize": filesize,
                "note": f.get("format_note") or "",
                "display": f.get("format") or "",
            }
        )

    # Most useful first (higher bitrate near top)
    formats.sort(key=lambda x: (x.get("tbr") or 0), reverse=True)

    return jsonify(
        {
            "title": info.get("title") or "",
            "uploader": info.get("uploader") or "",
            "duration": info.get("duration"),
            "formats": formats,
        }
    )


@app.route("/api/open-downloads", methods=["POST"])
def api_open_downloads():
    if not sys.platform.startswith("win"):
        return jsonify({"error": "Open folder is currently implemented for Windows only"}), 400
    try:
        os.startfile(DOWNLOAD_DIR)
        return jsonify({"ok": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    debug_enabled = True
    if "--no-debug" in sys.argv or os.environ.get("PIPEDL_DEBUG", "1") in ("0", "false", "False"):
        debug_enabled = False

    app.run(host="0.0.0.0", port=5000, debug=debug_enabled)
