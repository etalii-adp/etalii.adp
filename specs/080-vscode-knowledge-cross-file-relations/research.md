# Research: The VS Code Knowledge Designer Follows Relations into Other Files

**Feature**: [vscode-knowledge-cross-file-relations.spec.md](vscode-knowledge-cross-file-relations.spec.md) | **Date**: 2026-11-21 | **Read at**: `etalii.adp.ide.vscode` `develop` `21e4a16`, `etalii.adp.ide.standalone` `develop` `6da7f5a`

## R1. How the core learns a second file

**Decision**: A `Source` may carry the texts of the files its relations name, by the path the relation writes (`related: Record<string, { fileName, text }>`). The core reads each through the same binding as the open document and takes from it what a relation needs: the rows, their titles and the computed counterpart. The extension gathers those texts: from the open text document when one is open (unsaved changes included), otherwise from disk, and it follows their changes (`onDidChangeTextDocument`, a file-system watcher) and sends a new view when one changes.

**Rationale**: The core stays a function of text, not of VS Code or a file system (principle III); only what it is given grows. The standalone host reads the target read-only and watches it, as `knowledge.md` requires.

**Alternatives considered**: The core reading files itself; it would depend on Node's or VS Code's file access, which principle III forbids.

## R2. One undo step over two files

**Decision**: A two-file step (FR-007, FR-008, FR-010) is planned in the core as splices of both bodies; when either is refused nothing is applied. The extension applies both in one `WorkspaceEdit`, as it already does for a document and its registration (`toolEditor.ts`). Visual Studio Code then records it as one workspace edit: Undo in either editor offers to undo it in both files, and redo restores both.

**Rationale**: It is the platform's own mechanism for an edit over several files (principle I), and the one the extension already uses for a body and its `.adp`. The real-IDE suite holds that one Undo restores both files' bytes (SC-002).

**Risk**: Visual Studio Code asks "Undo in all files?" for a workspace edit across files; that dialog is the platform's and is recorded in `docs/parity.md` with the other native dialogs once Peter has seen it.

## R3. Finding the files that name this one

**Decision**: For FR-009 and FR-010 the extension lists the workspace's knowledge files once (files whose envelope names the Knowledge designer, read through the binding's claim), keeps the list current with a watcher, and asks the core which of their relations name a given file and which of its rows they hold.

**Rationale**: VS Code's `onWillRenameFiles` gives the rename before it happens and accepts a `WorkspaceEdit` to apply with it, so the rewrite of `target` is one step with the move. Counting the rows that relate to a row needs the same list.

## R4. Which file a relation may write

**Decision**: Only a file inside a workspace folder, in a trusted workspace, is ever written; a target outside it is read when the platform allows, and a step that would write it is refused with its reason.

## R5. What changes in `docs/disl-support.md`

The sentence "a tool type here is a function of one document's text" gains its exception: a relation of a DESL table reads the files it names and writes them in the two-file steps of `knowledge.md`. The rows "A relation to another file", "A two-way relation, and the steps that write two files" and "A relation limited to one row" go.
