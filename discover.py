#!/usr/bin/env python3
"""
Scans /etc/nginx/sites-enabled for real hostnames and appends anything
missing from data.json into a "New — needs review" group, so a freshly
deployed site always shows up on the dashboard even before anyone gets
around to picking a real icon/description/group for it.

Idempotent: matches purely on hostname, so re-running never duplicates
an entry once it exists anywhere in data.json (including ones already
moved out of the New group by hand).
"""
import glob
import json
import re
import sys

DATA_PATH = "/var/www/homepage/public/data.json"
NGINX_ENABLED = "/etc/nginx/sites-enabled/*"
SELF_HOSTNAME = "home.dibberlab.me"
NEW_GROUP = "New — needs review"

def existing_hostnames(groups):
    hosts = set()
    for g in groups:
        for item in g.get("items", []):
            m = re.search(r"://([^/]+)", item.get("url", ""))
            if m:
                hosts.add(m.group(1).lower().removeprefix("www."))
    return hosts

def nginx_hostnames():
    hosts = set()
    for path in glob.glob(NGINX_ENABLED):
        try:
            with open(path, encoding="utf-8", errors="ignore") as f:
                text = f.read()
        except (IsADirectoryError, OSError):
            continue
        for m in re.finditer(r"server_name\s+([^;]+);", text):
            for name in m.group(1).split():
                name = name.strip().lower()
                if name in ("_", "") or "~" in name or "*" in name:
                    continue
                hosts.add(name.removeprefix("www."))
    hosts.discard(SELF_HOSTNAME)
    return hosts

def main():
    with open(DATA_PATH, encoding="utf-8") as f:
        groups = json.load(f)

    known = existing_hostnames(groups)
    found = nginx_hostnames()
    missing = sorted(found - known)

    if not missing:
        print("no new sites")
        return

    new_group = next((g for g in groups if g["group"] == NEW_GROUP), None)
    if new_group is None:
        new_group = {"group": NEW_GROUP, "items": []}
        groups.append(new_group)

    for host in missing:
        new_group["items"].append({
            "name": host,
            "sub": "Auto-discovered — pick a real name/icon/group",
            "icon": "fa-solid fa-circle-question",
            "url": f"https://{host}",
        })
        print(f"added: {host}")

    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(groups, f, indent=2)
        f.write("\n")

if __name__ == "__main__":
    sys.exit(main())
