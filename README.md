# To-Do List — React Native + Expo

Aplicación móvil de lista de tareas pendientes, construida con **React Native**, **Expo (Expo Go)**, **TypeScript** y **Yarn**. Multiusuario, con fotos y ubicación GPS adjuntas a cada tarea.

## Funcionalidad

- Registro/login local por usuario, con aislamiento estricto: cada usuario solo ve y edita sus propias tareas.
- Agregar tareas con **título**, **descripción**, **foto** (cámara del dispositivo) y **ubicación GPS** capturada al momento de crearlas.
- Editar título/descripción de tareas existentes (foto y ubicación quedan fijas desde el alta).
- Eliminar tareas (con confirmación).
- Captura de foto y de GPS con permisos pedidos en el momento (*just-in-time*): si el usuario deniega alguno, la tarea se crea igual, sin foto y/o sin ubicación.

## Estructura

```
App.tsx              # pantalla principal: sesión activa, lista de tareas y formulario
src/types.ts          # tipos User, Task, TaskLocation
src/auth.ts            # registro/login/logout/sesión (hash de contraseña + expo-secure-store)
src/storage.ts         # persistencia en AsyncStorage, namespaced por usuario
src/photos.ts          # captura de foto (expo-image-picker) + copia persistente (expo-file-system)
src/location.ts        # captura de GPS (expo-location) con validación de precisión
src/LoginScreen.tsx    # login/registro
src/TaskForm.tsx       # formulario de alta/edición (+ foto, + GPS en alta)
src/TaskItem.tsx       # tarjeta de tarea (miniatura + badge de ubicación + editar/eliminar)
__tests__/             # tests unitarios con mocks de cámara, GPS y auth
```

Detalle de arquitectura y decisiones en `docs/1_BRIEF.md` a `docs/6_CIERRE.md`.

Persistencia: usuarios y tareas en `AsyncStorage` (namespaced por `userId`), sesión activa en `expo-secure-store`, fotos en el `documentDirectory` de la app. No hay backend remoto ni sincronización entre dispositivos.

## Requisitos

- Node.js
- Yarn (Berry, v4)
- App **Expo Go** instalada en el dispositivo móvil (Android/iOS)

## Instalación y ejecución

```bash
yarn install
yarn start
```

Esto abre Metro Bundler con un código QR. Escanéalo desde la app **Expo Go** en tu teléfono para correr la aplicación.

Alternativas:

```bash
yarn android   # abre en emulador/dispositivo Android
yarn ios       # abre en simulador iOS (requiere macOS)
```

## Verificación

```bash
yarn tsc --noEmit    # typecheck
yarn jest             # tests unitarios (auth, location, photos con mocks)
yarn expo export --platform android --output-dir /tmp/check && rm -rf /tmp/check   # smoke bundle
```
