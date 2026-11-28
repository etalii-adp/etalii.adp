/* What the plain text editor looks like: a bar, and the text as highlighted lines. */
import type { VNode } from 'preact';

/* The highlighted lines of a text. The highlighter (code.ts) marks a text up as the text of HTML, so the lines are handed to the element as that. */
export const CodeLines = ({ lines }: { lines: string }): VNode => <div class="code" tabindex={0} dangerouslySetInnerHTML={{ __html: lines }} />;

/* what says what is shown, the language of the text, and the lines; binary names a file that has no text, and no lines means the text is on its way */
export const Code = ({ what, language, ignored, binary, lines }: { what: string; language: string; ignored: boolean; binary: string | null; lines: string | undefined }): VNode =>
  <div class="tool">
    <div class="tb"><span class="tk">{`Editor · ${what}`}</span><span>{language}</span>{ignored ? <span class="chip">Ignored by git</span> : ''}</div>
    {binary !== null ? <div class="hint">{`${binary} is a binary file, so there is no text to show.`}</div> : lines === undefined ? '' : <CodeLines lines={lines} />}
  </div>;
