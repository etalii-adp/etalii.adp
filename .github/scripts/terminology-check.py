#!/usr/bin/env python3
"""Reports retired uses of the ADP vocabulary in a repository's tracked files (spec 002, contracts/terminology-check.md).

Usage: terminology-check.py [--repo PATH] [--name NAME] [--config FILE] [--review]

The list of retired patterns and allowances is docs/terminology-check.json in etalii.adp; --config points at it
(a path or an https URL) and defaults to the copy beside this script. Each finding is printed as
`<name>:<path>:<line>: [<id>] <matched> -- <entry>; use: <replacement>`. Findings of severity "review" are
printed only with --review and never fail the check. Exit code: 0 without errors, 1 with at least one.
"""

import argparse
import fnmatch
import json
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

HEADING = re.compile(r"^(#{1,6})\s+(.*)$")
DEFAULT_CONFIG =Path(__file__).resolve().parents[2] / "docs" / "terminology-check.json"


def load_config(source: str) -> dict:
    if source.startswith("https://"):
        with urllib.request.urlopen(source) as response:
            return json.load(response)
    return json.loads(Path(source).read_text(encoding="utf-8"))


def matches_any(path: str, globs: list[str]) -> bool:
    candidates = [path, "/" + path]
    return any(fnmatch.fnmatch(candidate, glob) or fnmatch.fnmatch(candidate, glob.removeprefix("**/")) for glob in globs for candidate in candidates)


def tracked_files(repo: Path) -> list[str]:
    result = subprocess.run(["git", "-C", str(repo), "ls-files", "-z"], capture_output=True)
    if result.returncode == 0:
        return [name for name in result.stdout.decode("utf-8").split("\0") if name]
    # Not a git checkout (an exported tree, for example): scan every file.
    return [path.relative_to(repo).as_posix() for path in repo.rglob("*") if path.is_file()]


def read_text(path: Path) -> str | None:
    data = path.read_bytes()
    if b"\0" in data[:8192]:
        return None
    try:
        return data.decode("utf-8")
    except UnicodeDecodeError:
        return data.decode("latin-1")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--repo", default=".", help="repository root to scan")
    parser.add_argument("--name", help="repository name, for per-repository allowances (default: the folder name)")
    parser.add_argument("--config", default=str(DEFAULT_CONFIG), help="path or https URL of terminology-check.json")
    parser.add_argument("--review", action="store_true", help="also print findings of severity 'review'")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    name = args.name or repo.name
    config = load_config(args.config)
    allowed_paths = config.get("allowedPaths", []) + config.get("allowedPathsByRepository", {}).get(name, [])
    literals = [item["text"] for item in config.get("allowedLiterals", [])]
    allowed_sections = config.get("allowedSections", [])
    allowed_lines = config.get("allowedLines", [])
    patterns = []
    for item in config["patterns"]:
        flags = 0 if item.get("caseSensitive") else re.IGNORECASE
        patterns.append((item, re.compile(item["regex"], flags)))

    errors = reviews = 0
    for relative in tracked_files(repo):
        if matches_any(relative, allowed_paths):
            continue
        path = repo / relative
        if not path.is_file():
            continue
        text = read_text(path)
        if text is None:
            continue
        sections = [item for item in allowed_sections if matches_any(relative, [item["path"]])]
        line_rules = [re.compile(item["regex"]) for item in allowed_lines if matches_any(relative, [item["path"]])]
        allowed_level = None
        for number, line in enumerate(text.splitlines(), start=1):
            heading = HEADING.match(line) if sections else None
            if heading:
                level = len(heading.group(1))
                if allowed_level is not None and level <= allowed_level:
                    allowed_level = None
                if any(item["heading"].lower() in heading.group(2).lower() for item in sections):
                    allowed_level = level
            if allowed_level is not None or any(rule.search(line) for rule in line_rules):
                continue
            masked = line
            for literal in literals:
                masked = masked.replace(literal, " " * len(literal))
            for item, regex in patterns:
                if "paths" in item and not matches_any(relative, item["paths"]):
                    continue
                for match in regex.finditer(masked):
                    review = item.get("severity") == "review"
                    if review:
                        reviews += 1
                        if not args.review:
                            continue
                    else:
                        errors += 1
                    print(f"{name}:{relative}:{number}: [{item['id']}] {match.group(0)} -- {item['entry']}; use: {item['replacement']}")

    print(f"{name}: {errors} error(s), {reviews} for review.", file=sys.stderr)
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
