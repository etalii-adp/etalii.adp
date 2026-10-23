"""Builds, lints and publishes the grammar of ATD, the ADP tool language (spec 035, contracts/grammar.md).

The grammar lives in `specifications/atd/grammar/` as modules in ATD grammar notation, a subset of Lark's grammar
language (ATD section 4), whose root is `atd.lark`. Modes, any number of them together:

- `--build`: builds the grammar with Lark as `parser="lalr"`, `lexer="contextual"`, `strict=True`, start symbol
  `description`, with `interegular` installed so that two terminals a parser state accepts and that match the same text
  fail the build (rule 1). On a conflict it prints the terminal and the two rules involved, with the state's items.
- `--lint`: refuses every construct outside the notation subset (templates, rule priorities, `%declare`, `%override`,
  `%extend`, imports from outside the language's modules, keep-all-tokens rules, string and regular expression flags,
  ranges, repetition counts) and every terminal outside the regular expression subset of ATD section 3.5, naming the
  file, the line and the construct (rule 2).
- `--probe`: the keyword probe (rule 3, FR-008). In every example, at every token the parser reads as a name, each
  keyword is put in its place: the keyword must be read as that name, leaving the parser where the name left it.
- `--tables`: writes Lark's LALR(1) automaton as `grammar/atd.tables.json`, in the normalized form of
  `atd.schema.json#/$defs/ParseTables` (rule 5).
- `--flatten`: writes `grammar/atd.flat.lark`, the whole grammar in one file, and has `llguidance`'s Lark front end
  accept it (rule 4, FR-090).
- `--highlighting`: writes `highlighting/atd.tmLanguage.json` and `highlighting/atd.sublime-syntax` from the grammar's
  terminal classes (rule 6, FR-052).
- `--check`: all of the above, writing nothing: a generated file that differs from what this script would write
  fails (rule 7).

Exits 0 when every mode passed, 1 when one did not.
"""
import argparse
import copy
import json
import re
import sys
from collections import deque
from pathlib import Path

from lark import Lark, Token
from lark.exceptions import GrammarError, UnexpectedInput

repository = Path(__file__).resolve().parents[2]
atd = repository / "specifications" / "atd"
grammar_dir = atd / "grammar"
root_module = grammar_dir / "atd.lark"
tables_file = grammar_dir / "atd.tables.json"
flat_file = grammar_dir / "atd.flat.lark"
highlighting_dir = atd / "highlighting"
tm_file = highlighting_dir / "atd.tmLanguage.json"
sublime_file = highlighting_dir / "atd.sublime-syntax"
modules = ["atd", "core", "cel", "script", "canvas", "form", "text", "binding", "notation"]

failures = []


def fail(message):
    failures.append(message)
    print(message)


# ---------------------------------------------------------------------------------------------------------------- build

def build(text=None, source=None):
    """The parser Lark builds from the root module (contracts/grammar.md rule 1)."""
    return Lark(text if text is not None else root_module.read_text(encoding="utf-8"), parser="lalr", lexer="contextual",
                strict=True, start="description", import_paths=[str(grammar_dir)],
                source_path=str(source or root_module), g_regex_flags=re.ASCII, propagate_positions=True)


def conflicts(text, source):
    """Every shift/reduce and reduce/reduce conflict of the grammar, with the items of the state it is in."""
    from lark.common import ParserConf
    from lark.load_grammar import load_grammar
    from lark.parsers.lalr_analysis import LALR_Analyzer
    grammar, _ = load_grammar(text, str(source), [str(grammar_dir)], False)
    _, rules, _ = grammar.compile(["description"], set())
    analysis = LALR_Analyzer(ParserConf(rules, None, ["description"]), debug=False, strict=False)
    analysis.compute_lr0_states()
    analysis.compute_reads_relations()
    analysis.compute_includes_lookback()
    analysis.compute_lookaheads()
    found = []
    for state in analysis.lr0_itemsets:
        for lookahead, reductions in state.lookaheads.items():
            reductions = sorted(str(rule) for rule in reductions)
            if len(reductions) > 1:
                found.append(("reduce/reduce", lookahead.name, reductions, state))
            elif lookahead in state.transitions:
                found.append(("shift/reduce", lookahead.name, reductions, state))
    return found


