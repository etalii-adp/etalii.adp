"""Validates every example in specifications/, and every tool definition in definitions/, against its specification's
schema (constitution principle II).

An example is a DISL specification (`*.dis`), a DID definition (`*.did`), an FBL document (`*.fbl`), or a `*.json`
file that names its schema in `$schema`. The extension decides the schema: `*.dis` against
`disl.schema.json#/$defs/Specification`, `*.did` against `did.schema.json#/$defs/Definition`, `*.fbl` against
`fbl.schema.json#/$defs/Document`. A `$schema` the example names must agree with that; its part before `#`
is matched against the `$id` of a `*.schema.json` in this repository, so the schemas in the same commit are used,
never the published ones. All schemas are loaded into one registry, so DID's references to DISL resolve.

The legacy fixtures under `specifications/*/legacy/` keep the identifiers of the earlier combined format, and the `.disl`
extension DISL specifications had before `.dis`, which DISL and DID still read as deprecated aliases (DISL section 18,
DID section 11). They are validated through the alias
table below. A file outside a `legacy/` folder that uses a deprecated alias fails: aliases are read, never written.

Two FBL formats are not JSON documents and get their own treatment (spec 005, contracts/validator.md). An `.adp`
registration under `specifications/fbl/` is parsed from its line form into `fbl.schema.json#/$defs/Registration`
(FBL section 8). A `fixture.json` under `specifications/fbl/fixtures/` is validated against `$defs/Fixture` and then
replayed: every step's splices must turn the document before the step into the document it expects, byte for byte,
and an undo must return the document the undone edit started from (FBL section 15.3).

Prints one line per example and exits 1 when any example is invalid or names an unknown schema.
"""
import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator
from referencing import Registry, Resource

repository = Path(__file__).resolve().parents[2]
root = repository / "specifications"
# The tool definitions (definitions/diagrams/*.dis and, later, designers and editors) are checked the same way.
folders = [root, repository / "definitions"]

DISL = "https://etalii.net/adp/disl/schema/0.1/disl.schema.json#/$defs/Specification"
DID = "https://etalii.net/adp/did/schema/0.1/did.schema.json#/$defs/Definition"
FBL = "https://etalii.net/adp/fbl/schema/0.1/fbl.schema.json#/$defs/Document"
FBL_REGISTRATION = "https://etalii.net/adp/fbl/schema/0.1/fbl.schema.json#/$defs/Registration"
FBL_FIXTURE = "https://etalii.net/adp/fbl/schema/0.1/fbl.schema.json#/$defs/Fixture"
CURRENT_EXTENSIONS = {".dis": DISL, ".did": DID, ".fbl": FBL}
CURRENT_VERSION_KEYS = {"disl": DISL, "did": DID, "fbl": FBL}

# Alias table: each deprecated identifier and the current schema reference it is read as.
LEGACY = "https://etalii.net/adp/dedl/schema/0.1/dedl.schema.json"
ALIAS_SCHEMAS = {LEGACY: DISL, LEGACY + "#/$defs/Definition": DISL, LEGACY + "#/$defs/Document": DID}
ALIAS_EXTENSIONS = {".dedl": DISL, ".disl": DISL}
ALIAS_VERSION_KEYS = {"dedl": DISL, "dedlDocument": DID}

schemas = {}
for path in sorted(root.rglob("*.schema.json")):
    schema = json.loads(path.read_text(encoding="utf-8"))
    schemas[schema["$id"]] = schema
registry = Registry().with_resources(
    (uri, Resource.from_contents(schema)) for uri, schema in schemas.items()
)


def is_fbl_file(path: Path) -> bool:
    return (root / "fbl") in path.parents


