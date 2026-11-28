/* Ids: the ShortGuid every item is named by, the short hash of a commit, and the id of a call. */

/* An item's id is a ShortGuid, as in the other ADP hosts (ShortGuid in the standalone host; "encoding": "base36" in DISL 11.5.1): a UUID, written as its 128-bit value in lowercase base 36 and left-padded with 0 to 25 characters, the smallest width every UUID fits in. */
const SHORT_GUID_LENGTH = 25;
const shortGuid = (bytes: Uint8Array): string => bytes.reduce((n, b) => n << 8n | BigInt(b), 0n).toString(36).padStart(SHORT_GUID_LENGTH, '0');
/* a new item gets a random UUID (version 4) */
export const newShortGuid = (): string => {
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = b[6] & 15 | 64; b[8] = b[8] & 63 | 128;
  return shortGuid(b);
};
/* what is named by its place gets a UUID made from that place (version 8), so it has the same id on every load, as ShortGuid.FromName gives one name one id in the standalone host */
export const shortGuidOf = (name: string): string => {
  const b = new Uint8Array(16), v = new DataView(b.buffer);
  for (let i = 0; i < 4; i++) {
    let h = 2166136261 ^ Math.imul(i + 1, 0x9e3779b1);
    for (const ch of name) h = Math.imul(h ^ ch.codePointAt(0)!, 16777619);
    h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
    v.setUint32(i * 4, h >>> 0);
  }
  b[6] = b[6] & 15 | 128; b[8] = b[8] & 63 | 128;
  return shortGuid(b);
};

/* a commit hash as git abbreviates it, seven hex digits: one made from a text, and a new one */
export const gitHashOf = (s: string): string => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.codePointAt(0)!, 16777619); return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7); };
export const newGitHash = (): string => gitHashOf(Math.random() + '/' + Date.now());

/* the id of one call: a command that is sent again carries the same one, so it is carried out once */
export const newCallId = newShortGuid;
