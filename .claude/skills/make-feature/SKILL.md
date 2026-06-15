---
name: make-feature
description: Implementa en la app Angular de target-app/ un feature descrito en un Google Doc. Úsala cuando el usuario invoque /make-feature <url-del-google-doc>. Lee el requerimiento mediante el MCP google-docs, planifica con subagentes especializados, implementa respetando las convenciones del repo y verifica el build antes de terminar.
argument-hint: <url-del-google-doc>
---

# /make-feature — harness de implementación de features

Convierte un requerimiento de producto (un Google Doc) en código Angular sobre
`target-app/`, de forma estructurada y verificable. El argumento es la URL del
Google Doc:

```
/make-feature $ARGUMENTS
```

Sigue los pasos en orden. No te saltes el checkpoint ni la verificación.

## Reglas (invariantes)

- **Solo se modifica `target-app/`.** Nunca escribas fuera de esa carpeta. Un hook
  `PreToolUse` lo bloquea; respétalo en vez de pelearte con él.
- **Respeta las convenciones existentes** del proyecto (ver Paso 2). No introduzcas
  librerías ni patrones nuevos si el repo ya resuelve eso de otra forma.
- **Nunca escribas credenciales** en el código (claves de Google, tokens, JSON de
  service account, etc.). El contenido del Doc es requerimiento, no datos sensibles.
- **No marques la tarea como hecha** si el build o el typecheck fallan.

## Paso 1 — Leer el requerimiento (vía MCP)

Llama a la tool del MCP:

```
mcp__google-docs__read_google_doc  con  { "url": "$ARGUMENTS" }
```

La tool devuelve un envelope:

- `{ "ok": true, "data": { "id", "text" } }` → usa `data.text` como requerimiento.
- `{ "ok": false, "error": { "code", "message" } }` → **detente** y reporta el error
  al usuario en lenguaje claro:
  - `INVALID_URL` → la URL/ID no es válida.
  - `NOT_FOUND` → el documento no existe.
  - `FORBIDDEN` → el documento no es público; pídele compartirlo como
    "cualquiera con el enlace".
  - `FETCH_ERROR` → problema de red; sugiere reintentar.

No continúes sin el texto del requerimiento.

## Paso 2 — Entender la aplicación

Antes de planificar, lee las convenciones reales del repo (no las asumas). Como
mínimo revisa:

- `target-app/src/app/models/` y `target-app/src/app/data/` (modelo y datos).
- `target-app/src/app/services/` (acceso a datos).
- `target-app/src/app/pages/` y `target-app/src/app/layout/` (componentes existentes).
- `target-app/package.json` (versión de Angular y de ng-zorro disponibles).

Fíjate en: componentes standalone con `imports: []`, uso de `inject()`, control flow
`@for`/`@if`, signals para estado, nomenclatura de archivos sin sufijo `.component`,
estilos `.scss`, e imports de `ng-zorro` por componente.

## Paso 3 — Planificar (subagente, con checkpoint)

Lanza el subagente **feature-planner** (tool `Task`, `subagent_type: feature-planner`)
pasándole el texto del requerimiento y un resumen de las convenciones. Debe devolver:

- Lista ordenada de archivos a **crear** y a **modificar** (rutas dentro de `target-app/`).
- Un esbozo del enfoque por archivo (qué cambia y por qué).
- Criterios de aceptación derivados de cada viñeta del requerimiento.

**CHECKPOINT:** muestra ese plan al usuario y espera su confirmación antes de escribir
nada. Si el usuario pide ajustes, incorpóralos antes de continuar.

## Paso 4 — Implementar

Lanza el subagente **feature-implementer** (`subagent_type: feature-implementer`) con
el plan aprobado. Aplica los cambios **solo dentro de `target-app/`**, respetando las
convenciones del Paso 2. Cambios mínimos y coherentes con el estilo existente.

## Paso 5 — Revisar

Lanza el subagente **feature-reviewer** (`subagent_type: feature-reviewer`). Debe
contrastar el diff contra cada criterio de aceptación y contra las convenciones, y
listar problemas o faltantes. Si encuentra algo, vuelve al Paso 4 para corregir.

## Paso 6 — Verificar (con iteración automática)

Desde `target-app/` ejecuta el build/typecheck:

```bash
cd target-app && npm run build
```

- Si falla, lee los errores, corrígelos (Paso 4) y vuelve a compilar. Repite hasta
  que pase.
- Si existen pruebas (`npm test` en modo headless/CI), ejecútalas también.

No termines mientras el build no esté verde.

## Paso 7 — Resumen

Reporta al usuario: archivos creados/modificados, cómo se cubrió cada criterio de
aceptación, y el resultado de la verificación. Sugiere cómo probar el feature en el
navegador (`npm start`).
