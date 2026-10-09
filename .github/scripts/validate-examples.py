"""Validates every example in specifications/, and every tool definition in definitions/, against its specification's
schema (constitution principle II).

An example is a DISL specification (`*.dis`), a DID definition (`*.did`), an FBL document (`*.fbl`), a DESL
specification (`*.des`), or a `*.json` file that names its schema in `$schema`. The extension decides the schema: `*.dis` against
`disl.schema.json#/$defs/Specification`, `*.did` against `did.schema.json#/$defs/Definition`, `*.fbl` against
`fbl.schema.json#/$defs/Document`, `*.des` against `desl.schema.json#/$defs/Specification`. A `$schema` the example names must agree with that; its part before `#`
is matched against the `$id` of a `*.schema.json` in this repository, so the schemas in the same commit are used,
never the published ones. All schemas are loaded into one registry, so DID's references to DISL resolve. A `$schema`
naming an earlier version of DISL or DID (0.1) is read against the current schema, because 0.2 keeps every 0.1 document valid.

The legacy fixtures under `specifications/*/legacy/` keep the identifiers of the earlier combined format, and the `.disl`
extension DISL specifications had before `.dis`, which DISL and DID still read as deprecated aliases (DISL section 18,
DID section 11). They are validated through the alias
table below. A file outside a `legacy/` folder that uses a deprecated alias fails: aliases are read, never written.

Two FBL formats are not JSON documents and get their own treatment (spec 005, contracts/validator.md). An `.adp`
registration under `specifications/fbl/` is parsed from its line form into `fbl.schema.json#/$defs/Registration`
(FBL section 8). A `fixture.json` under `specifications/fbl/fixtures/` is validated against `$defs/Fixture` and then
replayed: every step's splices must turn the document before the step into the document it expects, byte for byte,
and an undo must return the document the undone edit started from (FBL section 15.3). Every `*.fbl` that validates is
then checked for its names (FBL section 14.1, step 4): every rule a `parent`, `cascade`, `reference.to`, `within` or
`files` names exists in its binding, and a reference's `by` is an attribute every rule it names binds, or `id` when
every rule it names stores its id with `id.from` (DISL reserves `id`, so it is never an attribute's name).
The fixtures under a folder named `*-equivalence` read one model in different formats: their `read` must be identical.

Prints one line per example and exits 1 when any example is invalid or names an unknown schema.
"""
import json
import sys
import xml.etree.ElementTree as ElementTree
from pathlib import Path

from jsonschema import Draft202012Validator
from referencing import Registry, Resource

repository = Path(__file__).resolve().parents[2]
root = repository / "specifications"
# The tool definitions (definitions/diagrams/*.dis and, later, designers and editors) are checked the same way.
folders = [root, repository / "definitions"]

DISL = "https://etalii.net/adp/disl/schema/0.2/disl.schema.json#/$defs/Specification"
DID = "https://etalii.net/adp/did/schema/0.2/did.schema.json#/$defs/Definition"
FBL = "https://etalii.net/adp/fbl/schema/0.1/fbl.schema.json#/$defs/Document"
DESL = "https://etalii.net/adp/desl/schema/0.1/desl.schema.json#/$defs/Specification"
FBL_REGISTRATION = "https://etalii.net/adp/fbl/schema/0.1/fbl.schema.json#/$defs/Registration"
FBL_FIXTURE = "https://etalii.net/adp/fbl/schema/0.1/fbl.schema.json#/$defs/Fixture"
KNOWLEDGE = "https://etalii.net/adp/definitions/designers/knowledge.schema.json"
CURRENT_EXTENSIONS = {".dis": DISL, ".did": DID, ".fbl": FBL, ".des": DESL}
CURRENT_VERSION_KEYS = {"disl": DISL, "did": DID, "fbl": FBL, "desl": DESL, "knowledge": KNOWLEDGE}
# A designer's examples are documents in the formats its bindings read (definitions/designers/examples/).
designer_examples = repository / "definitions" / "designers" / "examples"

# Alias table: each deprecated identifier and the current schema reference it is read as.
LEGACY = "https://etalii.net/adp/dedl/schema/0.1/dedl.schema.json"
ALIAS_SCHEMAS = {LEGACY: DISL, LEGACY + "#/$defs/Definition": DISL, LEGACY + "#/$defs/Document": DID}
ALIAS_EXTENSIONS = {".dedl": DISL, ".disl": DISL}
ALIAS_VERSION_KEYS = {"dedl": DISL, "dedlDocument": DID}

# Earlier versions: every 0.1 document is a valid 0.2 document (DISL and DID, "Changes from 0.1"), so a document that
# names a 0.1 schema is read against the current one. These are versions, not deprecated aliases, and are allowed anywhere.
PREVIOUS_SCHEMA_IDS = {
    "https://etalii.net/adp/disl/schema/0.1/disl.schema.json": "https://etalii.net/adp/disl/schema/0.2/disl.schema.json",
    "https://etalii.net/adp/did/schema/0.1/did.schema.json": "https://etalii.net/adp/did/schema/0.2/did.schema.json",
}

