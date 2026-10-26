#!/usr/bin/env python3
"""Checks that every tracked path can be checked out on Windows.

Usage: file-names-check.py

Windows refuses to create a file or folder whose name ends in a dot or a space, contains one of < > : " | ? * \\ or a
control character, or is a reserved device name (CON, PRN, AUX, NUL, COM0-COM9, LPT0-LPT9, with or without an
extension); and on its case-insensitive file system two paths that differ only in case become one file. A clone with
such a path cannot finish a checkout there, so `git pull` stops on every Windows machine (27 conformance files named
`after-N.` did this on 2026-10-26). Every failure is reported, not only the first.
Exit code: 0 when every tracked path is safe, 1 otherwise.
"""

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

RESERVED = {"CON", "PRN", "AUX", "NUL"} | {f"{n}{i}" for n in ("COM", "LPT") for i in range(10)}
FORBIDDEN = re.compile(r'[<>:"|?*\\\x00-\x1f]')


def problem(name: str) -> str | None:
    if name.endswith(".") or name.endswith(" "):
        return "ends in a dot or a space"
    if FORBIDDEN.search(name):
        return 'contains one of < > : " | ? * \\ or a control character'
    if name.split(".")[0].rstrip(" ").upper() in RESERVED:
        return "is a reserved device name"
    return None


def main() -> int:
    listed = subprocess.run(["git", "ls-files", "-z"], cwd=ROOT, check=True, capture_output=True).stdout
    paths = [p for p in listed.decode("utf-8").split("\0") if p]
    failures = []
    for path in paths:
        for name in path.split("/"):
            reason = problem(name)
            if reason:
                failures.append(f"{path}: '{name}' {reason}")
                break
    folded: dict[str, str] = {}
    for path in paths:
        parts = path.split("/")
        for depth in range(1, len(parts) + 1):
            prefix = "/".join(parts[:depth])
            other = folded.setdefault(prefix.casefold(), prefix)
            if other != prefix:
                failures.append(f"{prefix}: differs from {other} only in case")
                break
    for failure in sorted(set(failures)):
        print(failure, file=sys.stderr)
    if failures:
        print(f"{len(set(failures))} path(s) cannot be checked out on Windows.", file=sys.stderr)
        return 1
    print(f"{len(paths)} tracked paths, all safe on Windows.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
