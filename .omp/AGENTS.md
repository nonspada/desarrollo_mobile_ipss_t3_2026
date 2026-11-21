# Convenciones del proyecto

App móvil de lista de tareas (To-Do). Stack: **Expo (Expo Go) + React Native + TypeScript + Yarn 4 (Berry)**.

## Gestor de paquetes

- **Yarn**, nunca `npm`/`pnpm`. `nodeLinker: node-modules` en `.yarnrc.yml` (PnP no es compatible con Metro/Expo).
- Agregar dependencias con `npx expo install <pkg>` (resuelve versión compatible con el SDK), luego confirmar que `yarn.lock` quedó actualizado.
- Si `yarn install` falla con `"... are quarantined"`: es `npmMinimalAgeGate` (ventana de 24h para paquetes recién publicados). Ya está puesto en `0` en `.yarnrc.yml` para este proyecto; no lo subas a `1440` sin motivo.

## Estructura

- `App.tsx` — pantalla principal (lista de tareas) condicionada a sesión activa; sin
  navegación (no se usa Expo Router: 2 pantallas —login y lista— no lo justifican).
- `src/types.ts` — tipos `User`, `Task`, `TaskLocation`.
- `src/TaskForm.tsx`, `src/TaskItem.tsx`, `src/LoginScreen.tsx` — componentes planos, sin
  carpetas anidadas innecesarias.
- `src/auth.ts` — registro/login/logout/sesión (hash de contraseña con `expo-crypto`,
  sesión activa en `expo-secure-store`).
- `src/storage.ts` — persistencia de usuarios y tareas en `AsyncStorage`, namespaced por
  `userId` (aislamiento estricto por usuario).
- `src/photos.ts` — captura de foto (`expo-image-picker`) + copia persistente a
  `documentDirectory` (`expo-file-system`).
- `src/location.ts` — captura de GPS (`expo-location`) con validación de precisión y
  manejo de permiso denegado/timeout, sin bloquear el alta de tareas.
- `__tests__/` — tests de `auth`, `location`, `photos` con mocks de los módulos nativos
  (ver detalle y justificación en `docs/3_STACK.md` y `docs/6_CIERRE.md`).
- Persistencia real vía `AsyncStorage`/`expo-secure-store`/`expo-file-system`: la
  excepción a "no agregar backend/API ni AsyncStorage" (YAGNI) quedó habilitada
  explícitamente por los requerimientos de autenticación multiusuario y fotos/ubicación
  persistentes — documentado en `docs/3_STACK.md`. Sigue sin haber backend remoto.

## Verificación obligatoria tras cambios

```bash
yarn tsc --noEmit                              # typecheck
yarn expo export --platform android --output-dir /tmp/check && rm -rf /tmp/check   # smoke bundle (Metro)
yarn jest                                      # unit tests (auth, location, photos con mocks)
```

## Git

Repo con historia real (no squash de scaffolding). Commits en español, imperativo, con cuerpo que explique el *porqué* de decisiones no obvias (p. ej. cambios de package manager, workarounds de tooling).
