"""Validates every example in specifications/, and every tool definition in definitions/, against its specification's
schema (constitution principle II).

An example is a DISL specification (`*.dis`), a DID definition (`*.did`), an FBL document (`*.fbl`), a DESL
specification (`*.des`), a DED definition (`*.ded`), or a `*.json` file that names its schema in `$schema`. The extension decides the schema: `*.dis` against
`disl.schema.json#/$defs/Specification`, `*.did` against `did.schema.json#/$defs/Definition`, `*.fbl` against
`fbl.schema.json#/$defs/Document`, `*.des` against `desl.schema.json#/$defs/Specification`, `*.ded` against `ded.schema.json#/$defs/Definition`. A DED definition
whose designer type has a file schema in definitions/designers/ (DESIGNERS below) is validated against that one, which
refines DED's. A Markdown definition (`*.md` under `specifications/ded/`, the specification document aside) has its
envelope on line 1 (DED section 2); it is read into `ded` and `designer` and validated as a DED definition, and one
without the envelope fails. A Markdown definition whose envelope names the Hierarchical Requirement Designer
(`etalii/hierarchical-requirement`), under `specifications/ded/` or `definitions/designers/examples/`, is read whole, by
a reader written for that designer type (`requirements_from_markdown`, as `knowledge_from_xml` is written for the
Knowledge designer), which takes its expressions from the designer type's binding and specification and follows the
`bullets` family (FBL 0.7, section 4.8): into the JSON form `hierarchical-requirement.schema.json` describes, which is
validated, and into what reading it would report, each a failure at its line: a bullet in no known form, a number an
earlier entry carries, a mention or an assessment that names nothing, and a requirement out of place (at the top level,
or anything nested in a requirement). An entry written `ITEM-NEW` or `REQ-NEW` is not a failure. A designer type's
registration (`*.adp` under `definitions/designers/examples/`) is parsed as the registrations under `specifications/fbl/`
are. A `$schema` the example names must agree with that; its part before `#`
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
and an undo must return the document the undone edit started from (FBL section 15.3), its splices listed under the
operations of the splices they invert, as a redo's are. A `setting` step
on a block the fixture's binding declares with `history: false` is no step of the history (FBL 0.7, section 7.1); an
undo or redo of an edit made before it is checked by what each of its splices replaces and writes, since that block's
write stands between. An `.adp` registration's blocks besides `layout:` and `identities:` are read into `blocks`,
declared or not, and what follows the blocks is kept, as FBL 0.7 section 8.1 says. Every `*.fbl` that validates is
then checked for its names (FBL section 14.1, step 4): every rule a `parent`, `cascade`, `reference.to`, `within` or
`files` names exists in its binding (in the `bullets` family `within` names sections), and a reference's `by` is an attribute every rule it names binds, or `id` when
every rule it names stores its id with `id.from` (the specification languages reserve `id`, so it is never an attribute's name).
It is also checked for its constants (FBL 0.8, section 14.1, step 6): an insert's `constant` stands only on a rule that
reads the yaml or json family, and none of its keys is a key the same rule writes, through a writable attribute
binding, its id or one of its ends. The `*.fbl` documents under `specifications/fbl/refused/` are the other way
round: each must be valid against the schema and refused by one of these checks, and the run fails when one is
accepted.
The fixtures under a folder named `*-equivalence` read one model in different formats: their `read` must be identical.

Every `*.dis` that validates is checked for the names DISL 0.4's constructs refer to (DISL section 14.1): a compartment's
`groupBy` names an attribute of every item type it lists, of an enumeration type; a `force` layout's `tiers` name node
types of the metamodel; and `persistence.view.bind` is used only with `format: "fbl"`, for kinds that `view.store` lists.
It is also checked for its relation flags (DISL 0.6, sections 4.7 and 14.1 step 6): the relation types are put in their
C3 linearisation, a cycle or an order C3 cannot make being a problem; each of `directed`, `allowSelfLoops` and
`allowParallel` has the value of the nearest type in it that states the flag, else the section 4.9 default; a relation
type that states a flag only narrows every direct supertype's value (`true` to `false`, and `directed` never differs);
and one that does not state it has supertypes that agree on it. The `*.dis` documents under `specifications/disl/refused/`
are, like the FBL ones, each valid against the schema and refused by one of these checks, and the run fails when one is
accepted. The findings a definition gives (such as `service-calls.findings.json`) are validated against
`$defs/ValidatorOutput` only; the hosts' tests compute them.

A diagram type whose file has a JSON Schema beside its definition (`definitions/diagrams/<name>.schema.json`) shows a
complete file in the first YAML block of its companion `<name>.md`; that example is validated against the schema, read
without turning moments into timestamps.

Prints one line per example and exits 1 when any example is invalid or names an unknown schema.
"""
import json
import re
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
DED = "https://etalii.net/adp/ded/schema/0.1/ded.schema.json#/$defs/Definition"
KNOWLEDGE = "https://etalii.net/adp/definitions/designers/knowledge.schema.json"
HIERARCHICAL_REQUIREMENT = "https://etalii.net/adp/definitions/designers/hierarchical-requirement.schema.json"
CURRENT_EXTENSIONS = {".dis": DISL, ".did": DID, ".fbl": FBL, ".des": DESL, ".ded": DED}
CURRENT_VERSION_KEYS = {"disl": DISL, "did": DID, "fbl": FBL, "desl": DESL, "ded": DED}
# The file schema of each designer type whose DED definitions have one, by the origin in their `designer` key.
DESIGNERS = {"etalii/knowledge": KNOWLEDGE, "etalii/hierarchical-requirement": HIERARCHICAL_REQUIREMENT}
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
    if root / "atd" / "highlighting" in path.parents:
        return False  # generated by atd-grammar.py, which compares them; a TextMate grammar names a schema not kept here
    if path.suffix == ".adp":
        return is_fbl_file(path) or designer_examples in path.parents
    if is_fbl_file(path) and "fixtures" in path.relative_to(root / "fbl").parts and path.name != "fixture.json":
        return False  # a fixture's input and expected bodies are checked through its fixture.json
    if (path.parent / "conformance.json").is_file() and path.name != "conformance.json" and not path.name.startswith("drawing."):
        return False  # a conformance case's documents (a body in JSON among them) are checked through its conformance.json
    if designer_examples in path.parents and path.suffix in (".yaml", ".yml", ".xml", ".md"):
        return True
    if path.suffix == ".md":
        return path.parent == root / "ded" and not path.name.endswith("-specification.md") and path.name != "SPEC.md"  # SPEC.md is the spec-graph node
    return path.suffix in CURRENT_EXTENSIONS or path.suffix in ALIAS_EXTENSIONS or path.suffix == ".json"


