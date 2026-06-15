const URL_RE = /\/document\/d\/([a-zA-Z0-9_-]+)/;
const ID_RE = /^[a-zA-Z0-9_-]{20,}$/;

export function parseDocId(input: string): string | null {
    const trimmed = input.trim();
    const fromUrl = trimmed.match(URL_RE);
    if (fromUrl) return fromUrl[1];
    if (ID_RE.test(trimmed)) return trimmed;
    return null;
}