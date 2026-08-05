# Instrucciones para agentes

Referencia canónica para cualquier agente que trabaje en este repositorio:
Claude Code, Codex, Cursor, opencode o el que venga. `CLAUDE.md` apunta acá y
no repite nada.

**Antes de tocar código, leé [`docs/ESTADO.md`](docs/ESTADO.md).** Lleva lo que
el código no puede llevar: en qué punto está el trabajo, qué decisiones de
diseño e interpretación ya se tomaron y por qué, qué se sabe roto y qué trampas
ya costaron tiempo. Se actualiza en el mismo commit que el trabajo que
describe. Si vas a cerrar una sesión, actualizalo.

---

## La regla que gobierna todo lo demás

Esto no es software donde un bug se descubre en producción y se arregla el
martes. **Un cálculo de esta app puede terminar fundando una resolución
judicial.** La exactitud del número es el producto; el código es el vehículo.

De ahí una sola regla, de la que se derivan casi todas las demás:

> **Ningún cambio puede mover un número sin que eso sea exactamente lo que se
> pidió, esté justificado en la norma y quede escrito.**

Un refactor que mejora el código y cambia un resultado no es un refactor
mejorado: es un error. Los resultados actuales se consideran correctos y son la
referencia a preservar, salvo que se demuestre lo contrario con el caso
concreto.

Lo que se sigue de eso:

- **No cambies escalas, porcentajes, coeficientes ni reglas normativas** sin
  pedido explícito. Si creés que algo está mal, decilo con el caso: qué
  entrada, qué da hoy, qué debería dar, y qué artículo o criterio lo funda.
  Después esperá confirmación.
- **No "simplifiques" una fórmula legal.** Lo que parece una redundancia suele
  ser una distinción de la ley. El orden de los pasos importa: aplicar una
  quita sobre la base no es lo mismo que aplicarla sobre la escala.
- **No elimines validaciones** porque parezcan defensivas de más.
- **El motor clásico no es un oráculo.** Es la referencia histórica de la que
  salió esta app, no la verdad. Ya se encontró al menos un caso donde ambos
  compartían el mismo agujero (ver `ESTADO.md`, flujo hacia atrás). Que dos
  implementaciones coincidan prueba que son consistentes, no que están bien.

**Lo que sí podés hacer sin preguntar:** cambios de interfaz, texto, estilos,
tipos, estructura de archivos y documentación. No hace falta un plan aprobado
para renombrar una variable. El riesgo acá no es el tamaño del cambio, es si un
número se movió.

Orden de prioridades cuando entran en conflicto:
**1) exactitud legal, 2) claridad, 3) mantenibilidad, 4) funcionalidad nueva,
5) performance.** La performance va última en serio.

---

## Cómo se verifica un cambio

Un solo comando, y es el mismo que corre CI:

```bash
npm run check      # tipos + las 11 validaciones
```

Por separado, si necesitás aislar:

```bash
npm run typecheck  # tsc --noEmit
npm run validate   # solo las validaciones
npm run build      # el export estatico, que es lo que se publica
```

Las validaciones de `lib/legal/__tests__/*.validation.ts` son scripts sueltos
—no hay framework de tests, a propósito— que comparan la salida del motor
contra casos conocidos y salen con código distinto de cero si algo no coincide.
`scripts/validate.mjs` las corre todas y junta los resultados.

**Tienen que quedar todas en verde antes de dar un cambio por hecho.** Corren
en `.github/workflows/motor.yml` en cada push y cada PR, y otra vez antes de
publicar: si una falla, el sitio no sale.

Si agregás una regla al motor, agregá su validación. Si cambiás un resultado a
propósito, va al [`CHANGELOG`](CHANGELOG.md) aunque el diff sea de una línea.

---

## Cómo está armado

Next.js (App Router, export estático), TypeScript y Tailwind. Cuatro capas, con
una regla que las ordena: **las reglas jurídicas viven en una sola de ellas.**

