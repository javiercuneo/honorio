# Estado del proyecto

Documento de continuidad entre sesiones. **Leer antes de empezar a trabajar.**
Se actualiza en el mismo commit que el trabajo, para que nunca mienta.

Última actualización: 2026-08-05

> Honorio salió de
> [herramientas-judiciales](https://github.com/javiercuneo/herramientas-judiciales),
> donde convivía con las calculadoras de plazos y el asistente clásico. La
> historia de `honorio/` viajó completa con `git subtree split`, así que
> `git log` de antes de la mudanza sigue siendo válido. Lo que quedó allá:
> las calculadoras, el asistente clásico y la documentación de dominio.

---

## Dónde estamos

Versión **2.1.1**. El rediseño visual está cerrado y el bug del flujo hacia
atrás de la entrevista —que arrastraba respuestas de un proceso a otro— quedó
resuelto. Las 11 validaciones de `lib/legal/__tests__` están en verde y corren
solas en CI.

Pantallas terminadas sobre el mismo sistema visual: **dashboard**, **wizard**,
**portada**, **intro** y **mínimos**. Falta pulido de mensajes.

El 5/8 se cerraron los tres pendientes inmediatos —**autoría**, **informe
imprimible** y **vuelta al repositorio**— y se sacó la UMA del navegador del
visitante. Ver [Lo del 5/8](#lo-del-58-la-uma-la-firma-y-el-informe).

---

## Lo del 5/8: la UMA, la firma y el informe

### El campo numérico leía mal lo que se pegaba

Lo reportó Javier con el caso: pegar `66316779.77` cargaba `$6.631.677.977`.
El parser hacía `replace(/\./g,'')` a ciegas, suponiendo formato es-AR, así
que un punto decimal multiplicaba por cien. Un separador de miles inglés
(`66,316,779.77`) daba `NaN` y el campo volvía al valor anterior. **Los dos
en silencio**, y el número que salía se veía perfectamente normal.

La regla nueva, única y escrita en `numeric-field.tsx`: **el último separador
con una o dos cifras detrás es el decimal; cualquier otro separa miles.**
Entran las dos convenciones. Lo único que no cubre es un decimal de tres
cifras (`1,234` por 1 con 234 milésimas), que no existe en pesos y que
admitirlo obligaría a leer `66.316.779` como 66 mil.

**El script que lee la planilla usa la misma función**, copiada a mano porque
es `.mjs` y no puede importar TS. Si una cambia, la otra también: mostrar un
número y calcular con otro es el peor resultado posible acá.

### Y no se podía corregir sin un clic al vacío

El segundo bug del mismo campo, y el peor: el valor se confirmaba en `blur` y
en `Enter`, nunca al escribir. Pegar un número y apretar «Calcular»
**calculaba con el anterior** — el botón corría antes de que el campo se
sincronizara. Había que hacer clic en cualquier otro lado primero.

Ahora se confirma en cada tecla y en cada pegado. Mientras el campo tiene el
foco manda lo que se escribió (reformatear ahí mueve el cursor); al salir, la
cifra se normaliza, y **esa normalización es la confirmación visual de cómo
se leyó lo pegado**.

> **Invariante:** el valor que se ve y el valor que entra al motor no se
> pueden separar. Si algún día se agrega otro campo de entrada, se confirma
> en `onChange`, no en `onBlur`.

### La UMA sale del repositorio, no de Google

La planilla la lee el build, no el visitante. `scripts/actualizar-uma.mjs` la
baja, la compara con `data/uma.json` y agrega una entrada si cambió; un cron
mensual (`.github/workflows/uma.yml`) lo corre solo y el push dispara el
deploy.

**La planilla sigue siendo la superficie de edición** y eso era el requisito:
Javier la actualiza todos los días para su trabajo, y cualquier alternativa
que le pidiera un segundo acto de actualización se iba a pudrir. Lo que
cambió es *cuándo* se lee.

Los cuatro problemas que resolvió, porque conviene no rediscutirlos:

1. **La afirmación de privacidad dependía de Google.** La app declara que
   nada de lo que se escribe sale del navegador, pero cada visitante le
   mandaba su IP a `docs.google.com`. Es el mismo razonamiento con el que se
   sacó `@vercel/analytics` el 4/8.
2. **El fallback era una mina.** Si el pedido fallaba, el motor seguía con
   `92482` escrito a mano y avisaba por `console.warn`.
3. **El número no tenía procedencia.** Ahora llega con su norma, y el paso de
   la UMA la muestra debajo del campo.
4. **No era reproducible.** La lista histórica deja abierto calcular con la
   UMA vigente a una fecha anterior sin rehacer nada.

**El formato de la planilla es `clave,valor` por fila** y el script la lee
como diccionario: agregar una fila o cambiarlas de orden no puede romper el
número. Hoy trae `UMA`, `UHOM` (de otra calculadora, se ignora) y `Acordada`.

**El hipervínculo de una celda no viaja.** Un CSV publicado es texto plano: la
frase de `Acordada` llega sin su enlace. Se comprobó. Por eso la URL va en una
**fila propia** (`URL`), que un AppScript de la planilla escribe; el script la
prefiere sobre cualquier URL suelta dentro de la frase.

**El script completa la procedencia aunque el valor no cambie.** La celda de
la URL se agregó cuando el valor ya estaba cargado: sin esto habría entrado
recién dentro de varios meses, cuando la UMA se moviera. Actualiza `fuente` y
`url` de la última entrada y **nunca el valor** — completar el registro no es
reescribir historia; cambiar un número que ya se usó para calcular, sí.

**No se guarda desde cuándo rige.** Decisión de Javier del 5/8: el dato no
está en su planilla original y levantarlo le agrega fricción diaria. Se
aceptó el costo —el informe cita la norma, no su vigencia— porque la norma se
identifica sola y el PDF la trae. Si algún día se quiere calcular con la UMA
vigente a una fecha anterior, ese es el dato que falta.

`public/legacy/core.js` **conserva su `cargarUMA()` y no se toca**: es copia
del asistente clásico, que se mantiene en el otro repositorio y todavía la
usa. Parchear la copia la haría divergir de su fuente. Simplemente no se la
llama: `adapters.setUMA()` pisa `window.valorUMA` después de cargar.

### Autoría e informe: eran un solo trabajo

Las dos preguntas eran la misma —*¿quién firma esto y contra qué versión se
hizo?*— y por eso resolver «autoría» sola habría terminado en un nombre en un
rincón sin función.

`components/dashboard/Firma.tsx` va al pie del dashboard y se imprime con el
informe. Lleva autor, versión del motor, la UMA con su norma, la fecha del
cálculo, el contacto, el código y la licencia. Decisión de Javier: **sin
matrícula** —es abogado no matriculado, trabaja en el Poder Judicial— y por
eso el rol dice «autor de Honorio», que es lo exacto.

La fecha se resuelve después del montaje a propósito: el sitio es un export
estático y en el HTML sería la fecha del build, no la del cálculo.

**El informe es CSS de impresión, no PDF armado.** Se descartó la librería:
sería una segunda maqueta que se desvía de la primera sin que nadie se entere
hasta que alguien imprime algo mal. El costo aceptado es que el navegador
agrega su encabezado y que los saltos de página hay que cuidarlos a mano
(`break-inside: avoid` en `section` y en `[data-ledger-row]`).

**Lo que no era obvio del interruptor de fundamentos:** viven en `<details>`,
y un `<details>` cerrado no imprime su contenido. Sin hacer nada, el informe
habría salido con los fundamentos que el lector hubiera abierto al leer —o
sea, cualquier cosa— y el interruptor habría sido decorativo. Se abren o se
cierran todos en `beforeprint` y se restaura el estado exacto en
`afterprint`. Va enganchado al evento y no al botón porque `Ctrl+P` tiene que
dar el mismo informe.

### Menos ruido en la cadena de cálculo

Pedido de Javier con el caso: sucesión, único letrado, sin ninguna reducción
de base. El bloque decía «Ninguna regla reduce la base» y debajo imprimía un
total con el mismo número que el usuario acababa de ingresar; el bloque de
honorario repetía por tercera vez la cifra que ya estaban la fila de la
escala y el número grande de arriba.

Se extendió a los otros dos ejes **el criterio que la escala ya usaba**: si no
hubo reducción, no se imprime el total. Los tres ejes siguen apareciendo —se
ve que se consideraron— pero ninguna cifra se repite sin agregar algo.

### Lo que se descartó, y por qué

- **Un honorario promedio** entre mínimo y máximo. No tiene estatus
  normativo: el punto medio no lo señala nada de la 27.423, sería la única
  cifra en pantalla sin un artículo al lado, y por su forma («el justo
  medio») se citaría como «lo que corresponde». Va en contra de la misma
  tesis que sostiene el contrafáctico.
- **Un scraper de la Corte.** Acordadas en PDF sobre un sitio que cambia: un
  pasivo permanente que además falla en silencio.

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

**Los cuatro se cerraron el 5/8**: informe imprimible, autoría visible, vuelta
al repositorio y enlace a la documentación de dominio.

**Dónde quedó el enlace a la documentación, y por qué.** En la **firma** del
dashboard y en la **información adicional** de la intro. Son dos lectores
distintos y ninguno está en la portada:

- Quien busca los ocho documentos de dominio casi siempre **ya tiene un
  número y no está de acuerdo con él**. Entra por el resultado, no por la
  puerta: de ahí la firma, que además se imprime con el informe.
- Quien está leyendo el alcance y los límites antes de empezar ya está en la
  información adicional, junto a los enlaces a infoleg y al precedente.
- **En la portada no.** Su único trabajo es que se apriete «Comenzar»;
  ofrecer ocho documentos ahí compite con esa decisión.

Lo único que sigue abierto de esa tanda es la **fecha de vigencia de la UMA**
(ver más arriba: se decidió no levantarla).

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
- **La tecla Enter del panel del navegador llega con `key` vacía.** Un
  `computer key Return` desde la automatización dispara un `keydown` con
  `key: ""`, así que ningún manejador que mire `e.key === 'Enter'` reacciona.
  **No es un bug de la app**: costó media hora darlo por roto cuando andaba.
  Para verificar atajos de teclado, despachar el evento a mano
  (`new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })`) y leer el
  DOM **después de un tick**, no en la misma expresión: React todavía no
  re-renderizó y parece que no pasó nada.
- **El valor de un `<input>` no aparece en `get_page_text`.** Es `value`, no
  `innerText`. Un campo que se ve vacío en el texto de la página puede estar
  perfectamente lleno; hay que leerlo por JS.
- **`explanation.expanded` es texto plano y se renderiza como tal.** Si un
  paso necesita mandar a un sitio, va en `explanation.enlace`, no incrustado
  como HTML en la frase. Interpretar HTML de ese schema abriría una puerta
  que no hace falta.
- **Las acciones de CI se fijan por major (`@v7`) y el runner corre Node 24.**
  Estaban en `@v4` con Node 20 y GitHub ya avisaba que las forzaba a 24. Al
  tocar una workflow, tocar las tres: quedar desparejas es cómo vuelve el
  aviso.
- **Nunca escribir `92482` ni ningún otro valor de UMA en el código.** El
  único lugar es `data/uma.json`, y `UMA_VIGENTE` es la única forma de
  leerlo. Un valor por defecto escrito a mano es un número equivocado
  esperando el día que algo falle.

---

## Cómo verificar un cambio

```bash
npm run check    # tipos + las 11 validaciones. Es lo que corre CI.
npm run build    # el export estatico, que es lo que se publica
npm run uma      # trae el valor de la UMA de la planilla, si cambio
```
