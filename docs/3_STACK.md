# 3. Stack

## Base (sin cambios)

| Capa | Tecnología | Versión actual (`package.json`) |
|---|---|---|
| Runtime/Framework | Expo (Expo Go) | `~58.0.22` |
| UI | React Native | `0.88.1` |
| UI | React | `19.3.0` |
| Lenguaje | TypeScript | `~6.0.3` |
| Package manager | Yarn Berry (`node-modules` linker) | `4.18.1` |
| Status bar | `expo-status-bar` | `~58.0.4` |

No se cambia versión de Expo/RN/React/TS ni el `nodeLinker`. Todo paquete nuevo se agrega
con `npx expo install <pkg>` (resuelve la versión compatible con el SDK instalado), tal
como indica `.omp/AGENTS.md`.

## Paquetes nuevos (oficiales, mínimos necesarios)

| Paquete | Requerimiento | Por qué este y no otro |
|---|---|---|
| `expo-image-picker` | 3 — cámara | API oficial Expo, abre la cámara nativa del SO (sin construir UI de cámara propia); `requestCameraPermissionsAsync` + `launchCameraAsync` cubren permiso + captura en una sola llamada. Más simple que `expo-camera` (que exige vista de preview propia) para el caso "una foto, adjuntar". |
| `expo-file-system` | 3 — persistencia de foto | El URI que devuelve `expo-image-picker` vive en cache del SO (puede borrarse). Se copia a `FileSystem.documentDirectory` para persistencia real entre reinicios de la app. |
| `expo-location` | 4 — GPS | API oficial Expo para permisos y lectura de ubicación foreground (`requestForegroundPermissionsAsync`, `getCurrentPositionAsync`), expone `coords.accuracy` para validar precisión. |
| `expo-crypto` | 2 — hashing de contraseña | API oficial Expo con `digestStringAsync` (SHA-256); evita contraseñas en texto plano sin agregar una dependencia nativa de criptografía de terceros. |
| `expo-secure-store` | 2 — sesión | Almacenamiento cifrado respaldado por Keychain (iOS) / Keystore (Android); guarda solo el `userId` de la sesión activa, nunca credenciales. |
| `@react-native-async-storage/async-storage` | 2, 3, 4 — persistencia de usuarios/tareas | Paquete de referencia recomendado por la documentación de Expo/React Native para persistencia clave-valor no sensible (lista de usuarios con hash, tareas por usuario). Mantenido por la org `react-native-async-storage`, instalable vía `expo install`. |

> Nota sobre `.omp/AGENTS.md`: ese archivo indica no agregar `AsyncStorage` "a menos que se
> pida explícitamente". Los requerimientos 2–4 (multiusuario con aislamiento + fotos y
> ubicación persistentes) exigen persistencia real entre reinicios y por usuario; sin
> backend (explícitamente fuera de alcance), `AsyncStorage` es el mecanismo estándar. Se
> documenta aquí como la justificación explícita que habilita la excepción.

## Testing (nuevo, dev-only)

| Paquete | Rol |
|---|---|
| `jest-expo` | Preset oficial de Jest para proyectos Expo (transform de RN/Expo modules). |
| `jest` | Test runner. |
| `@testing-library/react-native` | Render y queries de componentes RN en tests, recomendado por la doc de React Native. |
| `@types/jest` | Tipos para TS. |

Mocks requeridos (ver `6_CIERRE.md` para detalle):

- `expo-image-picker` → mock de `requestCameraPermissionsAsync` / `launchCameraAsync`.
- `expo-location` → mock de `requestForegroundPermissionsAsync` / `getCurrentPositionAsync`.
- Módulo de auth propio (`src/auth.ts` o similar) → mock de hashing/`AsyncStorage` para no
  depender de almacenamiento real en tests.

`jest-expo` trae mocks base de módulos nativos de Expo; los mocks de arriba son overrides
puntuales por test/suite, no un mock global adicional.

## Configuración nativa (`app.json`)

Agregar bajo `expo.*` (sin tocar `name`, `slug`, `version`, íconos existentes):

```json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        { "cameraPermission": "Esta app usa la cámara para adjuntar fotos a tus tareas." }
      ],
      [
        "expo-location",
        { "locationAlwaysAndWhenInUsePermission": "Esta app usa tu ubicación para registrar dónde creaste cada tarea." }
      ]
    ],
    "ios": {
      "supportsTablet": true,
      "infoPlist": {
        "NSCameraUsageDescription": "Esta app usa la cámara para adjuntar fotos a tus tareas.",
        "NSLocationWhenInUseUsageDescription": "Esta app usa tu ubicación para registrar dónde creaste cada tarea."
      }
    },
    "android": {
      "permissions": ["CAMERA", "ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"]
    }
  }
}
```

Los `plugins` son los que generan los `Info.plist`/`AndroidManifest.xml` correctos vía
prebuild/EAS; los bloques `ios.infoPlist`/`android.permissions` quedan como documentación
explícita y refuerzo para el flujo de Expo Go (que ya trae los permisos base, pero el
texto de justificación sí importa en build standalone).

## Estructura de carpetas (incremental)

```
src/
  types.ts          # + User, Task.ownerId, TaskLocation
  TaskForm.tsx       # + captura de foto y GPS al confirmar alta
  TaskItem.tsx       # + miniatura de foto, badge de ubicación
  auth.ts            # nuevo: registro/login/hash/sesión
  storage.ts         # nuevo: AsyncStorage namespaced (users, tasks:<userId>)
  location.ts        # nuevo: wrapper de expo-location + validación de precisión
  photos.ts          # nuevo: wrapper de expo-image-picker + copia a FileSystem
  LoginScreen.tsx     # nuevo: login/registro
__tests__/
  auth.test.ts
  location.test.ts
  photos.test.ts
```

Sin librería de navegación: solo dos "pantallas" (login vs. lista de tareas), resueltas
con el mismo patrón condicional que ya usa `App.tsx` (`editingTask` toggle) — agregar
`react-navigation`/`expo-router` sería sobre-ingeniería para dos vistas.
