import { Envelope, ok, err } from '../lib/envelope.js';
import { parseDocId } from '../lib/parse-doc-id.js';
import type { DocData } from './types.js';

/**
 * Estrategia de lectura por EXPORT PÚBLICO.
 * El documento debe estar compartido como "cualquiera con el enlace".
 * No requiere credenciales.
 */
export async function fetchDocText(
  input: string,
): Promise<Envelope<DocData>> {
  const id = parseDocId(input);
  if (!id) {
    return err('INVALID_URL', `No se pudo extraer un ID de Google Doc desde: "${input}"`);
  }

  const url = `https://docs.google.com/document/d/${id}/export?format=txt`;

  let res: Response;
  try {
    res = await fetch(url);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return err('FETCH_ERROR', `Fallo de red al contactar Google: ${msg}`);
  }

  if (res.status === 404) {
    return err('NOT_FOUND', `No existe un documento con ID "${id}".`);
  }
  if (res.url.includes('accounts.google.com')) {
    return err('FORBIDDEN', 'El documento no es público. Compártelo como "cualquiera con el enlace".');
  }
  if (!res.ok) {
    return err('FETCH_ERROR', `Google respondió con estado ${res.status}.`);
  }

  const text = await res.text();
  const contentType = res.headers.get('content-type') ?? '';
  const looksHtml =
    contentType.includes('text/html') || /^\s*<!doctype html|^\s*<html/i.test(text);
  if (looksHtml) {
    return err('FORBIDDEN', 'El documento no es accesible públicamente (se recibió HTML, no texto).');
  }

  return ok({ id, text, authMode: 'public' });
}