def mode_build():
    text = root_module.read_text(encoding="utf-8")
    try:
        parser = build(text)
    except GrammarError as error:
        fail(f"{root_module.relative_to(repository)}: the grammar does not build as strict LALR(1): {error}")
        for kind, terminal, reductions, state in conflicts(text, root_module)[:20]:
            print(f"  {kind} conflict on {terminal}: reduce {' or '.join(reductions)}")
            shifts = [str(item) for item in state.kernel if not item.is_satisfied and item.next.name == terminal]
            for item in sorted(str(item) for item in state.kernel):
                print(f"      {item}")
            if shifts:
                print(f"    against shifting it in {', '.join(shifts)}")
        return None
    print(f"build: {len(parser.rules)} rules, {len(parser.terminals)} terminals, strict LALR(1), no conflict")
    check_name_rule()
    return parser


cel_reserved = {"as", "break", "const", "continue", "else", "false", "for", "function", "if", "import", "in", "let",
                "loop", "namespace", "null", "package", "return", "true", "var", "void", "while"}


def check_name_rule():
    """`word` lists every keyword that is not one of CEL's reserved words, and `name` adds the ATD keywords that are
    (FR-008, ATD section 3.6); a keyword no other rule uses is not one."""
    core = (grammar_dir / "core.lark").read_text(encoding="utf-8")
    rule = re.search(r"^name: word\n(?:\s+\|.*\n)*\nword: NAME\n(?:\s+\|.*\n)*", core, re.MULTILINE)
    if rule is None:
        fail("specifications/atd/grammar/core.lark: the rules `name` and `word` are not where ATD section 3.6 says")
        return
    listed = re.findall(r'"([A-Za-z_][A-Za-z0-9_]*)"', rule.group(0))
    used = set()
    for module in modules:
        text = (grammar_dir / f"{module}.lark").read_text(encoding="utf-8")
        if module == "core":
            text = text.replace(rule.group(0), "")
        text = re.sub(r"//[^\n]*", "", text)
        used |= set(re.findall(r'"([A-Za-z_][A-Za-z0-9_]*)"', text)) - {"true", "false", "null"}
    if module_unused := sorted(set(listed) - used):
        fail(f"core.lark: `name` lists words no construct uses: {', '.join(module_unused)}")
    if missing := sorted(used - set(listed)):
        fail(f"core.lark: keywords missing from `name` (FR-008): {', '.join(missing)}")
    if misplaced := sorted(w for w in re.findall(r'"([A-Za-z_]+)"', rule.group(0).split("word: NAME")[1])
                           if w in cel_reserved):
        fail(f"core.lark: CEL reserved words in `word`, which CEL identifiers use: {', '.join(misplaced)}")


# ---------------------------------------------------------------------------------------------------------------- lint

# Lark grammar text in tokens: enough to find the constructs the subset does not admit, never inside a string or a
# regular expression.
grammar_token = re.compile(r'''
    (?P<comment>//[^\n]*)
  | (?P<string>"(?:[^"\\\n]|\\.)*"(?P<string_flags>[a-z]*))
  | (?P<regexp>/(?![/*])(?:[^/\\\n]|\\.)+/(?P<regexp_flags>[a-z]*))
  | (?P<directive>%[a-z]+)
  | (?P<word>[?!_]?[A-Za-z_][A-Za-z0-9_]*(?:\.\d+)?)
  | (?P<range>\.\.)
  | (?P<punctuation>->|[:|()\[\]{}?*+~.,])
  | (?P<newline>\n)
  | (?P<space>[ \t\r]+)
''', re.VERBOSE)

admitted_escapes = set("dDsSwWtnr\\")


