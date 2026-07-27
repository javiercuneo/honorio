# Arquitectura — Milestone 1: Integracion

**Fecha:** 27 de julio de 2026
**Proyecto:** Asistente de Honorarios Judiciales (Ley 27.423)
**Branch:** milestone-1-integracion

---

## Principios Arquitectonicos

1. **Motor juridico intacto** — Los archivos JS del clasico NO se modifican.
2. **Adaptador agnostico** — La capa de adaptacion es TypeScript puro, sin dependencia de React ni de ningun framework.
3. **Wizard declarativo** — Todo el flujo de navegacion y validacion se deriva de un schema de datos.
4. **React es solo presentacion** — Los componentes no contienen reglas juridicas, solo renderizan.
5. **Copia temporal explicita** — La copia del motor en `public/legacy/` es transitoria y se eliminara cuando la logica se extraiga a TS puro.

---

## Diagrama de Capas

```
+--------------------------------------------------------------------------+
¦                        CAPA DE PRESENTACION (React)                      ¦
¦                                                                          ¦
¦  pages/page.tsx                                                          ¦
¦    +-- InterviewExperience  (orquestador de fase)                        ¦
¦          +-- IntroView       (pantalla de bienvenida)                    ¦
¦          +-- StepShell       (wrapper generico de paso)                  ¦
¦          ¦     +-- CardsField      (seleccion tipo proceso, objeto, etc) ¦
¦          ¦     +-- NumericField    (ingreso de UMA, base, porcentajes)   ¦
¦          ¦     +-- ExplanationDisclosure (articulos de ley desplegables) ¦
¦          +-- ContextPanel    (resumen lateral + navegacion)              ¦
¦          +-- ProgressRail    (barra de progreso superior)                ¦
¦          +-- DashboardView   (pantalla de resultados)                    ¦
¦                                                                          ¦
¦  Rol: Solo renderiza. NO contiene reglas juridicas.                     ¦
¦  Consume: hooks/useWizard.ts                                             ¦
+--------------------------------------------------------------------------+
                                   ¦
                                   ?
+--------------------------------------------------------------------------+
¦                       CAPA DE APLICACION (React)                         ¦
¦                                                                          ¦
¦  hooks/useWizard.ts                                                      ¦
¦    - Lee el schema (wizard-schema.ts) para saber estructura de pasos     ¦
¦    - Mantiene React state con respuestas del usuario                     ¦
¦    - Llama adapters para validar, sincronizar y calcular                 ¦
¦    - Orquesta la navegacion (siguiente, anterior, saltar)                ¦
¦    - Maneja ramificaciones condicionales (ej: paso 3 solo si conocim.)   ¦
¦                                                                          ¦
¦  Rol: Orquestacion pura. NO contiene reglas juridicas.                  ¦
¦  Consume: lib/legal/adapters.ts y lib/wizard/wizard-schema.ts            ¦
+--------------------------------------------------------------------------+
                                   ¦
                                   ?
+--------------------------------------------------------------------------+
¦                       CAPA DE ADAPTACION (TS puro)                       ¦
¦                                                                          ¦
¦  lib/legal/types.ts        — Interfaces TS (WizardState, EscalaResult)  ¦
¦  lib/legal/adapters.ts     — Wrappers tipados sobre window.*            ¦
¦  lib/legal/index.ts        — Re-export                                  ¦
¦                                                                          ¦
¦  Ejemplo:                                                                ¦
¦    export function calcularEscala(base: number, uma: number) {           ¦
¦      return (window as any).calcularEscalaBase(base, uma) as EscalaRes   ¦
¦    }                                                                     ¦
¦                                                                          ¦
¦  Rol: Traducir el contrato JS del motor a una interfaz TS tipada.       ¦
¦  Framework-agnostic: NO importa React. Podria usarse desde Vue/Svelte.  ¦
+--------------------------------------------------------------------------+
                                   ¦
                                   ?
+--------------------------------------------------------------------------+
¦                     WIZARD SCHEMA (TS puro, datos)                       ¦
¦                                                                          ¦
¦  lib/wizard/wizard-schema.ts                                             ¦
¦    - Define cada paso del wizard como objeto (id, tipo, opciones, ...)   ¦
¦    - Define condiciones de ramificacion (dependencias entre pasos)       ¦
¦    - Define reglas de validacion por paso                                ¦
¦                                                                          ¦
¦  Rol: Fuente de verdad del flujo de navegacion. Datos puros, sin logica.¦
¦  NO importa React.                                                       ¦
+--------------------------------------------------------------------------+
                                   ¦
                                   ?
+--------------------------------------------------------------------------+
¦                      MOTOR JURIDICO (Vanilla JS)                         ¦
¦                                                                          ¦
¦  public/legacy/                                                          ¦
¦  +-- core.js             — UMA, parse/format, calcularEscalaBase         ¦
¦  +-- state.js            — wizardState global, validaciones              ¦
¦  +-- calculations.js     — calcularFinal(), mostrarTablasMinimos()       ¦
¦                                                                          ¦
¦  Rol: Fuente de verdad de la Ley 27.423. Implementacion original.        ¦
¦                                                                          ¦
¦  +------------------------------------------------------------------+    ¦
¦  ¦  ADVERTENCIA: Esta copia es TEMPORAL.                           ¦    ¦
¦  ¦  Existira solo hasta que la logica se extraiga a TS puro        ¦    ¦
¦  ¦  en el Milestone 2. No agregar nuevas dependencias sobre esto.  ¦    ¦
¦  ¦  Fuente original: asistente-honorarios-clasico/js/              ¦    ¦
¦  +------------------------------------------------------------------+    ¦
+--------------------------------------------------------------------------+
```