MARKDOWN_ENVELOPE = re.compile(r"^<!--[ \t]+ded:[ \t]+(?P<ded>[^ \t]+)[ \t]+designer:[ \t]+(?P<designer>[^ \t]+)[ \t]+-->[ \t]*$")


def definition_from_markdown(text: str):
    """Reads the envelope of a Markdown definition, its line 1 (DED section 2), into the YAML and JSON form."""
    match = MARKDOWN_ENVELOPE.match(text.removeprefix("﻿").split("\n", 1)[0].removesuffix("\r"))
    if not match:
        raise ValueError("it has no envelope: line 1 is not '<!-- ded: <version> designer: <origin> -->'")
    return match.groupdict()


KNOWLEDGE_BOOLEANS = {"title", "computed", "parent", "visible", "wrap", "hideEmptyGroups", "checked"}
KNOWLEDGE_NUMBERS = {"width", "number"}


def knowledge_from_xml(text: str):
    """Reads a knowledge file's XML form into its YAML and JSON form (knowledge.md, section 3), so that one schema and
    one check serve the three. The root's `version` and `designer` are DED's envelope (DED section 3)."""
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

    if root_element.tag != "ded":
        raise ValueError(f"the root element is <{root_element.tag}>, not <ded>")
    table = {"ded": root_element.get("version"), "designer": root_element.get("designer")}
    table.update({k: v for k, v in attributes(root_element).items() if k not in ("version", "designer")})
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


# The Hierarchical Requirement Designer's definition: the reader takes its expressions from these two files.
REQUIREMENT_DESIGNER = repository / "definitions" / "designers" / "hierarchical-requirement"
LIST_ITEM = re.compile(r"[-*+](?:[ \t]|$)")
THEMATIC_BREAK = re.compile(r"^[ \t]*(?:(?:-[ \t]*){3,}|(?:\*[ \t]*){3,}|(?:_[ \t]*){3,})$")
FENCE = re.compile(r"(`{3,}|~{3,})")
HEADING = re.compile(r"(#{1,6})(?:[ \t]|$)")


def common_regex(expression: str, case_insensitive: bool = False):
    """An expression of FBL's common subset (FBL section 2.5) as Python reads it: named groups are written (?P<name>),
    and the classes are ASCII, as RE2's are."""
    return re.compile(expression.replace("(?<", "(?P<"), re.ASCII | (re.IGNORECASE if case_insensitive else 0))


def columns(whitespace: str) -> int:
    """The columns of a run of spaces and tabs, a tab counting four (FBL section 4.8)."""
    return sum(4 if character == "\t" else 1 for character in whitespace)


def without_indentation(line: str, column: int) -> str:
    """A continuation line with the whitespace before `column` taken off; a tab the column cuts into leaves its spaces."""
    at = index = 0
    while index < len(line) and line[index] in " \t" and at < column:
        width = 4 if line[index] == "\t" else 1
        if at + width > column:
            return " " * (at + width - column) + line[index + 1:]
        at, index = at + width, index + 1
    return line[index:]


class Bullet:
    """A list item of the bullets family (FBL section 4.8): its line, its marker's and its content's columns, its text,
    the item it is nested in, and its continuation (the lines before its first nested item, blank lines between them)."""

    def __init__(self, number, marker, content, text, parent):
        self.number, self.marker, self.content, self.text, self.parent = number, marker, content, text, parent
        self.continuation, self.blanks, self.nested = [], [], False

    def add_line(self, number, line):
        if not self.nested:
            self.continuation += self.blanks + [(number, line)]
            self.blanks = []

    def add_blank(self, number):
        if not self.nested and self.continuation:
            self.blanks.append((number, ""))

    def text_of_continuation(self):
        return [(number, without_indentation(line, self.content)) for number, line in self.continuation]


def bullets_of(text: str):
    """Reads a Markdown body's lines into the bullets family's kinds (FBL section 4.8): its list items, its headings (line,
    level, text) and its statements (line, text). Fenced lines and thematic breaks are none of these."""
    lines = re.split(r"\r\n|\n|\r", text.removeprefix("﻿"))
    if lines and lines[-1] == "":
        lines.pop()
    items, headings, statements, open_items, fence = [], [], [], [], None
    for number, line in enumerate(lines, start=1):
        rest = line.lstrip(" \t")
        if fence:  # (character, length, the item it belongs to or None)
            if re.fullmatch(re.escape(fence[0]) + "{%d,}[ \t]*" % fence[1], rest):
                fence, owner = None, fence[2]
            else:
                owner = fence[2]
            if owner:
                owner.add_line(number, line)
            continue
        if not rest:
            if open_items:
                open_items[-1].add_blank(number)
            continue
        indentation = columns(line[:len(line) - len(rest)])
        while open_items and open_items[-1].marker >= indentation:
            open_items.pop()
        if LIST_ITEM.match(rest) and not THEMATIC_BREAK.match(line):
            after = rest[1:]
            item_text = after.lstrip(" \t")
            content = indentation + 1 + columns(after[:len(after) - len(item_text)]) if item_text else indentation + 2
            parent = open_items[-1] if open_items else None
            if parent:
                parent.nested = True
            item = Bullet(number, indentation, content, item_text, parent)
            items.append(item)
            open_items.append(item)
            continue
        opens = FENCE.match(rest)
        if open_items:
            open_items[-1].add_line(number, line)
            if opens:
                fence = (opens.group(1)[0], len(opens.group(1)), open_items[-1])
            continue
        heading = HEADING.match(rest) if indentation <= 3 else None
        if heading:
            title = re.sub(r"(?:^|[ \t]+)#+$", "", rest[len(heading.group(1)):].strip(" \t")).strip(" \t")
            headings.append((number, len(heading.group(1)), title))
        elif opens:
            fence = (opens.group(1)[0], len(opens.group(1)), None)
        elif not THEMATIC_BREAK.match(line):
            statements.append((number, line))
    return items, headings, statements, len(lines)