def regex_problems(pattern):
    """What a terminal's regular expression uses outside the subset of ATD section 3.5, as sentences."""
    problems = []
    i = 0
    in_class = False
    depth_after_atom = False
    while i < len(pattern):
        c = pattern[i]
        if c == "\\":
            if i + 1 >= len(pattern):
                problems.append("a trailing backslash")
                break
            e = pattern[i + 1]
            if e.isdigit():
                problems.append(f"the backreference `\\{e}`")
            elif e.isalpha() and e not in admitted_escapes:
                problems.append(f"the escape `\\{e}`")
            i += 2
            depth_after_atom = True
            continue
        if in_class:
            if c == "]":
                in_class = False
            i += 1
            continue
        if c == "[":
            in_class = True
            if pattern[i + 1:i + 2] == "^":
                i += 1
            if pattern[i + 1:i + 2] == "]":
                i += 1
            i += 1
            depth_after_atom = True
            continue
        if c in "^$":
            problems.append(f"the anchor `{c}`")
        elif c == ".":
            problems.append("`.` outside a character class (write the class: engines differ on which line ends `.` takes)")
        elif c == "(" and pattern[i + 1:i + 2] == "?":
            if pattern[i + 2:i + 3] != ":":
                problems.append(f"the group `{pattern[i:i + 3]}` (only `(…)` and `(?:…)` are admitted)")
        elif c in "*+?}" and pattern[i + 1:i + 2] in ("?", "+") and depth_after_atom:
            problems.append(f"the lazy or possessive quantifier `{c}{pattern[i + 1]}`")
            i += 1
        depth_after_atom = c not in "(|"
        i += 1
    return problems


def mode_lint():
    names_ok = True
    for module in modules:
        path = grammar_dir / f"{module}.lark"
        relative = path.relative_to(repository)
        text = path.read_text(encoding="utf-8")
        line = 1
        at_line_start = True
        previous = None
        position = 0
        while position < len(text):
            match = grammar_token.match(text, position)
            if match is None:
                fail(f"{relative}:{line}: `{text[position]}` is not ATD grammar notation")
                position += 1
                continue
            kind = match.lastgroup if match.lastgroup not in ("string_flags", "regexp_flags") else None
            kind = next(k for k in ("comment", "string", "regexp", "directive", "word", "range", "punctuation",
                                    "newline", "space") if match.group(k) is not None)
            value = match.group(0)
            where = f"{relative}:{line}"
            if kind == "string" and match.group("string_flags"):
                fail(f"{where}: the string flag `{match.group('string_flags')}` of {value} (flags are not admitted)")
            if kind == "regexp":
                if match.group("regexp_flags"):
                    fail(f"{where}: the flag `{match.group('regexp_flags')}` of {value} (flags are not admitted)")
                body = value[1:len(value) - len(match.group("regexp_flags") or "") - 1]
                for problem in regex_problems(body):
                    fail(f"{where}: the terminal {value} uses {problem}, outside the subset of ATD section 3.5")
            if kind == "directive" and value not in ("%import", "%ignore"):
                fail(f"{where}: `{value}` is not admitted (only `%import` and `%ignore` are)")
            if kind == "directive" and value == "%import":
                rest = text[match.end():].lstrip(" \t")
                target = re.match(r"\.([a-z_]+)\s*\(", rest)
                if target is None or target.group(1) not in modules:
                    fail(f"{where}: an import from outside the language's modules (write `%import .<module> (names)`)")
            if kind == "word" and at_line_start:
                head = re.match(r"([?!_]?)([A-Za-z_][A-Za-z0-9_]*)(\.\d+)?", value)
                after = text[match.end():].lstrip(" \t")
                if after.startswith(":") or after.startswith("{"):
                    if head.group(1) == "!":
                        fail(f"{where}: the keep-all-tokens rule `{value}` is not admitted")
                    if head.group(3) and head.group(2)[0].islower():
                        fail(f"{where}: the rule priority of `{value}` is not admitted")
                    if after.startswith("{"):
                        fail(f"{where}: the template `{value}{{…}}` is not admitted")
            if kind == "range":
                fail(f"{where}: the range `..` is not admitted")
            if kind == "punctuation" and value == "~":
                fail(f"{where}: the repetition `~` is not admitted")
            if kind == "newline":
                line += 1
                at_line_start = True
            elif kind not in ("space", "comment"):
                at_line_start = False
            previous = value
            position = match.end()
        del previous
    notation = notation_parser()
    for path in [grammar_dir / f"{module}.lark" for module in modules] + [flat_file]:
        if path.exists():
            try:
                notation.parse(path.read_text(encoding="utf-8"))
            except UnexpectedInput as error:
                fail(f"{path.relative_to(repository)}:{error.line}:{error.column}: not ATD grammar notation as "
                     f"notation.lark states it: {str(error).splitlines()[0]}")
    if names_ok:
        print(f"lint: {len(modules)} modules in ATD grammar notation, every terminal in the regular expression subset")


