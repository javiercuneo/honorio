# Estado del proyecto

Documento de continuidad entre sesiones. **Leer antes de empezar a trabajar.**
Se actualiza en el mismo commit que el trabajo, para que nunca mienta.

Última actualización: 2026-08-04

> Honorio salió de
> [Herramientas-Judiciales-IA](https://github.com/javiercuneo/Herramientas-Judiciales-IA),
> donde convivía con las calculadoras de plazos y el asistente clásico. La
> historia de `honorio/` viajó completa con `git subtree split`, así que
> `git log` de antes de la mudanza sigue siendo válido. Lo que quedó allá:
> las calculadoras, el asistente clásico y la documentación de dominio.

---

## Dónde estamos

Versión **2.0.0**. El rediseño visual está cerrado y el bug del flujo hacia
atrás de la entrevista —que arrastraba respuestas de un proceso a otro— quedó
resuelto. Las 11 validaciones de `lib/legal/__tests__` están en verde y corren
solas en CI.

Pantallas terminadas sobre el mismo sistema visual: **dashboard**, **wizard**,
**portada**, **intro** y **mínimos**. Falta pulido de mensajes.

### El flujo hacia atrás (cerrado el 3/8)

El bug: llegar a *conocimiento*, elegir **honorarios provisorios**, volver atrás
y cambiar a **sucesión**. El paso de terminación desaparece —la sucesión no lo
pregunta— pero la respuesta seguía en `answers`, el resumen mostraba
«Terminación: provisorios» y el resultado salía marcado como provisorio.

Es doblemente incorrecto: es un estado que la entrevista no puede producir yendo
hacia adelante, y es un error jurídico. En el sucesorio no se admiten
regulaciones provisorias salvo excepción, y en esa excepción —el letrado
renuncia con la sucesión sin terminar— **la regulación es definitiva y va con
mínimo y máximo**, justo lo contrario de lo que hace el art. 12.

La causa: `answers` era un acumulador que solo crecía. `visibleSteps` sí se
recalculaba, pero nadie borraba lo que dejaba de preguntarse. Un barrido de los
**25.600 cruces** posibles encontró otras dos salidas, esas con consecuencia
numérica:

| Camino | Qué quedaba pegado |
|---|---|
| Sentencia «rechazada» → atrás → modos anormales / caducidad | base −30 % (art. 22) sin haberlo preguntado |
| Modos anormales «antes de prueba» → atrás → caducidad / art. 22 | escala −50 % (art. 25) sin haberlo preguntado |

El arreglo, en tres capas:

1. **`lib/wizard/reachability.ts`** — una respuesta vive mientras su paso sea
   visible. `podarInalcanzables` itera hasta punto fijo, porque podar una
   respuesta puede volver invisible a otro paso.
2. **El motor se defiende solo** — `esRegulacionProvisoria` mira el tipo de
   proceso, no solo el modo de terminación. Un estado imposible no depende de
   que el llamador lo haya limpiado.
3. **`calculate()` reconstruye el estado del motor entero**
   (`resetWizardState` + `syncAllToLegacy`) en vez de parchearlo.

**Consecuencia que hay que sostener:** volver atrás y cambiar el tipo de proceso
**vacía** las respuestas que ese proceso no comparte. Es deliberado —decisión de
Javier el 3/8— y es el precio de que no queden respuestas que el usuario no dio.
Si alguna vez molesta, la salida **no** es dejar de podar: sería guardar las
respuestas viejas en un cajón aparte, que es exactamente el estado oculto que
causó este bug.

### Cambio de criterio en el motor

`resolveReglas` aplicaba el −50 % del art. 25 también cuando la caducidad se
trataba por **art. 22**, acumulando la quita de base del 22 y la de escala del
25 sobre el mismo hecho. **El motor clásico nunca tuvo esa rama.** Se quitó el
3/8 con confirmación de Javier: los dos criterios de la caducidad son
alternativos —o art. 22 o art. 25—; elegido el art. 22 la instancia cae como
demanda desestimada y el momento de la apertura a prueba no juega.

---

## Decisiones tomadas, y por qué

Estas no se derivan del código. Si algo se va a cambiar, conviene saber contra
qué se está discutiendo.

### El sistema visual

**"Instrumento de medición".** El honorario es una banda medida en UMA contra
una escala graduada; la interfaz se diseñó como un instrumento, no como un
dashboard genérico. Se descartó explícitamente el cluster "crema + serif display
+ terracota" por ser el look más reconocible de diseño generado por IA.

**Cuatro roles tipográficos, cada uno con significado estructural:**

- `font-meter` (**Archivo**, Omnibus-Type, Buenos Aires) — cifras y preguntas.
  Grotesca de raíz DIN con cifras tabulares. Elegida por ser una tipografía
  argentina para una herramienta jurídica argentina.
- `font-law` (**Source Serif 4**) — texto de la ley. **Si aparece serif, se está
  leyendo la norma y no la interfaz.** No usar serif para nada más.
- `font-sans` (Geist) — interfaz.
- `font-mono` (Geist Mono) — etiquetas, unidades y citas de artículos.

**Un solo acento.** Cobalto `#1E45CE` es `primary`, `ring` y `accent-foreground`
a la vez: lo activo, lo enfocado y lo seleccionado son siempre el mismo color.

**Tres ejes de color, uno por eje del cálculo:**

- **ocre** `--axis-base` — base regulatoria (arts. 22, 40)
- **violeta** `--axis-escala` — escala del art. 21 (arts. 25, 35, 37, 41)
- **óxido** `--axis-honorarios` — honorario final (arts. 34, 38, 49)
- **verde** `--rol` — ajuste por rol (art. 20). Fuera del sistema de tres ejes a
  propósito: no reduce por una razón procesal, ubica al rol respecto del
  patrocinante.

**`--radius: 0.375rem`.** El `rounded-2xl` parejo era parte del look de plantilla.

### Las dos reglas que gobiernan el contenido

1. **Toda la información importante debe estar.** Es software didáctico y
   deliberadamente transparente, no una caja negra.
2. **Pero solo se le muestra a quien quiere entender.** De ahí:

   > **Los números no se ocultan nunca; las frases, siempre.**

   Un número es una decisión (el efectivo, el piso, la quita): se ve. Una frase
   es un fundamento (la norma, el criterio): va detrás de un `Disclosure`.

**El `por qué` es un único signo.** Misma palabra, mismo tamaño, mismo lugar al
borde derecho de la fila, en toda la app. **No inventar variantes.**

### Decisiones de contenido

- **Cifras siempre completas.** Se eliminó la abreviación (`$101K`): dos importes
  distintos como `$2.001.300` y `$2.011.800` abrevian ambos a "2M" y borran
  justamente la diferencia que importa.
- **El contrafáctico.** Bajo la cifra principal: *"La tabla del tramo sugiere
  $1.428.000"*, con la norma detrás del `por qué`. Es el momento más didáctico
  de la app. **No aparece cuando la base cae en el primer tramo**, porque ahí el
  cálculo ingenuo y el real coinciden y la frase mentiría.
- **Segunda instancia es una sección par**, no un colapsable: la van a consumir
  mucho quienes revisan regulaciones en cámara.
- **No numerar los ejes.** "Eje 1 / 01" es una convención nuestra, no de la ley.

### Arquitectura del rediseño

- `components/dashboard/primitives.tsx` — `Cifra`, `LedgerRow`, `Disclosure`,
  `Segmented`, `Tile`, `Prosa`, `Insignia`, y el mapa de colores por eje.
  **Todo componente nuevo del dashboard debería componerse de acá.**
- `components/dashboard/cadena.ts` — deriva los estados intermedios por
  aritmética sobre los factores que emite el motor. **No reimplementa ninguna
  fórmula legal, y no debe hacerlo.**
- `components/prefs.tsx` — tema y preferencias de lectura. Persisten en
  `localStorage`. **Solo cambian cómo se escribe la cifra, nunca el cálculo.**
- `components/interview/app-topbar.tsx` — la única cabecera de la app.

**Invariante importante:** el paso de la escala en la cadena se expresa
**siempre en términos del patrocinante**, y el ajuste por rol es un paso
posterior.

### Licencia

**AGPL-3.0-or-later** (`LICENSE`, texto verbatim de la FSF). Decidido por Javier
el 31/7. El motivo, para no rediscutirlo: no quiere restringir el uso ni cobrar
por la app, quiere que un tercero no pueda cerrar el motor —donde están los
criterios— como producto propio.

Consecuencias que hay que sostener:

- **Todo PR necesita la aceptación de `CONTRIBUTING.md`**, que incluye la cesión
  de licencia. Sin eso se pierde la opción de licenciar comercialmente. Si
  aparece un PR, esto es lo primero que hay que mirar.
- Los archivos de `lib/legal/` llevan encabezado SPDX. Un archivo nuevo también.
- Al publicar el motor como paquete o API, arrastrar `LICENSE` y los SPDX.

---

## Lo que sigue

### Bugs conocidos

Ninguno. El del flujo hacia atrás quedó cubierto por `retroceso.validation.ts`,
que barre los 25.600 cruces en cada corrida.

### Pendiente inmediato

- **Enlace a la documentación desde la app.** Ya hay a dónde apuntar: la
  documentación de dominio está publicada en el sitio de origen. Falta decidir
  **desde qué pantalla se entra**.
- **Informe imprimible.** PDF del cálculo con interruptor para incluir u omitir
  las explicaciones. Propuesto, no empezado.
- **Autoría visible.** Hoy figura en los README, no en la interfaz. Es la misma
  pregunta que "qué firma el informe imprimible".

La versión del motor —hoy `2.0.0`— es el hilo que los une: el informe la tiene
que mostrar, y es lo que hace que un cálculo sea reproducible dentro de dos
años. Ver el encabezado de `CHANGELOG.md` para el criterio de numeración.

### Pendiente de diseño y contenido

- **Assets de marca.** `components/brand.tsx` usa `mask-image` + `currentColor`
  sobre `public/honorio-marca.svg`: el trazado toma la tinta y deja el papel
  transparente, que es lo que hace que `currentColor` funcione. Quedaron sin
  usar cuatro variantes que Javier generó (`honorio trazo blanco/negro.svg`,
  `honorio2 trazo blanco/negro.svg`) y dos propuestas de ícono sin revisar
  (`resultado gemini.png`, `resultado gpt.png`). **Son suyas: no borrarlas sin
  preguntar.** `honorio-wordmark.svg` está generado pero no cableado.
  Idea de marca a conservar: *un abogado que hace mal los números*.
- **Mensajes.** Varios pasos del wizard traen `brief: 'Ver más'`, que era el
  rótulo del botón viejo, no un resumen. Hoy se reemplaza en presentación por
  "Qué dice la ley sobre este paso" (ver `explanation-disclosure.tsx`), pero
  **conviene escribir briefs reales en el schema**.
- El resto está en [ROADMAP](ROADMAP.md): caducidad, mediación, consumo del
  motor desde afuera, regulación redactada.

---

## Trampas conocidas

- **El panel del navegador no compone frames si el panel no está a la vista.**
  Se anotó mucho tiempo como si fuera una limitación del entorno, y no lo es:
  **la causa es que el panel está cerrado o en segundo plano.** Con el panel
  oculto, `document.hidden` es `true`, `requestAnimationFrame` no dispara,
  `clientWidth` mide 0 y las capturas fallan con *«the Browser pane is not
  displayed»*. Consecuencia: `AnimatePresence mode="wait"` nunca completa la
  salida y el paso del wizard no llega a montarse. **La solución es abrir el
  panel y reintentar** — verificado el 4/8, funciona.
- **Redimensionar el panel no siempre recompone la superficie.** Después de un
  `resize_window` explícito, la página reporta el ancho nuevo pero el
  compositor sigue pintando el tamaño viejo. Volver al tamaño nativo del panel
  destraba.
- **`setAnswer` del wizard toma un solo argumento** (el valor), no `(id, valor)`:
  aplica siempre al paso actual.
- **`answers` no es un acumulador.** `setAnswer` poda las respuestas que dejaron
  de preguntarse. Si algo necesita sobrevivir a un cambio de rumbo, **no** se
  guarda en `answers` "por las dudas": se declara como paso en
  `PROCESS_STEP_MAP`, o vive fuera del wizard. Ver `lib/wizard/reachability.ts`.
- **El orden de `ALL_STEPS` no es cosmético.** Todo `dependsOn` apunta hacia
  atrás, y de eso depende que podar no invalide el `index` del paso actual. Un
  paso nuevo va después de aquellos de los que depende.
- **No diferir `wizard.next()` en un `setTimeout` que cierre sobre `wizard`.**
  Ese objeto queda con las respuestas del render anterior y la validación no ve
  la selección recién hecha. Usar una ref al último render.
- **El auto-avance es solo por teclado, a propósito.** Con el mouse, equivocarse
  de tarjeta te sacaba de la pregunta.
- **`git commit -m` con here-string falla** en el entorno del autor (guardia de
  sandbox). Usar `git commit -F <archivo>`.
- **No hay `npm run lint`.** Declaraba `eslint .` sin que `eslint` estuviera
  instalado. Verificar con `npm run check`.
- **`next-env.d.ts` no se versiona.** Next lo regenera y alterna solo según si
  lo último que corrió fue `dev` o `build`. Está en `.gitignore`.
- **Una carpeta de ruta que empieza con `_` no existe para el App Router**: es
  carpeta privada. Una página temporal de verificación tiene que llamarse
  `app/verificar/`, no `app/_verificar/`, o da 404 sin explicar por qué.
- **`next dev` puede quedar bloqueado por un candado de un proceso muerto**
  ("Another next dev server is already running" con un PID que ya no existe).
  Levantarlo en otro puerto (`npx next dev -p 3007`) destraba y sirve igual.

---

## Cómo verificar un cambio

```bash
npm run check    # tipos + las 11 validaciones. Es lo que corre CI.
npm run build    # el export estatico, que es lo que se publica
```
