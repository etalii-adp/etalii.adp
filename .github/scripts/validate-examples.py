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
operations of the splices they invert, as a redo's are. (FBL 0.10) A splice that names a `file` writes a file beside
the input, the body a registration names or a sidecar: that file is replayed from its bytes beside the input, the
step's `expectFiles` gives its bytes after the step, and an undo or a redo is checked over the input and those files
together. A fixture with a `template` (`{name, origin}`) states that its input is the new document the binding's
template gives for that file name and origin (FBL section 13): the template is written with its placeholders replaced,
`{key:lower}` included, and compared with the input byte for byte. A `setting` step
on a block the fixture's binding declares with `history: false` is no step of the history (FBL 0.7, section 7.1); an
undo or redo of an edit made before it is checked by what each of its splices replaces and writes, since that block's
write stands between. An `.adp` registration's blocks besides `layout:` and `identities:` are read into `blocks`,
declared or not, and what follows the blocks is kept, as FBL 0.7 section 8.1 says. Every `*.fbl` that validates is
then checked for its names (FBL section 14.1, step 4): every rule a `parent`, `cascade`, `reference.to`, `within` or
`files` names exists in its binding (in the `bullets` family `within` names sections), and a reference's `by` is an attribute every rule it names binds, or `id` when
every rule it names stores its id with `id.from` (the specification languages reserve `id`, so it is never an attribute's name).
It is also checked for its constants (FBL 0.8, section 14.1, step 6): an insert's `constant` stands only on a rule that
reads the yaml or json family, and none of its keys is a key the same rule writes, through a writable attribute
binding, its id or one of its ends. And it is checked for its origins (FBL 0.10, section 14.1, step 6): every
origin a rule's `origins` lists, and every origin `registration.resource.byOrigin` names, is one of the binding's
`claims.origins`. The `*.fbl` documents under `specifications/fbl/refused/` are the other way
round: each must be valid against the schema and refused by one of these checks, and the run fails when one is
accepted.
The fixtures under a folder named `*-equivalence` read one model in different formats: their `read` must be identical.
A fixture whose binding is of the `grammar` family is also **read** (FBL 0.11, the reading check of spec 066's
research R20): its input, or the body its registration names, is parsed with Python Lark under the binding's grammar,
lexed by ATD section 3.6's rule (the longest match, then the higher priority, then a string terminal), read whole or,
with `recover`, unit by unit and inside blocks as FBL section 4.9 says; the rules' `at` select the entries, the first
rule in the binding's order whose `when` holds taking an entry; ids and attribute values are read through `{node}`
slots with `match` and `escape`, a `many` attribute (by the tool type's metamodel) taking every node its slot and its
`gather` reach, and `{value}` and `{parent}` slots; the views of the binding's block rules for the reading's origin give
the selected view, inside which alone `selectedView` rules read. The tool type is found by its origin, the
registration's or, for a body opened alone, the first the binding claims: its `typeMap` puts a type mapped as the
diagram into the document's attributes (a list gathering every entry's items, a single value the first) and leaves out
a relation, and its metamodel gives each attribute's type, so that an int reads as a JSON number. What is compared is
what the fixture's `read` states: `elements` in reading order (type, the id where FBL reads one, `parent` by its
place, and the attributes named), the `document`'s attributes named, `findings` by rule and line among the codes this
check reads (GRAMMAR_FINDINGS), and `unreadable`. It plans no edit; splices stay checked by replay. An element whose id
FBL does not read (no `id.from`, or a slot that reaches nothing) has the id DISL gives it, which is not compared.
A registration with a `legacyLayout` also has its legacy layout file read (FBL section 8.7): its keys case-insensitively,
a key written twice reported as fbl.duplicate-key at its line and a key of the view that names no element of the body as
fbl.stale-view-data.


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
import operator
import re
import sys
import xml.etree.ElementTree as ElementTree
from pathlib import Path

from jsonschema import Draft202012Validator
from lark import Lark, Token, Tree
from lark.lexer import Lexer
from lark.exceptions import UnexpectedInput
from lark.parsers.lalr_analysis import Shift
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

def is_case_input(path: Path) -> bool:
    """Whether a conformance case names the file among its inputs: a tool's own data (a Helm chart carries its
    values.schema.json), which the case's conformance.json checks rather than this script."""
    for folder in path.parents:
        fixture = folder / "conformance.json"
        if fixture.is_file():
            inputs = json.loads(fixture.read_text(encoding="utf-8")).get("inputs", {})
            return path.relative_to(folder).as_posix() in inputs.values()
    return False


schemas = {}
editor_cases = repository / "definitions" / "editors" / "conformance"
for path in sorted([*root.rglob("*.schema.json"), *(repository / "definitions").rglob("*.schema.json")]):
    if editor_cases in path.parents or is_case_input(path):
        continue  # a document of an editor's case, such as a JSON Schema a JSON document names (spec 035, T066), or of another case
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
    if editor_cases in path.parents and path.name != "conformance.json":
        return False  # an editor's case's documents are its inputs, kept byte for byte and checked through its conformance.json
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


def fixture_binding(folder: Path, reference: str):
    """The binding a fixture names, or None when it cannot be read."""
    file, _, name = reference.partition("#")
    try:
        return json.loads((folder / file).read_text(encoding="utf-8"))["bindings"][name]
    except (OSError, ValueError, KeyError):
        return None


def template_key(base: str) -> str:
    """The `{key}` of a template (FBL section 13): the base name with every character outside ASCII letters, digits
    and `_` replaced by `_`, leading and trailing `_` removed, `_` prefixed before a leading digit, `untitled` for
    nothing."""
    key = re.sub(r"[^A-Za-z0-9_]", "_", base).strip("_")
    if key[:1].isdigit():
        key = "_" + key
    return key or "untitled"


def write_template(text: str, name: str) -> tuple[str | None, str | None]:
    """Writes a binding's template for a new file of that name (FBL section 13, step 2), or returns a problem. Only
    the placeholders are replaced; `{` and `}` that form none are literal. A `{newid:<rule>}` depends on an id
    strategy no fixture can state."""
    base = name.rpartition(".")[0] or name
    key = template_key(base)
    values = {"name": name, "base": base, "key": key, "key:lower": key.lower()}  # FBL 0.10: {key:lower}
    written, position = [], 0
    for placeholder in re.finditer(r"\{(name|base|key|key:lower|newid:[^{}]*)\}", text):
        if placeholder.group(1).startswith("newid:"):
            return None, f"the template holds {placeholder.group(0)}, whose id a fixture cannot state"
        written.append(text[position:placeholder.start()])
        written.append(values[placeholder.group(1)])
        position = placeholder.end()
    written.append(text[position:])
    return "".join(written), None


def check_template(folder: Path, fixture) -> str | None:
    """FBL 0.10, section 15.3: a fixture's `template` says that its input is the new document the binding's template
    gives for that file name and origin; the template is written so and compared with the input byte for byte."""
    binding = fixture_binding(folder, fixture["binding"])
    if binding is None:
        return f"its binding {fixture['binding']} cannot be read"
    origin = fixture["template"]["origin"]
    if origin not in binding.get("claims", {}).get("origins", []):
        return f"its template names the origin {origin!r}, which the binding does not claim"
    template = binding.get("template")
    if template is None:
        return "its binding has no template"
    written, problem = write_template(template.get("byOrigin", {}).get(origin, template["text"]), fixture["template"]["name"])
    if problem:
        return problem
    expected = written.encode("utf-8")
    document = (folder / fixture["input"]).read_bytes()
    if document != expected:
        return f"the input is not the template the binding writes for {fixture['template']['name']!r} as {origin}, first at byte {first_difference(document, expected)}"
    return None