---

## Flujo de Datos

### Ciclo de navegacion (por paso)

```
Usuario hace clic
       ¦
       ?
+------------------+
¦  Componente UI   ¦  ?-- renderiza segun schema (CardsField o NumericField)
¦  (React)         ¦
+------------------+
       ¦ onChange(valor)
       ?
+------------------+
¦  useWizard       ¦  --? actualiza React state local (answers)
¦  hook            ¦  --? si aplica, llama adapter.syncWizardState()
+------------------+
       ¦ "Siguiente"
       ?
+------------------+
¦  useWizard       ¦  --? schema.validar(pasoActual, answers)
¦  validar         ¦      si error ? mostrar mensaje
¦                  ¦      si OK ? avanzar indice
+------------------+
```

### Ciclo de calculo (pantalla de resultados)

```
Usuario llega al paso final
       ¦
       ?
+------------------+
¦  useWizard       ¦  --? vuelca answers ? wizardState (via adapter)
¦  calcular()      ¦      llama adapter.calcularFinal()
+------------------+
       ¦ resultado
       ?
+------------------+
¦  adapters.ts     ¦  --? llama (window as any).calcularFinal()
¦                  ¦      (que internamente lee wizardState, aplica
¦                  ¦       escalas, reducciones, y renderiza HTML)
+------------------+
       ¦
       ?
  ??  El motor legacy ESCRIBE directamente al DOM
      (innerHTML en document.getElementById('resultadosDinamicos'))

       Para el Milestone 1: se captura ese HTML y se inyecta en
       el componente DashboardView como contenido renderizado.
       En Milestone 2 esto se reemplazara por datos estructurados.
```

---

## Estructura de Archivos (Milestone 1)

