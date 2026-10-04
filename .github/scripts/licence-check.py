#!/usr/bin/env python3
"""Checks the repository licence and every specification's licence statement (spec 003, contracts/licence-check.md).

Usage: licence-check.py

The etalii.adp.site refresh publishes a version of a language only under the licence GitHub identifies for this
repository, and records the first `Copyright` line of that file as the copyright holder. This script keeps both true
without the network: LICENSE must hold the Apache License 2.0 terms (a pinned hash, stricter than GitHub's own
comparison) and one copyright line, no second licence file may sit at the root or under specifications/, and every
specification document, found by the constitution's naming rule specifications/<name>/<NAME>-specification.md, must
state the repository's licence in a `Licence` row of its header table. Every failure is reported, not only the first.
Exit code: 0 when nothing failed and at least one specification document was found, 1 otherwise.
"""

import hashlib
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

SPDX_ID = "Apache-2.0"
LICENCE_NAME = "Apache License 2.0"
LICENCE_LINK = "https://github.com/etalii-adp/etalii.adp/blob/develop/LICENSE"
COPYRIGHT = "Copyright © Peter Vrenken 2026"

# SHA-256 of the Apache License 2.0 terms, from the first line up to and including END OF TERMS AND CONDITIONS, runs
# of whitespace collapsed to one space. Computed from LICENSE at 3396177, which GitHub identifies as Apache-2.0, and
# equal to the same computation over https://www.apache.org/licenses/LICENSE-2.0.txt.
TERMS_END = "END OF TERMS AND CONDITIONS"
TERMS_SHA256 = "59d8f0ba87ad9a2f1a431123c8d16646e5b89ba53653e818f16d136d77263c99"

LICENCE_FILE_NAME = re.compile(r"^(licen[cs]e|copying|unlicense)", re.IGNORECASE)
CODE_SPAN = re.compile(r"`([^`]+)`")


class Report:
    def __init__(self) -> None:
        self.failures = 0

    def ok(self, path: str, note: str = "") -> None:
        print(f"ok   {path}{': ' + note if note else ''}")

    def fail(self, path: str, cause: str) -> None:
        self.failures += 1
        print(f"FAIL {path}: {cause}")


def check_licence_file(report: Report) -> None:
    path = ROOT / "LICENSE"
    if not path.is_file():
        report.fail("LICENSE", "missing")
        return
    text = path.read_text(encoding="utf-8")
    failed = report.failures

    end = text.find(TERMS_END)
    terms = text[: end + len(TERMS_END)] if end >= 0 else text
    if end < 0 or hashlib.sha256(" ".join(terms.split()).encode("utf-8")).hexdigest() != TERMS_SHA256:
        report.fail("LICENSE", "its terms are not the Apache License 2.0")

    lines = [line.strip() for line in text.splitlines() if line.lstrip().startswith("Copyright ")]
    filled = [line for line in lines if not re.search(r"\[[^\]]*\]", line)]
    if filled != [COPYRIGHT]:
        found = "; ".join(f"'{line}'" for line in lines) if lines else "none"
        report.fail("LICENSE", f"expected one copyright line, '{COPYRIGHT}', found {found}")

    if report.failures == failed:
        report.ok("LICENSE", f"{SPDX_ID}, {COPYRIGHT}")


def check_second_licence_files(report: Report) -> None:
    tracked = subprocess.run(
        ["git", "ls-files", "-z"], cwd=ROOT, capture_output=True, text=True, encoding="utf-8", check=True
    ).stdout.split("\0")
    for name in sorted(filter(None, tracked)):
        parts = name.split("/")
        if name == "LICENSE" or not LICENCE_FILE_NAME.match(parts[-1]):
            continue
        if len(parts) == 1 or parts[0] == "specifications":
            report.fail(name, "a second licence file; the repository keeps one, LICENSE at its root")


def header_table(text: str) -> list[list[str]]:
    """The rows of the document's first table, each as its stripped cells, the delimiter row left out."""
    rows: list[list[str]] = []
    for line in text.splitlines():
        if line.lstrip().startswith("|"):
            cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
            if not all(re.fullmatch(r":?-+:?", cell) for cell in cells):
                rows.append(cells)
        elif rows:
            break
    return rows


def check_statement(report: Report, document: Path) -> None:
    relative = document.relative_to(ROOT).as_posix()
    rows = [row for row in header_table(document.read_text(encoding="utf-8")) if row[0] == "Licence"]
    if not rows:
        report.fail(relative, "no Licence row in its header table")
        return
    if len(rows) > 1:
        report.fail(relative, "more than one Licence row in its header table")
        return
    value = " | ".join(rows[0][1:])
    failed = report.failures

    codes = CODE_SPAN.findall(value)
    if SPDX_ID not in codes:
        report.fail(relative, f"states {codes[0] if codes else 'no SPDX id'}, the repository's licence is {SPDX_ID}")
    if LICENCE_NAME not in value:
        report.fail(relative, "the Licence row does not name the Apache License 2.0")
    if f"]({LICENCE_LINK})" not in value:
        report.fail(relative, f"the Licence row does not link {LICENCE_LINK}")

    if report.failures == failed:
        report.ok(relative)


def check_specifications(report: Report) -> int:
    documents = 0
    for folder in sorted(path for path in (ROOT / "specifications").iterdir() if path.is_dir()):
        document = folder / f"{folder.name.upper()}-specification.md"
        if not document.is_file():
            report.fail(folder.relative_to(ROOT).as_posix(), f"no {document.name}")
            continue
        documents += 1
        check_statement(report, document)
    return documents


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    report = Report()
    check_licence_file(report)
    check_second_licence_files(report)
    documents = check_specifications(report)
    print(f"{documents} specification document(s), {report.failures} failure(s).")
    return 0 if report.failures == 0 and documents > 0 else 1


if __name__ == "__main__":
    sys.exit(main())
