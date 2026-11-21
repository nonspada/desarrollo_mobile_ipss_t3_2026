# To-Do List — React Native + Expo

Aplicación móvil de lista de tareas pendientes, construida con **React Native**, **Expo (Expo Go)**, **TypeScript** y **Yarn**. Multiusuario, con fotos y ubicación GPS adjuntas a cada tarea.

## Objetivo y metas del proyecto

Partiendo de un CRUD simple de tareas en memoria (una sola pantalla, un solo usuario), el
proyecto evolucionó hacia una app multiusuario con integración de periféricos del
dispositivo, manteniendo el stack original intacto. Metas concretas:

1. Mismo stack base (Expo/RN/React/TypeScript/Yarn), solo agregando paquetes **oficiales**
   de Expo para periféricos y seguridad — nada de librerías redundantes de terceros.
2. Autenticación multiusuario con **aislamiento estricto**: ningún usuario ve o modifica
   tareas de otro, aunque compartan el mismo dispositivo.
3. Captura de **fotos con la cámara** adjuntas de forma persistente a cada tarea
   (sobreviven a reinicios de la app y limpiezas de cache del SO).
4. Registro de **ubicación GPS** al crear cada tarea, validando precisión y manejando
   fallos/permisos denegados **sin bloquear** la creación de la tarea.
5. Permisos pedidos **en el momento** (just-in-time, nunca al abrir la app) y **pruebas
   automatizadas con mocks** de cámara, GPS y autenticación (sin depender de hardware).

## Proceso de desarrollo

El desarrollo se documentó en `docs/` antes de tocar código, en este orden (fuente de
verdad del diseño; revisar ahí el detalle de cada decisión):

1. `docs/1_BRIEF.md` — objetivo, alcance y criterios de éxito.
2. `docs/2_DOMAIN.md` — entidades (`User`, `Task`, `TaskLocation`) y reglas de negocio
   (aislamiento, hashing de contraseña, estados de ubicación).
3. `docs/3_STACK.md` — stack heredado + justificación de cada paquete nuevo
   (`expo-image-picker`, `expo-file-system`, `expo-location`, `expo-crypto`,
   `expo-secure-store`, `@react-native-async-storage/async-storage`) y de testing
   (`jest-expo`, `@testing-library/react-native`).
4. `docs/4_DESIGN.md` — diagramas de componentes y flujos (login, alta de tarea con
   foto+GPS no bloqueante), estructura de persistencia y de archivos.
5. `docs/5_MVP.md` — historias de usuario, criterios de aceptación y matriz de estados de
   permisos (cámara/GPS: concedido, denegado, cancelado, baja precisión, timeout).
6. `docs/6_CIERRE.md` — estrategia de verificación, checklist de cierre, riesgos y
   trabajo futuro fuera de alcance.

Una vez aprobado el diseño, la implementación siguió ese mismo orden: tipos → persistencia
(`storage.ts`) → auth (`auth.ts`) → periféricos (`location.ts`, `photos.ts`) → UI
(`LoginScreen.tsx`, `TaskForm.tsx`, `TaskItem.tsx`, `App.tsx`) → tests con mocks.

## Funcionalidad

- Registro/login local por usuario, con aislamiento estricto: cada usuario solo ve y edita
  sus propias tareas.
- **Cerrar sesión** desde la lista de tareas para volver al login y entrar con otro
  usuario (o el mismo) sin reiniciar la app.
- Agregar tareas con **título**, **descripción**, **foto** (cámara del dispositivo) y
  **ubicación GPS** capturada al momento de crearlas.
- Editar título/descripción de tareas existentes (foto y ubicación quedan fijas desde el
  alta).
- Eliminar tareas (con confirmación).
- Captura de foto y de GPS con permisos pedidos en el momento (*just-in-time*): si el
  usuario deniega alguno, la tarea se crea igual, sin foto y/o sin ubicación.

### Cuenta de ejemplo

La primera vez que la app corre en un dispositivo, se crea automáticamente un usuario de
ejemplo para poder entrar sin pasar antes por el registro:

| Usuario | Contraseña |
|---|---|
| `admin` | `admin123` |

