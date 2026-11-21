# 1. Brief

## Contexto

App móvil de lista de tareas (To-Do), actualmente de pantalla única, estado en memoria,
sin backend ni persistencia. Stack base: **Expo (Expo Go) + React Native + TypeScript + Yarn 4 (Berry)**.
Ver `.omp/AGENTS.md` para convenciones vigentes.

## Objetivo

Evolucionar la app a una **lista de tareas multiusuario** donde cada tarea puede llevar
una **foto adjunta** y la **ubicación GPS** capturada al momento de crearla, manteniendo
el stack base intacto y agregando solo las dependencias oficiales estrictamente
necesarias para cámara, GPS, almacenamiento seguro y persistencia.

## Alcance (resumen)

| # | Requerimiento | Tipo |
|---|---|---|
| 1 | Mismo stack base; solo paquetes oficiales compatibles para periféricos/seguridad | Técnico |
| 2 | Autenticación multiusuario con aislamiento estricto de tareas por usuario | Funcional |
| 3 | Captura de fotos con cámara, adjuntas de forma persistente a la tarea | Funcional |
| 4 | Registro de GPS al crear tarea, con validación de precisión y manejo de fallos sin bloquear | Funcional |
| 5 | Permisos en runtime (just-in-time) + pruebas automatizadas con mocks (cámara/GPS/auth) | Técnico |

Detalle de dominio, stack, diseño, MVP y cierre en los documentos `2_DOMAIN.md` a `6_CIERRE.md`.

## Fuera de alcance (explícito)

- Backend remoto / API / sincronización en la nube.
- Recuperación de contraseña, verificación de email, OAuth/SSO.
- Multi-dispositivo (el usuario y sus tareas viven solo en el dispositivo local).
- Notificaciones push, compartir tareas entre usuarios.
- Edición/recorte de fotos, múltiples fotos por tarea.

## Criterio de éxito

- `yarn tsc --noEmit` y `yarn expo export --platform android` pasan sin errores.
- Dos usuarios distintos en el mismo dispositivo no pueden ver ni modificar las tareas
  del otro.
- Crear una tarea nunca queda bloqueada por permiso de cámara o GPS denegado/fallido.
- Suite de tests unitarios (mocks de cámara, GPS y auth) en verde.

## Stakeholders

- Equipo de desarrollo (IPSS, curso de desarrollo móvil).
- Usuario final: estudiante/evaluador usando Expo Go en Android/iOS.
