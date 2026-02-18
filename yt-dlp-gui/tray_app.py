import os
import sys
import time
import threading
import subprocess
from urllib.request import urlopen
from urllib.error import URLError
import tkinter as tk
from tkinter import ttk

import pystray
from PIL import Image, ImageDraw

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVER_CMD = [sys.executable, "app.py", "--no-debug"]
SERVER_URL = "http://127.0.0.1:5000/api/settings"
WEB_URL = "http://127.0.0.1:5000"
LOG_PATH = os.path.join(BASE_DIR, "pipedl-server.log")


class PipeDLTrayApp:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("pipedl-server")
        self.root.geometry("420x260")
        self.root.resizable(False, False)
        self.root.protocol("WM_DELETE_WINDOW", self.hide_window)

        self.server_proc = None
        self.server_log_handle = None
        self.icon = None
        self.running = True

        self.status_var = tk.StringVar(value="Server: checking...")
        self.toggle_var = tk.StringVar(value="Start Server")

        self._build_ui()

    def _build_ui(self):
        frame = ttk.Frame(self.root, padding=14)
        frame.pack(fill="both", expand=True)

        title = ttk.Label(frame, text="pipedl-server", font=("Segoe UI", 16, "bold"))
        title.pack(anchor="w")

        subtitle = ttk.Label(frame, text="server controller", font=("Segoe UI", 10))
        subtitle.pack(anchor="w", pady=(0, 10))

        status = ttk.Label(frame, textvariable=self.status_var, font=("Segoe UI", 11))
        status.pack(anchor="w", pady=(0, 12))

        actions = ttk.Frame(frame)
        actions.pack(fill="x", pady=(0, 8))

        self.toggle_btn = ttk.Button(actions, textvariable=self.toggle_var, command=self.toggle_server)
        self.toggle_btn.pack(side="left", padx=(0, 8))

        ttk.Button(actions, text="Open Web UI", command=self.open_web).pack(side="left", padx=(0, 8))
        ttk.Button(actions, text="View Console Logs", command=self.open_logs_window).pack(side="left")

        bottom = ttk.Frame(frame)
        bottom.pack(fill="x", side="bottom", pady=(16, 0))
        ttk.Button(bottom, text="Hide to Tray", command=self.hide_window).pack(side="left")
        ttk.Button(bottom, text="Exit", command=self.exit_app).pack(side="right")

    def create_icon_image(self):
        img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        draw.rounded_rectangle((4, 4, 60, 60), radius=14, fill=(21, 34, 61, 255), outline=(110, 212, 255, 255), width=2)
        draw.text((20, 16), "P", fill=(110, 212, 255, 255))
        return img

    def create_tray_icon(self):
        menu = pystray.Menu(
            pystray.MenuItem("Show", self.show_window),
            pystray.MenuItem("Open Web UI", self.open_web),
            pystray.MenuItem("Start/Stop Server", self.toggle_server),
            pystray.MenuItem("Exit", self.exit_app),
        )
        self.icon = pystray.Icon("pipedl-server", self.create_icon_image(), "pipedl-server", menu)
        threading.Thread(target=self.icon.run, daemon=True).start()

    def is_server_up(self):
        try:
            with urlopen(SERVER_URL, timeout=1.5) as r:
                return r.status == 200
        except URLError:
            return False
        except Exception:
            return False

    def start_server(self):
        if self.server_proc and self.server_proc.poll() is None:
            return
        if self.is_server_up():
            # Another server instance is already running (likely external/manual)
            return

        self.server_log_handle = open(LOG_PATH, "a", encoding="utf-8")
        self.server_proc = subprocess.Popen(
            SERVER_CMD,
            cwd=BASE_DIR,
            stdout=self.server_log_handle,
            stderr=subprocess.STDOUT,
            text=True,
        )

    def stop_server(self):
        if not self.server_proc:
            return
        if self.server_proc.poll() is None:
            try:
                self.server_proc.terminate()
                self.server_proc.wait(timeout=5)
            except Exception:
                try:
                    self.server_proc.kill()
                except Exception:
                    pass

        self.server_proc = None
        if self.server_log_handle:
            try:
                self.server_log_handle.close()
            except Exception:
                pass
            self.server_log_handle = None

    def toggle_server(self, *args):
        managed_running = self.server_proc and self.server_proc.poll() is None
        external_running = self.is_server_up() and not managed_running

        if managed_running:
            self.stop_server()
        elif external_running:
            # External server is running; tray cannot safely stop what it didn't start.
            self.show_window()
        else:
            self.start_server()

        self.update_status_once()

    def update_status_once(self):
        up = self.is_server_up()
        managed_running = self.server_proc and self.server_proc.poll() is None

        if up and managed_running:
            self.status_var.set("Server: ONLINE (managed by tray)")
            self.toggle_var.set("Shutdown Server")
            self.toggle_btn.configure(state="normal")
        elif up:
            self.status_var.set("Server: ONLINE (external instance)")
            self.toggle_var.set("Server running externally")
            self.toggle_btn.configure(state="disabled")
        else:
            self.status_var.set("Server: OFFLINE")
            self.toggle_var.set("Start Server")
            self.toggle_btn.configure(state="normal")

    def poll_status_loop(self):
        while self.running:
            self.root.after(0, self.update_status_once)
            time.sleep(2)

    def open_web(self, *args):
        import webbrowser
        webbrowser.open(WEB_URL)

    def open_logs_window(self):
        win = tk.Toplevel(self.root)
        win.title("pipedl-server logs")
        win.geometry("780x460")

        text = tk.Text(win, wrap="word", font=("Consolas", 10))
        text.pack(fill="both", expand=True)

        def refresh():
            try:
                with open(LOG_PATH, "r", encoding="utf-8", errors="ignore") as f:
                    data = f.read()
            except FileNotFoundError:
                data = "No log file yet. Start the server first."

            text.delete("1.0", "end")
            text.insert("1.0", data[-25000:])
            text.see("end")

        refresh_btn = ttk.Button(win, text="Refresh", command=refresh)
        refresh_btn.pack(anchor="e", padx=8, pady=6)
        refresh()

    def hide_window(self, *args):
        self.root.withdraw()

    def show_window(self, *args):
        self.root.deiconify()
        self.root.lift()
        self.root.focus_force()

    def exit_app(self, *args):
        self.running = False
        self.stop_server()
        if self.icon:
            self.icon.stop()
        self.root.quit()

    def run(self):
        self.create_tray_icon()
        self.start_server()
        self.update_status_once()
        threading.Thread(target=self.poll_status_loop, daemon=True).start()
        self.root.mainloop()


if __name__ == "__main__":
    PipeDLTrayApp().run()
