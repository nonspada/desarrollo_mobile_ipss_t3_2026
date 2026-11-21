# MyToDos

Lista de tareas (To-Do) móvil y multiusuario: cada tarea puede llevar una foto tomada con la cámara del dispositivo y la ubicación GPS capturada en el momento de crearla.

> **Sin backend:** todos los datos viven en el dispositivo (`AsyncStorage` + `expo-secure-store`). Desinstalar la app borra usuarios, tareas y fotos; no hay sincronización entre dispositivos.

## Funcionalidades

- **Cuenta:** registro e inicio de sesión por usuario (nombre de usuario + contraseña); cerrar sesión vuelve al login sin reiniciar la app.
- **Tareas:** crear con título, descripción, foto y ubicación; editar título/descripción; eliminar con confirmación.
- **Cámara:** foto tomada con la cámara nativa del dispositivo (no desde galería), copiada a almacenamiento persistente de la app.
- **GPS:** ubicación capturada al confirmar el alta de la tarea, con validación de precisión.
- **Permisos just-in-time:** cámara y ubicación se piden recién al usarlas, nunca al abrir la app; si se deniegan o cancelan, la tarea se crea igual.

### Reglas principales

| Regla | Definición |
|---|---|
| Aislamiento | Las tareas se guardan namespaced por usuario (`tasks:<userId>`); ninguna pantalla o consulta cruza usuarios |
| Usuario único | `username` único, comparación case-insensitive; duplicado rechaza el registro |
| Login sin enumeración | Credenciales inválidas → mensaje genérico, sin indicar si falló el usuario o la contraseña |
| Estado de foto | Captura cancelada o permiso denegado → `photoUri: null`; la tarea se crea igual |
| Estado de GPS | `granted` (≤ 50 m) · `low_accuracy` (> 50 m, coordenadas igual guardadas) · `denied` (permiso rechazado) · `unavailable` (timeout, error de hardware o lectura `(0,0)`) |
| Edición | Título y descripción son editables; foto y ubicación quedan fijas desde el alta |

El detalle está en [`docs/2_DOMAIN.md`](docs/2_DOMAIN.md).

## Stack

| Necesidad | Tecnología | Versión instalada |
|---|---|---|
| Framework | Expo (Expo Go, flujo administrado) | `58.0.22` |
| UI | React Native | `0.88.1` |
| UI | React | `19.3.0` |
| Lenguaje | TypeScript (`strict`) | `6.0.3` |
| Package manager | Yarn Berry (`nodeLinker: node-modules`) | `4.18.1` |
| Cámara | `expo-image-picker` | `58.0.10` |
| Persistencia de foto | `expo-file-system` | `58.0.14` |
| GPS | `expo-location` | `58.0.22` |
| Hash de contraseña | `expo-crypto` | `58.0.8` |
| Sesión segura | `expo-secure-store` | `58.0.3` |
| Persistencia de usuarios/tareas | `@react-native-async-storage/async-storage` | `2.2.0` |
| Barra de estado | `expo-status-bar` | `58.0.4` |
| Pruebas | `jest` + `jest-expo` + `@testing-library/react-native` | `30.5.2` / `58.0.15` / `14.1.0` |

Detalle y justificación de cada paquete en [`docs/3_STACK.md`](docs/3_STACK.md).

## Requisitos

- Node.js y Yarn Berry (`4.18.1`, fijado por `packageManager` en `package.json`; nunca `npm`/`pnpm`).
- App **Expo Go** instalada en un teléfono Android o iPhone.
- Para probar cámara y GPS conviene un **dispositivo físico**: el emulador de Android no siempre entrega cámara ni fix de GPS reales.

## Puesta en marcha

```bash
yarn install
yarn start
```

Escanea el código QR con Expo Go. Al abrir la app por primera vez:

1. Espera el spinner inicial (restaura la sesión y siembra la cuenta de ejemplo si no existe).
2. Entra con la cuenta de ejemplo, o regístrate con un usuario nuevo.
3. Agrega una tarea: toca "Tomar foto" y confirma los permisos de cámara/ubicación cuando el SO los pida (no se piden antes).
4. Usa "Cerrar sesión" para volver al login y probar con otra cuenta.

Alternativas:

```bash
yarn android   # abre en emulador/dispositivo Android
yarn ios       # abre en simulador iOS (requiere macOS)
```

### Cuenta de ejemplo

La primera vez que la app corre en un dispositivo se crea un usuario de ejemplo (`seedDefaultAdmin`, idempotente, no inicia sesión automáticamente) para poder entrar sin registrarse antes. La pantalla de login la muestra como recordatorio.

| Usuario | Contraseña |
|---|---|
| `admin` | `admin123` |

## Calidad

