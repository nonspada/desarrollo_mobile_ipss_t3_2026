# Retomar esta sesión y trabajar eficientemente con OMP

Este documento tiene dos partes: cómo volver a esta sesión de OMP exactamente
donde quedó, y una guía práctica para usar OMP de forma eficiente en el resto
del desarrollo de esta app.

## 1. Retomar esta sesión

### Datos de esta sesión

| Campo | Valor |
|---|---|
| Proyecto (cwd) | `/home/patralist/Work/ipss/desarrollo_mobile` |
| ID de sesión | `01a1969f-f623-7590-a1e8-70999e2c5a91` |
| Archivo | `~/.omp/agent/sessions/-Work-ipss-desarrollo_mobile/2026-11-01T10-20-28-067Z_01a1969f-f623-7590-a1e8-70999e2c5a91.jsonl` |
| Título | "TODO: Crear app To-Do con Expo y TypeScript" |

OMP guarda cada sesión como un archivo `.jsonl` bajo `~/.omp/agent/sessions/<carpeta-codificada>/`,
una carpeta por proyecto. Mientras no borres esos archivos, la sesión se puede
retomar desde cualquier terminal.

### Opción recomendada: `--continue`

Parado en la carpeta del proyecto, la forma más simple:

```bash
cd /home/patralist/Work/ipss/desarrollo_mobile
omp --continue
# o abreviado:
omp -c
```

Abre automáticamente la sesión más reciente de **esta carpeta** (usa un
"breadcrumb" por terminal + fallback a la más nueva no vacía). Como es la
única sesión activa reciente de este proyecto, siempre la va a encontrar.

### Opción explícita: `--resume <id>`

Si trabajás desde otra carpeta, o querés apuntar a esta sesión puntual (y no
"la más reciente"):

```bash
omp --resume 01a1969f
```

Basta un prefijo del ID (no hace falta el UUID completo). Si tu `sessionDir`
no es el default, hay fallback automático a la búsqueda global.

### Opción interactiva: picker

```bash
omp --resume
```

Sin argumento abre un selector fullscreen con las sesiones de la carpeta
actual (Tab alterna a "todos los proyectos"). Útil cuando no te acordás el ID
ni la carpeta exacta.

### Dentro de una sesión ya abierta

Si ya estás en otra sesión de OMP y querés saltar a esta sin cerrar el
proceso:

```
/resume 01a1969f
```

o `/resume` sin argumento para el mismo picker en modo interactivo.

### Qué se conserva al retomar

- Todo el historial de mensajes, herramientas y archivos tocados.
- El modelo y el nivel de razonamiento ("thinking") que estaban activos.
- El estado de la todo list (`/todo`), si se usó.

### Qué **no** hacer

- No muevas ni renombres la carpeta del proyecto sin confirmar el prompt de
  "¿re-rootear la sesión?" que OMP te muestra — si decís que no, el resume
  falla.
- No esperes que `--continue` encuentre la sesión si corrés el comando desde
  una carpeta distinta a `desarrollo_mobile`: `--continue` es por-carpeta.

## 2. Guía para desarrollar eficientemente con OMP

### Arrancar la sesión con el contexto correcto

```bash
cd /home/patralist/Work/ipss/desarrollo_mobile && omp
```

Al arrancar en esta carpeta, OMP carga automáticamente `.omp/AGENTS.md` (ya
creado en este repo) como contexto de proyecto: stack, convenciones de Yarn,
estructura de carpetas, y qué comandos correr para verificar cambios. **No
hace falta pedirle al agente que lo lea** — se inyecta solo al iniciar la
sesión. Si agregás convenciones nuevas (por ejemplo, una librería de
navegación cuando la app crezca a más de una pantalla), actualizá ese archivo
en vez de repetir el contexto en cada prompt.

Para reglas cortas que **siempre** deben respetarse incluso en conversaciones
largas (p. ej. "nunca hagas `git push`", "nunca toques `yarn.lock` a mano"),
usá `.omp/RULES.md` en vez de `AGENTS.md`: se reinyecta en cada request, no
solo al principio.

### Pedidos grandes: dejá que la todo list trackee

Para tareas con varios pasos (como esta: scaffold + CRUD + componentes +
verificación + git), el agente usa la herramienta `todo` internamente para no
perder pasos. Vos podés:

- Pedir explícitamente una lista de requisitos numerada en el prompt — se
  traduce 1:1 a fases/tareas.
- Revisar el estado con `/todo` en cualquier momento.
- Si el pedido cambia a mitad de camino, decílo en el mismo chat en vez de
  abrir una sesión nueva: el agente actualiza la lista, no la reinicia.

### Prompts eficientes

- **Sé concreto con el stack y las restricciones** ("con Yarn", "TypeScript",
  "sin backend") en el primer mensaje: ahorra una ronda de preguntas.
- Palabras mágicas útiles en el texto del prompt (sin comandos extra):
  - `ultrathink` — fuerza razonamiento más profundo antes de tocar código;
    usala para decisiones de arquitectura (ej. "ultrathink qué estructura de
    estado conviene si agregamos persistencia").
  - `orchestrate` — para pedidos que conviene partir en sub-tareas paralelas
    delegadas (útil si el scope crece mucho, p. ej. "agregá pantallas de
    login, perfil y configuración").
- Evitá pedidos ambiguos tipo "mejorá la app": especificá qué ("agregá
  validación de título vacío con mensaje de error visible").

### Verificar, no asumir

Para este proyecto, cualquier cambio de código debería cerrarse con:

```bash
yarn tsc --noEmit
yarn expo export --platform android --output-dir /tmp/check && rm -rf /tmp/check
```

Pedile al agente que corra esto después de cambios (ya está en
`.omp/AGENTS.md`, así que lo hace por convención, pero reforzarlo en el
prompt no está de más si el cambio es grande).

### Sesiones paralelas sin perder la principal

- `/fork` — crea una copia de la sesión actual y segui trabajando ahí sin
  tocar la original. Útil para probar un approach arriesgado.
- `/fork pane` / `/fork tab` — igual, pero en una pestaña/pane nueva del
  terminal (tmux/Zellij/etc.), corriendo en paralelo.
- `/seance <id>` — abre un subagente de **solo lectura** que consulta otra
  sesión (por ejemplo, para preguntarle "¿por qué decidiste X?" a una sesión
  vieja) sin modificarla.

### Compartir / entregar la sesión

- `/export` — genera un HTML navegable con todo el transcript (útil para
  entregar evidencia del proceso de desarrollo a un profesor/revisor).
- `/dump` — copia el transcript como texto plano al portapapeles.
- `/share` — sube un snapshot cifrado y da un link (requiere red).

### Config persistente

Ajustes que querés mantener entre sesiones van en `config.yml`, no repetidos
en cada prompt:

```bash
omp config set <clave> <valor>
omp config list   # ver todo lo configurado y su origen
```

Por ejemplo, fijar el modelo por defecto para este proyecto o desactivar
`autolearn` si no lo usás.

### Resumen rápido de comandos usados en este proyecto

| Objetivo | Comando |
|---|---|
| Retomar esta sesión | `cd desarrollo_mobile && omp --continue` |
| Retomar por ID desde otra carpeta | `omp --resume 01a1969f` |
| Elegir sesión de una lista | `omp --resume` |
| Ver todo list actual | `/todo` dentro de la sesión |
| Exportar evidencia del desarrollo | `/export` dentro de la sesión |
| Bifurcar para probar algo riesgoso | `/fork` |
