"""Validates every example in specifications/ against its specification's schema (constitution principle II).

An example is a DISL specification (`*.dis`), a DID definition (`*.did`), or a `*.json` file that names its schema
in `$schema`. The extension decides the schema: `*.dis` against `disl.schema.json#/$defs/Specification`, `*.did`
against `did.schema.json#/$defs/Definition`. A `$schema` the example names must agree with that; its part before `#`
is matched against the `$id` of a `*.schema.json` in this repository, so the schemas in the same commit are used,
never the published ones. All schemas are loaded into one registry, so DID's references to DISL resolve.

The legacy fixtures under `specifications/*/legacy/` keep the identifiers of the earlier combined format, and the `.disl`
extension DISL specifications had before `.dis`, which DISL and DID still read as deprecated aliases (DISL section 18,
DID section 11). They are validated through the alias
table below. A file outside a `legacy/` folder that uses a deprecated alias fails: aliases are read, never written.

Prints one line per example and exits 1 when any example is invalid or names an unknown schema.
"""
import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator
from referencing import Registry, Resource

root = Path(__file__).resolve().parents[2] / "specifications"

DISL = "https://etalii.net/adp/disl/schema/0.1/disl.schema.json#/$defs/Specification"
DID = "https://etalii.net/adp/did/schema/0.1/did.schema.json#/$defs/Definition"
CURRENT_EXTENSIONS = {".dis": DISL, ".did": DID}
CURRENT_VERSION_KEYS = {"disl": DISL, "did": DID}

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


def is_example(path: Path) -> bool:
    if path.name.endswith(".schema.json") or not path.is_file():
        return False
    return path.suffix in CURRENT_EXTENSIONS or path.suffix in ALIAS_EXTENSIONS or path.suffix == ".json"


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
examples = [p for p in sorted(root.rglob("*")) if is_example(p)]
for path in examples:
    name = path.relative_to(root.parent).as_posix()
    legacy = "legacy" in path.relative_to(root).parts
    try:
        document = json.loads(path.read_text(encoding="utf-8"))
    except ValueError as error:
        print(f"FAIL {name}: not JSON: {error}")
        failures += 1
        continue
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
    else:
        via = f" (legacy fixture, read through: {', '.join(aliases)})" if aliases else ""
        print(f"ok   {name}{via}")

print(f"{len(examples)} example(s), {failures} invalid.")
sys.exit(1 if failures or not examples else 0)