def replay_fixture(path: Path, fixture) -> str | None:
    """Replays a fixture's steps (FBL section 15.3) and returns the first problem, if any. The document is the input
    and (FBL 0.10) every file beside it that a step's splices name in `file`, by that name: each file's splices turn
    its bytes before the step into those `expectFiles` gives, and an undo or a redo is checked over all of them."""
    folder = path.parent
    if "template" in fixture and (problem := check_template(folder, fixture)):
        return problem
    beside = (folder / fixture["input"]).parent
    files = {None: (folder / fixture["input"]).read_bytes()}  # None: the input; otherwise a file beside it
    outside = blocks_outside_history(folder, fixture["binding"])
    # (before, after, changes, crossed, operations) of each edit that can be undone, and of each that can be redone:
    # before and after hold every file; changes the input's; crossed: a write outside the history (FBL 0.7, section
    # 7.1) came after it, so its undo is compared by what it changes in the input, not by bytes; operations: the
    # operations its splices are named by, which its undo and redo are listed under (section 15.3)
    done, undone = [], []
    for index, step in enumerate(fixture["steps"], start=1):
        expected_files = step.get("expectFiles", {})
        named = {splice["file"] for splice in step["splices"] if "file" in splice} | set(expected_files)
        for name in sorted(named - set(files)):
            try:
                files[name] = (beside / name).read_bytes()
            except OSError:
                return f"step {index}: the file {name!r} is not beside the input"
        for name in sorted(named - set(expected_files)):
            return f"step {index}: its splices write {name!r}, and expectFiles does not give that file's bytes after the step"
        before_step = dict(files)
        after_step = {}
        for name, document in files.items():
            splices = [splice for splice in step["splices"] if splice.get("file") == name]
            result, restored, problem = apply_splices(document, splices)
            where = "" if name is None else f" in {name!r}"
            if problem:
                return f"step {index}: {problem}{where}"
            if name is None and "expectFile" in step:
                expected = (folder / step["expectFile"]).read_bytes()
            elif name is None and "expect" in step:
                expected = step["expect"].encode("utf-8")
            elif name is None:
                expected = document
            else:
                expected = expected_files.get(name, document.decode("utf-8")).encode("utf-8")
            if result != expected:
                return f"step {index}: the splices give a different document{where}, first at byte {first_difference(result, expected)}"
            if restored != document:
                return f"step {index}: the inverse splices do not restore the document before the step{where}"
            after_step[name] = result
        document, result = before_step, after_step
        edit = step.get("edit", {})
        changes_of_edit = edit if isinstance(edit, list) else [edit]  # FBL 0.7: one transaction's changes
        changes = splice_changes(before_step[None], [splice for splice in step["splices"] if "file" not in splice])
        operations = {splice["operation"] for splice in step["splices"]}
        if step.get("undo") or step.get("redo"):
            # An undo lists the inverse splices under the operation of the splice each inverts, and a redo the edit's own
            # (section 15.3); a snapshot's one splice is under the operation of the edit's first (section 7.1).
            stack = done if step.get("undo") else undone
            if stack and not operations <= stack[-1][4]:
                named_operations = ", ".join(sorted(operations - stack[-1][4]))
                return f"step {index}: the {'undo' if step.get('undo') else 'redo'} names an operation the edit it replays has not: {named_operations}"
        if step.get("undo"):
            if not done:
                return f"step {index}: nothing to undo"
            before, after, edit_changes, crossed, edit_operations = done.pop()
            if crossed and (changes != [(new, old) for old, new in edit_changes] or not same_beside(document, after) or not same_beside(result, before)):
                return f"step {index}: the undo does not put back what the undone edit changed"
            if not crossed and (not same_files(document, after) or not same_files(result, before)):
                return f"step {index}: the undo does not return the document the undone edit started from"
            undone.append((before, after, edit_changes, crossed, edit_operations))
        elif step.get("redo"):
            if not undone:
                return f"step {index}: nothing to redo"
            before, after, edit_changes, crossed, edit_operations = undone.pop()
            if crossed and (changes != edit_changes or not same_beside(document, before) or not same_beside(result, after)):
                return f"step {index}: the redo does not make the changes the edit made"
            if not crossed and (not same_files(document, before) or not same_files(result, after)):
                return f"step {index}: the redo does not return the document the edit produced"
            done.append((before, after, edit_changes, crossed, edit_operations))
        elif step.get("refused") or any("save" in change for change in changes_of_edit):
            if not same_files(result, document):
                return f"step {index}: a refused edit or a save without change must leave the document as it is"
        elif all(change.get("setting", {}).get("block") in outside for change in changes_of_edit):  # no step of the history: undo and redo pass it by
            done = [(before, after, edit_changes, True, edit_operations) for before, after, edit_changes, _, edit_operations in done]
            undone = [(before, after, edit_changes, True, edit_operations) for before, after, edit_changes, _, edit_operations in undone]
        else:
            done.append((document, result, changes, False, operations))
            undone.clear()
        files = result
    return None


def same_files(a: dict, b: dict) -> bool:
    """Whether two states of a fixture's files hold the same bytes; a file one of them has not read yet is as it is
    beside the input in the other, since only a step's splices change a file."""
    return all(a.get(name, b[name]) == b[name] for name in b) and all(b.get(name, a[name]) == a[name] for name in a)


def same_beside(a: dict, b: dict) -> bool:
    """Whether two states of a fixture's files hold the same bytes in every file beside the input."""
    return same_files({name: data for name, data in a.items() if name is not None}, {name: data for name, data in b.items() if name is not None})


# ---------------------------------------------------------------------------------------------- the reading check
# FBL 0.11 (spec 066, research R20): a fixture whose binding is of the grammar family is read here as a host reads it,
# with Python Lark under the binding's grammar, and what it reads is compared with the fixture's `read`. It plans no
# edit; the splices stay checked by replay_fixture.

GRAMMAR_FINDINGS = {"fbl.unparsed-text", "fbl.unclosed-block", "fbl.unmatched-close", "fbl.unclosed-comment",
                    "fbl.duplicate-key", "fbl.stale-view-data"}


class ReadingProblem(Exception):
    """A binding, grammar or expression the reading check cannot read: the fixture fails with its message."""


class CelError(Exception):
    """An expression that has no value for this entry, such as a missing key; in a `when` it does not hold."""


class UnusedLexer(Lexer):
    """The lexer Lark is given for the reading check, which feeds the parser tokens it lexes itself."""

    def __init__(self, lexer_conf):
        self.lexer_conf = lexer_conf

    def lex(self, lexer_state, parser_state):
        raise ReadingProblem("the reading check lexes the body itself")