def notation_parser():
    """A parser of ATD grammar notation from the module `notation` (ATD section 4), which every module reads under."""
    text = "\n".join([
        "start: grammar_text",
        "%import .notation (grammar_text, name, KEY, STRING, NAME, INLINE_HEAD, PRIORITY_HEAD, REGEXP)",
        "%import .core (name, word, NAME, KEY, STRING, WHITESPACE, COMMENT, BLOCK_COMMENT)",
        "%ignore WHITESPACE", "%ignore COMMENT", "%ignore BLOCK_COMMENT", ""])
    return Lark(text, parser="lalr", lexer="contextual", strict=True, import_paths=[str(grammar_dir)],
                g_regex_flags=re.ASCII)


# ---------------------------------------------------------------------------------------------------------------- probe

# CEL's literal words are CEL's, not ATD keywords: outside CEL they are bare words, inside it never names (ATD §3.6).
cel_literal_words = {"true", "false", "null"}


def keyword_terminals(parser):
    """The keywords: every string terminal that spells a name, by terminal name."""
    return {t.name: t.pattern.value for t in parser.terminals
            if t.pattern.type == "str" and re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", t.pattern.value)
            and t.pattern.value not in cel_literal_words}


def lexed_type(parser, state, text, keywords_by_text):
    """The type the contextual lexer gives the word `text` in parser state `state`."""
    accepts = parser.parser.parser.parser.parse_table.states[state]
    keyword = keywords_by_text.get(text)
    if keyword is not None and keyword in accepts:
        return keyword
    return "NAME"


def mode_probe(parser):
    keywords = keyword_terminals(parser)
    by_text = {value: name for name, value in keywords.items()}
    table = parser.parser.parser.parser.parse_table.states
    examples = sorted(p for p in atd.glob("*.atd")) + sorted(atd.glob("refused/*.atd"))
    checked = set()
    count = 0
    for example in examples:
        if example.parent.name == "refused":
            continue
        text = example.read_text(encoding="utf-8")
        interactive = parser.parse_interactive(text)
        tokens = list(_tokens(parser, text))
        for index, token in enumerate(tokens):
            state = interactive.parser_state.position
            if token.type == "NAME" or token.type in keywords:
                following = tokens[index + 1] if index + 1 < len(tokens) else Token("$END", "")
                name_like = token.type == "NAME" or _reads_as_name(interactive, token, following, table)
                key = (state, following.type)
                if name_like and key not in checked:
                    checked.add(key)
                    reference = interactive.copy()
                    reference.feed_token(Token("NAME", "x"))
                    _feed(reference, following)
                    for keyword, spelling in sorted(keywords.items()):
                        kind = lexed_type(parser, state, spelling, by_text)
                        if kind == "NAME":
                            continue
                        attempt = interactive.copy()
                        try:
                            attempt.feed_token(Token(kind, spelling))
                            _feed(attempt, following)
                        except UnexpectedInput:
                            fail(f"{example.relative_to(repository)}:{token.line}:{token.column}: the keyword "
                                 f"`{spelling}` cannot stand where `{token.value}` stands as a name (FR-008)")
                            continue
                        if attempt.parser_state.state_stack != reference.parser_state.state_stack:
                            fail(f"{example.relative_to(repository)}:{token.line}:{token.column}: the keyword "
                                 f"`{spelling}` is read otherwise than the name `{token.value}` there (FR-008)")
                        count += 1
            interactive.feed_token(token)
    print(f"probe: {count} keyword placements at {len(checked)} name positions read as names")


def _tokens(parser, text):
    interactive = parser.parse_interactive(text)
    yield from interactive.iter_parse()


def _feed(interactive, token):
    if token.type == "$END":
        interactive.feed_eof()
    else:
        interactive.feed_token(token)


def _reads_as_name(interactive, token, following, table):
    """Whether the parser reduces this keyword token to a name before it reads the next token."""
    attempt = interactive.copy()
    attempt.feed_token(token)
    depth = len(attempt.parser_state.value_stack)
    values = attempt.parser_state.value_stack
    try:
        _feed(attempt, following)
    except UnexpectedInput:
        return False
    for value in attempt.parser_state.value_stack[:depth]:
        if getattr(value, "data", None) in ("word", "name") and value.children and value.children[-1] is token:
            return True
    return False


