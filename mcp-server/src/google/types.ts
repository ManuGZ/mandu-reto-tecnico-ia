export type AuthMode = 'public' | 'service-account';

export interface DocData {
  id: string;
  text: string;
  /** Estrategia de autenticación con la que se leyó el documento. */
  authMode: AuthMode;
}