class GrammarTerminals:
    """The lexing rule of ATD section 3.6 over a built grammar: at a position, of the candidates that match, the
    longest match, then the higher priority, then a string terminal over a pattern terminal."""

    def __init__(self, parser):
        self.terminals = {}
        for terminal in parser.terminals:
            source = re.escape(terminal.pattern.value) if terminal.pattern.type == "str" else terminal.pattern.to_regexp()
            self.terminals[terminal.name] = (re.compile(source, re.ASCII), terminal.priority,
                                             terminal.pattern.type == "str", terminal.pattern.value)
        self.ignored = list(parser.ignore_tokens)
        self.everything = list(self.terminals)

    def named(self, name_or_text):
        """The terminal a `sync` entry, `nested.open` or `nested.close` names: its name, or the text of an anonymous
        string terminal (FBL section 4.9)."""
        if name_or_text in self.terminals:
            return name_or_text
        for name, (_, _, is_string, value) in self.terminals.items():
            if is_string and value == name_or_text:
                return name
        raise ReadingProblem(f"`{name_or_text}` names no terminal of the grammar")

    def token_at(self, text, position, candidates):
        """The (terminal, end) the candidates lex at the position, or None when none of them matches."""
        best = None
        for name in candidates:
            pattern, priority, is_string, _ = self.terminals[name]
            match = pattern.match(text, position)
            if not match or match.end() == position:
                continue
            key = (match.end(), priority, is_string)
            if best is None or key > best[0]:
                best = (key, name)
        return None if best is None else (best[1], best[0][0])


class Lines:
    """1-based lines and columns of positions in a text, its line endings being CRLF, LF or a lone CR (FBL 2.6)."""

    def __init__(self, text):
        self.starts = [0] + [m.end() for m in re.finditer(r"\r\n|\n|\r", text)]

    def line(self, position):
        low, high = 0, len(self.starts)
        while high - low > 1:
            middle = (low + high) // 2
            if self.starts[middle] <= position:
                low = middle
            else:
                high = middle
        return low + 1

    def column(self, position):
        return position - self.starts[self.line(position) - 1] + 1


class GrammarCursor:
    """A parser state that a token is fed to only when the parser can take it: a failed feed leaves it as it was."""

    def __init__(self, state):
        self.state = state

    def copy(self):
        return GrammarCursor(self.state.copy(deepcopy_values=False))

    def accepts(self, terminal):
        return terminal in self.state.parse_conf.parse_table.states[self.state.position]

    def candidates(self):
        return [s for s in self.state.parse_conf.parse_table.states[self.state.position] if s.isupper() and s != "$END"]

    def takes(self, terminal):
        """Whether the parser can shift the terminal here (or, for `$END`, accept), found on the parse table alone.
        A feed that fails after its reductions would have run their callbacks on values the cursor shares with its
        copies, and Lark's tree builder extends a left-recursive rule's children in place (FBL 0.12: a `.owm`
        component's segments read twice), so nothing is fed that this does not admit."""
        states, end_state = self.state.parse_conf.states, self.state.parse_conf.end_state
        stack = list(self.state.state_stack)
        while True:
            entry = states[stack[-1]].get(terminal)
            if entry is None:
                return False
            action, argument = entry
            if action is Shift:
                return terminal != "$END"
            size = len(argument.expansion)
            if size:
                del stack[-size:]
            stack.append(states[stack[-1]][argument.origin.name][1])
            if terminal == "$END" and stack[-1] == end_state:
                return True

    def feed(self, token):
        if not self.takes(token.type):
            return False
        attempt = self.state.copy(deepcopy_values=False)
        try:
            attempt.feed_token(token)
        except UnexpectedInput:
            return False
        self.state = attempt
        return True

    def end(self, token):
        """The tree, when the parser can accept here, else None."""
        if not self.takes("$END"):
            return None
        attempt = self.state.copy(deepcopy_values=False)
        try:
            return attempt.feed_token(token, True)
        except UnexpectedInput:
            return None


class GrammarBlock:
    """A block the reader is inside (FBL 0.11, recover.nested): its open token and its last boundary."""

    def __init__(self, token, cursor, position):
        self.token = token
        self.cursor = cursor
        self.position = position


