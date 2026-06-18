# Reto Técnico — AI Developer · `make-feature`

Este proyecto resuelve una idea concreta: en lugar de pedirle a una IA, prompt a prompt,
que escriba un feature, construí una **herramienta** (un *harness*) que toma un
requerimiento redactado en un Google Doc —tal como lo escribiría un Product Manager— y lo
implementa de forma autónoma sobre una app Angular existente.

El flujo, de punta a punta: un **MCP server** lee el Google Doc y devuelve su texto; una
**skill de Claude Code** (`/make-feature`) toma ese texto, entiende la app, planifica,
escribe el código y verifica que compile, apoyándose en **subagentes** especializados y en
un **hook de seguridad**. El valor no está en que la IA "sepa" Angular, sino en que el
proceso queda encapsulado y es repetible.

**Repo:** https://github.com/ManuGZ/mandu-reto-tecnico-ia

---

## Entregables del reto (dónde está cada cosa)

| Entregable | Ubicación |
|---|---|
| 1. MCP server (TypeScript, desde cero) | `mcp-server/` |
| 2. Skill `/make-feature` | `.claude/skills/make-feature/SKILL.md` |
| 3. `target-app` con los features implementados por el harness | `target-app/` |
| 4. README (ejecución, decisiones, harness vs. prompt) | este archivo |
| 5. Video del harness ejecutando `/make-feature` | enlace al final |
| + Hook de seguridad `PreToolUse` | `.claude/settings.json` + `.claude/hooks/guard.mjs` |
| + Subagentes (planner / implementer / reviewer) | `.claude/agents/` |

---

## Arquitectura

Cuatro piezas que viven dentro de Claude Code y se reparten el trabajo:

| Pieza | Rol |
|---|---|
| **MCP server** (`mcp-server/`) | Expone la tool `read_google_doc`: recibe la URL/ID de un Google Doc y devuelve su texto en un envelope consistente. |
| **Skill `/make-feature`** | Orquesta: leer el doc → leer convenciones → planificar (con checkpoint) → implementar → revisar → verificar. |
| **Subagentes** (`.claude/agents/`) | `feature-planner`, `feature-implementer`, `feature-reviewer`, cada uno con su responsabilidad y sus tools. |
| **Hook de seguridad** | `PreToolUse`: limita las escrituras a `target-app/` y escanea secretos antes de escribir. |

La app objetivo es `target-app/` (**Angular 21 + ng-zorro**), donde el harness escribe los features.

---

## Estructura del repositorio

```
mandu-reto-tecnico-ia/
├── .claude/
│   ├── settings.json                 # registro del hook PreToolUse
│   ├── hooks/guard.mjs               # scope de paths + secret scanning
│   ├── skills/make-feature/SKILL.md  # la skill /make-feature
│   └── agents/                       # feature-planner / -implementer / -reviewer
├── .mcp.json                         # registro del MCP (scope proyecto)
├── mcp-server/                       # MCP server (TypeScript)
│   └── src/
│       ├── index.ts                  # server stdio + tool read_google_doc
│       ├── google/
│       │   ├── doc-export.ts         # selector de estrategia de auth (auto-detección)
│       │   ├── public-export.ts      # estrategia: export público
│       │   ├── service-account.ts    # estrategia: service account / ADC (googleapis)
│       │   └── types.ts              # tipos compartidos (DocData, AuthMode)
│       └── lib/{envelope,parse-doc-id}.ts
└── target-app/                       # app Angular 21 con los features del harness
```

---

## Requisitos

- **Node** `^20.19` || `^22.12` || `>=24` (lo pide Angular 21) y **npm** 9+.
- **Claude Code**: la skill, los subagentes y el hook son nativos de Claude Code.

---

## Puesta en marcha

### 1. Clonar

```bash
git clone https://github.com/ManuGZ/mandu-reto-tecnico-ia.git
cd mandu-reto-tecnico-ia
```

### 2. MCP server

```bash
cd mcp-server
npm install
npm run build            # genera dist/index.js
cd ..
```

Registrarlo en el proyecto (si `.mcp.json` no estuviera ya presente):

```bash
claude mcp add --scope project --transport stdio google-docs -- node mcp-server/dist/index.js
```

Probarlo **aislado**, sin Claude Code, con el MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node mcp-server/dist/index.js
```

En el Inspector: pestaña **Tools** → `read_google_doc` → pasa la URL de un Google Doc → **Run**.
Al arrancar, el server registra en stderr el modo de autenticación activo
(`[google-docs] modo de autenticación: público (link)` o `service-account`).

### 3. target-app

```bash
cd target-app
npm install
npm start                # http://localhost:4200
cd ..
```

### 4. Ejecutar el harness

Abre Claude Code en la **raíz** del repo, confirma el MCP con `/mcp`, y ejecuta:

```
/make-feature <url-del-google-doc>
```

El documento debe estar accesible (ver autenticación). La skill lee el requerimiento,
muestra un plan, espera tu confirmación, implementa el feature en `target-app/` y verifica
el build.

---

## Autenticación con Google

El MCP **auto-detecta** la estrategia, así que el usuario elige sin tocar código:

- **Export público (por defecto):** sin credenciales. Lee el documento vía
  `https://docs.google.com/document/d/<ID>/export?format=txt`. El doc debe estar compartido
  como **"cualquiera con el enlace" (Lector)**.
