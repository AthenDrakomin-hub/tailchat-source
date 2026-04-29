import json
import os
import subprocess


PROJECT_DIR = os.environ.get("OPS_PROJECT_DIR", "/var/www/tailchat-source")
COMPOSE_FILE = os.environ.get("OPS_COMPOSE_FILE", "docker-compose.yml")


def parse_compose_ps_json(items):
    if not items:
        return {
            "ok": True,
            "service": "livekit",
            "state": "not_found",
            "containerName": "",
            "image": "",
            "ports": [],
            "uptime": "",
        }

    item = items[0] if isinstance(items, list) else items
    name = item.get("Name") or item.get("name") or ""
    state = item.get("State") or item.get("state") or ""
    status = item.get("Status") or item.get("status") or ""
    image = item.get("Image") or item.get("image") or ""
    pubs = item.get("Publishers") or item.get("publishers") or []
    ports = []
    for p in pubs:
        url = p.get("URL") or p.get("url")
        target = p.get("TargetPort") or p.get("targetPort")
        proto = p.get("Protocol") or p.get("protocol")
        if url and target and proto:
            ports.append(f"{url}->{target}/{proto}")

    normalized = "not_found"
    if isinstance(state, str):
        if state.lower() == "running":
            normalized = "running"
        elif state:
            normalized = "exited"

    return {
        "ok": True,
        "service": "livekit",
        "state": normalized,
        "containerName": name,
        "image": image,
        "ports": ports,
        "uptime": status,
    }


def _run_compose(args):
    p = subprocess.run(
        ["docker", "compose", "-f", COMPOSE_FILE] + args,
        cwd=PROJECT_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        timeout=30,
    )
    return p.returncode, p.stdout


def get_livekit_status():
    log_command = f"cd {PROJECT_DIR} && docker compose -f {COMPOSE_FILE} logs -n 200 livekit"

    code, out = _run_compose(["ps", "--format", "json", "livekit"])
    if code == 0:
        try:
            items = json.loads(out or "[]")
            data = parse_compose_ps_json(items)
            data["logCommand"] = log_command
            return data
        except Exception:
            pass

    code, out = _run_compose(["ps", "--format", "{{json .}}", "livekit"])
    if code == 0:
        try:
            lines = [l.strip() for l in (out or "").splitlines() if l.strip()]
            items = [json.loads(l) for l in lines]
            data = parse_compose_ps_json(items)
            data["logCommand"] = log_command
            return data
        except Exception:
            pass

    code, out = _run_compose(["ps", "livekit"])
    if code != 0:
        return {"ok": False, "error": out.strip() or "compose ps failed", "logCommand": log_command}

    lines = [l.rstrip("\n") for l in (out or "").splitlines()]
    data_lines = [l for l in lines[2:] if l.strip()] if len(lines) >= 3 else []
    if not data_lines:
        return {
            "ok": True,
            "service": "livekit",
            "state": "not_found",
            "containerName": "",
            "image": "",
            "ports": [],
            "uptime": "",
            "logCommand": log_command,
        }

    row = data_lines[0]
    normalized = "running" if "Up" in row else ("exited" if "Exit" in row else "not_found")
    return {
        "ok": True,
        "service": "livekit",
        "state": normalized,
        "containerName": "",
        "image": "",
        "ports": [],
        "uptime": row.strip(),
        "logCommand": log_command,
    }