class GrammarReader:
    """Reads a grammar body as FBL section 4.9 says: whole, or with `recover` unit by unit (FBL 0.9) and inside blocks
    (FBL 0.11, `nested`), giving the tree's root, the findings and the blocks left open."""

    def __init__(self, body, folder):
        source = body["grammar"]
        where = folder / "binding.lark"
        if isinstance(source, dict):
            where = folder / source["file"]
            source = where.read_text(encoding="utf-8")
        self.start = body.get("start", "start")
        self.recover = body.get("recover")
        starts = [self.start] + ([self.recover["unit"]] if self.recover else [])
        try:
            # The reading check lexes by ATD section 3.6 itself (GrammarTerminals), so Lark's own lexer is not built:
            # atd-grammar.py --bindings holds the grammar to strict mode, and its collision check is slow.
            self.parser = Lark(source, parser="lalr", lexer=UnusedLexer, start=starts,
                               import_paths=[str(folder)], source_path=str(where), g_regex_flags=re.ASCII,
                               maybe_placeholders=True, propagate_positions=True)
        except Exception as error:  # noqa: BLE001 - a grammar that does not build is atd-grammar.py's to report
            raise ReadingProblem(f"the binding's grammar does not build: {str(error).splitlines()[0]}") from error
        self.lexer = GrammarTerminals(self.parser)
        recover = self.recover or {}
        self.sync = {self.lexer.named(s) for s in recover.get("sync", [])}
        nested = recover.get("nested")
        self.open = self.lexer.named(nested["open"]) if nested else None
        self.close = self.lexer.named(nested["close"]) if nested else None
        self.unclosed = {self.lexer.named(name): end for name, end in recover.get("unclosed", {}).items()}

    def cursor(self, start):
        return GrammarCursor(self.parser.parse_interactive("", start=start).parser_state)

    def token(self, terminal, start, end):
        return Token(terminal, self.text[start:end], start_pos=start, line=self.lines.line(start),
                     column=self.lines.column(start), end_line=self.lines.line(max(start, end - 1)),
                     end_column=self.lines.column(end), end_pos=end)

    def read(self, text):
        self.text, self.lines = text, Lines(text)
        self.findings, self.open_blocks, self.trivia = [], [], []
        if not self.recover:
            tree, position = self.read_unit(0, self.start, whole=True)
            root = tree
        else:
            units, position = [], 0
            while True:
                position = self.pass_trivia(position)
                if position >= len(text):
                    break
                tree, position = self.read_unit(position, self.recover["unit"])
                if tree is not None and not (isinstance(tree, Tree) and tree.data == self.recover["unit"]
                                             and not tree.children):
                    units.append(tree)
            root = Tree(self.start, units)
        for token in self.trivia:
            end = self.unclosed.get(token.type)
            if end is not None and not token.value.endswith(end):
                self.finding("fbl.unclosed-comment", token.start_pos)
        return root

    def finding(self, rule, position):
        self.findings.append({"rule": rule, "line": self.lines.line(position)})

    def pass_trivia(self, position):
        while position < len(self.text):
            found = self.lexer.token_at(self.text, position, self.lexer.ignored)
            if not found:
                break
            self.trivia.append(self.token(found[0], position, found[1]))
            position = found[1]
        return position

    def read_unit(self, start, symbol, whole=False):
        """One unit from `start` (rules 1 and 2 of section 4.9, and FBL 0.11's rules inside blocks): its tree and the
        position after it, or None and the position after the skipped text."""
        cursor = self.cursor(symbol)
        blocks = []
        position = last = start
        while True:
            candidates = cursor.candidates() + self.lexer.ignored
            found = self.lexer.token_at(self.text, position, candidates) if position < len(self.text) else None
            if found and found[0] in self.lexer.ignored:
                self.trivia.append(self.token(found[0], position, found[1]))
                position = found[1]
                continue
            if found:
                token = self.token(found[0], position, found[1])
                if cursor.feed(token):
                    if token.type == self.open:
                        blocks.append(GrammarBlock(token, cursor.copy(), token.end_pos))
                    elif token.type == self.close and blocks:
                        blocks.pop()
                    elif token.type in self.sync and blocks:
                        blocks[-1].cursor, blocks[-1].position = cursor.copy(), token.end_pos
                    position = last = token.end_pos
                    continue
            if not whole:  # rule 1: the unit ends after its last token when the parser can accept it there
                tree = cursor.end(self.token("$END", last, last))
                if tree is not None:
                    return tree, last
            if found is None and position < len(self.text) and self.close and not blocks:
                probe = self.lexer.token_at(self.text, position, self.lexer.everything)
                if probe and probe[0] == self.close:  # FBL 0.11, rule 7: skipped alone, and it closes nothing
                    self.finding("fbl.unmatched-close", position)
                    position = probe[1]
                    continue
            if position >= len(self.text) and blocks and self.close_at_end(cursor, blocks, last):
                continue  # FBL 0.11, rule 6
            if whole:
                if position >= len(self.text):
                    tree = cursor.end(self.token("$END", last, last))
                    if tree is not None:
                        return tree, last
                raise ReadingProblem(f"the body does not parse at line {self.lines.line(position)} and the binding "
                                     f"has no `recover`, so it is unreadable (FBL section 7.5)")
            if blocks:  # FBL 0.11, rule 5: skip from the block's last boundary, and read on from there
                block = blocks[-1]
                end = self.skip_end(position, inside=True)
                self.finding("fbl.unparsed-text", position)
                if end <= position and position == block.position:
                    end = found[1] if found else position + 1
                cursor = block.cursor.copy()
                position, last = end, block.position
                continue
            end = self.skip_end(position, inside=False)  # FBL 0.9, rule 2: the unit is skipped
            self.finding("fbl.unparsed-text", position)
            return None, end

    def close_at_end(self, cursor, blocks, last):
        """FBL 0.11, rule 6: the innermost block still open at the end of the body ends there, reported at its open
        token. Returns whether it could be closed."""
        close = self.token(self.close, last, last)
        attempt = cursor.copy()
        if not attempt.feed(close):
            attempt = cursor.copy()
            if not any(attempt.feed(self.token(sync, last, last)) for sync in sorted(self.sync)) or not attempt.feed(close):
                return False
        cursor.state = attempt.state
        block = blocks.pop()
        self.open_blocks.append(block.token)
        self.finding("fbl.unclosed-block", block.token.start_pos)
        return True

    def skip_end(self, stop, inside):
        """Where text skipped from the place reading stopped ends: after the first token of a synchronising terminal,
        lexing with every terminal; inside a block (FBL 0.11) before a close token at the block's own depth when that
        comes first; at the end of the body when neither follows."""
        position, depth = stop, 0
        while position < len(self.text):
            found = self.lexer.token_at(self.text, position, self.lexer.everything)
            if not found:
                position += 1
                continue
            name, end = found
            if inside and name == self.open:
                depth += 1
            elif inside and name == self.close:
                if depth == 0:
                    return position
                depth -= 1
            if name in self.lexer.ignored:
                self.trivia.append(self.token(name, position, end))
            if name in self.sync:
                return end
            position = end
        return position


CEL_TOKEN = re.compile(r"\s*(?:(?P<number>\d+(?:\.\d+)?)|(?P<string>'(?:[^'\\]|\\.)*'|\"(?:[^\"\\]|\\.)*\")"
                       r"|(?P<name>[A-Za-z_][A-Za-z0-9_]*)|(?P<operator>==|!=|<=|>=|&&|\|\||[-+*/%<>!?:.,()\[\]{}]))")


CEL_OPERATORS = {"==": operator.eq, "!=": operator.ne, "<": operator.lt, ">": operator.gt, "<=": operator.le,
                 ">=": operator.ge, "+": operator.add, "-": operator.sub, "*": operator.mul, "/": operator.truediv,
                 "%": operator.mod}


