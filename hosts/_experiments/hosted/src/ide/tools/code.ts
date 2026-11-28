/* Editor: plain text with light highlighting. It shows the stored form of an item, and the files of the File System view. */
import { esc } from '../../common/dom';
import { K } from '../kinds';
import { binary, disk, fileOf, ownerOf, suffixOf } from '../model';
import { project } from '../storage';
import type { Item } from '../types';
import type { Tool } from './shared';

/* what a text is highlighted as: a query, C#, Python, or a file of settings such as a project file; without one, strings, numbers, keys and comments are marked as the .adp files need them */
export type Syntax = 'query' | 'csharp' | 'python' | 'settings';

const words = (list: string, flags: string): RegExp => new RegExp(`(<span[^>]*>.*?</span>)|\\b(${list})\\b`, flags);
const WORDS: Partial<Record<Syntax, RegExp>> = {
  query: words('select|from|where|group by|order by|left join|join|on|as|and|or|not|null|is|sum|max|count|desc|with|having|interval|limit|import|def|return', 'gi'),
  csharp: words('using|namespace|public|private|internal|sealed|static|readonly|class|record|interface|async|await|var|new|return|if|else|foreach|for|in|is|not|null|true|false|throw|get|set|string|int|decimal|bool|void', 'g'),
  python: words('import|from|def|class|return|if|elif|else|for|while|in|is|not|and|or|with|as|yield|assert|raise|try|except|pass|None|True|False', 'g'),
};
/* the comment a line ends with */
const COMMENT: Record<Syntax | 'plain', RegExp> = { plain: /^(.*?)((?:--|#|\/\/) .*|#$)$/, query: /^(.*?)((?:--|#|\/\/) .*|#$)$/, csharp: /^(|.*?\s)(\/\/.*)$/, python: /^(|.*?\s)(#.*)$/, settings: /^(|.*?\s)(#.*)$/ };

/* a text as highlighted lines: strings, numbers and comments, the keys of a .adp file, and the keywords of a query or a language */
export function hl(src: string, syntax?: Syntax): string {
  const plain = !syntax || syntax === 'query', keywords = syntax && WORDS[syntax];
  const marks = plain ? /(&quot;[^&]*?&quot;|'[^']*')|\b(\d+(?:\.\d+)?)\b|^(\s*-?\s*)([\w.@-]+)(:)(?=\s|$)/g : /(&quot;(?:(?!&quot;).)*&quot;|'[^']*')|(?<![\w.])(\d+(?:\.\d+)?)\b/g;
  return src.split('\n').map(l => {
    const m = l.match(COMMENT[syntax ?? 'plain']), com = m ? m[2] : '';
    let code = esc(m ? m[1] : l).replace(marks, (_all, s?: string, nu?: string, lead?: string, key?: string, col?: string) => s ? `<span class="s">${s}</span>` : nu ? `<span class="nu">${nu}</span>` : `${lead}<span class="ky">${key}</span>${col}`);
    if (keywords) code = code.replace(keywords, (_all, span?: string, word?: string) => span || `<span class="kw">${word}</span>`);
    return `<div>${code}${com ? `<span class="cm">${esc(com)}</span>` : ''}</div>`;
  }).join('');
}

/* what the bar of the editor calls a file, where that is not its extension in capitals */
const LANGUAGE: Record<string, string> = { cs: 'C#', py: 'Python', csproj: 'MSBuild', env: 'Text', tag: 'Text', 'python-version': 'Text' };
/* what a text is highlighted as: by the name it has on disk, or else as the storage says of the file */
const syntaxOf = (x: Item, said = ''): Syntax | undefined => {
  const name = x.pseudo ? x.name : x.kind === 'code' || x.kind === 'notebook' ? '.sql' : disk(x);
  return name.endsWith('.sql') ? 'query' : name.endsWith('.cs') ? 'csharp' : name.endsWith('.py') ? 'python' : said === 'settings' ? 'settings' : undefined;
};

export const rCode: Tool = (d, x) => {
  const ext = x.pseudo ? x.name.split('.').pop() || 'adp' : suffixOf(x).replace(/^\./, ''), lang = LANGUAGE[ext.toLowerCase()] ?? ext.toUpperCase(), bin = binary(x);
  /* a binary file has no text to ask for; of anything else the text may still be on its way */
  const file = x.pseudo && !bin ? project.content.file(ownerOf(x), fileOf(x)) : undefined, text = bin ? '' : x.pseudo ? file?.text : project.content.text(x);
  d.innerHTML = `<div class="tool"><div class="tb"><span class="tk">Editor · ${x.pseudo ? 'File' : K[x.kind].label}</span><span>${esc(bin ? 'Binary' : lang)}</span>${x.ignored ? '<span class="chip">Ignored by git</span>' : ''}</div>${bin ? `<div class="hint">${esc(x.name)} is a binary file, so there is no text to show.</div>` : text === undefined ? '' : `<div class="code" tabindex="0">${hl(text || ' ', syntaxOf(x, file?.syntax))}</div>`}</div>`;
};
