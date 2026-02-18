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
- Extension popup autofills URL from active YouTube tab.
- Extension badge now shows active queued/running task count.

### Changed
- `/api/download` now enqueues tasks (`queued` status) instead of immediate direct execution.
- Task status responses now include `queue_position` while queued.
- Web UI advanced options now include “Skip duplicates (archive)”.
- Download options now accept `exactFormat` for precise stream selection.
- UI now persists mode and post-download behavior preferences.

### Fixed
- Fixed queue deadlock in `/api/download` caused by nested locking during task trimming.
- Better queue visibility in UI status hint (shows queued position before running).

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