class Cel:
    """The part of CEL that bindings' `when` and `value` expressions use (FBL section 2.4), enough for the reading
    check: literals, lists, field and index access, has(), size(), string(), int(), the methods matches, startsWith,
    endsWith, contains and lowerAscii, the comparison, arithmetic and logical operators, and the conditional."""

    def __init__(self, source):
        self.source = source
        self.tokens = []
        position = 0
        while position < len(source):
            match = CEL_TOKEN.match(source, position)
            if not match or match.end() == position:
                if source[position:].strip() == "":
                    break
                raise ReadingProblem(f"the expression `{source}` is not read by the reading check at {position}")
            kind = match.lastgroup
            self.tokens.append((kind, match.group(kind)))
            position = match.end()
        self.index = 0
        self.tree = self.conditional()
        if self.index != len(self.tokens):
            raise ReadingProblem(f"the expression `{source}` is not read by the reading check")

    def peek(self, value=None):
        if self.index >= len(self.tokens):
            return None
        token = self.tokens[self.index]
        return token if value is None or token[1] == value else None

    def take(self, value=None):
        token = self.peek(value)
        if token is None:
            raise ReadingProblem(f"the expression `{self.source}` is not read by the reading check")
        self.index += 1
        return token

    def conditional(self):
        condition = self.binary(0)
        if self.peek("?"):
            self.take("?")
            then = self.conditional()
            self.take(":")
            return ("?", condition, then, self.conditional())
        return condition

    LEVELS = [["||"], ["&&"], ["==", "!=", "<", ">", "<=", ">=", "in"], ["+", "-"], ["*", "/", "%"]]

    def binary(self, level):
        if level == len(self.LEVELS):
            return self.unary()
        left = self.binary(level + 1)
        while self.peek() and self.peek()[1] in self.LEVELS[level] and self.peek()[0] in ("operator", "name"):
            operator = self.take()[1]
            left = (operator, left, self.binary(level + 1))
        return left

    def unary(self):
        if self.peek("!"):
            self.take("!")
            return ("!", self.unary())
        if self.peek("-"):
            self.take("-")
            return ("neg", self.unary())
        return self.member()

    def member(self):
        node = self.primary()
        while True:
            if self.peek("."):
                self.take(".")
                name = self.take()[1]
                if self.peek("("):
                    node = ("call", name, [node] + self.arguments())
                else:
                    node = ("field", node, name)
            elif self.peek("["):
                self.take("[")
                index = self.conditional()
                self.take("]")
                node = ("index", node, index)
            else:
                return node

    def arguments(self):
        self.take("(")
        items = []
        while not self.peek(")"):
            items.append(self.conditional())
            if not self.peek(")"):
                self.take(",")
        self.take(")")
        return items

    def primary(self):
        kind, value = self.take()
        if kind == "number":
            return ("literal", float(value) if "." in value else int(value))
        if kind == "string":
            return ("literal", re.sub(r"\\(.)", r"\1", value[1:-1]))
        if value == "(":
            node = self.conditional()
            self.take(")")
            return node
        if value == "[":
            items = []
            while not self.peek("]"):
                items.append(self.conditional())
                if not self.peek("]"):
                    self.take(",")
            self.take("]")
            return ("list", items)
        if kind == "name":
            if value in ("true", "false", "null"):
                return ("literal", {"true": True, "false": False, "null": None}[value])
            if self.peek("("):
                return ("call", value, self.arguments())
            return ("name", value)
        raise ReadingProblem(f"the expression `{self.source}` is not read by the reading check")

    def evaluate(self, variables):
        return self.value(self.tree, variables)

    def value(self, node, variables):
        kind = node[0]
        if kind == "literal":
            return node[1]
        if kind == "list":
            return [self.value(item, variables) for item in node[1]]
        if kind == "name":
            if node[1] not in variables:
                raise CelError(node[1])
            return variables[node[1]]
        if kind == "field":
            target = self.value(node[1], variables)
            if not isinstance(target, dict) or node[2] not in target:
                raise CelError(node[2])
            return target[node[2]]
        if kind == "index":
            target, index = self.value(node[1], variables), self.value(node[2], variables)
            try:
                return target[index]
            except (KeyError, IndexError, TypeError) as error:
                raise CelError(str(index)) from error
        if kind == "?":
            return self.value(node[2] if self.value(node[1], variables) is True else node[3], variables)
        if kind == "!":
            return not self.value(node[1], variables)
        if kind == "neg":
            return -self.value(node[1], variables)
        if kind == "call":
            return self.call(node[1], node[2], variables)
        if kind == "&&":
            return self.value(node[1], variables) is True and self.value(node[2], variables) is True
        if kind == "||":
            return self.value(node[1], variables) is True or self.value(node[2], variables) is True
        left, right = self.value(node[1], variables), self.value(node[2], variables)
        try:
            return right.__contains__(left) if kind == "in" else CEL_OPERATORS[kind](left, right)
        except (TypeError, AttributeError) as error:
            raise CelError(kind) from error

    def call(self, name, arguments, variables):
        if name == "has":
            try:
                self.value(arguments[0], variables)
            except CelError:
                return False
            return True
        values = [self.value(argument, variables) for argument in arguments]
        try:
            if name == "size":
                return len(values[0])
            if name == "string":
                return str(values[0])
            if name == "int":
                return int(values[0])
            if name == "matches":
                return re.search(values[1].replace("(?<", "(?P<"), values[0]) is not None
            if name in ("startsWith", "endsWith"):
                return values[0].startswith(values[1]) if name == "startsWith" else values[0].endswith(values[1])
            if name == "contains":
                return values[1] in values[0]
            if name == "lowerAscii":
                return values[0].lower()
        except (TypeError, ValueError, IndexError, AttributeError) as error:
            raise CelError(name) from error
        raise ReadingProblem(f"the reading check does not evaluate CEL's `{name}`")


SELECTOR_SEGMENT = re.compile(r"^(?P<name>[^\[\]]+)(?:\[(?P<path>[^=\]]+)=(?P<quote>['\"])(?P<value>.*)(?P=quote)\])?$")


class GrammarTree:
    """The tree of a grammar body as FBL section 4.9 presents it: names, children, spans, texts, document order,
    selectors and the CEL value of a node (section 4.1.4)."""

    def __init__(self, root, text):
        self.root, self.text = root, text
        self.parent, self.order = {}, {}
        stack = [root]
        while stack:
            node = stack.pop()
            self.order[id(node)] = len(self.order)
            children = self.children(node)
            for child in children:
                self.parent[id(child)] = node
            stack.extend(reversed(children))

    def is_token(self, node):
        return isinstance(node, Token)

    def name(self, node):
        return node.type if self.is_token(node) else str(node.data)

    def children(self, node):
        return [] if self.is_token(node) else [child for child in node.children if child is not None]

    def span(self, node):
        if node is self.root:
            return 0, len(self.text)
        if self.is_token(node):
            return node.start_pos, node.end_pos
        return None if node.meta.empty else (node.meta.start_pos, node.meta.end_pos)

    def text_of(self, node):
        span = self.span(node)
        return "" if span is None else self.text[span[0]:span[1]]

    def ancestors(self, node):
        while id(node) in self.parent:
            node = self.parent[id(node)]
            yield node

    def ordered(self, nodes):
        unique = {id(node): node for node in nodes}
        return [node for _, node in sorted((self.order[key], node) for key, node in unique.items())]

    def select(self, context, selector):
        """The nodes a selector reaches (section 4.9's table), in document order."""
        if selector == ".":
            return [context]
        if selector.startswith("/"):
            context, selector = self.root, selector[1:]
        nodes = [context]
        for segment in [part for part in selector.split("/") if part]:
            if segment == "**":
                reached = []
                for node in nodes:
                    reached.extend(self.descendants(node))
                nodes = reached
                continue
            match = SELECTOR_SEGMENT.match(segment)
            if not match:
                raise ReadingProblem(f"the selector `{selector}` has a segment the reading check does not read")
            reached = []
            for node in nodes:
                for child in self.children(node):
                    if match["name"] != "*" and self.name(child) != match["name"]:
                        continue
                    if match["path"] and not any(self.text_of(found) == match["value"]
                                                 for found in self.select(child, match["path"])):
                        continue
                    reached.append(child)
            nodes = reached
        return self.ordered(nodes)

    def descendants(self, node):
        found, stack = [], [node]
        while stack:
            current = stack.pop()
            found.append(current)
            stack.extend(self.children(current))
        return found

    def cel(self, node):
        """A node as CEL sees it: its type, text and children, an optional part that matched nothing being null."""
        if node is None:
            return None
        if self.is_token(node):
            return {"type": node.type, "text": str(node), "children": []}
        return {"type": str(node.data), "text": self.text_of(node), "children": [self.cel(c) for c in node.children]}


class ToolTypes:
    """The tool type specifications by origin (`language.origin`), for the reading check's typeMap and attribute
    types (DISL section 11.2)."""

    specifications = None

    @classmethod
    def of(cls, origin):
        if cls.specifications is None:
            cls.specifications = {}
            for path in sorted(repository.glob("definitions/**/*.dis")) + sorted(root.glob("**/*.dis")):
                if "refused" in path.parts or "legacy" in path.parts:
                    continue
                try:
                    document = json.loads(path.read_text(encoding="utf-8"))
                except ValueError:
                    continue
                cls.specifications.setdefault(document.get("language", {}).get("origin"), document)
        return cls.specifications.get(origin)


