# Convenciones del proyecto

App móvil de lista de tareas (To-Do). Stack: **Expo (Expo Go) + React Native + TypeScript + Yarn 4 (Berry)**.

## Gestor de paquetes

- **Yarn**, nunca `npm`/`pnpm`. `nodeLinker: node-modules` en `.yarnrc.yml` (PnP no es compatible con Metro/Expo).
- Agregar dependencias con `npx expo install <pkg>` (resuelve versión compatible con el SDK), luego confirmar que `yarn.lock` quedó actualizado.
- Si `yarn install` falla con `"... are quarantined"`: es `npmMinimalAgeGate` (ventana de 24h para paquetes recién publicados). Ya está puesto en `0` en `.yarnrc.yml` para este proyecto; no lo subas a `1440` sin motivo.

## Estructura

- `App.tsx` — pantalla única, estado de tareas (`useState`), sin navegación (no se usa Expo Router: una sola pantalla no lo justifica).
- `src/types.ts`, `src/TaskForm.tsx`, `src/TaskItem.tsx` — componentes planos, sin carpetas anidadas innecesarias.
- Estado en memoria. **No** agregar backend/API ni `AsyncStorage` a menos que se pida explícitamente (YAGNI).

## Verificación obligatoria tras cambios

```bash
yarn tsc --noEmit                              # typecheck
yarn expo export --platform android --output-dir /tmp/check && rm -rf /tmp/check   # smoke bundle (Metro)
```

No hay test runner configurado; no inventar uno salvo pedido explícito.

## Git

Repo con historia real (no squash de scaffolding). Commits en español, imperativo, con cuerpo que explique el *porqué* de decisiones no obvias (p. ej. cambios de package manager, workarounds de tooling).