def requirements_from_markdown(text: str):
    """Reads a requirement document (hierarchical-requirement.md) through the rules of its binding,
    hierarchical-requirement.fbl#markdown, into the JSON form hierarchical-requirement.schema.json describes, and returns
    it with what reading it reports, each a problem at its line (contracts/requirement-document.md, What reading
    reports). The mentions are found by the patterns of hierarchical-requirement.des. Raises when line 1 is no envelope."""
    document = dict(definition_from_markdown(text))
    binding = json.loads(REQUIREMENT_DESIGNER.with_suffix(".fbl").read_text(encoding="utf-8"))["bindings"]["markdown"]
    types = json.loads(REQUIREMENT_DESIGNER.with_suffix(".des").read_text(encoding="utf-8"))["metamodel"]["types"]
    rules = {rule["name"]: rule for rule in binding["elements"]}

    def rule_regex(name):
        return common_regex(rules[name]["line"], rules[name].get("caseInsensitive", False))

    def word_regex(rule, attribute):
        return common_regex(rules[rule]["attributes"][attribute]["word"])

    def mentions_of(type_name, attribute):
        return common_regex(types[type_name]["attributes"][attribute]["mentions"]["pattern"])

    items, headings, statements, line_count = bullets_of(text)
    sections = {}
    for section in binding["sections"]:
        heading_regex = common_regex(section["heading"], section.get("caseInsensitive", False))
        first = next((h for h in headings if heading_regex.search(h[2])), None)
        if first:
            end = next((number for number, level, _ in headings if number > first[0] and level <= first[1]), line_count + 1)
            sections[section["name"]] = (first[0], end)

    def stands_in(item, name):
        return name in sections and sections[name][0] < item.number < sections[name][1]

    for number, line in statements:
        marks = rule_regex("marks").search(line)
        if marks:
            document.update({k: v for k, v in marks.groupdict().items() if v is not None})
            break
    document["items"], document["assessments"] = [], []
    problems, read, not_looked_into, ids, mentions = [], {}, set(), {}, []

    def words(group):
        return re.findall(r'"[^"]*"|\S+', group or "")

    def description(item):
        lines = item.text_of_continuation()
        return "\n".join(line for _, line in lines), [number for number, _ in lines]

    for item in items:
        if item.parent in not_looked_into or not (stands_in(item, "requirements") or stands_in(item, "assessments")):
            not_looked_into.add(item)
            continue
        if stands_in(item, "requirements"):
            match, kind = rule_regex("item").search(item.text), "Item"
            if not match:
                match, kind = rule_regex("requirement").search(item.text), "Requirement"
            if not match:
                problems.append(f"line {item.number}: a bullet under Requirements that is neither an item nor a requirement (std.unreadableEntry): {item.text!r}")
                not_looked_into.add(item)
                continue
            rule = "item" if kind == "Item" else "requirement"
            entry = {"id": match.group("id"), "title": match.group("title")}
            text_of, lines_of = description(item)
            if text_of:
                entry["description"] = text_of
                mentions.append((mentions_of(kind, "description"), text_of, lines_of, False))
            group = words(match.group("words"))
            tags = [m.group("value") for m in (word_regex(rule, "tags").match(w) for w in group) if m]
            if tags:
                entry["tags"] = tags
            if kind == "Requirement":
                for attribute in ("category", "state"):
                    value = next((m.group("value") for m in (word_regex(rule, attribute).match(w) for w in group) if m), None)
                    if value is not None:
                        entry[attribute] = value
            else:
                entry.update({"requirements": [], "items": []})
            parent = read.get(item.parent)
            read[item] = (kind, entry, parent)
            if not entry["id"].endswith("-NEW"):  # the placeholder is std.missingId, which is no failure
                if entry["id"] in ids:
                    problems.append(f"line {item.number}: {entry['id']} is the number of the entry on line {ids[entry['id']]} too (std.duplicateId)")
                else:
                    ids[entry["id"]] = item.number
            if not entry.get("title", "").strip():
                problems.append(f"line {item.number}: {entry['id']} has no title (std.required)")
            if parent is None and kind == "Requirement":
                problems.append(f"line {item.number}: {entry['id']} stands at the top level, where a requirement stands in an item (std.containment)")
            elif parent is not None and parent[0] == "Requirement":
                problems.append(f"line {item.number}: {entry['id']} is nested under the requirement {parent[1]['id']}, which holds nothing (std.containment)")
            elif parent is None:
                document["items"].append(entry)
                entry["placed"] = True
            elif parent[1].get("placed"):
                parent[1]["requirements" if kind == "Requirement" else "items"].append(entry)
                entry["placed"] = True
        else:
            match = rule_regex("assessment").search(item.text)
            if not match:
                problems.append(f"line {item.number}: a bullet under Assessments in no known form (std.unreadableEntry): {item.text!r}")
                not_looked_into.add(item)
                continue
            entry = {"kind": match.group("kind").lower(), "about": match.group("about"), "text": match.group("text"), "resolved": (match.group("done") or " ").lower() == "x"}
            text_of, lines_of = description(item)
            if text_of:
                entry["detail"] = text_of
                mentions.append((mentions_of("Assessment", "detail"), text_of, lines_of, False))
            mentions.append((mentions_of("Assessment", "text"), entry["text"], [item.number], False))
            mentions.append((mentions_of("Assessment", "about"), entry["about"], [item.number], True))
            document["assessments"].append(entry)
    for pattern, value, lines_of, about in mentions:  # once every entry is read, so that a mention may name one after it
        for match in pattern.finditer(value):
            if match.group("id") is not None and match.group("id") not in ids:
                line = lines_of[min(value.count("\n", 0, match.start()), len(lines_of) - 1)]
                if about:
                    problems.append(f"line {line}: an assessment about {match.group('id')}, which names no item or requirement (std.mentions)")
                else:
                    problems.append(f"line {line}: [{match.group('id')}] names no item or requirement (std.mentions)")

    def without_marks(entries):
        for entry in entries:
            entry.pop("placed", None)
            without_marks(entry.get("requirements", []))
            without_marks(entry.get("items", []))

    without_marks(document["items"])
    problems.sort(key=lambda problem: int(problem.split(":", 1)[0].removeprefix("line ")))
    return document, problems


BLOCK_LINE = re.compile(r"^[A-Za-z_][A-Za-z0-9_.-]*:$")


def parse_registration(data: bytes):
    """Parses an .adp registration's line form (FBL section 8.1) into $defs/Registration, or returns a problem. Every
    block besides layout: and identities: is read into `blocks`, declared or not, since no binding is at hand."""
    text = data.decode("utf-8").removeprefix("﻿")
    lines = text.splitlines()
    if not lines or not lines[0].strip():
        return None, "line 1 must name the origin"
    registration = {"origin": lines[0].strip()}
    block = None  # the block being read; "" after the blocks, where what is not a block is kept unbound
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
            elif block == "identities":
                registration["identities"][key] = value
            else:
                registration["blocks"][block][key] = value
            continue
        if BLOCK_LINE.match(line):  # layout:, identities: or (FBL 0.7) a block a binding declares, or one nobody does
            block = line[:-1]
            if block in ("layout", "identities"):
                registration[block] = {}
            else:
                registration.setdefault("blocks", {})[block] = {}
            continue
        if block is not None:
            block = ""  # anything after the blocks that is neither a block nor an entry is unbound (FBL section 8.1)
            continue
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


