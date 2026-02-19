# Changelog

All notable changes to this project will be documented in this file.

Format inspired by [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Changelog policy: every meaningful change should be recorded here.
- Queue-based download execution with worker pool and configurable concurrency (Phase A).
- New backend endpoints:
  - `POST /api/cancel/<task_id>` (cancel queued/running tasks)
  - `GET/POST /api/settings` (runtime concurrency + queue/runtime info)
- Archive dedupe option (`--download-archive`) to skip already-downloaded IDs.
- Exact quality picker backend endpoint: `POST /api/formats` (yt-dlp format discovery).
- Exact quality picker modal in web UI with selectable `format_id`.
- Post-download action selector (open folder / copy path / both / none).
- Simple vs Pro UI mode toggle.
- Quick copy-download-path action button.
- Queue controls UI: live queue/running stats, concurrency selector, and per-task cancel buttons.
- Task list visual polish: status icons, hover motion, and running pulse accent.
- Status chip tooltips now show queue position + started/finished timestamps.
- New PipeDL SVG logo asset and refreshed README/docs visual layout.
- UI quick actions for URL input: Paste from clipboard + Clear.
- Keyboard shortcuts in web UI: `Ctrl/Cmd + Enter` to start and `Esc` to close the exact-format modal.
- Task list filters (all/running/queued/done/error/canceled) and one-click “Retry Failed” action.
- Task rows now show parsed progress details (percent/speed/ETA) when available.
- New PipeDL tray controller app (`yt-dlp-gui/tray_app.py`) with status display, start/stop server control, web UI launch, and log viewer.
- Startup scripts for tray mode:
  - `run-tray.ps1`
  - `install-tray-autostart.ps1`
  - `uninstall-tray-autostart.ps1`
- `setup.ps1` now asks whether to enable tray auto-start at login during setup.
- Tray app now detects external server instances and reflects status correctly (won’t spawn duplicate server or attempt to stop unmanaged process).
- Tray/server app naming simplified to `pipedl-server` across window title, startup task, and user-facing hints.
- Setup and troubleshooting docs expanded with `pipedl-server` flow, extension server-status behavior, startup task guidance, and updated API references.
- Added new docs: `docs/ARCHITECTURE.md` and `docs/FAQ.md`.
- README limitations section moved to the bottom and visually de-emphasized.
- README API/structure sections moved into a dedicated compact reference section at the bottom.
- Compact reference typography adjusted for readability (no extra mini text styling).
- README license section moved to the end of the document.
- Extension popup autofills URL from active YouTube tab.
- Extension popup now shows live backend server status (online/offline), disables backend actions when offline, and surfaces a clear server-offline hint.
- Extension badge now shows active queued/running task count.
- Extension now sends native completion notifications when tasks transition from queued/running to done/error/canceled.
- `pipedl-server` tray window refreshed with a modern dark UI, accent colors, status indicator dot, and improved log window styling.
- README and setup docs now explicitly note running setup/start scripts with Administrator rights.
- Docs now explicitly confirm that setup still prompts for auto-run at login.

### Changed
- `/api/download` now enqueues tasks (`queued` status) instead of immediate direct execution.
- Task status responses now include `queue_position` while queued.
- Web UI advanced options now include “Skip duplicates (archive)”.
- Download options now accept `exactFormat` for precise stream selection.
- UI now persists mode and post-download behavior preferences.
- UI now persists task filter preference.
- Top toolbar is now sticky with glass styling for easier access while scrolling.
- Root README copy/style refreshed to better match the PipeDL brand tone while keeping structure intact.
- README top section polished (hero line, compact badge row, stronger launch CTA copy).
- `app.py` now supports `--no-debug` / `PIPEDL_DEBUG=0` for stable background and tray execution.
- `run.ps1` now starts `pipedl-server` tray mode by default; use `-Terminal` for classic terminal backend mode.
- README setup flow clarified for tray-default startup and added `git pull` note when local copies still launch terminal mode.

### Fixed
- Fixed queue deadlock in `/api/download` caused by nested locking during task trimming.
- Better queue visibility in UI status hint (shows queued position before running).
- Moved `pipedl_archive.txt` out of the Downloads output folder into `~/.pipedl/` to keep downloads clean.
- Adjusted YouTube in-page PipeDL button wrapper/sizing to avoid cropping or visual breakage of adjacent YouTube action buttons.

## [2026-02-18]

### Added
- Public release readiness docs:
  - `LICENSE` (MIT)
  - `SECURITY.md`
  - `docs/PUBLIC_RELEASE_CHECKLIST.md`
  - `docs/RELEASE_TEMPLATE.md`
  - `setup.ps1` and `run.ps1`
  - GitHub issue templates (`bug_report`, `feature_request`)
- Brave YouTube in-page AeroDL/PipeDL action button and styled dropdown menu.
- Keyboard support in menu (Arrow keys, Enter, Escape).
- PipeDL one-line quick-start commands in README.

### Changed
- Project renamed from **AeroDL** to **PipeDL** across app, extension, and docs.
- GitHub repository renamed from `aerodl` to `pipedl`.
- Download output path changed to local machine folder (`Downloads/PipeDL`).
- Root README redesigned/polished for public-facing usage.
- YouTube button icon refined to YouTube-like stroke style.
- Main web UI slightly modernized (subtle glass/grid polish).
- Release template updated with explicit release date fields.

### Fixed
- Removed PC-specific absolute paths from docs.
- Stopped tracking Python cache artifact (`__pycache__/app.cpython-312.pyc`).
- Improved YouTube menu positioning/overflow handling to avoid off-screen clipping.

---

## Changelog workflow

- Add entries under **[Unreleased]** as work happens.
- On release, move items into a dated section (e.g. `## [YYYY-MM-DD]`).
- Keep entries short and user-visible (Added/Changed/Fixed).