class ToolType:
    """A tool type's specification as a binding's rule types meet it: the type map's entry of a rule type and the
    metamodel's declaration of an attribute (DISL section 11.2)."""

    def __init__(self, specification):
        self.type_map = specification.get("persistence", {}).get("typeMap") or {}
        self.metamodel = specification.get("metamodel", {})

    def mapped(self, rule_type):
        """The type map's entry for the rule's type: ('diagram' | 'relation' | 'element' | other, its renames)."""
        entry = self.type_map.get(rule_type)
        if not entry:
            return ("relation" if rule_type in self.metamodel.get("relations", {}) else "element"), {}, rule_type
        target = entry.get("as", rule_type)
        renames = entry.get("attributes", {})
        if target == "diagram":
            return "diagram", renames, None
        if target in self.metamodel.get("relations", {}):
            return "relation", renames, target
        if target in ("header", "unreadable"):
            return target, renames, None
        return "element", renames, target

    def attribute_type(self, rule_type, attribute):
        """The metamodel's declaration of the attribute the binding's attribute maps to, or {} when it has none."""
        kind, renames, target = self.mapped(rule_type)
        name = renames.get(attribute, attribute)
        if kind == "diagram":
            return self.metamodel.get("diagram", {}).get("attributes", {}).get(name, {})
        types = self.metamodel.get("relations" if kind == "relation" else "types", {})
        seen = set()
        while target and target not in seen:
            seen.add(target)
            declared = types.get(target, {})
            if name in declared.get("attributes", {}):
                return declared["attributes"][name]
            target = declared.get("extends")
            target = target[0] if isinstance(target, list) else target
        return {}


class GrammarModel:
    """What reading a grammar body gives for one reading: the elements of the rules, in reading order, with their
    ids, parents and attributes; the attributes of the document from the rules the tool type maps as the diagram;
    and the findings. FBL sections 4.9, 5, 9.3 and, for `selectedView` and views, FBL 0.11."""

    def __init__(self, binding, folder, text, origin, view):
        reader = GrammarReader(binding["body"], folder)
        self.tree = GrammarTree(reader.read(text), text)
        self.findings = list(reader.findings)
        self.open_blocks = reader.open_blocks
        self.lines = reader.lines
        self.binding, self.origin = binding, origin
        specification = ToolTypes.of(origin) or {}
        self.tool = ToolType(specification)
        self.metamodel = self.tool.metamodel
        self.views = self.read_views(view)
        self.selected = next((v for v in self.views if v["selected"]), None)
        self.elements, self.document = [], {}
        self.read_rules()

    def read_views(self, wanted):
        """Every view of the binding's block rules for this reading's origin (section 9.3), the selected one marked."""
        views = []
        rules = [rule for rule in self.binding.get("blocks", []) if "at" in rule and "view" in rule]
        if any("origins" in rule for rule in rules):
            rules = [rule for rule in rules if self.origin in rule.get("origins", [])]
        for rule in rules:
            for entry in self.tree.select(self.tree.root, rule["at"]):
                values = self.slot_values(entry, rule["view"], None)
                views.append({"rule": rule, "entry": entry, "name": values[0] if values else None, "selected": False})
        views = [view for _, _, view in sorted((self.tree.order[id(v["entry"])], i, v) for i, v in enumerate(views))]
        if wanted is None:
            if views:
                views[0]["selected"] = True
        else:
            match = next((v for v in views if v["name"] is not None and v["name"].lower() == wanted.lower()), None)
            if match:
                match["selected"] = True
        return views

    def rules(self):
        return [("element", rule) for rule in self.binding.get("elements", [])] + [
            ("relation", rule) for rule in self.binding.get("relations", [])]

    def read_rules(self):
        selected = {}
        candidates = []
        for kind, rule in self.rules():
            for entry in self.tree.select(self.tree.root, rule["at"]):
                candidates.append((kind, rule, entry))
        matched = {id(entry) for _, _, entry in candidates}
        claimed = {}
        for kind, rule, entry in candidates:
            if id(entry) in claimed:
                continue
            if rule.get("selectedView") and not (self.selected and any(
                    a is self.selected["entry"] for a in self.tree.ancestors(entry))):
                continue
            if "when" in rule and not self.holds(rule["when"], entry, matched):
                continue
            claimed[id(entry)] = (kind, rule, entry)
        for _, (kind, rule, entry) in sorted((self.tree.order[key], claim) for key, claim in claimed.items()):
            element = {"kind": kind, "rule": rule, "entry": entry, "attributes": {}, "id": None, "parent": None}
            selected[id(entry)] = element
            parent_rules = rule.get("parent", {}).get("rules", [])
            element["parent"] = next((selected[id(a)] for a in self.tree.ancestors(entry)
                                      if id(a) in selected and selected[id(a)]["rule"]["name"] in parent_rules), None)
            enclosing = next((selected[id(a)] for a in self.tree.ancestors(entry) if id(a) in selected), None)
            identifier = rule.get("id", {}).get("from")
            if identifier:
                values = self.slot_values(entry, identifier, enclosing)
                element["id"] = values[0] if values else None
            for attribute, binding in rule.get("attributes", {}).items():
                value = self.attribute_value(rule, attribute, binding, entry, enclosing)
                if value is not None:
                    element["attributes"][attribute] = value
            self.place(element)

    def holds(self, expression, entry, matched):
        parent = next((a for a in self.tree.ancestors(entry) if id(a) in matched), None)
        variables = {"entry": self.tree.cel(entry), "parent": self.tree.cel(parent),
                     "line": self.lines.line(self.tree.span(entry)[0]) if self.tree.span(entry) else 0,
                     "registration": {}}
        try:
            return Cel(expression).evaluate(variables) is True
        except CelError:
            return False

    def mapped(self, rule):
        return self.tool.mapped(rule["type"])

    def attribute_type(self, rule, attribute):
        return self.tool.attribute_type(rule["type"], attribute)

    def attribute_value(self, rule, attribute, binding, entry, enclosing):
        declared = self.attribute_type(rule, attribute)
        values = self.slot_values(entry, binding, enclosing)
        for further in binding.get("gather", []):
            values = values + self.slot_values(entry, further, enclosing)
        if declared.get("many"):
            return [self.converted(value, declared) for value in values]
        if not values:
            return binding.get("default")
        return self.converted(values[0], declared)

    def converted(self, value, declared):
        kind = declared.get("type")
        if not isinstance(value, str):
            return value
        if kind == "int" and re.fullmatch(r"[-+]?\d+", value):
            return int(value)
        if kind == "number" and re.fullmatch(r"[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?", value):
            return float(value)
        if kind == "bool" and value in ("true", "false"):
            return value == "true"
        return value

    def slot_values(self, entry, slot, enclosing):
        """Every value a slot reads from an entry, in document order (FBL 0.11: a `many` attribute's `{node}` slot
        reads every node it reaches; a single-valued one takes the first)."""
        if "node" in slot:
            values = []
            for node in self.tree.select(entry, slot["node"]):
                if self.tree.span(node) is None:
                    continue
                value = self.tree.text_of(node)
                if "match" in slot:
                    match = re.fullmatch(slot["match"].replace("(?<", "(?P<"), value, re.DOTALL)
                    if not match:
                        continue
                    value = match["value"]
                if "escape" in slot:
                    value = unescaped(value, slot["escape"]["with"], slot["escape"]["quote"])
                values.append(value)
            return values
        if "value" in slot:
            try:
                value = Cel(slot["value"]).evaluate({"entry": self.tree.cel(entry), "line": self.lines.line(
                    self.tree.span(entry)[0]) if self.tree.span(entry) else 0, "registration": {}, "parent": None})
            except CelError:
                return []
            return [] if value is None else [value]
        if "parent" in slot:
            if enclosing is None or slot["parent"] not in enclosing["attributes"]:
                return []
            value = enclosing["attributes"][slot["parent"]]
            return value if isinstance(value, list) else [value]
        raise ReadingProblem(f"a slot of the grammar family the reading check does not read: {json.dumps(slot)}")

    def place(self, element):
        """An element as reading yields it: in `elements`, or, for a type the tool type maps as the diagram, in the
        document's attributes, a list attribute gathering the items of every entry in reading order and a single one
        taking the first; a relation, a header or an unreadable entry is in neither."""
        kind, renames, _ = self.mapped(element["rule"])
        element["mapped"] = kind
        if kind == "element" and element["kind"] == "element":
            self.elements.append(element)
        elif kind == "diagram":
            for attribute, value in element["attributes"].items():
                name = renames.get(attribute, attribute)
                if isinstance(value, list):
                    self.document[name] = self.document.get(name, []) + value
                else:
                    self.document.setdefault(name, value)