def splice_changes(document: bytes, splices):
    """What each splice replaces and with what, in the order of their offsets."""
    ordered = sorted(splices, key=lambda splice: (splice["start"], splice["end"]))
    return [(document[splice["start"]:splice["end"]], splice["text"].encode("utf-8")) for splice in ordered]


def blocks_outside_history(folder: Path, reference: str) -> set[str]:
    """The registration blocks a fixture's binding declares with history: false (FBL 0.7, sections 7.1, 8.1)."""
    file, _, name = reference.partition("#")
    try:
        binding = json.loads((folder / file).read_text(encoding="utf-8"))["bindings"][name]
    except (OSError, ValueError, KeyError):
        return set()
    blocks = binding.get("registration", {}).get("blocks", {})
    return {block for block, settings in blocks.items() if settings.get("history") is False}


def replay_fixture(path: Path, fixture) -> str | None:
    """Replays a fixture's steps (FBL section 15.3) and returns the first problem, if any."""
    folder = path.parent
    document = (folder / fixture["input"]).read_bytes()
    outside = blocks_outside_history(folder, fixture["binding"])
    # (before, after, changes, crossed, operations) of each edit that can be undone, and of each that can be redone; crossed:
    # a write outside the history (FBL 0.7, section 7.1) came after it, so its undo is compared by what it changes, not by
    # bytes; operations: the operations its splices are named by, which its undo and redo are listed under (section 15.3)
    done, undone = [], []
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
        changes_of_edit = edit if isinstance(edit, list) else [edit]  # FBL 0.7: one transaction's changes
        changes = splice_changes(document, step["splices"])
        operations = {splice["operation"] for splice in step["splices"]}
        if step.get("undo") or step.get("redo"):
            # An undo lists the inverse splices under the operation of the splice each inverts, and a redo the edit's own
            # (section 15.3); a snapshot's one splice is under the operation of the edit's first (section 7.1).
            stack = done if step.get("undo") else undone
            if stack and not operations <= stack[-1][4]:
                named = ", ".join(sorted(operations - stack[-1][4]))
                return f"step {index}: the {'undo' if step.get('undo') else 'redo'} names an operation the edit it replays has not: {named}"
        if step.get("undo"):
            if not done:
                return f"step {index}: nothing to undo"
            before, after, edit_changes, crossed, edit_operations = done.pop()
            if crossed and changes != [(new, old) for old, new in edit_changes]:
                return f"step {index}: the undo does not put back what the undone edit changed"
            if not crossed and (document != after or result != before):
                return f"step {index}: the undo does not return the document the undone edit started from"
            undone.append((before, after, edit_changes, crossed, edit_operations))
        elif step.get("redo"):
            if not undone:
                return f"step {index}: nothing to redo"
            before, after, edit_changes, crossed, edit_operations = undone.pop()
            if crossed and changes != edit_changes:
                return f"step {index}: the redo does not make the changes the edit made"
            if not crossed and (document != before or result != after):
                return f"step {index}: the redo does not return the document the edit produced"
            done.append((before, after, edit_changes, crossed, edit_operations))
        elif step.get("refused") or any("save" in change for change in changes_of_edit):
            if result != document:
                return f"step {index}: a refused edit or a save without change must leave the document as it is"
        elif all(change.get("setting", {}).get("block") in outside for change in changes_of_edit):  # no step of the history: undo and redo pass it by
            done = [(before, after, edit_changes, True, edit_operations) for before, after, edit_changes, _, edit_operations in done]
            undone = [(before, after, edit_changes, True, edit_operations) for before, after, edit_changes, _, edit_operations in undone]
        else:
            done.append((document, result, changes, False, operations))
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
        sections = {section["name"] for section in binding.get("sections", [])}
        bullets = binding.get("body", {}).get("family") == "bullets"

        def known(names, pointer, allowed=()):
            for name in names:
                if name not in rules and name not in allowed:
                    problems.append(f"at {pointer}: names the rule {name!r}, which this binding does not have")

        for name, (rule, pointer) in rules.items():
            known(rule.get("parent", {}).get("rules", []), pointer + "/parent/rules")
            known(rule.get("remove", {}).get("cascade", []), pointer + "/remove/cascade")
            if bullets:  # a bullets rule's within names sections (FBL section 4.8)
                for section in rule.get("within", []):
                    if section not in sections:
                        problems.append(f"at {pointer}/within: names the section {section!r}, which this binding does not have")
            else:
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


def check_constants(document) -> list[str]:
    """Checks an insert's constants (FBL 0.8, section 14.1, step 6) and returns a problem per constant that stands in
    a binding of another family than yaml or json, or whose key the same rule also writes: through a writable
    attribute binding, its id or one of its ends. The schema refuses a constant beside emit, and on a binding whose
    file body names another family; a folder body's families are its file rules', checked here."""
    problems = []
    for binding_name, binding in document.get("bindings", {}).items():
        base = f"/bindings/{binding_name}"
        body = binding.get("body", {})
        file_families = {rule["name"]: rule.get("family") for rule in body.get("files", [])}
        for kind in ("elements", "relations"):
            for index, rule in enumerate(binding.get(kind, [])):
                constant = rule.get("insert", {}).get("constant")
                if not constant:
                    continue
                pointer = f"{base}/{kind}/{index}/insert/constant"
                families = [file_families.get(name) for name in rule.get("files", [])] or [body.get("family")]
                for family in families:
                    if family not in ("yaml", "json"):
                        problems.append(f"at {pointer}: a constant is written only in the yaml and json families, and this rule reads {family!r}")
                written = {}  # key -> what the rule writes there
                if not binding.get("readOnly") and not rule.get("readOnly"):
                    for attribute, attribute_binding in rule.get("attributes", {}).items():
                        if isinstance(attribute_binding, dict) and "key" in attribute_binding and "child" not in attribute_binding and not attribute_binding.get("readOnly"):
                            written.setdefault(attribute_binding["key"], f"the attribute {attribute!r}")
                    for slot_name, slot in (("id", rule.get("id", {}).get("from")), ("source", rule.get("source")), ("target", rule.get("target"))):
                        if isinstance(slot, dict) and "key" in slot and "child" not in slot:
                            written.setdefault(slot["key"], f"its {slot_name}")
                for key in constant:
                    if key in written:
                        problems.append(f"at {pointer}/{key}: the rule {rule['name']!r} also writes the key {key!r}, through {written[key]}")
    return problems


# The names DISL section 2.2 reserves: the built-in fields of an element in CEL, and CEL's keywords. An attribute
# with one of them would be shadowed by the field, so a host refuses the specification.
DISL_RESERVED = {
    "id", "type", "kind", "parent", "children", "descendants", "ancestors", "incoming", "outgoing", "source", "target",
    "sourcePort", "targetPort", "ports", "owner", "view", "diagram", "self", "value", "item", "index", "env", "old",
    "event", "detail",
    "in", "as", "break", "const", "continue", "else", "for", "function", "if", "import", "let", "loop", "package",
    "namespace", "return", "var", "void", "while", "true", "false", "null",
}


