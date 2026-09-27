"""Validates every example in specifications/ against its specification's schema (constitution principle II).

An example is a `*.dedl` or `*.json` file that names its schema in `$schema`, such as
`https://etalii.net/adp/dedl/schema/0.1/dedl.schema.json#/$defs/Definition`. The part before `#` is matched
against the `$id` of a `*.schema.json` in this repository, so the schema in the same commit is used, never the
published one. Prints one line per example and exits 1 when any example is invalid or names an unknown schema.
"""
import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator
from referencing import Registry, Resource

root = Path(__file__).resolve().parents[2] / "specifications"

schemas = {}
for path in sorted(root.rglob("*.schema.json")):
    schema = json.loads(path.read_text(encoding="utf-8"))
    schemas[schema["$id"]] = schema
registry = Registry().with_resources(
    (uri, Resource.from_contents(schema)) for uri, schema in schemas.items()
)

failures = 0
examples = [p for p in sorted(root.rglob("*")) if p.suffix in (".dedl", ".json") and not p.name.endswith(".schema.json")]
for path in examples:
    name = path.relative_to(root.parent).as_posix()
    try:
        document = json.loads(path.read_text(encoding="utf-8"))
    except ValueError as error:
        print(f"FAIL {name}: not JSON: {error}")
        failures += 1
        continue
    reference = document.get("$schema", "") if isinstance(document, dict) else ""
    uri, _, fragment = reference.partition("#")
    if uri not in schemas:
        print(f"FAIL {name}: $schema {reference!r} names no schema in this repository")
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
        print(f"ok   {name}")

print(f"{len(examples)} example(s), {failures} invalid.")
sys.exit(1 if failures or not examples else 0)
