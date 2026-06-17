import { google } from 'googleapis';
import { Envelope, ok, err } from '../lib/envelope.js';
import { parseDocId } from '../lib/parse-doc-id.js';

// GoogleAuth resuelve credenciales por ADC (Application Default Credentials):
//  - Service account: variable de entorno GOOGLE_APPLICATION_CREDENTIALS -> ruta al JSON.
//  - ADC local:       `gcloud auth application-default login` (sin archivo).
const auth = new google.auth.GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});
const drive = google.drive({ version: 'v3', auth });

export async function fetchDocText(
  input: string,
): Promise<Envelope<{ id: string; text: string }>> {
  const id = parseDocId(input);
  if (!id) {
    return err('INVALID_URL', `No se pudo extraer un ID de Google Doc desde: "${input}"`);
  }

  try {
    const res = await drive.files.export(
      { fileId: id, mimeType: 'text/plain' },
      { responseType: 'text' },
    );
    return ok({ id, text: String(res.data) });
  } catch (e: unknown) {
    const status =
      (e as { code?: number })?.code ??
      (e as { response?: { status?: number } })?.response?.status;
    if (status === 404) {
      return err('NOT_FOUND', `No existe un documento con ID "${id}".`);
    }
    if (status === 403) {
      return err(
        'FORBIDDEN',
        'Sin permiso. Comparte el documento con el email del service account (o usa una cuenta con acceso).',
      );
    }
    if (status === 401) {
      return err(
        'FORBIDDEN',
        'Credenciales inválidas o ausentes (revisa GOOGLE_APPLICATION_CREDENTIALS o el ADC).',
      );
    }
    const msg = e instanceof Error ? e.message : String(e);
    return err('FETCH_ERROR', `Error al leer el documento: ${msg}`);
  }
}
