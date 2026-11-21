# AGENTS.md

## Contexto y Fuente de Verdad
Este proyecto evoluciona un repositorio existente (app To-Do List) hacia una aplicación móvil multiusuario con integración de periféricos. Consulta la documentación en estricto orden:
1. `docs/1_BRIEF.md` — Objetivo del producto y alcance.
2. `docs/2_DOMAIN.md` — Entidades (`Usuario`, `Tarea`), aislamiento de datos y reglas de negocio.
3. `docs/3_STACK.md` — Stack heredado del repositorio base y módulos oficiales permitidos.
4. `docs/4_DESIGN.md` — Pantallas de autenticación, flujo de permisos y componentes de tarea.
5. `docs/5_MVP.md` — Criterios de aceptación del MVP.
6. `docs/6_CIERRE.md` — Bitácora técnica, decisiones y estado de cada hito.

## Coherencia con el Repositorio Base
- **Reutilización estricta:** Conserva el framework, navegación, gestor de estado, estilos, persistencia y estructura de carpetas de la app To-Do List actual.
- **Dependencias controladas:** No instales librerías de terceros redundantes. Para Cámara, GPS y Autenticación/Storage seguro, utiliza exclusivamente paquetes oficiales compatibles con la versión exacta del framework instalado en el repo y solicita confirmación antes de instalarlos.

## Estándares de Periféricos, Permisos y Seguridad
1. **Permisos (Just-in-Time y Privacidad):**
   - Solicita permisos de cámara y ubicación únicamente en el momento en que el usuario ejecuta la acción (nunca al abrir la app por primera vez).
   - Declara explícitamente los permisos requeridos en la configuración nativa (`app.json` / `AndroidManifest.xml` / `Info.plist`).
   - Maneja siempre los estados `denied` y `blocked/never_ask_again` mostrando un mensaje claro y una acción para abrir la configuración del dispositivo, sin crashear la app.
2. **Cámara y Rendimiento:**
   - Comprime o redimensiona las imágenes capturadas antes de guardarlas para evitar fugas de memoria y degradación de rendimiento.
   - Persiste las imágenes en almacenamiento local permanente de la app (no dependas de rutas temporales de caché que el SO pueda borrar) y vincula su URI a la tarea.
3. **GPS y Precisión:**
   - Configura `timeout` y nivel de precisión adecuado al obtener coordenadas al crear una tarea.
   - Valida que las coordenadas obtenidas no sean nulas ni `(0, 0)` antes de persistirlas y permite guardar la tarea con estado de ubicación degradado/no disponible si el GPS falla o no tiene señal.
4. **Autenticación y Multiusuario:**
   - Aísla estrictamente las tareas por usuario autenticado: ningún usuario puede listar, editar ni eliminar tareas de otro usuario.
   - Almacena credenciales/tokens de sesión de forma segura (nunca contraseñas en texto plano en almacenamiento no cifrado).

## Pruebas Automatizadas (Obligatorias)
- Implementa pruebas unitarias y de integración automatizadas que verifiquen:
  1. Flujo de captura de imagen (permiso concedido, permiso denegado, cancelación del usuario y adjunto correcto de URI a la tarea).
  2. Flujo de obtención de ubicación GPS (permiso concedido, obtención de coordenadas válidas, timeout/error de sensor y manejo de permiso denegado).
  3. Aislamiento de tareas entre distintos usuarios autenticados.
- Mockea los módulos nativos de cámara y GPS de forma determinista para que las pruebas corran en CI/terminal sin hardware físico.

## Definición de Hecho (Verification Gate)
Antes de dar por cerrado cualquier hito, ejecuta y verifica que pasen al 100%:
1. Chequeo de tipos estáticos y linter del proyecto.
2. Suite completa de pruebas automatizadas (existentes + nuevas de periféricos y auth).
3. Actualización del avance en `docs/6_CIERRE.md`.