```bash
yarn tsc --noEmit                                                                 # tipos
yarn jest                                                                         # tests unitarios y de componente
yarn expo export --platform android --output-dir /tmp/check && rm -rf /tmp/check  # smoke bundle (Metro)
```

No hay ESLint configurado en el proyecto.

| Suite | Cubre | Mock clave |
|---|---|---|
| `auth.test.ts` | registro/duplicados, login válido/inválido (sin enumeración), restauración de sesión, siembra idempotente de la cuenta de ejemplo, aislamiento de tareas por `ownerId` | `AsyncStorage` en memoria, `expo-secure-store` |
| `location.test.ts` | permiso denegado, precisión aceptable/baja, error de hardware, coordenadas `(0,0)` inválidas — ninguna rama lanza excepción | `expo-location` |
| `photos.test.ts` | permiso denegado, cancelación, copia exitosa a ruta persistente, fallo de filesystem | `expo-image-picker`, `expo-file-system` |
| `App.test.tsx` | login con la cuenta de ejemplo y cierre de sesión, incluida la regresión de que la UI no quede colgada si `logout()` falla del lado nativo | `auth`, `storage` |

QA manual (no automatizable sin Detox/Maestro, fuera de alcance — ver [`docs/6_CIERRE.md`](docs/6_CIERRE.md)):

1. Registrar un usuario, crear una tarea con foto + ubicación.
2. Cerrar la app por completo (no solo segundo plano) y reabrir: la foto y la ubicación siguen ahí.
3. Cerrar sesión, loguearse con otra cuenta: la lista de tareas está vacía o solo tiene las suyas.
4. Denegar el permiso de cámara al crear una tarea: se crea sin foto, sin crash.
5. Denegar el permiso de ubicación: se crea con badge "sin ubicación".

## Estructura

```
App.tsx              # pantalla principal: sesión activa, lista de tareas y formulario
src/theme.ts          # paleta de colores pastel compartida
src/types.ts          # tipos User, Task, TaskLocation
src/auth.ts           # registro/login/logout/sesión + siembra de la cuenta de ejemplo
src/storage.ts        # persistencia en AsyncStorage, namespaced por usuario
src/photos.ts         # captura de foto (expo-image-picker) + copia persistente (expo-file-system)
src/location.ts       # captura de GPS (expo-location) con validación de precisión
src/LoginScreen.tsx   # login/registro
src/TaskForm.tsx      # formulario de alta/edición (+ foto, + GPS en alta)
src/TaskItem.tsx      # tarjeta de tarea (miniatura + badge de ubicación + editar/eliminar)
__tests__/            # tests unitarios y de componente, con mocks de cámara, GPS y auth
docs/                 # documentación de producto y decisiones técnicas
```

Sin librería de navegación: solo dos pantallas (login y lista de tareas), resueltas con el mismo patrón condicional que ya usaba `App.tsx` — agregar `react-navigation`/`expo-router` sería sobre-ingeniería para dos vistas (ver [`docs/3_STACK.md`](docs/3_STACK.md)).

## Documentación

| Documento | Contenido |
|---|---|
| [`1_BRIEF.md`](docs/1_BRIEF.md) | Objetivo, alcance, fuera de alcance y criterios de éxito |
| [`2_DOMAIN.md`](docs/2_DOMAIN.md) | Entidades (`User`, `Task`, `TaskLocation`) y reglas de negocio |
| [`3_STACK.md`](docs/3_STACK.md) | Stack heredado, justificación de cada paquete nuevo y configuración nativa |
| [`4_DESIGN.md`](docs/4_DESIGN.md) | Diagramas de componentes y flujos (login, alta de tarea con foto + GPS) |
| [`5_MVP.md`](docs/5_MVP.md) | Historias de usuario, criterios de aceptación y matriz de estados de permisos |
| [`6_CIERRE.md`](docs/6_CIERRE.md) | Estrategia de verificación, checklist de cierre, riesgos y trabajo futuro |
| [`AGENTS.md`](AGENTS.md) | Instrucciones para agentes de código que evolucionan este proyecto |
| [`.omp/AGENTS.md`](.omp/AGENTS.md) | Convenciones del proyecto (package manager, estructura, verificación, git) |

## Limitaciones

- Sin backend remoto: desinstalar la app o perder el dispositivo borra usuarios, tareas y fotos. No hay sincronización entre dispositivos.
- No hay recuperación de contraseña, verificación de email ni OAuth/SSO.
- Una foto por tarea, sin edición ni recorte; no se puede subir desde la galería (solo cámara).
- La ubicación se guarda como coordenadas: no hay mapa embebido.
- Umbral de precisión GPS (50 m) fijo en `location.ts`, no configurable desde la UI.
