export type ErrorCode = 'INVALID_URL' | 'NOT_FOUND' | 'FORBIDDEN' | 'FETCH_ERROR';

export type Envelope<T> = 
    | { ok: true; data: T}
    | { ok: false; error: { code: ErrorCode; message: string } };

export function ok<T>(data:T): Envelope<T> {
    return { ok: true, data };
}

export function err(code:ErrorCode, message: string): Envelope<never> {
    return { ok: false, error: { code, message } };
}