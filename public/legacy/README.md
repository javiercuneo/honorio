# ADVERTENCIA: Motor Legacy Temporal

**ESTA CARPETA ES TEMPORAL.** Contiene una copia directa del motor juridico
original del proyecto `asistente-honorarios-clasico`.

## Origen

- `core.js`         ? asistente-honorarios-clasico/js/core.js
- `state.js`        ? asistente-honorarios-clasico/js/state.js
- `calculations.js` ? asistente-honorarios-clasico/js/calculations.js

## Por que existe

Sirve como puente para que la nueva interfaz (Next.js/React) consuma la logica
existente de la Ley 27.423 **sin modificar el codigo original**, mientras se
valida la integracion visual (Milestone 1).

## Ciclo de vida

- **Milestone 1 (actual):** Se carga via `<script>` desde `app/layout.tsx`
- **Milestone 2:** La logica se extraera a `lib/legal/` en TypeScript puro
- **Milestone 2 (fin):** Esta carpeta se elimina por completo

## Reglas

1. NO modificar estos archivos. Son una copia exacta del clasico.
2. NO agregar nuevos archivos aqui.
3. NO crear dependencias permanentes sobre esta carpeta.
4. Toda la comunicacion debe hacerse via `lib/legal/adapters.ts`.

## Fuente de verdad

El repositorio original del motor es:
`asistente-honorarios-clasico/js/`

Cualquier correccion legal debe hacerse ALLI, y luego copiarse aqui.