| Capa | Dónde | Qué puede hacer |
|---|---|---|
| Motor | `lib/legal/` | Toda la aritmética y todas las reglas de la ley. No conoce React, DOM ni HTML. |
| Schema | `lib/wizard/` | Qué se pregunta, en qué orden y bajo qué condición. Datos puros, sin efectos. |
| Orquestación | `hooks/useWizard.ts` | Navegación, validación y estado. Ninguna regla jurídica. |
| Presentación | `components/` | Solo renderiza. Ninguna regla jurídica. |

Punto de entrada único del motor:

```ts
import { buildCalculationResult } from '@/lib/legal/calculate'
const resultado = buildCalculationResult(estado) // función pura
```

Devuelve el cálculo **y** la lista de transformaciones que lo produjeron: eso es
lo que la interfaz muestra como cadena, y es lo que permitiría consumir el motor
desde afuera. No lo rompas devolviendo solo el número.

Invariantes que hay que sostener:

- El alias `@/*` apunta a la raíz del repositorio.
- `components/dashboard/cadena.ts` deriva los pasos intermedios por aritmética
  sobre los factores que emite el motor. **No reimplementa ninguna fórmula legal
  y no debe hacerlo.**
- Todo componente nuevo del dashboard se compone desde
  `components/dashboard/primitives.tsx`.
- Los archivos de `lib/legal/` llevan encabezado SPDX (AGPL). Uno nuevo también.

Detalle de capas y contratos: [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md).
Lo que sigue en curso: [`docs/ROADMAP.md`](docs/ROADMAP.md).

El **razonamiento normativo** de las reglas —qué hace cada tipo de proceso, qué
dice cada artículo, dónde la ley obliga a elegir un criterio— quedó en el
repositorio de origen, porque lo comparte con el asistente clásico:
[documentación de dominio](https://javiercuneo.github.io/Herramientas-Judiciales-IA/docs/).
Si alguna vez el clásico se retira, esos ocho documentos se mudan acá.

### El motor legacy

`public/legacy/{core,state,calculations}.js` es una copia del asistente clásico,
cargada por `<script>` y manejada por `window.*` para lo que todavía no se
portó. **No agregues dependientes nuevos:** todo lo nuevo va a `lib/legal/`.

El original vive en el repositorio de las calculadoras
(`asistente-honorarios-clasico/js/`). Si hay que arreglar algo del motor
compartido, se arregla allá —que es la fuente— y se propaga a propósito.

---

## Convenciones

- **Español rioplatense, con tildes**, en interfaz, documentación y commits.
  No "tú", no "vosotros", no texto sin acentuar.
- **Sin emojis en documentación técnica.** `ESTADO.md`, `README.md` y
  `CONTRIBUTING.md` marcan el registro: directo, con las razones dichas, sin
  decoración.
- **Commits en español**, con prefijo tipo `feat:`, `fix:`, `docs:`, `chore:`.
  Miralos con `git log --oneline` antes de escribir el tuyo.
- **`git commit -m` con here-string falla** en el entorno del autor. Usá
  `git commit -F <archivo>`.
- **Licencia AGPL-3.0-or-later.** Si aparece un PR, lo primero que se mira es la
  aceptación de [`CONTRIBUTING.md`](CONTRIBUTING.md): sin eso se pierde la
  opción de licenciar comercialmente. El motivo está en el README y no hace
  falta rediscutirlo.
- **El sitio se publica en `honorio.ar`** desde `public/CNAME`. El prefijo de
  publicación sale de `PAGES_BASE_PATH`, y acá el default vacío es el correcto.

## Trampas conocidas

Están todas en la sección final de [`docs/ESTADO.md`](docs/ESTADO.md), con el
detalle de qué pasa y por qué. No se duplican acá para que no se desincronicen.
Si te chocaste con una nueva, agregala ahí.