def unescaped(value, escape, quote):
    """FBL 0.11, a slot's `escape`: `with`+`quote` reads as `quote`, `with`+`with` as `with`, and `with` before any other
    character stays as it is."""
    result, index = [], 0
    while index < len(value):
        if value[index] == escape and index + 1 < len(value) and value[index + 1] in (escape, quote):
            result.append(value[index + 1])
            index += 2
        else:
            result.append(value[index])
            index += 1
    return "".join(result)


def grammar_fixture_binding(path: Path, fixture):
    """The binding a fixture names and the folder of its FBL document, or None and None when it cannot be read."""
    reference = fixture["binding"].partition("#")[0]
    return fixture_binding(path.parent, fixture["binding"]), (path.parent / reference).resolve().parent


def reading_of_fixture(path: Path, fixture, binding, folder):
    """What the fixture's input reads as: a body, or a registration that names one (FBL section 8), and the origin of
    the reading, which is the registration's or, for a body opened alone, the first origin the binding claims."""
    input_path = path.parent / fixture["input"]
    view, registration = None, {}
    origin = (binding.get("claims", {}).get("origins") or [None])[0]
    registration_input = input_path.suffix == ".adp"
    if registration_input:
        registration, problem = parse_registration(input_path.read_bytes())
        if problem:
            raise ReadingProblem(f"the registration does not parse: {problem}")
        origin, view = registration["origin"], registration.get("view")
        if "body" in registration:
            input_path = input_path.parent / registration["body"]
        else:
            input_path = next((input_path.with_suffix(e) for e in binding.get("claims", {}).get("extensions", [])
                               if input_path.with_suffix(e).is_file()), input_path)
    text = input_path.read_bytes().decode("utf-8").removeprefix("﻿")
    model = GrammarModel(binding, folder, text, origin, view)
    legacy = binding.get("registration", {}).get("legacyLayout")
    if registration_input and legacy and "layout" not in registration:
        sidecar = input_path.parent / legacy.replace("{base}", input_path.stem)
        if sidecar.is_file():
            model.findings.extend(legacy_layout_findings(model, sidecar.read_text(encoding="utf-8")))
    return model


def legacy_layout_findings(model, text):
    """FBL 0.11, section 8.7: what reading a legacy layout reports for the reading's view. The view's object and its
    element keys are matched ignoring the case of ASCII letters; of two keys that match one id the first applies and
    each later one is `fbl.duplicate-key`, and a key that names no element of the body is `fbl.stale-view-data`, each
    at its line in the sidecar. The other views of the file are not read."""
    findings = []
    view = model.selected["name"] if model.selected else None
    layout = json.loads(text, object_pairs_hook=list)
    entries = next((value for key, value in layout if view is not None and key.lower() == view.lower()), None)
    if entries is None:
        return findings
    ids = {element["id"].lower(): element["id"] for element in model.elements if element["id"]}
    applied = set()
    lines = Lines(text)
    searched = 0
    for key, _ in entries:
        searched = text.index(json.dumps(key), searched)
        line = lines.line(searched)
        if key.lower() not in ids:
            findings.append({"rule": "fbl.stale-view-data", "line": line})
        elif key.lower() in applied:
            findings.append({"rule": "fbl.duplicate-key", "line": line})
        applied.add(key.lower())
    return findings


def same_value(expected, actual) -> bool:
    """Whether a value read equals the fixture's, of the same JSON type (a bool is not a number)."""
    if isinstance(expected, bool) or isinstance(actual, bool):
        return isinstance(expected, bool) and isinstance(actual, bool) and expected == actual
    if isinstance(expected, list) and isinstance(actual, list):
        return len(expected) == len(actual) and all(same_value(e, a) for e, a in zip(expected, actual))
    return type(expected) is type(actual) and expected == actual or (
        isinstance(expected, (int, float)) and isinstance(actual, (int, float)) and expected == actual)


def check_reading(path: Path, fixture) -> str | None:
    """The reading check (FBL 0.11, research R20): for a fixture whose binding is of the grammar family, what reading
    its input gives against the fixture's `read`. Returns the first difference, if any."""
    expected = fixture.get("read")
    binding, folder = grammar_fixture_binding(path, fixture)
    if expected is None or binding is None or binding.get("body", {}).get("family") != "grammar":
        return None
    try:
        model = reading_of_fixture(path, fixture, binding, folder)
    except ReadingProblem as problem:
        if expected.get("unreadable") and "unreadable" in str(problem):
            return None
        return f"reading: {problem}"
    if expected.get("unreadable"):
        return "reading: the fixture says the body is unreadable, and it reads"
    if "elements" in expected:
        read = model.elements
        if len(read) != len(expected["elements"]):
            listed = ", ".join(f"{e['rule']['type']} {e['id']}" for e in read)
            return f"reading: {len(read)} element(s) read ({listed}), and the fixture lists {len(expected['elements'])}"
        position = {id(element): index for index, element in enumerate(read)}
        for index, (want, got) in enumerate(zip(expected["elements"], read), start=1):
            where = f"reading: element {index} ({want['id']})"
            if want["type"] != got["rule"]["type"]:
                return f"{where} is read as a {got['rule']['type']}, and the fixture says {want['type']}"
            if got["id"] is not None and want["id"] != got["id"]:
                return f"{where} is read with the id {got['id']}"
            if "parent" in want:
                parent = got["parent"]
                parent_id = None if parent is None else expected["elements"][position[id(parent)]]["id"] \
                    if id(parent) in position else parent["id"]
                if want["parent"] != parent_id:
                    return f"{where} is read inside {parent_id}, and the fixture says {want['parent']}"
            for attribute, value in want.get("attributes", {}).items():
                actual = got["attributes"].get(attribute)
                if not same_value(value, actual) and not (value is None and attribute not in got["attributes"]):
                    return f"{where}: {attribute} reads {json.dumps(actual)}, and the fixture says {json.dumps(value)}"
    if "document" in expected:
        for attribute, value in expected["document"].get("attributes", {}).items():
            actual = model.document.get(attribute)
            if not same_value(value, actual) and not (value is None and attribute not in model.document):
                return f"reading: the document's {attribute} reads {json.dumps(actual)}, and the fixture says {json.dumps(value)}"
    if "findings" in expected:
        got = sorted((f["rule"], f["line"]) for f in model.findings)
        want = [f for f in expected["findings"] if f["rule"] in GRAMMAR_FINDINGS]
        remaining = list(got)
        for finding in want:
            match = next((g for g in remaining if g[0] == finding["rule"] and finding.get("line", g[1]) == g[1]), None)
            if match is None:
                return f"reading: no {finding['rule']} is read{' at line ' + str(finding['line']) if 'line' in finding else ''}; read: {got}"
            remaining.remove(match)
        if remaining:
            return f"reading: {remaining[0][0]} is read at line {remaining[0][1]}, which the fixture does not list"
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


