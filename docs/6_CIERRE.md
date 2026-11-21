# 6. Cierre

## Estrategia de verificación

### Comandos obligatorios (de `.omp/AGENTS.md`, sin cambios)

```bash
yarn tsc --noEmit
yarn expo export --platform android --output-dir /tmp/check && rm -rf /tmp/check
```

Se ejecutan después de cada cambio de código. No se agrega un test runner nuevo a estos
comandos base; los tests corren aparte (`yarn jest`).

### Tests automatizados (nuevos)

Runner: `jest` + `jest-expo`. Ubicación: `__tests__/*.test.ts(x)`.

| Suite | Qué cubre | Mock clave |
|---|---|---|
| `auth.test.ts` | registro rechaza duplicado; login válido/ inválido; hash nunca igual a password plano; aislamiento: tareas de `storage.ts` filtradas por `ownerId` | `AsyncStorage` en memoria (mock), `expo-secure-store` mock |
| `photos.test.ts` | captura exitosa copia a `documentDirectory`; cancelación o permiso denegado devuelve `null` sin lanzar | `expo-image-picker` (`launchCameraAsync`, `requestCameraPermissionsAsync`) mockeado con casos: éxito, cancelado, denegado |
| `location.test.ts` | accuracy ≤ 50 → `granted`; accuracy > 50 → `low_accuracy`; permiso denegado → `denied`; excepción/timeout/coords `(0,0)` → `unavailable`; nunca lanza | `expo-location` (`requestForegroundPermissionsAsync`, `getCurrentPositionAsync`) mockeado con los 5 casos |

Regla de test: cada mock de permiso/captura se parametriza (no un solo happy path) para
que las ramas de la matriz de `5_MVP.md` queden cubiertas explícitamente.

### QA manual (Expo Go, no automatizable sin Detox/Maestro — fuera de alcance)

1. Registrar usuario A, crear tarea con foto + ubicación.
2. Cerrar la app por completo (no background), reabrir: foto y ubicación persisten.
3. Cerrar sesión, registrar usuario B: lista de tareas vacía.
4. Denegar permiso de cámara al crear tarea: se crea sin foto, sin crash.
5. Denegar permiso de ubicación al crear tarea: se crea con badge "sin ubicación".
6. Simular baja precisión (emulador con mock location de baja accuracy, o alejar GPS
   fix): badge "poco precisa" pero coordenadas guardadas.

## Checklist antes de dar por cerrada la iteración

- [ ] `yarn tsc --noEmit` sin errores.
- [ ] `yarn expo export --platform android` sin errores.
- [ ] `yarn jest` en verde (auth, photos, location).
- [ ] QA manual (6 pasos de arriba) ejecutado al menos una vez en Expo Go.
- [ ] `app.json` con plugins/permisos de `3_STACK.md` aplicados.
- [ ] `README.md` actualizado: nuevas dependencias, nuevo flujo de login, comando
      `yarn jest`.
- [ ] `.omp/AGENTS.md` actualizado si cambia la excepción de AsyncStorage o la
      estructura de `src/`.

## Riesgos y limitaciones conocidas

| Riesgo | Mitigación / nota |
|---|---|
| Expo Go puede no soportar `expo-image-picker`/`expo-location` con la misma fidelidad que un build standalone en todas las versiones de SDK | Verificar en Expo Go real antes de cerrar; si falla, requiere dev build (`expo-dev-client`) — decisión a tomar en ese momento, no preventiva |
| `AsyncStorage` no cifra contenido en disco | Solo guarda hash+salt de contraseña, nunca texto plano; credenciales de sesión van en `expo-secure-store` (sí cifrado) |
| Sin backend: perder el dispositivo = perder todos los usuarios/tareas/fotos | Documentado como alcance aceptado (ver `1_BRIEF.md`, fuera de alcance) |
| Umbral de precisión GPS (50 m) es arbitrario | Ajustable en un único punto (`location.ts`); no hardcodeado en UI |

## Trabajo futuro (explícitamente no incluido ahora)

- Backend/API + sincronización multi-dispositivo.
- Recuperación de contraseña / verificación de identidad.
- Biometría (`expo-local-authentication`) como segundo factor.
- Mapa embebido mostrando la ubicación de la tarea.
- Tests end-to-end con Detox/Maestro sobre Expo Go o dev build.
