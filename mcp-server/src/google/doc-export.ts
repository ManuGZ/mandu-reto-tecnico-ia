import type { Envelope } from '../lib/envelope.js';
import { existsSync } from 'node:fs';
import type { DocData } from './types.js';
/**
 * Selector de estrategia de autenticación (AUTO-DETECCIÓN).
 *
 *  - Si GOOGLE_APPLICATION_CREDENTIALS está definido -> service account (googleapis),
 *    que soporta documentos privados.
 *  - Si no                                            -> export público (el documento
 *    debe estar compartido por enlace).
 *
 * Para cambiar de modo el usuario solo define o quita GOOGLE_APPLICATION_CREDENTIALS
 * (y reinicia el server). No hay que tocar este código ni el resto del harness.
 *
 * La estrategia se carga con import() dinámico, así el modo público no necesita
 * cargar googleapis.
 */
function useServiceAccount(): boolean {
  const p = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  return Boolean(p && existsSync(p));
}

console.error(
  `[google-docs] modo de autenticación: ${useServiceAccount() ? 'service-account' : 'público (link)'}`,
);

export async function fetchDocText(
  input: string,
): Promise<Envelope<DocData>> {
  if (useServiceAccount()) {
    const mod = await import('./service-account.js');
    return mod.fetchDocText(input);
  }
  const mod = await import('./public-export.js');
  return mod.fetchDocText(input);
}
