# Contract *(informative)*: what a tool description looks like

A sketch of the surface syntax the plan builds toward, to fix the decisions of research R4 to R7, R13 and R14. The ATD document fixes the exact keywords and forms; this sketch is not normative and its constructs are shortened.

## A diagram, split into a root and a part

`definitions/diagrams/mindmap.atd`:

```text
atd 0.1

/// Topics in a tree, read from and written to a Freeplane `.mm` file.
diagram freeplane/mindmap version "1.4.0" {
  label "Mind map"
  import "mindmap.notation.atd"
  requires capability layout.twoSidedTree@^1

  model {
    element Topic {
      attribute text: string required
      attribute folded: bool default false
      attribute side: Side default right
      contains Topic as children ordered
    }
    enum Side { left right }
  }

  constraint namedTopic for Topic severity warning
    rule self.text.trim() != ""
    message "A topic needs a text."

  operation addSibling "Add sibling" for Topic when self.parent != null {
    let name = siblingName(self.parent, "Topic")
    create Topic { text: name } in self.parent after self as added
    select added
  }

  fn siblingName(parent: Topic, base: string) -> string {
    let taken = parent.children.map(c, c.text)
    if !(base in taken) { return base }
    for i in range(2, 1000) limit 1000 {
      let candidate = base + " " + string(i)
      if !(candidate in taken) { return candidate }
    }
    fail "No free name below " + parent.text
  }

  binding freeplane family xml {
    claims files "*.mm"
    element Topic at "node" {
      id from attribute "ID"
      attribute text from attribute "TEXT"
      attribute folded from attribute "FOLDED" map { "true": true, absent: false }
      parent within "node"
    }
  }
}
```

`definitions/diagrams/mindmap.notation.atd`:

```text
atd 0.1
part of freeplane/mindmap

notation {
  node Topic {
    shape roundedRect
    label @text editable
    fill $color.surface
    stroke: { width: 1, color: $color.border }
    variant root when self.parent == null {
      shape ellipse
      font: { size: 16, weight: bold }
    }
  }
}

layout {
  default mindmap
  algorithm twoSidedTree capability layout.twoSidedTree { spacing: 24, direction: (self.side == Side.left ? "left" : "right") }
}
```

What the sketch fixes:

- **Values** (R6): `"Topic"` and `24` are literals; `( … )` is CEL; `@text` is an attribute reference, `$color.surface` a theme token; `when`, `rule` and statement right-hand sides take CEL directly.
- **Soft keywords** (R4): `label`, `default` and `text` are keywords in some positions and names in others (`attribute text`, `@text`).
- **Settings** (R7): `stroke: { … }` and `font: { … }` are `key: value` maps, checked against DISL's `Stroke` and `Font`.
- **Script** (R13): `let`, `if`, `for … limit`, `fail`, and the action `create … as added`; `siblingName` is pure where it is called from an expression, and here called from an operation.
- **Capabilities** (R14): `requires capability` once, then used by name.
- **Parts** (FR-012): `import` in the root, `part of` in the part.

## A designer and an editor, in outline

```text
atd 0.1
designer etalii/knowledge version "0.3.0" {
  model { element Concept { attribute name: string required  attribute broader: list<Concept> } }
  surface table Concepts of Concept {
    column name "Name" editable
    column broader "Broader" cell relation picker
    view tree by broader
  }
  binding yaml family yaml { claims files "*.knowledge.yaml" … }
}
```

```text
atd 0.1
editor etalii/markdown version "0.1.0" {
  model { element Heading { attribute level: int  attribute text: string } }
  surface text {
    tokens from binding markdown
    outline Heading by level
    fold Heading
    preview capability render.markdown
  }
  binding markdown family bullets { claims files "*.md" … }
}
```

## A binding with a grammar (FBL 0.9)

```text
binding turtle family grammar {
  claims files "*.ttl"
  grammar {
    start: statement*
    statement: triples "." | directive
    triples: subject predicate_object_list
    …
    %ignore WS
    %ignore COMMENT
  }
  element Resource at "triples" { id from node "subject" … }
  relation Property at "triples/predicate_object_list/verb" { source parent target node "object" … }
}
```
