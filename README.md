# To-Do List — React Native + Expo

Aplicación móvil básica de lista de tareas pendientes, construida con **React Native**, **Expo (Expo Go)**, **TypeScript** y **Yarn**.

## Funcionalidad

- Agregar tareas con **título** y **descripción**.
- Editar tareas existentes.
- Eliminar tareas (con confirmación).
- Visualizar la lista de tareas pendientes.

## Estructura

```
App.tsx          # pantalla principal: estado de la lista y formulario
src/types.ts     # tipo Task
src/TaskForm.tsx # formulario de alta/edición
src/TaskItem.tsx # tarjeta de tarea con acciones editar/eliminar
```

El estado de las tareas vive en memoria (`useState` en `App.tsx`); no requiere backend ni persistencia para este alcance.

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

## Verificación de tipos

```bash
yarn tsc --noEmit
```

## Flujo de trabajo con OMP

Instrucciones para retomar la sesión de desarrollo y guía de uso eficiente:
[`docs/omp-workflow.md`](docs/omp-workflow.md).
