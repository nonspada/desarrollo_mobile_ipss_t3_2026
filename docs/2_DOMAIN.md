# 2. Dominio

## Entidades

### User

```ts
interface User {
  id: string;        // uuid local
  username: string;   // único, case-insensitive
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;  // ISO
}
```

- `username` es la clave de login; no hay email ni recuperación de contraseña (fuera de alcance).
- `passwordHash` nunca es la contraseña en texto plano: `SHA-256(salt + password)` vía `expo-crypto`.
- No existe entidad `Session` persistida en claro: solo el `userId` activo vive en
  `expo-secure-store` (ver `3_STACK.md`).

### Task

```ts
interface Task {
  id: string;
  ownerId: string;        // User.id — clave de aislamiento
  title: string;
  description: string;
  photoUri: string | null;      // ruta persistente local (documentDirectory)
  location: TaskLocation | null;
  createdAt: string;
}

interface TaskLocation {
  status: 'granted' | 'denied' | 'unavailable' | 'low_accuracy';
  latitude: number | null;
  longitude: number | null;
  accuracyMeters: number | null;
  capturedAt: string | null;
}
```

- `ownerId` es obligatorio y no editable: toda consulta/mutación de tareas se filtra por
  el usuario autenticado actual.
- `photoUri` y `location` son opcionales a nivel de dato (pueden ser `null`) pero el intento
  de captura ocurre siempre al crear la tarea (requerimientos 3 y 4).
- `TaskLocation.status` registra el resultado del intento de GPS incluso cuando no hay
  coordenadas, para que la UI explique por qué falta la ubicación sin bloquear la creación.

## Reglas de negocio

1. **Aislamiento estricto**: ninguna pantalla, store o query puede listar/editar/borrar una
   `Task` cuyo `ownerId` no sea el del usuario autenticado activo. La clave de persistencia
   de tareas está namespaced por usuario (`tasks:<userId>`), no es solo un filtro en memoria.
2. **Alta de usuario**: `username` único (comparación case-insensitive); si ya existe, se
   rechaza el registro con mensaje claro.
3. **Login**: credenciales inválidas → mensaje genérico ("usuario o contraseña incorrectos"),
   sin distinguir si falló el usuario o la contraseña (evita enumeración de usuarios).
4. **Foto de tarea**: si el usuario captura una foto, se copia del cache de la cámara al
   `documentDirectory` de la app antes de guardar la `Task`, para que sobreviva a limpiezas
   de cache del SO. Si el usuario cancela la captura o niega el permiso, `photoUri` queda
   `null` y la tarea se crea igual.
5. **GPS al crear tarea**: se intenta obtener ubicación una sola vez al confirmar el alta.
   - Permiso denegado → `status: 'denied'`, tarea se crea sin coordenadas.
   - Timeout/error de hardware, o lectura `(0, 0)` (centinela de GPS sin fix real) →
     `status: 'unavailable'`.
   - Precisión reportada (`coords.accuracy`) peor que el umbral aceptado (> 50 m) →
     `status: 'low_accuracy'`, se guardan igualmente las coordenadas obtenidas (son la
     mejor lectura disponible) pero la UI lo marca como poco confiable.
   - Lectura exitosa dentro del umbral → `status: 'granted'`.
   - En ningún caso el flujo de creación de tarea espera más de un timeout corto
     (ver `4_DESIGN.md`) ni queda bloqueado indefinidamente.
6. **Edición de tarea**: título/descripción editables; foto y ubicación son inmutables una
   vez creada la tarea (se capturan solo en el alta, consistente con "registro al momento
   de crear").

## Glosario

| Término | Significado |
|---|---|
| Aislamiento por usuario | Ninguna tarea es visible/accesible fuera de la sesión de su dueño |
| Just-in-time permission | Pedir el permiso de SO justo antes de usarlo, no al abrir la app |
| Precisión GPS | `coords.accuracy` de `expo-location`, en metros (radio de error estimado) |