def resolve_disl(document) -> list[str]:
    """Checks the names DISL 0.4's constructs refer to (DISL section 14.1) and returns a problem per unresolved name,
    each with the JSON Pointer of where it is used."""
    problems = []
    metamodel = document.get("metamodel", {})
    types, enums = metamodel.get("types", {}), metamodel.get("enums", {})
    for section in ("types", "relations"):
        for type_name, declaration in metamodel.get(section, {}).items():
            for attribute in declaration.get("attributes", {}):
                if attribute in DISL_RESERVED or attribute[:1] in ("_", "$"):
                    problems.append(f"at /metamodel/{section}/{type_name}/attributes/{attribute}: {attribute!r} is a reserved name (DISL section 2.2)")
    for attribute in metamodel.get("diagram", {}).get("attributes", {}):
        if attribute in DISL_RESERVED or attribute[:1] in ("_", "$"):
            problems.append(f"at /metamodel/diagram/attributes/{attribute}: {attribute!r} is a reserved name (DISL section 2.2)")

    def attributes_of(name, seen=()):
        node = types.get(name, {})
        extends = node.get("extends", [])
        inherited = {}
        for parent in [extends] if isinstance(extends, str) else extends:
            if parent not in seen:
                inherited.update(attributes_of(parent, seen + (name,)))
        return {**inherited, **node.get("attributes", {})}

    for type_name, notation in document.get("notation", {}).get("nodes", {}).items():
        for index, compartment in enumerate(notation.get("compartments", [])):
            group_by = compartment.get("groupBy")
            if not group_by:
                continue
            pointer = f"/notation/nodes/{type_name}/compartments/{index}/groupBy/attribute"
            items = compartment.get("items", {})
            item_types = items.get("children") if isinstance(items, dict) else None
            if not item_types:
                problems.append(f"at {pointer}: groupBy needs items that are children of named types")
                continue
            for item_type in item_types:
                attribute = attributes_of(item_type).get(group_by["attribute"])
                if attribute is None:
                    problems.append(f"at {pointer}: the type {item_type!r} has no attribute {group_by['attribute']!r}")
                elif attribute.get("type") not in enums:
                    problems.append(f"at {pointer}: the attribute {group_by['attribute']!r} of {item_type!r} is of type {attribute.get('type')!r}, which is not an enumeration")
                else:
                    for value in group_by.get("collapsed", {}):
                        if value not in enums[attribute["type"]].get("values", {}):
                            problems.append(f"at {pointer[:-len('attribute')]}collapsed/{value}: {attribute['type']!r} has no value {value!r}")
    for name, config in document.get("layout", {}).get("algorithms", {}).items():
        for index, tier in enumerate(config.get("force", {}).get("tiers", [])):
            for type_name in [tier] if isinstance(tier, str) else tier:
                if type_name not in types:
                    problems.append(f"at /layout/algorithms/{name}/force/tiers/{index}: names the type {type_name!r}, which the metamodel does not declare")
    problems += relation_flag_problems(metamodel.get("relations", {}))
    persistence = document.get("persistence", {})
    view = persistence.get("view", {})
    for kind in view.get("bind", {}):
        if persistence.get("format") != "fbl":
            problems.append(f"at /persistence/view/bind/{kind}: view data is bound into a body only with format fbl")
        if kind not in view.get("store", []):
            problems.append(f"at /persistence/view/bind/{kind}: the kind {kind!r} is bound but view.store does not list it")
    return problems


RELATION_FLAGS = {"directed": True, "allowSelfLoops": False, "allowParallel": True}  # the defaults of DISL section 4.9


def relation_flag_problems(relations) -> list[str]:
    """Checks the relation flags of DISL 0.6 (sections 4.7 and 14.1 step 6): each flag a relation type does not state is
    the value of the nearest type of its C3 linearisation that states it, else the 4.9 default; a stated flag only
    narrows every direct supertype's value; and direct supertypes that differ in a flag the type does not state are an
    error. A supertype the metamodel does not declare as a relation type is left to the other checks."""
    problems, linearisations, failed = [], {}, set()

    def parents(name):
        extends = relations.get(name, {}).get("extends", [])
        return [p for p in ([extends] if isinstance(extends, str) else extends) if p in relations]

    def linearise(name, visiting=()):
        if name in linearisations or name in failed:
            return linearisations.get(name)
        if name in visiting:
            failed.add(name)
            problems.append(f"at /metamodel/relations/{name}/extends: the relation type {name!r} is its own supertype (DISL section 4.7)")
            return None
        sequences = []
        for parent in parents(name):
            order = linearise(parent, visiting + (name,))
            if order is None:
                failed.add(name)
                return None
            sequences.append(list(order))
        sequences.append(parents(name))
        result = [name]
        while any(sequences):
            sequences = [s for s in sequences if s]
            head = next((s[0] for s in sequences if not any(s[0] in other[1:] for other in sequences)), None)
            if head is None:
                failed.add(name)
                problems.append(f"at /metamodel/relations/{name}/extends: the supertypes of {name!r} cannot be put in one order (C3, DISL section 4.7)")
                return None
            result.append(head)
            sequences = [s[1:] if s[0] == head else s for s in sequences]
        linearisations[name] = result
        return result

    def effective(name, flag):
        for type_name in linearisations[name]:
            if flag in relations[type_name]:
                return relations[type_name][flag]
        return RELATION_FLAGS[flag]

    for name in relations:
        linearise(name)
    for name, declaration in relations.items():
        if name not in linearisations or any(p not in linearisations for p in parents(name)):
            continue
        for flag in RELATION_FLAGS:
            values = {parent: effective(parent, flag) for parent in parents(name)}
            if flag in declaration:
                stated = declaration[flag]
                for parent, value in values.items():
                    if flag == "directed" and stated != value:
                        problems.append(f"at /metamodel/relations/{name}/{flag}: {name!r} states {flag} {str(stated).lower()}, which differs from the {str(value).lower()} of its supertype {parent!r} (DISL section 4.7)")
                    elif flag != "directed" and stated is True and value is False:
                        problems.append(f"at /metamodel/relations/{name}/{flag}: {name!r} states {flag} true, which widens the false of its supertype {parent!r} (DISL section 4.7)")
            elif len(set(values.values())) > 1:
                given = ", ".join(f"{str(value).lower()} from {parent!r}" for parent, value in values.items())
                problems.append(f"at /metamodel/relations/{name}: {name!r} does not state {flag}, and its supertypes give it differently: {given} (DISL section 4.7)")
    return problems