- **Service account / ADC:** si la variable `GOOGLE_APPLICATION_CREDENTIALS` apunta a un
  JSON de service account **que existe**, el server usa `googleapis` y soporta documentos
  privados (hay que compartir el doc con el email del service account). También sirve ADC
  (`gcloud auth application-default login`).

La detección se basa en la **existencia del archivo** de credenciales: si está, usa service
account; si no (por ejemplo al clonar el repo en otra máquina), vuelve a export público
automáticamente. Para cambiar de modo, defines o quitas `GOOGLE_APPLICATION_CREDENTIALS`
(en el bloque `env` de `.mcp.json`, o como variable de entorno) y reinicias el server.

### Probar cada modo con el Inspector

> Cambia `/Users/manuel/.config/mandu/sa.json` por la ruta real de tu JSON de service account.

**Con service account** (lee documentos privados compartidos con el service account):

```bash
GOOGLE_APPLICATION_CREDENTIALS=/Users/manuel/.config/mandu/sa.json \
  npx @modelcontextprotocol/inspector node mcp-server/dist/index.js
```

**Sin service account** (export público; el documento debe estar compartido por enlace):

```bash
npx @modelcontextprotocol/inspector node mcp-server/dist/index.js
```

En ambos casos, el log de arranque indica el modo activo (`service-account` o `público (link)`).

**Sin secretos en el repo.** El JSON de credenciales nunca se versiona: el `.gitignore`
ignora `*credential*.json`, `*service-account*.json` y `.claude/settings.local.json`. La
ruta que aparece en `.mcp.json` es local; si no existe, simplemente se usa el modo público.

---

## El MCP server

**Tool `read_google_doc({ url })`** — acepta la URL completa (`.../document/d/<ID>/edit`) o
el ID suelto. Built from scratch con el SDK oficial (`@modelcontextprotocol/sdk`),
transporte **stdio**, tool registrada con `registerTool` y validación de entrada con **Zod**.

**Envelope consistente.** Toda respuesta tiene la misma forma (devuelta como JSON en el
`content` de la tool y en `structuredContent`):

```jsonc
// éxito
{ "ok": true,  "data": { "id": "...", "text": "...", "authMode": "public" } }
// error
{ "ok": false, "error": { "code": "...", "message": "..." } }
```

El campo `authMode` (`public` | `service-account`) indica con qué estrategia se leyó el
documento, útil para saberlo durante una corrida de `/make-feature`.

**Manejo de errores** (`code`):

| Código | Causa |
|---|---|
| `INVALID_URL` | No se pudo extraer un ID válido (enlace mal formado). |
| `NOT_FOUND` | El documento no existe (HTTP 404). |
| `FORBIDDEN` | El documento no es accesible (no es público / sin permiso del service account). |
| `FETCH_ERROR` | Fallo de red u otro estado inesperado. |

---

## La skill `/make-feature` (el harness)

La skill aporta la **estructura** que un prompt directo no garantiza. Su flujo:

1. **Lee el requerimiento** llamando a `read_google_doc` (MCP) y reporta el `authMode`. Si
   el envelope viene con error, se detiene y lo explica.
2. **Lee las convenciones reales** de `target-app/` (modelo, servicio, componentes) en vez
   de asumirlas.
3. **Planifica** con el subagente `feature-planner`: archivos a crear/modificar y criterios
   de aceptación derivados de cada punto del documento. **Checkpoint**: muestra el plan y
   espera confirmación antes de escribir.
4. **Implementa** con `feature-implementer`, escribiendo solo dentro de `target-app/`.
5. **Revisa** con `feature-reviewer` contra los criterios y las convenciones.
6. **Verifica**: corre `npm run build` / typecheck e itera automáticamente ante fallos.

### Subagentes

| Subagente | Tools | Responsabilidad |
|---|---|---|
| `feature-planner` | solo lectura | Traduce el requerimiento a un plan técnico + criterios de aceptación. No escribe. |
| `feature-implementer` | lectura + escritura | Aplica el plan con código idiomático, solo en `target-app/`. |
| `feature-reviewer` | lectura + build | Contrasta el resultado y corre el build; reporta, no corrige. |

### Hook de seguridad

`PreToolUse` (matcher `Write|Edit|MultiEdit`) ejecuta `guard.mjs` antes de cada escritura,
con dos capas:

1. **Scope de paths:** bloquea cualquier escritura fuera de `target-app/`.
2. **Secret scanning:** bloquea si detecta claves de Google (`AIza…`), JWTs (`eyJ…`), JSON
   de service account, claves privadas PEM o asignaciones/`console.*` con
   `key`/`token`/`secret`/`password`, indicando el patrón y la línea.