# ---------------------------------------------------------------------------------------------------------------- tables

def normalized_tables(parser):
    """Lark's automaton in the normalized form of `$defs/ParseTables` (data-model.md section 14)."""
    terminals_by_name = {t.name: t for t in parser.terminals}
    anonymous = {t.name for t in parser.terminals if t.pattern.type == "str" and not _named_in_grammar(t.name)}

    def terminal_name(name):
        if name in ("$END",):
            return "$END"
        t = terminals_by_name.get(name)
        if t is not None and name in anonymous:
            return json.dumps(t.pattern.value)
        return name

    rules = parser.rules
    helper = {}

    def helper_name(origin):
        if origin in helper:
            return helper[origin]
        if not re.match(r"__.*_(star|plus)_\d+$", origin):
            return origin
        helper[origin] = None
        base = [r for r in rules if r.origin.name == origin and (not r.expansion or r.expansion[0].name != origin)]
        parts = [symbol_name(s) for s in base[0].expansion]
        helper[origin] = "(" + " ".join(parts) + ")+"
        return helper[origin]

    def symbol_name(symbol):
        if symbol.is_term:
            return terminal_name(symbol.name)
        return helper_name(symbol.name)

    normalized_rules = sorted({(symbol_name(r.origin), tuple(symbol_name(s) for s in r.expansion),
                                r.alias or "") for r in rules})
    rule_index = {(lhs, rhs): i for i, (lhs, rhs, _) in enumerate(normalized_rules)}
    table = parser.parser.parser.parser.parse_table
    start = table.start_states["description"]
    order = {start: 0}
    queue = deque([start])
    while queue:
        state = queue.popleft()
        actions = table.states[state]
        targets = []
        for symbol, (action, argument) in actions.items():
            if action.name == "Shift":
                targets.append((_symbol_key(symbol, terminal_name, helper_name), argument))
        for _, target in sorted(targets):
            if target not in order:
                order[target] = len(order)
                queue.append(target)
    states = []
    for state, number in sorted(order.items(), key=lambda item: item[1]):
        actions, gotos = {}, {}
        for symbol, (action, argument) in table.states[state].items():
            key = _symbol_key(symbol, terminal_name, helper_name)
            if action.name == "Shift":
                if _is_terminal(symbol, terminals_by_name):
                    actions[key] = f"s{order[argument]}"
                else:
                    gotos[key] = order[argument]
            else:
                rule = argument
                lhs = symbol_name(rule.origin)
                rhs = tuple(symbol_name(s) for s in rule.expansion)
                if lhs.startswith("$root") and key == "$END":
                    actions[key] = "accept"
                else:
                    actions[key] = f"r{rule_index[(lhs, rhs)]}"
        states.append({"actions": dict(sorted(actions.items())), "gotos": dict(sorted(gotos.items()))})
    return {
        "grammar": "specifications/atd/grammar/atd.lark",
        "start": "description",
        "terminals": sorted(({"name": terminal_name(t.name),
                              "kind": "string" if t.pattern.type == "str" else "pattern",
                              "value": t.pattern.value, "priority": t.priority}
                             for t in parser.terminals), key=lambda t: t["name"]),
        "ignore": sorted(parser.ignore_tokens),
        "rules": [{"lhs": lhs, "rhs": list(rhs), **({"alias": alias} if alias else {})}
                  for lhs, rhs, alias in normalized_rules],
        "states": states,
    }


_grammar_names = None


def _named_in_grammar(name):
    global _grammar_names
    if _grammar_names is None:
        _grammar_names = set()
        for module in modules:
            for match in re.finditer(r"^\s*_?([A-Z][A-Z0-9_]*)(?:\.\d+)?\s*:", (grammar_dir / f"{module}.lark")
                                     .read_text(encoding="utf-8"), re.MULTILINE):
                _grammar_names.add(match.group(1))
    bare = name.split("__")[-1].lstrip("_")
    return bare in _grammar_names


def _is_terminal(symbol, terminals_by_name):
    return symbol in terminals_by_name or symbol == "$END"