def type_list(names) -> list:
    """A TypeRefs value, one type or a list of them (DESL section 2.2), as a list."""
    return [names] if isinstance(names, str) else list(names)


def resolve_desl(path: Path, document) -> list[str]:
    """Checks the names a DESL specification's surface and persistence refer to (DESL section 10.1, step 4), for a
    table or (DESL 0.2) a hierarchy surface, with the types of each mentions facet, the mark of each counter rule and the
    blocks persistence.settings keeps, and returns a problem per unresolved name, each with the JSON Pointer of where it
    is used."""
    problems = []
    types = document.get("metamodel", {}).get("types", {})
    type_map = document.get("persistence", {}).get("typeMap", {})

    def attributes_of(name):
        """The attributes of an element type (DESL section 4.5)."""
        return types.get(name, {}).get("attributes", {})

    def children_of(name):
        children = types.get(name, {}).get("children", {})
        allowed = set(children.get("allowed", []))
        for slot in children.get("slots", {}).values():
            allowed.update(slot.get("allowed", []))
        return allowed

    def element_type(name, pointer):
        if name not in types:
            problems.append(f"at {pointer}: names the type {name!r}, which the metamodel does not declare")
            return False
        return True

    def attribute(owner, name, pointer, attributes=None):
        if name is not None and name not in (attributes if attributes is not None else attributes_of(owner)):
            problems.append(f"at {pointer}: the type {owner!r} has no attribute {name!r}")

    surface = document.get("surface", {})
    if surface.get("kind") == "hierarchy":  # DESL 0.2, section 7.7
        levels, entries = surface.get("levels", {}), surface.get("entries", {})
        for role, members in (("levels", levels), ("entries", entries)):
            if element_type(members.get("type"), f"/surface/{role}/type"):
                for part in ("title", "description"):
                    attribute(members["type"], members.get(part), f"/surface/{role}/{part}")
        if levels.get("type") in types:
            for contained in (levels["type"], entries.get("type")):
                if contained in types and contained not in children_of(levels["type"]):
                    problems.append(f"at /surface/levels/type: {contained!r} is not contained in {levels['type']!r}")
        for name, label in surface.get("labels", {}).items():
            for index, owner in enumerate(type_list(label.get("on", []))):
                if element_type(owner, f"/surface/labels/{name}/on/{index}"):
                    attribute(owner, name, f"/surface/labels/{name}")
            options = label.get("options", {})
            if element_type(options.get("type"), f"/surface/labels/{name}/options/type"):
                for part in ("name", "colour"):
                    attribute(options["type"], options.get(part), f"/surface/labels/{name}/options/{part}")
        for role, parts in (("notes", ("about", "kind", "text", "detail", "resolved")), ("filters", ("name", "query"))):
            members = surface.get(role)
            if members and element_type(members.get("type"), f"/surface/{role}/type"):
                for part in parts:
                    attribute(members["type"], members.get(part), f"/surface/{role}/{part}")
        if "collapsed" in surface:
            for members in (levels, entries):
                if members.get("type") in types:
                    attribute(members["type"], surface["collapsed"], "/surface/collapsed")
    else:
        columns, cells, views = surface.get("columns", {}), surface.get("cells", {}), surface.get("views", {})
        if element_type(columns.get("type"), "/surface/columns/type"):
            for role in ("name", "valueType", "title", "parent"):
                attribute(columns["type"], columns.get(role), f"/surface/columns/{role}")
            options = columns.get("options")
            if options and element_type(options["type"], "/surface/columns/options/type"):
                if options["type"] not in children_of(columns["type"]):
                    problems.append(f"at /surface/columns/options/type: {options['type']!r} is not contained in {columns['type']!r}")
                for role in ("name", "colour"):
                    attribute(options["type"], options.get(role), f"/surface/columns/options/{role}")
        element_type(surface.get("rows", {}).get("type"), "/surface/rows/type")
        if element_type(cells.get("type"), "/surface/cells/type"):
            attribute(cells["type"], cells.get("column"), "/surface/cells/column")
            if "items" in cells and element_type(cells["items"], "/surface/cells/items") and cells["items"] not in children_of(cells["type"]):
                problems.append(f"at /surface/cells/items: {cells['items']!r} is not contained in {cells['type']!r}")
        if element_type(views.get("type"), "/surface/views/type"):
            attribute(views["type"], views.get("name"), "/surface/views/name")
            attribute("the document", views.get("active"), "/surface/views/active", document.get("metamodel", {}).get("document", {}).get("attributes", {}))
            for role, name in views.get("settings", {}).items():
                element_type(name, f"/surface/views/settings/{role}")
        for name, value_type in surface.get("valueTypes", {}).items():
            holder = cells.get("items") if value_type.get("many") else cells.get("type")
            if holder in types:
                attribute(holder, value_type.get("key"), f"/surface/valueTypes/{name}/key")
            for target in value_type.get("converts", {}):
                if target not in surface.get("valueTypes", {}):
                    problems.append(f"at /surface/valueTypes/{name}/converts: names the value type {target!r}, which the surface does not declare")
    for type_name, declaration in types.items():  # DESL 0.2: what a mentions facet may name (section 4.3)
        for name, declared in declaration.get("attributes", {}).items():
            for index, target in enumerate(type_list(declared.get("mentions", {}).get("types", []))):
                element_type(target, f"/metamodel/types/{type_name}/attributes/{name}/mentions/types/{index}")
    document_attributes = document.get("metamodel", {}).get("document", {}).get("attributes", {})
    for type_name, rule in document.get("persistence", {}).get("ids", {}).get("types", {}).items():
        if rule.get("strategy") == "counter" and rule.get("mark") not in document_attributes:
            problems.append(f"at /persistence/ids/types/{type_name}/mark: names no attribute of the document: {rule.get('mark')!r}")
    settings = document.get("persistence", {}).get("settings", {})
    for name, setting in settings.items():  # DESL 0.2, section 5.5
        pointer = f"/persistence/settings/{name}"
        if "type" in setting and element_type(setting["type"], f"{pointer}/type"):
            for part in ("key", "value"):
                attribute(setting["type"], setting.get(part), f"{pointer}/{part}")
        for index, owner in enumerate(type_list(setting.get("of", []))):
            if element_type(owner, f"{pointer}/of/{index}"):
                attribute(owner, setting.get("attribute"), f"{pointer}/attribute")
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
        declared_blocks = binding.get("registration", {}).get("blocks", {})
        for name in settings:
            if name not in declared_blocks:
                problems.append(f"at /persistence/settings/{name}: the binding {reference!r} declares no registration block {name!r}")
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
    if reference == DED and fields.get("designer") in DESIGNERS:
        reference = DESIGNERS[fields["designer"]]
    if reference.partition("#")[0] not in schemas:
        return None, aliases, f"schema {reference!r} is not in this repository"
    return reference, aliases, None


