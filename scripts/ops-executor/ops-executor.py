#!/usr/bin/env python3

import json
import os
import subprocess
from http.server import BaseHTTPRequestHandler, HTTPServer

from ops_executor import get_livekit_status


HOST = os.environ.get("OPS_EXECUTOR_HOST", "0.0.0.0")
PORT = int(os.environ.get("OPS_EXECUTOR_PORT", "9110"))
PROJECT_DIR = os.environ.get("OPS_PROJECT_DIR", "/var/www/tailchat-source")
COMPOSE_FILE = os.environ.get("OPS_COMPOSE_FILE", "docker-compose.yml")
EXECUTOR_SHARED_SECRET = os.environ.get("EXECUTOR_SHARED_SECRET", "")


def run_compose(args):
    p = subprocess.run(
        ["docker", "compose", "-f", COMPOSE_FILE] + args,
        cwd=PROJECT_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        timeout=60,
    )
    return p.returncode, p.stdout


class Handler(BaseHTTPRequestHandler):
    def _json(self, status, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _check_auth(self):
        if not EXECUTOR_SHARED_SECRET:
            self._json(500, {"ok": False, "error": "Missing EXECUTOR_SHARED_SECRET"})
            return False
        got = self.headers.get("X-Executor-Secret", "")
        if got != EXECUTOR_SHARED_SECRET:
            self._json(401, {"ok": False, "error": "Unauthorized"})
            return False
        return True

    def do_GET(self):
        if self.path == "/health":
            self._json(200, {"ok": True})
            return

        if self.path == "/livekit/ps":
            if not self._check_auth():
                return
            code, out = run_compose(["ps", "livekit"])
            self._json(200, {"ok": code == 0, "output": out})
            return

        if self.path == "/livekit/status":
            if not self._check_auth():
                return
            self._json(200, get_livekit_status())
            return

        self._json(404, {"ok": False, "error": "Not Found"})

    def do_POST(self):
        if self.path.startswith("/livekit/"):
            if not self._check_auth():
                return

            if self.path == "/livekit/start":
                code, out = run_compose(["up", "-d", "livekit"])
                self._json(200, {"ok": code == 0, "output": out})
                return

            if self.path == "/livekit/stop":
                code, out = run_compose(["stop", "livekit"])
                self._json(200, {"ok": code == 0, "output": out})
                return

            if self.path == "/livekit/restart":
                code, out = run_compose(["restart", "livekit"])
                self._json(200, {"ok": code == 0, "output": out})
                return

        self._json(404, {"ok": False, "error": "Not Found"})


def main():
    httpd = HTTPServer((HOST, PORT), Handler)
    httpd.serve_forever()


if __name__ == "__main__":
    main()