schemas = {}
for path in sorted([*root.rglob("*.schema.json"), *(repository / "definitions").rglob("*.schema.json")]):
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
    if designer_examples in path.parents and path.suffix in (".yaml", ".yml", ".xml"):
        return True
    return path.suffix in CURRENT_EXTENSIONS or path.suffix in ALIAS_EXTENSIONS or path.suffix == ".json"


KNOWLEDGE_BOOLEANS = {"title", "computed", "parent", "visible", "wrap", "hideEmptyGroups", "checked"}
KNOWLEDGE_NUMBERS = {"width", "number"}


def knowledge_from_xml(text: str):
    """Reads a knowledge file's XML form into its YAML and JSON form (knowledge.md, section 3), so that one schema and
    one check serve the three."""
    root_element = ElementTree.fromstring(text)

    def attributes(element):
        out = {}
        for key, value in element.attrib.items():
            if key in KNOWLEDGE_BOOLEANS:
                out[key] = value == "true"
            elif key in KNOWLEDGE_NUMBERS:
                out[key] = float(value) if "." in value else int(value)
            else:
                out[key] = value
        return out

    def listed(entry, key, items):
        if items:
            entry[key] = items

    def conditions(element):
        out = []
        for child in element:
            if child.tag == "condition":
                out.append(attributes(child))
            elif child.tag == "filterGroup":
                group = attributes(child)
                listed(group, "conditions", conditions(child))
                out.append(group)
        return out

    table = {"knowledge": root_element.get("version")}
    table.update({k: v for k, v in attributes(root_element).items() if k != "version"})
    table["properties"] = []
    for element in root_element.findall("properties/property"):
        entry = attributes(element)
        listed(entry, "options", [attributes(o) for o in element.findall("option")])
        table["properties"].append(entry)
    table["views"] = []
    for element in root_element.findall("views/view"):
        entry = attributes(element)
        for key, tag in (("columns", "column"), ("sorts", "sort")):
            listed(entry, key, [attributes(c) for c in element.findall(tag)])
        listed(entry, "filter", conditions(element))
        for key, tag in (("groupOrder", "groupOrder"), ("hiddenGroups", "hiddenGroup"), ("collapsed", "collapsed")):
            listed(entry, key, [attributes(g) for g in element.findall(tag)])
        table["views"].append(entry)
    table["rows"] = []
    for element in root_element.findall("rows/row"):
        entry = attributes(element)
        cells = []
        for cell_element in element.findall("cell"):
            cell = attributes(cell_element)
            listed(cell, "options", [attributes(i) for i in cell_element.findall("item") if "option" in i.attrib])
            listed(cell, "rows", [attributes(i) for i in cell_element.findall("item") if "row" in i.attrib])
            cells.append(cell)
        listed(entry, "cells", cells)
        table["rows"].append(entry)
    return table


def check_knowledge(table) -> list[str]:
    """What reading a knowledge example must find nothing of (knowledge.md, section 7): every id a cell, a view
    setting or the table names is in the file, one property is the title, and no id is used twice."""
    problems = []
    properties = {p["id"]: p for p in table.get("properties", [])}
    options = {o["id"]: p["id"] for p in table.get("properties", []) for o in p.get("options", [])}
    views = {v["id"] for v in table.get("views", [])}
    ids = list(properties) + list(options) + [v["id"] for v in table.get("views", [])] + [r["id"] for r in table.get("rows", [])]
    for duplicate in sorted({i for i in ids if ids.count(i) > 1}):
        problems.append(f"the id {duplicate!r} is used twice")
    if sum(1 for p in properties.values() if p.get("title")) != 1:
        problems.append("the table does not have exactly one title property")
    if "activeView" in table and table["activeView"] not in views:
        problems.append(f"/activeView names no view: {table['activeView']!r}")

    def named(pointer, property_id):
        if property_id not in properties:
            problems.append(f"{pointer} names no property: {property_id!r}")
            return None
        return properties[property_id]

    def option_of(pointer, property_id, option_id):
        if options.get(option_id) != property_id:
            problems.append(f"{pointer} names no option of {property_id!r}: {option_id!r}")

    def filter_entries(pointer, entries):
        for index, entry in enumerate(entries):
            if "conditions" in entry or "match" in entry:
                filter_entries(f"{pointer}/{index}/conditions", entry.get("conditions", []))
            elif named(f"{pointer}/{index}/property", entry["property"]) and "option" in entry:
                option_of(f"{pointer}/{index}/option", entry["property"], entry["option"])

    for v_index, view in enumerate(table.get("views", [])):
        for key in ("columns", "sorts"):
            for index, setting in enumerate(view.get(key, [])):
                named(f"/views/{v_index}/{key}/{index}/property", setting["property"])
        filter_entries(f"/views/{v_index}/filter", view.get("filter", []))
        if "groupBy" in view:
            named(f"/views/{v_index}/groupBy", view["groupBy"])
    for r_index, row in enumerate(table.get("rows", [])):
        for index, cell in enumerate(row.get("cells", [])):
            pointer = f"/rows/{r_index}/cells/{index}"
            if not named(f"{pointer}/property", cell["property"]):
                continue
            if "option" in cell:
                option_of(f"{pointer}/option", cell["property"], cell["option"])
            for i, item in enumerate(cell.get("options", [])):
                option_of(f"{pointer}/options/{i}/option", cell["property"], item["option"])
    return problems


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