failures = 0
reading = {}  # what reading each requirement document reports (requirements_from_markdown), by its path
examples = [p for folder in folders for p in sorted(folder.rglob("*")) if is_example(p)]
for path in examples:
    name = path.relative_to(repository).as_posix()
    legacy = "legacy" in path.relative_to(repository).parts
    refused_fbl = root / "fbl" / "refused" in path.parents  # FBL 0.8: bindings that a check of section 14.1 must refuse
    refused_disl = root / "disl" / "refused" in path.parents  # DISL 0.6: specifications that a check of section 14.1 must refuse
    refused = refused_fbl or refused_disl
    if path.suffix == ".adp":
        document, problem = parse_registration(path.read_bytes())
        reference, aliases = FBL_REGISTRATION, []
    elif path.suffix in (".yaml", ".yml", ".xml", ".md"):
        try:
            if path.suffix == ".xml":
                document = knowledge_from_xml(path.read_text(encoding="utf-8"))
            elif path.suffix == ".md":
                document = definition_from_markdown(path.read_text(encoding="utf-8"))
                if document["designer"] == "etalii/hierarchical-requirement":  # read whole, by its designer type's reader
                    document, reading[path] = requirements_from_markdown(path.read_text(encoding="utf-8"))
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
        print(f"FAIL {name}: {len(errors)} error(s)" + (f" (a {'binding' if refused_fbl else 'specification'} in refused/ must be valid against the schema and refused by section 14.1)" if refused else ""))
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
    elif reference == HIERARCHICAL_REQUIREMENT and (problems := reading.get(path)):
        failures += 1
        print(f"FAIL {name}: {len(problems)} finding(s) on reading")
        for problem in problems[:10]:
            print(f"  {problem}")
    elif refused_disl and reference == DISL:
        if problems := resolve_disl(document):
            print(f"ok   {name} (refused, as a specification in refused/ must be: {problems[0]})")
        else:
            failures += 1
            print(f"FAIL {name}: a specification in refused/ must be refused by a check of DISL section 14.1, and this one is accepted")
    elif refused_disl:
        failures += 1
        print(f"FAIL {name}: only DISL specifications belong in specifications/disl/refused/")
    elif refused and reference == FBL:
        if problems := resolve_names(document) + check_constants(document):
            print(f"ok   {name} (refused, as a binding in refused/ must be: {problems[0]})")
        else:
            failures += 1
            print(f"FAIL {name}: a binding in refused/ must be refused by a check of FBL section 14.1, and this one is accepted")
    elif reference in (FBL, DESL, DISL) and (problems := (resolve_names(document) + check_constants(document) if reference == FBL else resolve_desl(path, document) if reference == DESL else resolve_disl(document))):
        failures += 1
        print(f"FAIL {name}: {len(problems)} name problem(s)")
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

# A diagram type whose file has a JSON Schema beside its definition (definitions/diagrams/<name>.schema.json) shows a
# complete file in its companion <name>.md, in the first YAML block that starts with the schema's header key; that
# example must be valid. YAML is read without turning moments into timestamps, as the format's binding reads them.
def yaml_without_timestamps(text: str):
    import yaml

    class Loader(yaml.SafeLoader):
        pass

    Loader.yaml_implicit_resolvers = {
        first: [(tag, pattern) for tag, pattern in resolvers if tag != "tag:yaml.org,2002:timestamp"]
        for first, resolvers in yaml.SafeLoader.yaml_implicit_resolvers.items()
    }
    return yaml.load(text, Loader=Loader)  # noqa: S506 - a SafeLoader subclass


for schema_path in sorted((repository / "definitions" / "diagrams").glob("*.schema.json")):
    companion = schema_path.with_name(schema_path.name.removesuffix(".schema.json") + ".md")
    name = companion.relative_to(repository).as_posix()
    file_schema = json.loads(schema_path.read_text(encoding="utf-8"))
    header = next(iter(file_schema.get("required", [])), None)
    blocks = companion.read_text(encoding="utf-8").split("```yaml\n")[1:] if companion.is_file() else []
    example = next((block.split("```", 1)[0] for block in blocks if header and block.startswith(header + ":")), None)
    if example is None:
        failures += 1
        print(f"FAIL {name}: shows no complete file starting with {header!r} for {schema_path.name}")
        continue
    errors = sorted(Draft202012Validator(file_schema, registry=registry).iter_errors(yaml_without_timestamps(example)), key=lambda e: list(e.absolute_path))
    if errors:
        failures += 1
        print(f"FAIL {name}: its example has {len(errors)} error(s) against {schema_path.name}")
        for error in errors[:10]:
            print(f"  at {'/'.join(str(part) for part in error.absolute_path) or '(root)'}: {error.message}")
    else:
        print(f"ok   {name}: its example is valid against {schema_path.name}")

# ATD, the ADP tool language (spec 035): what a schema alone cannot say about its JSON files. Every findings file,
# trace, conformance fixture, drawing, capability contract and the walk names `atd.schema.json` in `$schema` and is
# validated above; here the refused corpus is checked to be complete, a trace to cover its companion, a fixture's
# files to be there and its splices to turn each step's bytes into the next, and a capability's fixtures to be
# well formed (ATD sections 2.3 to 2.6, contracts/conformance.md).
ATD_SCHEMA = "https://etalii.net/adp/atd/schema/0.1/atd.schema.json"
atd = root / "atd"


def atd_validator(definition: str):
    return Draft202012Validator({"$ref": f"{ATD_SCHEMA}#/$defs/{definition}"}, registry=registry)


def companion_items(text: str, sections) -> list[tuple[str, str]]:
    """The items of a companion's named sections: each `###` heading and top-level list item, with its id
    `<section-slug>/<n>` and its text (ATD section 2.5)."""
    items = []
    current = None
    level = 0
    count = 0
    fenced = False
    for line in text.splitlines():
        if line.startswith("```"):
            fenced = not fenced
            continue
        if fenced:
            continue
        heading = re.match(r"^(#{1,6})\s+(.*?)\s*$", line)
        if heading:
            depth = len(heading.group(1))
            title = heading.group(2)
            if current is not None and depth <= level:
                current = None
            if title in sections:
                current, level, count = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-"), depth, 0
                continue
            if current is not None and depth == 3:
                count += 1
                items.append((f"{current}/{count}", title))
            continue
        item = re.match(r"^[-*+]\s+(.*)$", line) or re.match(r"^[0-9]+[.)]\s+(.*)$", line)
        if current is not None and item:
            count += 1
            items.append((f"{current}/{count}", item.group(1)))
    return items