def _symbol_key(symbol, terminal_name, helper_name):
    return terminal_name(symbol) if symbol.isupper() or symbol.startswith("$END") or symbol.startswith("__ANON") \
        else helper_name(symbol)


def tables_text(parser):
    data = normalized_tables(parser)
    lines = ["{", '  "$schema": "https://etalii.net/adp/atd/schema/0.1/atd.schema.json#/$defs/ParseTables",']
    for key in ("grammar", "start", "ignore"):
        lines.append(f"  {json.dumps(key)}: {json.dumps(data[key])},")
    lines.append('  "terminals": [')
    lines.append(",\n".join("    " + json.dumps(t, ensure_ascii=False) for t in data["terminals"]))
    lines.append("  ],")
    lines.append('  "rules": [')
    lines.append(",\n".join("    " + json.dumps(r, ensure_ascii=False) for r in data["rules"]))
    lines.append("  ],")
    lines.append('  "states": [')
    lines.append(",\n".join("    " + json.dumps(s, ensure_ascii=False, separators=(",", ":")) for s in data["states"]))
    lines.append("  ]")
    lines.append("}")
    return "\n".join(lines) + "\n"


# ---------------------------------------------------------------------------------------------------------------- flatten

def flatten():
    """The grammar in one file: each module's definitions with the names Lark gives them when the root imports the
    module (a module's own symbols prefixed `<module>__`, shared ones as the root lists them), and no `%import`."""
    root_text = root_module.read_text(encoding="utf-8")
    imports = {}
    for match in re.finditer(r"^%import \.([a-z_]+) \(([^)]*)\)", root_text, re.MULTILINE):
        imports[match.group(1)] = [name.strip() for name in match.group(2).split(",")]
    defined_by = {}
    definitions = {}
    for module in modules:
        text = (grammar_dir / f"{module}.lark").read_text(encoding="utf-8")
        definitions[module] = _definitions(text)
        for name in definitions[module]:
            defined_by[name] = module
    out = ["// ATD 0.1, the grammar in one file (ATD section 4.6): generated by .github/scripts/atd-grammar.py --flatten",
           "// from the modules in this folder. A module's own symbols carry its name as prefix; do not edit.",
           "", "// The start symbol model services look for (LLGuidance, FR-090); the language's start symbol is `description`.",
           "start: description"]
    for module in modules:
        shared = set(imports.get(module, [])) if module != "atd" else None
        out.append("")
        out.append(f"// ---- {module}.lark")
        for name, body in definitions[module].items():
            if module != "atd" and name not in shared:
                if name not in _used_from_root(module, imports, definitions):
                    continue
            out.append(_rename(name, body, module, shared, definitions[module], defined_by))
    out.append("")
    for match in re.finditer(r"^%ignore .*$", root_text, re.MULTILINE):
        out.append(match.group(0))
    return "\n".join(out) + "\n"


def _definitions(text):
    """A module's definitions in order: name to the text of its definition, comments left out."""
    result = {}
    current = None
    for line in text.splitlines():
        stripped = re.sub(r"\s*//.*$", "", line) if not re.search(r'"[^"]*//[^"]*"|/[^/\n]*//', line) else line
        if not stripped.strip() or stripped.lstrip().startswith("//") or stripped.startswith("%"):
            continue
        head = re.match(r"^([?_]?[A-Za-z][A-Za-z0-9_]*)(\.\d+)?\s*:", stripped)
        if head:
            current = head.group(1).lstrip("?")
            result[current] = stripped
        elif current is not None:
            result[current] += "\n" + stripped
    return result


def _used_from_root(module, imports, definitions):
    """The private symbols of a module that the symbols the root imports from it reach."""
    shared = set(imports.get(module, []))
    reached = set()
    todo = [name for name in shared if name in definitions[module]]
    while todo:
        name = todo.pop()
        if name in reached:
            continue
        reached.add(name)
        for reference in re.findall(r"\b[A-Za-z_][A-Za-z0-9_]*\b", _strip_literals(definitions[module][name])):
            if reference in definitions[module] and reference not in reached:
                todo.append(reference)
    return reached


def _strip_literals(text):
    return re.sub(r'"(?:[^"\\\n]|\\.)*"|/(?![/*])(?:[^/\\\n]|\\.)+/|->\s*[a-z_0-9]+', " ", text)