def resolve_names(document) -> list[str]:
    """Checks the names an FBL document's rules refer to (FBL section 14.1, step 4) and returns a problem per
    unresolved name, each with the JSON Pointer of where it is used."""
    problems = []
    for binding_name, binding in document.get("bindings", {}).items():
        base = f"/bindings/{binding_name}"
        rules = {}
        for kind in ("elements", "relations", "blocks"):
            for index, rule in enumerate(binding.get(kind, [])):
                rules[rule["name"]] = (rule, f"{base}/{kind}/{index}")
        file_rules = {rule["name"] for rule in binding.get("body", {}).get("files", [])}

        def known(names, pointer, allowed=()):
            for name in names:
                if name not in rules and name not in allowed:
                    problems.append(f"at {pointer}: names the rule {name!r}, which this binding does not have")

        for name, (rule, pointer) in rules.items():
            known(rule.get("parent", {}).get("rules", []), pointer + "/parent/rules")
            known(rule.get("remove", {}).get("cascade", []), pointer + "/remove/cascade")
            known(rule.get("within", []), pointer + "/within", allowed=("^",))
            for file_rule in rule.get("files", []):
                if file_rule not in file_rules:
                    problems.append(f"at {pointer}/files: names the file rule {file_rule!r}, which this binding does not have")
            for attribute, attribute_binding in rule.get("attributes", {}).items():
                reference = attribute_binding.get("reference") if isinstance(attribute_binding, dict) else None
                if not reference:
                    continue
                at = f"{pointer}/attributes/{attribute}/reference"
                known(reference.get("to", []), at + "/to")
                by = reference.get("by")
                for target in reference.get("to", []):
                    if target not in rules or by is None:
                        continue
                    target_rule = rules[target][0]
                    if by == "id":
                        if "from" not in target_rule.get("id", {}):
                            problems.append(f"at {at}/by: refers by id to the rule {target!r}, which stores no id ('id.from')")
                    elif by not in target_rule.get("attributes", {}):
                        problems.append(f"at {at}/by: the rule {target!r} binds no attribute {by!r}")
    return problems