def check_trace(path: Path) -> list[str]:
    trace = json.loads(path.read_text(encoding="utf-8"))
    problems = []
    description = path.parent / trace["description"]
    if not description.is_file():
        problems.append(f"its description {trace['description']} is not there")
    companion = path.parent / trace["companion"]["file"]
    if not companion.is_file():
        return problems + [f"its companion {trace['companion']['file']} is not there"]
    text = companion.read_text(encoding="utf-8")
    headings = set(re.findall(r"^#{1,6}\s+(.*?)\s*$", text, re.MULTILINE))
    for section in trace["companion"]["sections"]:
        if section not in headings:
            problems.append(f"the companion has no section {section!r}")
    expected = dict(companion_items(text, set(trace["companion"]["sections"])))
    seen = {}
    for item in trace["items"]:
        seen[item["id"]] = seen.get(item["id"], 0) + 1
        if item["id"] in expected and not expected[item["id"]].startswith(item["text"].rstrip(".")):
            problems.append(f"item {item['id']} is {expected[item['id']]!r} in the companion, not {item['text']!r}")
    for item_id in expected:
        if seen.get(item_id, 0) != 1:
            problems.append(f"the companion's item {item_id} ({expected[item_id]!r}) is traced {seen.get(item_id, 0)} times, not once")
    for item_id in seen:
        if item_id not in expected:
            problems.append(f"the trace names {item_id}, which the companion's sections do not have")
    return problems


def check_conformance(path: Path) -> list[str]:
    fixture = json.loads(path.read_text(encoding="utf-8"))
    folder = path.parent
    problems = []
    if not (folder / fixture["description"]).is_file():
        problems.append(f"its description {fixture['description']} is not there")
    files = list(fixture["inputs"].values())
    for drawing in [fixture.get("drawing")] + [step.get("drawing") for step in fixture.get("steps", [])]:
        if isinstance(drawing, dict) and "$ref" in drawing:
            files.append(drawing["$ref"])
    files += [step["expectFile"] for step in fixture.get("steps", []) if "expectFile" in step]
    for name in files:
        if not (folder / name).is_file():
            problems.append(f"the file {name} it names is not there")
    if problems or "body" not in fixture["inputs"]:
        return problems
    history = [(folder / fixture["inputs"]["body"]).read_bytes()]
    position = 0
    for index, step in enumerate(fixture.get("steps", []), start=1):
        expected = None
        if "expectFile" in step:
            expected = (folder / step["expectFile"]).read_bytes()
        elif "expect" in step:
            expected = step["expect"].encode("utf-8")
        if "refused" in step:
            current = history[position]
        elif "outside" in step:
            # Another writer's edit starts the history afresh: nothing before it can be undone (ATD section 2.3).
            current = expected if expected is not None else history[position]
            history, position = [current], 0
        elif step.get("undo"):
            position -= 1
            if position < 0:
                return problems + [f"step {index} undoes with nothing to undo"]
            current = history[position]
        elif step.get("redo"):
            position += 1
            current = history[position]
        else:
            if "splices" in step:
                current, restored, problem = apply_splices(history[position], step["splices"])
                if problem:
                    return problems + [f"step {index}: {problem}"]
                if restored != history[position]:
                    problems.append(f"step {index}: undoing its splices does not give back the bytes before it")
            else:
                current = expected
            del history[position + 1:]
            history.append(current)
            position += 1
        if expected is not None and current != expected:
            problems.append(f"step {index}: its splices give other bytes than it expects, from byte {first_difference(current, expected)}")
    return problems


def check_capability(folder: Path) -> list[str]:
    problems = []
    contract = json.loads((folder / "contract.json").read_text(encoding="utf-8"))
    if contract["name"] != folder.name:
        problems.append(f"its contract names {contract['name']!r}, not the folder's name")
    if contract["name"].split(".")[0] != contract["extensionPoint"]:
        problems.append(f"its name starts with another extension point than {contract['extensionPoint']!r}")
    for part in ("input", "output"):
        target = contract[part]["$ref"].rpartition("#/$defs/")[2]
        if target not in schemas[ATD_SCHEMA]["$defs"]:
            problems.append(f"its {part} names {target!r}, which atd.schema.json does not define")
    validator = atd_validator("CapabilityFixture")
    for fixture in sorted((folder / "fixtures").glob("*.json")):
        for error in validator.iter_errors(json.loads(fixture.read_text(encoding="utf-8"))):
            problems.append(f"fixtures/{fixture.name}: {error.message}")
    return problems


atd_checks = []
for refused_atd in sorted((atd / "refused").glob("*.atd")):
    if not refused_atd.with_name(refused_atd.stem + ".findings.json").is_file():
        atd_checks.append((refused_atd, [f"the refused description has no {refused_atd.stem}.findings.json"]))
for findings in sorted((atd / "refused").glob("*.findings.json")):
    if not findings.with_name(findings.name.removesuffix(".findings.json") + ".atd").is_file():
        atd_checks.append((findings, ["names no refused description beside it"]))
for trace in sorted([*atd.glob("*.trace.json"), *(repository / "definitions").rglob("*.trace.json")]):
    atd_checks.append((trace, check_trace(trace)))
for fixture in sorted([*atd.rglob("conformance.json"), *(repository / "definitions").rglob("conformance.json")]):
    atd_checks.append((fixture, check_conformance(fixture)))
for contract in sorted(atd.glob("capabilities/*/contract.json")):
    atd_checks.append((contract, check_capability(contract.parent)))
if "--atd-trees" in sys.argv:
    trees = Path(sys.argv[sys.argv.index("--atd-trees") + 1])
    tree_validator = atd_validator("Tree")
    tree_files = sorted(trees.rglob("*.tree.json"))
    if not tree_files:
        atd_checks.append((trees, ["holds no *.tree.json"]))
    for tree in tree_files:
        errors = sorted(tree_validator.iter_errors(json.loads(tree.read_text(encoding="utf-8"))), key=lambda e: list(e.absolute_path))
        atd_checks.append((tree, [f"at {'/'.join(str(p) for p in e.absolute_path) or '(root)'}: {e.message}" for e in errors[:10]]))
for path, problems in atd_checks:
    name = path.relative_to(repository).as_posix() if repository in path.parents else path.as_posix()
    if problems:
        failures += 1
        print(f"FAIL {name}: {problems[0]}")
        for problem in problems[1:10]:
            print(f"  {problem}")
    else:
        print(f"ok   {name}: ATD checks")

print(f"{len(examples)} example(s), {failures} invalid.")
sys.exit(1 if failures or not examples else 0)