def _rename(name, body, module, shared, own, defined_by):
    def mangle(symbol):
        if module == "atd" or symbol in (shared or ()):
            return symbol
        if symbol.startswith("_"):
            return f"_{module}__{symbol[1:]}"
        return f"{module}__{symbol}"

    pieces = re.split(r'("(?:[^"\\\n]|\\.)*"|/(?![/*])(?:[^/\\\n]|\\.)+/|->\s*[a-z_0-9]+)', body)
    result = []
    for i, piece in enumerate(pieces):
        if i % 2 == 1:
            if piece.startswith("->"):
                alias = piece[2:].strip()
                result.append("-> " + (alias if module == "atd" or alias in (shared or ()) else mangle(alias)))
            else:
                result.append(piece)
            continue

        def replace(match):
            symbol = match.group(0)
            prefix = ""
            if symbol.startswith("?"):
                prefix, symbol = "?", symbol[1:]
            if symbol in own or (module == "atd" and symbol in defined_by):
                return prefix + mangle(symbol)
            return prefix + symbol
        result.append(re.sub(r"\??[A-Za-z_][A-Za-z0-9_]*", replace, piece))
    return "".join(result)


def mode_flatten(parser, write):
    text = flatten()
    try:
        flat = Lark(text, parser="lalr", lexer="contextual", strict=True, start="description", g_regex_flags=re.ASCII)
    except GrammarError as error:
        fail(f"{flat_file.relative_to(repository)}: the flattened grammar does not build: {error}")
        return
    if tables_text(flat).replace('"grammar": "specifications/atd/grammar/atd.lark"', "") != \
            tables_text(parser).replace('"grammar": "specifications/atd/grammar/atd.lark"', ""):
        fail(f"{flat_file.relative_to(repository)}: the flattened grammar builds other tables than the modules")
    try:
        import llguidance
        verdict = llguidance.LLMatcher.validate_grammar(llguidance.grammar_from("lark", text))
    except Exception as error:  # noqa: BLE001 -- any failure of the engine is a refusal
        verdict = str(error)
    if verdict:
        fail(f"{flat_file.relative_to(repository)}: LLGuidance refuses the flattened grammar: {verdict}")
    else:
        print("flatten: the grammar in one file builds the same tables, and LLGuidance accepts it")
    compare_or_write(flat_file, text, write)


# ---------------------------------------------------------------------------------------------------------------- highlighting