def check_origins(document) -> list[str]:
    """Checks the origins an FBL document's rules and resource captures name (FBL 0.10, section 14.1, step 6): every
    origin a rule's `origins` lists, and every origin `registration.resource.byOrigin` names, is one of the binding's
    `claims.origins`. Returns a problem per origin that is not, with the JSON Pointer of where it is named."""
    problems = []
    for binding_name, binding in document.get("bindings", {}).items():
        base = f"/bindings/{binding_name}"
        claimed = set(binding.get("claims", {}).get("origins", []))
        for kind in ("elements", "relations", "blocks"):
            for index, rule in enumerate(binding.get(kind, [])):
                for origin in rule.get("origins", []):
                    if origin not in claimed:
                        problems.append(f"at {base}/{kind}/{index}/origins: the rule {rule['name']!r} is read for {origin!r}, which the binding does not claim")
        for origin in binding.get("registration", {}).get("resource", {}).get("byOrigin", {}):
            if origin not in claimed:
                problems.append(f"at {base}/registration/resource/byOrigin: names the origin {origin!r}, which the binding does not claim")
    return problems


def check_grammar_family(path: Path, document) -> list[str]:
    """Checks FBL 0.11's constructs that the schema cannot (section 14.1, step 6) and returns a problem per finding:
    `create.after` names attributes of the same rule; `gather` stands only on a read-only attribute binding;
    `selectedView` only in a binding with a block rule that has `view` (a block rule's `origins` are check_origins');
    and `recover.nested` and `recover.unclosed` name terminals of the binding's grammar,
    the terminals of `unclosed` ignored ones, as `atd-grammar.py --bindings` checks too. FBL 0.12: `items` stands only
    on an attribute that is `many` in the tool type's specification (items_not_many); the schema keeps `items` and
    `separator` to a `{node}` slot of the grammar family and `{n}` once in `sidecar.ordinal`."""
    problems = []
    for binding_name, binding in document.get("bindings", {}).items():
        base = f"/bindings/{binding_name}"
        views = any("view" in block for block in binding.get("blocks", []))
        for kind in ("elements", "relations"):
            for index, rule in enumerate(binding.get(kind, [])):
                pointer = f"{base}/{kind}/{index}"
                if rule.get("selectedView") and not views:
                    problems.append(f"at {pointer}/selectedView: the binding has no block rule with view, so no view is selected")
                attributes = rule.get("attributes", {})
                for attribute, attribute_binding in attributes.items():
                    if not isinstance(attribute_binding, dict):
                        continue
                    for name in attribute_binding.get("create", {}).get("after", []) if isinstance(attribute_binding.get("create"), dict) else []:
                        if name not in attributes or name == attribute:
                            problems.append(f"at {pointer}/attributes/{attribute}/create/after: {name!r} is no other attribute of the rule {rule['name']!r}")
                    if "gather" in attribute_binding and not (attribute_binding.get("readOnly") or rule.get("readOnly") or binding.get("readOnly")):
                        problems.append(f"at {pointer}/attributes/{attribute}/gather: gather stands only on a read-only attribute binding")
                    if "items" in attribute_binding:
                        problems.extend(items_not_many(binding, rule, attribute, f"{pointer}/attributes/{attribute}/items"))
        body = binding.get("body", {})
        recover = body.get("recover") or {}
        if body.get("family") == "grammar" and ("nested" in recover or "unclosed" in recover):
            try:
                reader = GrammarReader(body, path.parent)
            except ReadingProblem as problem:
                problems.append(f"at {base}/body/recover: {problem}")
                continue
            ignored = set(reader.lexer.ignored)
            for terminal in recover.get("unclosed", {}):
                if reader.lexer.named(terminal) not in ignored:
                    problems.append(f"at {base}/body/recover/unclosed: {terminal!r} is not a terminal the grammar ignores")
    return problems


def items_not_many(binding, rule, attribute, pointer) -> list[str]:
    """FBL 0.12, section 14.1, step 6: an attribute binding with `items` binds an attribute that is `many` in the tool
    type's specification, the attribute a `typeMap` maps it to included. It is checked against each specification of
    an origin the binding claims that is read through FBL, since that is the one loaded with the binding; one read
    by a plugin, or a rule type or attribute the specification does not declare, says nothing."""
    problems = []
    for origin in binding.get("claims", {}).get("origins", []):
        specification = ToolTypes.of(origin)
        if not specification or specification.get("persistence", {}).get("format") != "fbl":
            continue
        declared = ToolType(specification).attribute_type(rule["type"], attribute)
        if declared and not declared.get("many"):
            problems.append(f"at {pointer}: items stands only on a many attribute, and {origin} declares {attribute!r} of {rule['type']!r} single-valued")
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
    elif reference == FBL_FIXTURE and (problem := replay_fixture(path, document) or check_reading(path, document)):
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
        if problems := resolve_names(document) + check_constants(document) + check_origins(document) + check_grammar_family(path, document):
            print(f"ok   {name} (refused, as a binding in refused/ must be: {problems[0]})")
        else:
            failures += 1
            print(f"FAIL {name}: a binding in refused/ must be refused by a check of FBL section 14.1, and this one is accepted")
    elif reference in (FBL, DESL, DISL) and (problems := (resolve_names(document) + check_constants(document) + check_origins(document) + check_grammar_family(path, document) if reference == FBL else resolve_desl(path, document) if reference == DESL else resolve_disl(document))):
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
    for report in trace["companion"].get("reports", []):
        if not (path.parent / report).is_file():
            problems.append(f"its companion report {report} is not there")
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
    # A fixture's input and output are its contract's: each is checked against the `$defs` entry the contract names.
    parts = {}
    for part in ("input", "output"):
        target = contract[part]["$ref"].rpartition("#/$defs/")[2]
        if target in schemas[ATD_SCHEMA]["$defs"]:
            parts[part] = atd_validator(target)
    for fixture in sorted((folder / "fixtures").glob("*.json")):
        recorded = json.loads(fixture.read_text(encoding="utf-8"))
        for error in validator.iter_errors(recorded):
            problems.append(f"fixtures/{fixture.name}: {error.message}")
        for part, part_validator in parts.items():
            if part not in recorded:
                continue
            for error in part_validator.iter_errors(recorded[part]):
                where = "/".join(str(step) for step in error.absolute_path) or "(root)"
                problems.append(f"fixtures/{fixture.name}: its {part} at {where}: {error.message}")
        for name in recorded.get("args", {}):
            if name not in contract.get("args", {}):
                problems.append(f"fixtures/{fixture.name}: its argument {name!r} is not one its contract declares")
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