def resolve_desl(path: Path, document) -> list[str]:
    """Checks the names a DESL specification's surface and persistence refer to (DESL section 9.1, step 4) and
    returns a problem per unresolved name, each with the JSON Pointer of where it is used."""
    problems = []
    types = document.get("metamodel", {}).get("types", {})
    type_map = document.get("persistence", {}).get("typeMap", {})

    def attributes_of(name):
        """The attributes of a node type, its supertypes' included (DISL section 4.7)."""
        found, pending, seen = {}, [name], set()
        while pending:
            current = pending.pop()
            if current in seen or current not in types:
                continue
            seen.add(current)
            found.update(types[current].get("attributes", {}))
            extends = types[current].get("extends", [])
            pending.extend([extends] if isinstance(extends, str) else extends)
        return found

    def children_of(name):
        children = types.get(name, {}).get("children", {})
        allowed = set(children.get("allowed", []))
        for slot in children.get("slots", {}).values():
            allowed.update(slot.get("allowed", []))
        return allowed

    def node_type(name, pointer):
        if name not in types:
            problems.append(f"at {pointer}: names the type {name!r}, which the metamodel does not declare")
            return False
        return True

    def attribute(owner, name, pointer, attributes=None):
        if name is not None and name not in (attributes if attributes is not None else attributes_of(owner)):
            problems.append(f"at {pointer}: the type {owner!r} has no attribute {name!r}")

    surface = document.get("surface", {})
    columns, cells, views = surface.get("columns", {}), surface.get("cells", {}), surface.get("views", {})
    if node_type(columns.get("type"), "/surface/columns/type"):
        for role in ("name", "valueType", "title", "parent"):
            attribute(columns["type"], columns.get(role), f"/surface/columns/{role}")
        options = columns.get("options")
        if options and node_type(options["type"], "/surface/columns/options/type"):
            if options["type"] not in children_of(columns["type"]):
                problems.append(f"at /surface/columns/options/type: {options['type']!r} is not contained in {columns['type']!r}")
            for role in ("name", "colour"):
                attribute(options["type"], options.get(role), f"/surface/columns/options/{role}")
    node_type(surface.get("rows", {}).get("type"), "/surface/rows/type")
    if node_type(cells.get("type"), "/surface/cells/type"):
        attribute(cells["type"], cells.get("column"), "/surface/cells/column")
        if "items" in cells and node_type(cells["items"], "/surface/cells/items") and cells["items"] not in children_of(cells["type"]):
            problems.append(f"at /surface/cells/items: {cells['items']!r} is not contained in {cells['type']!r}")
    if node_type(views.get("type"), "/surface/views/type"):
        attribute(views["type"], views.get("name"), "/surface/views/name")
        attribute("the document", views.get("active"), "/surface/views/active", document.get("metamodel", {}).get("diagram", {}).get("attributes", {}))
        for role, name in views.get("settings", {}).items():
            node_type(name, f"/surface/views/settings/{role}")
    for name, value_type in surface.get("valueTypes", {}).items():
        holder = cells.get("items") if value_type.get("many") else cells.get("type")
        if holder in types:
            attribute(holder, value_type.get("key"), f"/surface/valueTypes/{name}/key")
        for target in value_type.get("converts", {}):
            if target not in surface.get("valueTypes", {}):
                problems.append(f"at /surface/valueTypes/{name}/converts: names the value type {target!r}, which the surface does not declare")
    for index, reference in enumerate(document.get("persistence", {}).get("bindings", [])):
        pointer = f"/persistence/bindings/{index}"
        file, _, binding_name = reference.partition("#")
        target = (path.parent / file).resolve() if file else path
        if not target.is_file():
            problems.append(f"at {pointer}: the FBL document {file!r} does not exist")
            continue
        binding = json.loads(target.read_text(encoding="utf-8")).get("bindings", {}).get(binding_name)
        if binding is None:
            problems.append(f"at {pointer}: {file!r} has no binding {binding_name!r}")
            continue
        for kind in ("elements", "relations"):
            for rule in binding.get(kind, []):
                if rule["type"] not in types and rule["type"] not in type_map:
                    problems.append(f"at {pointer}: the rule {rule['name']!r} produces the type {rule['type']!r}, which neither the metamodel nor the type map declares")
    return problems


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
        base, hash_, fragment = declared.partition("#")
        current = PREVIOUS_SCHEMA_IDS.get(base, base) + hash_ + fragment
        by_schema = ALIAS_SCHEMAS.get(declared, current)
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
    elif path.suffix in (".yaml", ".yml", ".xml"):
        try:
            if path.suffix == ".xml":
                document = knowledge_from_xml(path.read_text(encoding="utf-8"))
            else:
                import yaml  # only the designers' examples need it

                document = yaml.safe_load(path.read_text(encoding="utf-8"))
        except Exception as error:  # noqa: BLE001 - any parse error fails the example
            print(f"FAIL {name}: not readable: {error}")
            failures += 1
            continue
        reference, aliases, problem = expected_reference(path, document)
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
    elif reference == KNOWLEDGE and (problems := check_knowledge(document)):
        failures += 1
        print(f"FAIL {name}: {len(problems)} finding(s) on reading")
        for problem in problems[:10]:
            print(f"  {problem}")
    elif reference in (FBL, DESL) and (problems := (resolve_names(document) if reference == FBL else resolve_desl(path, document))):
        failures += 1
        print(f"FAIL {name}: {len(problems)} unresolved name(s)")
        for problem in problems[:10]:
            print(f"  {problem}")
    else:
        via = f" (legacy fixture, read through: {', '.join(aliases)})" if aliases else ""
        print(f"ok   {name}{via}")

# The fixtures under a folder named '*-equivalence' read the same model in different formats: what each reads must be
# the same.
for folder in sorted((root / "fbl" / "fixtures").glob("*-equivalence")):
    reads = {p.relative_to(repository).as_posix(): json.loads(p.read_text(encoding="utf-8")).get("read") for p in sorted(folder.rglob("fixture.json"))}
    first = next(iter(reads.values()), None)
    differing = [name for name, read in reads.items() if read != first]
    if len(reads) < 2 or differing:
        failures += 1
        print(f"FAIL {folder.relative_to(repository).as_posix()}: " + (f"reads differently in {', '.join(differing)}" if differing else "an equivalence needs two fixtures or more"))
    else:
        print(f"ok   {folder.relative_to(repository).as_posix()}: {len(reads)} fixtures read the same {len(first.get('elements', []))} elements")

print(f"{len(examples)} example(s), {failures} invalid.")
sys.exit(1 if failures or not examples else 0)
