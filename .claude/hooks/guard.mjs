/**
 * PreToolUse hook — protege el harness /make-feature.
 *
 * Dos capas de defensa antes de cada Write / Edit / MultiEdit:
 *   1) Scope de paths: solo se permite escribir DENTRO de target-app/.
 *   2) Secret scanning: se bloquea el contenido que contenga credenciales.
 *
 * Contrato Claude Code:
 *   exit 0  -> permitir la operación.
 *   exit 2  -> bloquear; el texto de stderr se devuelve al modelo.
 *
 * Riesgo que mitiga: el modelo tiene en contexto la salida del MCP y podría,
 * por error, escribir credenciales o tocar archivos fuera de la app objetivo.
 */
import { readFileSync } from 'node:fs';
import { resolve, relative, isAbsolute } from 'node:path';

function block(message) {
  console.error(`[guard] BLOQUEADO: ${message}`);
  process.exit(2);
}

// --- Leer el payload del hook desde stdin ---
let payload;
try {
  const raw = readFileSync(0, 'utf8'); // fd 0 = stdin
  payload = JSON.parse(raw || '{}');
} catch {
  // No pudimos parsear la entrada: no es un caso de seguridad, dejamos pasar.
  process.exit(0);
}

const toolName = payload.tool_name ?? '';
const input = payload.tool_input ?? {};

// Solo interceptamos herramientas de escritura.
if (!['Write', 'Edit', 'MultiEdit'].includes(toolName)) {
  process.exit(0);
}

const filePath = input.file_path ?? input.filePath ?? '';
if (!filePath) {
  process.exit(0);
}

// =====================================================================
// Capa 1 — Scope de paths: solo target-app/
// =====================================================================
const projectDir = process.env.CLAUDE_PROJECT_DIR ?? payload.cwd ?? process.cwd();
const allowedRoot = resolve(projectDir, 'target-app');
const target = isAbsolute(filePath) ? resolve(filePath) : resolve(projectDir, filePath);

const rel = relative(allowedRoot, target);
const insideTargetApp = rel !== '' && !rel.startsWith('..') && !isAbsolute(rel);

if (!insideTargetApp) {
  block(
    'escritura fuera de target-app/. El harness solo puede modificar la app objetivo.\n' +
      `  Archivo solicitado: ${target}\n` +
      `  Raíz permitida:     ${allowedRoot}`,
  );
}

// =====================================================================
// Capa 2 — Secret scanning sobre el contenido que se va a escribir
// =====================================================================
let content = '';
if (toolName === 'Write') {
  content = input.content ?? '';
} else if (toolName === 'Edit') {
  content = input.new_string ?? '';
} else if (toolName === 'MultiEdit') {
  content = (input.edits ?? []).map((e) => e?.new_string ?? '').join('\n');
}

const PATTERNS = [
  { name: 'Google API key (AIza...)', re: /AIza[0-9A-Za-z_\-]{35}/ },
  { name: 'JWT (eyJ...)', re: /eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}/ },
  { name: 'Service account JSON ("type": "service_account")', re: /"type"\s*:\s*"service_account"/ },
  { name: 'Clave privada PEM', re: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/ },
  {
    name: 'Asignación de secreto (key/token/secret/password = "...")',
    re: /\b(?:api[_-]?key|secret|token|password|passwd|pwd)\b\s*[:=]\s*['"][^'"\s]{6,}['"]/i,
  },
  {
    name: 'console.* que expone un secreto',
    re: /console\.\w+\s*\([^)]*\b(?:api[_-]?key|secret|token|password)\b[^)]*\)/i,
  },
];

const lines = content.split(/\r?\n/);
for (let i = 0; i < lines.length; i++) {
  for (const { name, re } of PATTERNS) {
    if (re.test(lines[i])) {
      block(
        `posible secreto detectado.\n` +
          `  Patrón: ${name}\n` +
          `  Línea ${i + 1}: ${lines[i].trim().slice(0, 120)}\n` +
          `  Nunca escribas credenciales en el código generado.`,
      );
    }
  }
}

process.exit(0);