def is_example(path: Path) -> bool:
    if path.name.endswith(".schema.json") or not path.is_file():
        return False
    if path.suffix == ".adp":
        return is_fbl_file(path)
    if is_fbl_file(path) and "fixtures" in path.relative_to(root / "fbl").parts and path.name != "fixture.json":
        return False  # a fixture's input and expected bodies are checked through its fixture.json
    return path.suffix in CURRENT_EXTENSIONS or path.suffix in ALIAS_EXTENSIONS or path.suffix == ".json"


def parse_registration(data: bytes):
    """Parses an .adp registration's line form (FBL section 8.1) into $defs/Registration, or returns a problem."""
    text = data.decode("utf-8").removeprefix("﻿")
    lines = text.splitlines()
    if not lines or not lines[0].strip():
        return None, "line 1 must name the origin"
    registration = {"origin": lines[0].strip()}
    block = None
    for number, line in enumerate(lines[1:], start=2):
        if not line.strip():
            continue
        if block and line[:1] in (" ", "\t"):
            key, separator, value = line.strip().rpartition(": ")
            if not separator:
                return None, f"line {number}: expected '<key>: <value>' in the {block} block"
            if block == "layout":
                try:
                    x, y = (float(part) for part in value.split())
                except ValueError:
                    return None, f"line {number}: expected '<id>: <x> <y>'"
                registration["layout"][key] = {"x": x, "y": y}
            else:
                registration["identities"][key] = value
            continue
        if line in ("layout:", "identities:"):
            block = line[:-1]
            registration[block] = {}
            continue
        if block:
            return None, f"line {number}: nothing may follow the {block} block except another block"
        key, separator, value = line.partition(": ")
        if not separator:
            return None, f"line {number}: expected a '<key>: <value>' header"
        if key in ("body", "view", "resource"):
            registration[key] = value
        else:
            registration.setdefault("headers", {})[key] = value
    return registration, None


def apply_splices(document: bytes, splices):
    """Applies a step's splices (UTF-8 byte offsets into the document before the step). Returns the result, the
    document the inverse splices give back, and a problem, if any."""
    ordered = sorted(splices, key=lambda splice: (splice["start"], splice["end"]))
    previous_end = 0
    for splice in ordered:
        if splice["start"] > splice["end"] or splice["end"] > len(document):
            return None, None, f"splice {splice['start']}..{splice['end']} is outside the document"
        if splice["start"] < previous_end:
            return None, None, f"splice {splice['start']}..{splice['end']} overlaps the one before it"
        previous_end = splice["end"]
    result, inverses, delta = document, [], 0
    for splice in ordered:
        text = splice["text"].encode("utf-8")
        replaced = document[splice["start"]:splice["end"]]
        start = splice["start"] + delta
        result = result[:start] + text + result[start + len(replaced):]
        inverses.append((start, start + len(text), replaced))
        delta += len(text) - len(replaced)
    restored = result
    for start, end, replaced in reversed(inverses):
        restored = restored[:start] + replaced + restored[end:]
    return result, restored, None


def first_difference(a: bytes, b: bytes) -> int:
    return next((i for i, (x, y) in enumerate(zip(a, b)) if x != y), min(len(a), len(b)))


def replay_fixture(path: Path, fixture) -> str | None:
    """Replays a fixture's steps (FBL section 15.3) and returns the first problem, if any."""
    folder = path.parent
    document = (folder / fixture["input"]).read_bytes()
    done, undone = [], []  # (before, after) of each edit that can be undone, and of each that can be redone
    for index, step in enumerate(fixture["steps"], start=1):
        if "expectFile" in step:
            expected = (folder / step["expectFile"]).read_bytes()
        elif "expect" in step:
            expected = step["expect"].encode("utf-8")
        else:
            expected = document
        result, restored, problem = apply_splices(document, step["splices"])
        if problem:
            return f"step {index}: {problem}"
        if result != expected:
            return f"step {index}: the splices give a different document, first at byte {first_difference(result, expected)}"
        if restored != document:
            return f"step {index}: the inverse splices do not restore the document before the step"
        edit = step.get("edit", {})
        if step.get("undo"):
            if not done:
                return f"step {index}: nothing to undo"
            before, after = done.pop()
            if document != after or result != before:
                return f"step {index}: the undo does not return the document the undone edit started from"
            undone.append((before, after))
        elif step.get("redo"):
            if not undone:
                return f"step {index}: nothing to redo"
            before, after = undone.pop()
            if document != before or result != after:
                return f"step {index}: the redo does not return the document the edit produced"
            done.append((before, after))
        elif step.get("refused") or "save" in edit:
            if result != document:
                return f"step {index}: a refused edit or a save without change must leave the document as it is"
        else:
            done.append((document, result))
            undone.clear()
        document = result
    return None


