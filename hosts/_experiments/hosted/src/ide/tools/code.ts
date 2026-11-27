/* Editor: plain text with light highlighting, and the text of the .adp and .user.adp files. */
import { esc } from '../../common/dom';
import { SOURCES } from '../data/applications';
import { CODE } from '../data/code';
import { K } from '../kinds';
import { binary, disk, modeOf, ownerOf, showAll, slug, suffixOf } from '../model';
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

/* the text of a level's .adp file, or of its .user.adp file */
function adpText(x: Item, user = false): string {
  const o = x.pseudo ? x.parent! : x, children = o.children || [];
  return user ? `# Your personal overrides for ${o.name}. Ignored by git, so they stay on this computer.\nview: ${modeOf(o)}\nshowAllFiles: ${showAll(o)}\ncanvas:\n  layout:\n${children.slice(0, 3).map((k, i) => `    ${k.id}: { x: ${i * 300 + 40}, y: ${i % 2 * 120 + 20} }   # ${k.name}`).join('\n') || '    {}'}`
    : `# Shared settings for ${o.name}. Committed with the project.\nid: ${o.id}\nname: "${o.name}"\nkind: ${o.kind}\nicon: ${o.icon || K[o.kind].icon}\nview: logical            # logical or files\nshowAllFiles: false\n${o.link ? `link:\n  repository: "${o.link.repo}"\n  ref: "${o.link.ref}"\n` : ''}children:\n${children.map(k => `  - id: ${k.id}            # ${k.name}`).join('\n') || '  []'}\ncanvas:\n  layout:\n${children.map((k, i) => `    ${k.id}: { x: ${i % 3 * 300}, y: ${Math.floor(i / 3) * 210} }`).join('\n') || '    {}'}`;
}

function textOf(x: Item): string {
  if (x.pseudo) {
    const owner = ownerOf(x);
    if (x.name in SOURCES) return SOURCES[x.name];
    if (x.name === '.adp') return adpText(x);
    if (x.name === '.user.adp') return adpText(x, true);
    if (x.name.endsWith('.sql')) return `-- Stored form of ${owner.name}. Edit it through its diagram in Logical Structure view.\nselect meter_id, read_at, value_kwh\nfrom bronze.meter_readings\nwhere quality = 'ok'`;
    return `# ${x.name}\n# Stored form of ${owner.name}. Edit it through its tool in Logical Structure view.\nitem: ${owner.id}\nname: "${owner.name}"\nkind: ${owner.kind}`;
  }
  if (x.fresh) return '';
  if (x.kind === 'csharp' || x.kind === 'python') return SOURCES[disk(x)] ?? '';
  if (CODE[x.name]) return CODE[x.name];
  if (x.kind === 'schema') return `{\n  "title": "${x.name}",\n  "type": "object",\n  "required": ["meterId", "readAt", "value"],\n  "properties": {\n    "meterId": { "type": "string" },\n    "readAt": { "type": "string", "format": "date-time" },\n    "value": { "type": "number", "minimum": 0 },\n    "unit": { "enum": ["kWh", "kW", "V"] }\n  }\n}`;
  if (x.kind === 'vocabulary') return `# ${x.name}, a SKOS vocabulary used by the ontology\n@prefix skos: <http://www.w3.org/2004/02/skos/core#> .\n@prefix atlas: <https://atlas.example.com/vocab/> .\n\natlas:${slug(x.name)} a skos:ConceptScheme ;\n  skos:prefLabel "${x.name}" .\n\natlas:residential a skos:Concept ;\n  skos:inScheme atlas:${slug(x.name)} ;\n  skos:prefLabel "Residential" .\n\natlas:commercial a skos:Concept ;\n  skos:inScheme atlas:${slug(x.name)} ;\n  skos:prefLabel "Commercial" .`;
  if (x.kind === 'prompt') return `# ${x.name}\n\nYou write for customers of an energy company.\n\nGiven the outage record below, write two sentences:\n1. What happened and where, in plain words.\n2. When power is expected back, only if the record has an estimate.\n\nNever guess a cause. Never promise a time the record does not contain.`;
  if (x.kind === 'notebook') return `# ${x.name}\nimport pandas as pd\n\nactual = pd.read_sql("select * from silver.system_load", atlas)\nforecast = pd.read_sql("select * from gold.load_forecast", atlas)\n\nerror = (forecast.load_mw - actual.load_mw).abs() / actual.load_mw\nerror.groupby(actual.read_at.dt.hour).mean().plot()   # error per hour of day`;
  return `-- ${x.name}\nselect 1`;
}

/* what the bar of the editor calls a file, where that is not its extension in capitals */
const LANGUAGE: Record<string, string> = { cs: 'C#', py: 'Python', csproj: 'MSBuild', env: 'Text', tag: 'Text', 'python-version': 'Text' };
const syntaxOf = (x: Item): Syntax | undefined => {
  const name = x.pseudo ? x.name : x.kind === 'code' || x.kind === 'notebook' ? '.sql' : disk(x);
  return name.endsWith('.sql') ? 'query' : name.endsWith('.cs') ? 'csharp' : name.endsWith('.py') ? 'python' : name in SOURCES ? 'settings' : undefined;
};

export const rCode: Tool = (d, x) => {
  const ext = x.pseudo ? x.name.split('.').pop() || 'adp' : suffixOf(x).replace(/^\./, ''), lang = LANGUAGE[ext.toLowerCase()] ?? ext.toUpperCase(), bin = binary(x);
  d.innerHTML = `<div class="tool"><div class="tb"><span class="tk">Editor · ${x.pseudo ? 'File' : K[x.kind].label}</span><span>${esc(bin ? 'Binary' : lang)}</span>${x.ignored ? '<span class="chip">Ignored by git</span>' : ''}</div>${bin ? `<div class="hint">${esc(x.name)} is a binary file, so there is no text to show.</div>` : `<div class="code" tabindex="0">${hl(textOf(x) || ' ', syntaxOf(x))}</div>`}</div>`;
};