`exit 0` permite; `exit 2` bloquea y devuelve el motivo al modelo.

---

## Features implementados sobre `target-app`

A partir de los dos requerimientos de ejemplo, el harness generó:

- **Filtrar el directorio por área** — selector de áreas sobre la tabla (`nz-select`),
  opción "Todas" que restablece la vista, y el contador de resultados que se actualiza con
  el filtro. Implementado con `signal` + `computed`.
- **Ver el detalle de una persona** — al hacer clic en una fila se abre un panel lateral
  (`nz-drawer`) con nombre, área, rol, email (enlace `mailto:`), fecha de ingreso en formato
  legible y manager. Se cierra con un botón y con la tecla **Escape**, y la fila seleccionada
  queda resaltada (iniciales como avatar).

Ambos respetan las convenciones del proyecto: componentes standalone, `inject()`, signals,
control flow `@for`/`@if`, archivos sin sufijo `.component`, SCSS e imports de `ng-zorro`
por componente.

Como extra se agrego el feature de **Mostrar manager en el directorio de personas** - agregar una columna en la tabla para poder identificar el Manager de cada colaborador. En el caso que el colaborador no tenga un manager asignado se muestra un "Sin asignar"

---

## Por qué `/make-feature` supera a prompetear directamente

Un prompt directo funciona, pero depende de que la persona recuerde cada vez pedir todo
lo que hace falta: respetar las convenciones, planificar antes de escribir, no romper lo
existente, verificar el build. En la práctica eso no sale consistente: cada corrida varía
según cómo se redactó el prompt.

La skill convierte eso en un proceso que siempre ocurre: lee
convenciones, planifica con un punto de control, separa responsabilidades en subagentes,
verifica e itera, y todo dentro de un perímetro de seguridad. El mismo documento produce el
mismo proceso, lo ejecute quien lo ejecute, y queda auditable de principio a fin. Esa
**reproducibilidad** es la diferencia: no es un mejor prompt, es no depender del prompt.

---

## Decisiones de diseño

**Un MCP como pieza separada** Separar la lectura del Doc
en un MCP da una interfaz limpia (texto plano vía una tool), reutilizable, testeable de
forma aislada con el Inspector, y alineada con el reto. La skill no sabe cómo se lee un
Google Doc; solo pide el texto.

**Autenticación con auto-detección (público / service account).** Por defecto, export
público: cero credenciales y nada de secretos en el repo. Cuando se
necesitan documentos privados, basta con proveer el JSON y el server cambia solo. El cambio
quedó **contenido en `mcp-server/src/google/`** (un selector + dos estrategias); `index.ts`,
el envelope, la skill, el hook y los subagentes no se tocan. Esa frontera entre "cómo se
autentica" y "qué hace el MCP" quedó bien trazada.

**Un envelope `{ ok, data }`.** Quería que el agente
distinguiera entre "no existe" de "no tengo permiso" de "URL mal formada" y actuara en
consecuencia. Un formato uniforme con un `code` tipado hace el manejo de errores explícito y
predecible.

**Transporte stdio.** El MCP corre como subproceso local de Claude Code: stdio es lo natural,
sin infraestructura que hostear ni asegurar en red.

**Tres subagentes en vez de un prompt monolítico.** Cada rol arranca con su contexto y sus
tools mínimas. El planner no puede escribir y el reviewer tampoco, así que no puede "tapar"
un problema corrigiéndolo: solo lo reporta. Esa separación de poderes mejora el resultado y
hace el proceso auditable.

**Un hook en dos capas.** El reto pide proteger contra fugas de credenciales; añadí también
el control de alcance porque el riesgo real es doble: que la IA escriba un secretoc o que
toque archivos fuera de la app.

**Migrar a Angular 21 antes de generar features.** La app venía en 20.3; la migré para que los features partieran de la version de Angular que se pedia

---

## Verificación

- El MCP compila (`npm run build`) y se probó con el Inspector en ambos modos de
  autenticación.
- El hook se probó con escrituras fuera de `target-app/`.
- Los features generados se verifican con el build de Angular y revisando cada criterio de
  aceptación del documento; no rompen la funcionalidad existente (la tabla del directorio).

---

## Link de requerimientos propuestos:

- Link del primer requerimiento: https://docs.google.com/document/d/1iwJ8P-Qm4I70nQIvlxyTpIzGzZhgL4ZDyudQCJMuaz8/edit?tab=t.0 
- Link del segundo requeriiento:https://docs.google.com/document/d/1Gbr53oZ6CGV7w5w1DXpp233psblMExDkYzISuMYKOHE/edit?tab=t.0 
- Link del requerimiento extra: https://docs.google.com/document/d/1Hp0MzKi7siWPcPvFPi0DHgsw8fZamfmTHyFiH078rM0/edit?tab=t.0 

## Video

> _(Enlace al video que muestra `/make-feature` ejecutándose de principio a fin sobre uno de
> los Google Docs.)_: https://drive.google.com/file/d/12NrQvgTQZr46nBq-tc82AJoBFCQtq3UK/view?usp=share_link 