La pantalla de login muestra esta cuenta como recordatorio. La creación es **idempotente**
(no se duplica en reinicios posteriores) y **no inicia sesión automáticamente**: hay que
loguearse con ella como con cualquier otra cuenta. Para probar el aislamiento entre
usuarios, registrá uno nuevo desde la misma pantalla ("¿No tienes cuenta? Regístrate"),
cargá tareas, cerrá sesión y volvé a entrar como `admin`: las tareas no se mezclan.

## Estructura

```
App.tsx              # pantalla principal: sesión activa, lista de tareas y formulario
src/types.ts          # tipos User, Task, TaskLocation
src/auth.ts            # registro/login/logout/sesión + seed del usuario admin de ejemplo
src/storage.ts         # persistencia en AsyncStorage, namespaced por usuario
src/photos.ts          # captura de foto (expo-image-picker) + copia persistente (expo-file-system)
src/location.ts        # captura de GPS (expo-location) con validación de precisión
src/LoginScreen.tsx    # login/registro
src/TaskForm.tsx       # formulario de alta/edición (+ foto, + GPS en alta)
src/TaskItem.tsx       # tarjeta de tarea (miniatura + badge de ubicación + editar/eliminar)
__tests__/             # tests unitarios con mocks de cámara, GPS y auth
```

Persistencia: usuarios y tareas en `AsyncStorage` (namespaced por `userId`), sesión activa
en `expo-secure-store`, fotos en el `documentDirectory` de la app. No hay backend remoto
ni sincronización entre dispositivos (fuera de alcance, ver `docs/1_BRIEF.md`).

## Requisitos

- Node.js
- Yarn (Berry, v4)
- App **Expo Go** instalada en el dispositivo móvil (Android/iOS)

## Instalación y ejecución

```bash
yarn install
yarn start
```

Esto abre Metro Bundler con un código QR. Escanéalo desde la app **Expo Go** en tu
teléfono para correr la aplicación. Al abrirla por primera vez:

1. Esperá el spinner inicial (restaura sesión y siembra la cuenta `admin` si no existe).
2. Entrá con `admin` / `admin123`, o registrá un usuario nuevo.
3. Agregá una tarea: probá "Tomar foto" y confirmá el permiso de cámara/ubicación cuando
   el SO lo pida (no se pide antes, solo al usarlos).
4. Usá "Cerrar sesión" para volver al login y probar con otra cuenta.

Alternativas:

```bash
yarn android   # abre en emulador/dispositivo Android
yarn ios       # abre en simulador iOS (requiere macOS)
```

## Cómo probar

### Tests automatizados

```bash
yarn jest
```

Corre `__tests__/{auth,location,photos}.test.ts` con mocks deterministas (sin hardware
real ni red):

| Suite | Cubre |
|---|---|
| `auth.test.ts` | registro/duplicados, login válido/ inválido (error genérico, sin enumeración), restauración de sesión, siembra idempotente del usuario `admin`, aislamiento de tareas por `ownerId` |
| `location.test.ts` | permiso denegado, precisión aceptable/baja, error de hardware, coordenadas `(0,0)` inválidas — ninguna rama lanza excepción |
| `photos.test.ts` | permiso denegado, cancelación del usuario, copia exitosa a ruta persistente namespaced por usuario, fallo de filesystem |

### Verificación de tipos y bundle (obligatoria tras cualquier cambio de código)

```bash
yarn tsc --noEmit
yarn expo export --platform android --output-dir /tmp/check && rm -rf /tmp/check
```

### QA manual (Expo Go)

No automatizable sin Detox/Maestro (fuera de alcance, ver `docs/6_CIERRE.md`). Pasos
mínimos antes de dar algo por cerrado:

1. Registrar un usuario, crear una tarea con foto + ubicación.
2. Cerrar la app por completo (no solo backgroundear) y reabrir: la foto y la ubicación
   siguen ahí.
3. Cerrar sesión, loguearse con `admin` (o registrar otro usuario): la lista de tareas
   está vacía o solo tiene las suyas, nunca las del usuario anterior.
4. Denegar el permiso de cámara al crear una tarea: se crea sin foto, sin crash.
5. Denegar el permiso de ubicación al crear una tarea: se crea con badge "sin ubicación".