def expected_reference(path: Path, document) -> tuple[str | None, list[str], str | None]:
    """Returns the schema reference to validate against, the deprecated aliases used, and a problem, if any."""
    aliases = []
    by_extension = CURRENT_EXTENSIONS.get(path.suffix)
    if path.suffix in ALIAS_EXTENSIONS:
        by_extension = ALIAS_EXTENSIONS[path.suffix]
        aliases.append(f"extension {path.suffix}")
    fields = document if isinstance(document, dict) else {}
    declared = fields.get("$schema")
    by_schema = None
    if declared:
        by_schema = ALIAS_SCHEMAS.get(declared, declared)
        if declared in ALIAS_SCHEMAS:
            aliases.append(f"$schema {declared}")
    by_version = None
    for key, reference in ALIAS_VERSION_KEYS.items():
        if key in fields:
            aliases.append(f"version key {key!r}")
            by_version = reference
    for key, reference in CURRENT_VERSION_KEYS.items():
        if key in fields:
            by_version = by_version or reference
    reference = by_extension or by_schema or by_version
    if reference is None:
        return None, aliases, "names no schema ($schema, extension or version key)"
    if by_schema and by_schema != reference:
        return None, aliases, f"$schema {declared!r} does not match the schema its extension requires ({reference})"
    if reference.partition("#")[0] not in schemas:
        return None, aliases, f"schema {reference!r} is not in this repository"
    return reference, aliases, None


failures = 0
examples = [p for folder in folders for p in sorted(folder.rglob("*")) if is_example(p)]
for path in examples:
    name = path.relative_to(repository).as_posix()
    legacy = "legacy" in path.relative_to(repository).parts
    if path.suffix == ".adp":
        document, problem = parse_registration(path.read_bytes())
        reference, aliases = FBL_REGISTRATION, []
    else:
        try:
            document = json.loads(path.read_text(encoding="utf-8"))
        except ValueError as error:
            print(f"FAIL {name}: not JSON: {error}")
            failures += 1
            continue
        if path.name == "fixture.json" and is_fbl_file(path):
            reference, aliases, problem = FBL_FIXTURE, [], None
        else:
            reference, aliases, problem = expected_reference(path, document)
    if problem:
        print(f"FAIL {name}: {problem}")
        failures += 1
        continue
    if aliases and not legacy:
        print(f"FAIL {name}: deprecated alias outside a legacy/ folder: {', '.join(aliases)}")
        failures += 1
        continue
    validator = Draft202012Validator({"$ref": reference}, registry=registry)
    errors = sorted(validator.iter_errors(document), key=lambda e: list(e.absolute_path))
    if errors:
        failures += 1
        print(f"FAIL {name}: {len(errors)} error(s)")
        for error in errors[:10]:
            location = "/".join(str(part) for part in error.absolute_path) or "(root)"
            print(f"  at {location}: {error.message}")
    elif reference == FBL_FIXTURE and (problem := replay_fixture(path, document)):
        failures += 1
        print(f"FAIL {name}: {problem}")
    else:
        via = f" (legacy fixture, read through: {', '.join(aliases)})" if aliases else ""
        print(f"ok   {name}{via}")

print(f"{len(examples)} example(s), {failures} invalid.")
sys.exit(1 if failures or not examples else 0)
