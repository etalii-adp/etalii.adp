#!/usr/bin/env python3
"""Checks the grammar of the causal loop diagram's text body (`.cld`).

Usage: cld-grammar-check.py

`definitions/diagrams/causal-loop-diagram/cld.lark` is the grammar an LLM or a tool writes `.cld` files against, and the
guide beside it, `README.md`, carries the same grammar in its `lark` block so that the guide can be handed to a model on
its own. This checks that the two are identical, that the grammar builds with Lark's `parser="lalr"` and `strict=True`,
and that it accepts the guide's example and every `.cld` example and fixture meant to be valid. The fixtures that hold
deliberate mistakes for the readers to report (`findings`, `flow-unknown`) are left out. Every failure is reported.
Exit code: 0 when every check holds, 1 otherwise.
"""

import re
import sys
from pathlib import Path

from lark import Lark

ROOT = Path(__file__).resolve().parents[2]
FOLDER = ROOT / "definitions" / "diagrams" / "causal-loop-diagram"
REFUSED = {"findings", "flow-unknown"}


def blocks(text: str, language: str) -> list[str]:
    return re.findall(rf"```{language}\n(.*?)```", text, re.S)


def main() -> int:
    failures = []
    grammar = (FOLDER / "cld.lark").read_text(encoding="utf-8")
    guide = (FOLDER / "README.md").read_text(encoding="utf-8")
    copies = blocks(guide, "lark")
    if copies != [grammar]:
        failures.append("README.md: its lark block is not identical to cld.lark")
    try:
        parser = Lark(grammar, parser="lalr", strict=True)
    except Exception as error:
        print(f"cld.lark: does not build as strict LALR(1): {error}")
        return 1
    samples = [(f"README.md example {i + 1}", text) for i, text in enumerate(blocks(guide, "text"))]
    for path in sorted(ROOT.glob("**/*.cld")):
        if REFUSED.isdisjoint(path.relative_to(ROOT).parts) and path.stem not in REFUSED:
            samples.append((str(path.relative_to(ROOT)), path.read_text(encoding="utf-8-sig")))
    for name, text in samples:
        try:
            parser.parse(text)
        except Exception as error:
            failures.append(f"{name}: {str(error).splitlines()[0]}")
    for failure in failures:
        print(failure)
    print(f"cld.lark: {len(samples)} documents parsed, {len(failures)} failures")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
