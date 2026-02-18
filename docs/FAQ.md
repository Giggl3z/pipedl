# PipeDL FAQ

## Do I need to keep a terminal open?
No, if you use `pipedl-server` (`.\run-tray.ps1`). It keeps server control in the system tray.

## Why does the extension say "server offline"?
The local backend is not reachable at the configured URL (default `http://localhost:5000`). Start `pipedl-server` or run `.\run.ps1`.

## Can the extension run downloads by itself?
No. Browser extensions cannot execute `yt-dlp` directly.

## Where are files downloaded?
Default folder:
`C:\Users\<you>\Downloads\PipeDL`

## Can I change concurrency?
Yes. In web UI queue controls, or via `POST /api/settings` with `{"concurrency": N}`.

## Can I retry failed tasks quickly?
Yes. Use **Retry Failed** in the web UI (calls `POST /api/retry-failed`).

## Is PipeDL multi-user/server-hosted?
Current default design is local single-user usage on your machine.

## Does PipeDL persist task history after restart?
Not yet. Current task list is in-memory.

## How do I auto-start PipeDL on login?
Run:
```powershell
.\install-tray-autostart.ps1
```
Remove it with:
```powershell
.\uninstall-tray-autostart.ps1
```

## Is this legal to use?
You are responsible for complying with platform ToS and local laws.
