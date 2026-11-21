# 5. MVP

## Historias de usuario

| ID | Historia | Requerimiento |
|---|---|---|
| H1 | Como usuario nuevo, quiero registrarme con usuario y contraseña para tener mi propio espacio de tareas. | 2 |
| H2 | Como usuario registrado, quiero iniciar sesión para ver solo mis tareas. | 2 |
| H3 | Como usuario, quiero que mis tareas sean invisibles/inaccesibles para otros usuarios del mismo dispositivo. | 2 |
| H4 | Como usuario, quiero tomar una foto al crear una tarea para adjuntarla. | 3 |
| H5 | Como usuario, quiero que la foto adjunta siga disponible aunque cierre y reabra la app. | 3 |
| H6 | Como usuario, quiero que al crear una tarea se registre dónde la creé. | 4 |
| H7 | Como usuario, si niego el permiso de ubicación o cámara, quiero poder crear la tarea igual. | 3, 4 |
| H8 | Como usuario, quiero que se me avise si la ubicación registrada es poco precisa. | 4 |

## Criterios de aceptación por historia

**H1/H2** — Registro rechaza `username` duplicado (case-insensitive); login con
credenciales inválidas muestra error genérico sin crashear; sesión persiste tras cerrar y
reabrir la app (restaurada desde `expo-secure-store`).

**H3** — Con usuario A logueado, crear 2 tareas; cerrar sesión; registrar/loguear usuario
B: la lista de B está vacía (o solo con sus propias tareas), nunca con las de A, aunque
compartan dispositivo/AsyncStorage físico.

**H4/H5** — Botón "Tomar foto" dispara cámara nativa (`expo-image-picker`); al confirmar,
miniatura visible en `TaskItem`; cerrar la app (no solo backgroundear), reabrir, la foto
sigue renderizando (prueba de que vive en `documentDirectory`, no en cache).

**H6/H8** — Al confirmar alta de tarea, se intenta `getCurrentPositionAsync`; si
`coords.accuracy <= 50` → badge "ubicación registrada"; si `> 50` → badge "ubicación poco
precisa" pero igual se guardan coordenadas.

**H7** — Denegar permiso de cámara: tarea se crea sin foto, sin alert bloqueante de error
no manejado. Denegar permiso de ubicación: tarea se crea con `location.status: 'denied'`,
badge "sin ubicación". En ambos casos no hay `try/catch` sin capturar que aborte el flujo.

## Prioridad (MVP estricto vs. deseable)

| Debe estar (MVP) | Puede esperar |
|---|---|
| Registro/login local, aislamiento por usuario | Validación de fuerza de contraseña |
| Captura y persistencia de 1 foto por tarea | Editar/reemplazar foto tras creada |
| GPS con manejo de denegado/fallo/baja precisión | Mapa visual de la ubicación |
| Permisos just-in-time | Mensajes de permiso personalizados por SO |
| Tests con mocks de cámara/GPS/auth | Cobertura de UI end-to-end (Detox/Maestro) |

## Matriz de manejo de permisos (no debe bloquear alta de tarea)

| Permiso | Estado | Efecto en la tarea | UI |
|---|---|---|---|
| Cámara | Concedido, foto tomada | `photoUri` set | Miniatura |
| Cámara | Concedido, usuario cancela | `photoUri: null` | Sin miniatura |
| Cámara | Denegado | `photoUri: null` | Mensaje breve, sin bloquear |
| Ubicación | Concedido, accuracy ≤ 50 m | `status: 'granted'` | Badge ok |
| Ubicación | Concedido, accuracy > 50 m | `status: 'low_accuracy'` | Badge "poco precisa" |
| Ubicación | Denegado | `status: 'denied'`, coords `null` | Badge "sin ubicación" |
| Ubicación | Timeout/error de hardware | `status: 'unavailable'`, coords `null` | Badge "sin ubicación" |

## Fuera de alcance del MVP (reconfirmado)

Backend/sync remoto, recuperación de contraseña, multi-dispositivo, múltiples fotos por
tarea, edición de foto/ubicación post-creación, navegación con `expo-router`/
`react-navigation` (2 pantallas no lo justifican).