```
honorio/
+-- public/
¦   +-- legacy/                          ? COPIADOS (temporales)
¦       +-- README.md                    ? advertencia de temporalidad
¦       +-- core.js                      ? del clasico (intacto)
¦       +-- state.js                     ? del clasico (intacto)
¦       +-- calculations.js              ? del clasico (intacto)
¦
+-- lib/
¦   +-- legal/                           ? NUEVO (adaptacion)
¦   ¦   +-- types.ts                     ? interfaces TS
¦   ¦   +-- adapters.ts                  ? wrappers framework-agnostic
¦   ¦   +-- index.ts                     ? re-export
¦   ¦
¦   +-- wizard/                          ? NUEVO (schema)
¦   ¦   +-- wizard-schema.ts             ? pasos declarativos
¦   ¦
¦   +-- interview-data.ts                ? SE ELIMINA
¦   +-- plan.ts                          ? SE ELIMINA
¦   +-- utils.ts                         ? SE CONSERVA
¦
+-- hooks/
¦   +-- useWizard.ts                     ? NUEVO
¦
+-- components/
¦   +-- ui/                              ? SE CONSERVA
¦   ¦   +-- button.tsx
¦   +-- interview/
¦       +-- interview-experience.tsx      ? SE ADAPTA
¦       +-- dashboard-view.tsx           ? SE ADAPTA
¦       +-- step-shell.tsx               ? SE CONSERVA
¦       +-- numeric-field.tsx            ? SE ADAPTA (formato AR)
¦       +-- cards-field.tsx              ? SE ADAPTA (sub-opciones)
¦       +-- progress-rail.tsx            ? SE CONSERVA
¦       +-- context-panel.tsx            ? SE ADAPTA
¦       +-- intro-view.tsx               ? SE ADAPTA
¦       +-- explanation-disclosure.tsx   ? SE CONSERVA
¦
+-- app/
    +-- layout.tsx                        ? SE ADAPTA (carga scripts legacy)
    +-- page.tsx                          ? SE CONSERVA
    +-- globals.css                       ? SE CONSERVA
```

---

## Contratos entre Capas

### 1. Wizard Schema ? useWizard hook

```typescript
// lib/wizard/wizard-schema.ts
interface WizardStep {
  id: string;
  kind: 'cards' | 'numeric';
  select?: 'single' | 'multi';         // solo para cards
  eyebrow: string;
  question: string;
  helper: string;
  options?: CardOption[];               // solo para cards
  unit?: string;                        // solo para numeric
  min?: number; max?: number;           // solo para numeric
  dependsOn?: string;                   // paso condicional
  condition?: (answers: Answers) => boolean;
  validate?: (value: any, answers: Answers) => string | null;
}
```

### 2. Adapter ? useWizard hook

```typescript
// lib/legal/adapters.ts
export function getWizardState(): WizardState;
export function setWizardState(partial: Partial<WizardState>): void;
export function validarPaso(paso: number): string;
export function recolectarDatos(): void;
export function calcularEscala(base: number, uma: number): EscalaResult | null;
export function ejecutarCalculoFinal(): void;
export function getUMA(): number;
export function cargarUMA(): Promise<void>;
export function parseNumero(str: string): number;
export function formatNumero(num: number): string;
```

### 3. useWizard hook ? Componentes React

```typescript
// hooks/useWizard.ts (lo que expone a los componentes)
interface UseWizardReturn {
  phase: 'intro' | 'question' | 'dashboard';
  currentStep: WizardStep | null;
  index: number;
  answers: Answers;
  totalSteps: number;
  completedSteps: number;
  setAnswer: (value: string | string[] | number) => void;
  next: () => string | null;  // null si OK, string si error
  back: () => void;
  jumpTo: (index: number) => void;
  restart: () => void;
  calculate: () => void;
  errorMessage: string | null;
}
```

---

## Por que el adapter es framework-agnostico

El archivo `adapters.ts`:
- **NO importa** React, hooks, ni nada del ecosistema React
- **NO usa** JSX, useState, useEffect
- **SOLO** define funciones que leen/escriben `window` y devuelven datos tipados
- Puede ser importado desde cualquier framework (Vue, Svelte, Angular) o incluso desde Node.js (via JSDOM)

Esto asegura que cuando en Milestone 2 extraigamos la logica a TS puro, los componentes React no necesiten cambios: solo cambiara la implementacion interna del adapter (de `window.*` a modulos ES), no su interfaz.

---

## Manejo de la salida HTML del motor legacy

`calcularFinal()` en el motor legacy genera HTML directamente y lo inyecta en el DOM. Para el Milestone 1:

1. `adapters.ts` redirige temporalmente `document.getElementById('resultadosDinamicos')` a un contenedor fantasma
2. Despues de llamar `calcularFinal()`, captura el HTML generado desde ese contenedor
3. Devuelve el HTML como string al hook `useWizard`
4. El componente `DashboardView` renderiza ese HTML en un contenedor con `dangerouslySetInnerHTML`

**Esto es temporal.** En Milestone 2 se reemplazara por datos estructurados (JSON) y componentes React nativos para cada seccion (tablas, KPIs, etc.).

---

*Documento de arquitectura v1.0 — Aprobado para inicio de Milestone 1.*