def highlighting(parser):
    """The TextMate and Sublime grammars, from the terminal classes of ATD section 3.3."""
    keywords = sorted(set(keyword_terminals(parser).values()), key=lambda k: (-len(k), k))
    statement = {"let", "var", "if", "else", "for", "while", "return", "break", "continue", "fail", "limit", "in"}
    constants = {"true", "false", "null"}
    construct_words = [k for k in keywords if k not in statement and k not in constants]
    control_words = [k for k in keywords if k in statement]
    patterns = [
        ("comment.line.documentation.atd", r"///[^\n]*"),
        ("comment.line.double-slash.atd", r"//[^\n]*"),
        ("string.quoted.triple.atd", r'[rRbB]{0,2}"""(?:(?:"|"")?(?:[^"\\]|\\[\s\S]))*(?:"|"")?"""'),
        ("string.quoted.triple.atd", r"[rRbB]{0,2}'''(?:(?:'|'')?(?:[^'\\]|\\[\s\S]))*(?:'|'')?'''"),
        ("string.quoted.double.atd", r'[rRbB]{0,2}"(?:[^"\\\n\r]|\\[^\n\r])*"'),
        ("string.quoted.single.atd", r"[rRbB]{0,2}'(?:[^'\\\n\r]|\\[^\n\r])*'"),
        ("entity.name.namespace.origin.atd", r"\b[A-Za-z0-9_][A-Za-z0-9_.-]*/[A-Za-z0-9_][A-Za-z0-9_.-]*"),
        ("constant.other.capability-range.atd", r"@[\^~<>=*0-9][^ \t\r\n{}]*"),
        ("variable.other.attribute-reference.atd", r"@[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*"),
        ("variable.other.token-reference.atd", r"\$[A-Za-z_][A-Za-z0-9_-]*(?:\.[A-Za-z_][A-Za-z0-9_-]*)*"),
        ("variable.parameter.param-reference.atd", r"#[A-Za-z_][A-Za-z0-9_]*"),
        ("constant.numeric.length.atd", r"\b[0-9]+(?:\.[0-9]+)?(?:px|mm|in|em|%)"),
        ("constant.numeric.atd", r"\b(?:0x[0-9a-fA-F]+[uU]?|[0-9]+\.[0-9]+(?:[eE][+-]?[0-9]+)?|[0-9]+[eE][+-]?[0-9]+|[0-9]+[uU]?)\b"),
        ("support.type.property-name.atd", r"\b[A-Za-z_][A-Za-z0-9_-]*(?:\.[A-Za-z_][A-Za-z0-9_-]*)*(?=[ \t]*:(?!:))"),
        ("keyword.control.atd", r"\b(?:" + "|".join(control_words) + r")\b"),
        ("constant.language.atd", r"\b(?:true|false|null)\b"),
        ("keyword.other.atd", r"\b(?:" + "|".join(re.escape(k) for k in construct_words) + r")\b"),
        ("keyword.operator.atd", r"->|&&|\|\||==|!=|<=|>=|[-+*/%!<>=?]"),
        ("punctuation.atd", r"[{}()\[\],.:]"),
        ("variable.other.name.atd", r"\b[A-Za-z_][A-Za-z0-9_]*\b"),
    ]
    tm = {
        "$schema": "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json",
        "name": "ATD",
        "scopeName": "source.atd",
        "fileTypes": ["atd"],
        "comment": "Generated by etalii.adp/.github/scripts/atd-grammar.py --highlighting from the ATD grammar; do not edit.",
        "patterns": [{"include": "#block-comment"}] + [{"name": scope, "match": regex} for scope, regex in patterns],
        "repository": {
            "block-comment": {"name": "comment.block.atd", "begin": r"/\*", "end": r"\*/"},
        },
    }
    tm_text = json.dumps(tm, indent=2, ensure_ascii=False) + "\n"
    sublime = ["%YAML 1.2", "---",
               "# Generated by etalii.adp/.github/scripts/atd-grammar.py --highlighting from the ATD grammar; do not edit.",
               "name: ATD", "file_extensions: [atd]", "scope: source.atd", "contexts:", "  main:",
               "    - match: '/\\*'", "      scope: punctuation.definition.comment.begin.atd", "      push: block-comment"]
    for scope, regex in patterns:
        sublime.append(f"    - match: {_yaml_quote(regex)}")
        sublime.append(f"      scope: {scope}")
    sublime += ["  block-comment:", "    - meta_scope: comment.block.atd", "    - match: '\\*/'", "      pop: true"]
    return tm_text, "\n".join(sublime) + "\n"


def _yaml_quote(text):
    return "'" + text.replace("'", "''") + "'"


# ---------------------------------------------------------------------------------------------------------------- files

def compare_or_write(path, text, write):
    relative = path.relative_to(repository)
    if write:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8", newline="\n")
        print(f"wrote {relative}")
    elif not path.exists() or path.read_text(encoding="utf-8") != text:
        fail(f"{relative} differs from what `atd-grammar.py` writes; run it with the mode that writes the file")


def main():
    arguments = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    for mode in ("build", "lint", "probe", "tables", "flatten", "highlighting", "check"):
        arguments.add_argument(f"--{mode}", action="store_true")
    options = arguments.parse_args()
    if not any(vars(options).values()):
        arguments.error("name at least one mode")
    check = options.check
    if check or options.lint:
        mode_lint()
    parser = mode_build() if (check or options.build or options.probe or options.tables or options.flatten
                              or options.highlighting) else None
    if parser is not None:
        if check or options.probe:
            mode_probe(parser)
        if check or options.tables:
            compare_or_write(tables_file, tables_text(parser), write=options.tables and not check)
        if check or options.flatten:
            mode_flatten(parser, write=options.flatten and not check)
        if check or options.highlighting:
            tm_text, sublime_text = highlighting(parser)
            compare_or_write(tm_file, tm_text, write=options.highlighting and not check)
            compare_or_write(sublime_file, sublime_text, write=options.highlighting and not check)
    if failures:
        print(f"{len(failures)} problem(s)")
        return 1
    print("the grammar of ATD passes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
