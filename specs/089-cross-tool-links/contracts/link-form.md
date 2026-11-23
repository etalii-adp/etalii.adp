# Contract: The Link's Text Form (FBL 0.23, section 13.1)

The maintainer's form: `$[DOCUMENT-ID]@[DOCUMENT-NAME]#[ELEMENT-ID].[ELEMENT-NAME-PROP]=[ELEMENT-NAME]`.

## Grammar (ABNF, RFC 5234)

```abnf
link          = "$" document-id "@" document-name [ "#" element-id [ "." name-prop ] [ "=" name ] ]
document-id   = 1*part-char
document-name = 1*part-char          ; the target file's name with extension, no folder
element-id    = 1*part-char
name-prop     = 1*part-char          ; an attribute, property or column of the target element
name          = *part-char           ; the cached name; may be empty
part-char     = unreserved / escaped
unreserved    = %x21-23 / %x26-2D / %x2F-3C / %x3E-3F / %x41-7E / %x80-10FFFF / %x20
                ; any character except "$" "%" "." "=" "@" "#" and controls
escaped       = "%" 2HEXDIG          ; UTF-8 bytes of a reserved character
```

- The reserved characters `$ @ # . = %` inside a part **MUST** be written percent-escaped (`%24 %40 %23 %2E %3D %25`); a reader unescapes after splitting. Hex digits are written in upper case and read in either case.
- A link without `#…` names a document only (a knowledge relation's `target`).
- `name-prop` absent: the target type's `linkable.nameProperty`, else its first text attribute (FR edge case).
- `name` absent: filled in at the next load (contracts/resolution.md, step 4).

## Examples

| Link | Meaning |
|---|---|
| `$k3f9x2ma@provinces.yaml#nh.name=Noord-Holland` | Row `nh` of the knowledge file `provinces.yaml`, named by property `name` |
| `$p0q7e2zd@release.tml#launch=Launch` | Element `launch` of a timeline, name property taken from the type |
| `$m8c1u4wa@ideas.mm#ID_1723.text=v1%2E2 scope` | A mind map node whose text is `v1.2 scope` |
| `$k3f9x2ma@provinces.yaml` | The document only |
| `k3f9x2ma@provinces.yaml` | Malformed: no leading `$` |
