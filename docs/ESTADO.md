# Estado del proyecto

Documento de continuidad entre sesiones. **Leer antes de empezar a trabajar.**
Se actualiza en el mismo commit que el trabajo, para que nunca mienta.

Última actualización: 2026-08-12

> Honorio salió de
> [herramientas-judiciales](https://github.com/javiercuneo/herramientas-judiciales),
> donde convivía con las calculadoras de plazos y el asistente clásico. La
> historia de `honorio/` viajó completa con `git subtree split`, así que
> `git log` de antes de la mudanza sigue siendo válido. Lo que quedó allá:
> las calculadoras, el asistente clásico y la documentación de dominio.

---

## Dónde estamos

Versión **3.1.0**. El rediseño visual está cerrado y el bug del flujo hacia
atrás de la entrevista —que arrastraba respuestas de un proceso a otro— quedó
resuelto. Las 17 validaciones de `lib/legal/__tests__` están en verde y corren
solas en CI.

**El 12/8 arrancó el trabajo de adopción y la app dejó de ser solo una
pantalla:** un cálculo se puede compartir por enlace, citar y reportar como
mal. Ver [Compartir un cálculo](#compartir-un-calculo--el-128). El plan de
adopción está fuera del repositorio, en `C:\IA\notas\adopcion.md`.

Pantallas terminadas sobre el mismo sistema visual: **dashboard**, **wizard**,
**portada**, **intro** y **mínimos**. Falta pulido de mensajes.

**El cálculo directo está terminado (7/8).** Motor, validación y pantalla. Ver
[El cálculo directo](#el-calculo-directo--empezado-el-78).

**Mediación está terminada (8/8).** El honorario del mediador con su escala en
UHOM, el UHOM versionado, la validación 16 y la sección del dashboard. Ver
[Mediación](#mediacion--empezado-el-88).

**La regulación en prosa arrancó el 10/8: está el motor, no la pantalla.**
`lib/legal/regulacion-prosa.ts` y la validación 17. Ver
[La regulación en prosa](#la-regulacion-en-prosa--empezada-el-108).

El 5/8 se cerraron los tres pendientes inmediatos —**autoría**, **informe
imprimible** y **vuelta al repositorio**— y se sacó la UMA del navegador del
visitante. Ver [Lo del 5/8](#lo-del-58-la-uma-la-firma-y-el-informe).

**El sitio de herramientas ya tiene dominio propio.** `javiercuneo.com.ar`
quedó activo el 5/8 y las tres URL absolutas de `lib/enlaces.ts` apuntan ahí.
Fue exactamente el barrido para el que ese archivo se centralizó: una lectura
y listo. Y a diferencia del renombre del 4/8, la URL vieja **no quedó rota**:
GitHub redirige `javiercuneo.github.io/herramientas-judiciales/…` con 301 al
dominio, conservando la ruta.

**El 6/8 se corrigió la medida cautelar**, que decía al revés lo que hacía. Ver
abajo. Ningún número se movió.

---

## El cálculo directo — empezado el 7/8

Un modo sin entrevista: entra la base y sale la escala del art. 21 desnuda, con
los tres roles, sus etapas y los auxiliares. El plan entero está en
[`PLAN_CALCULO_DIRECTO.md`](https://github.com/javiercuneo/herramientas-judiciales/blob/main/docs/PLAN_CALCULO_DIRECTO.md),
en el otro repositorio.

**Hecho:** `lib/legal/calculo-directo.ts`, su validación —la número 15— y
`components/interview/calculo-directo-view.tsx`. Se prende con `showDirecto` en
`interview-experience.tsx`, con entrada en la barra y en la intro, siguiendo el
patrón de `minimos-view.tsx`. El 8/8 se le agregó el bloque del mediador, entre
los auxiliares y la segunda instancia; ver [Mediación](#mediacion--empezado-el-88).

**No espera al motor legacy**, a diferencia de la pantalla de mínimos: toda su
aritmética es TypeScript propio y no toca `public/legacy/`.

**Verificado en el navegador** con la misma base de la hoja ($21.368.714,99):
209,34 UMA, 5ª escala, patrocinante 41,90–44,87, apoderado 58,66–62,82,
auxiliares 10,47–20,93 y punto medio 15,70. Cambiando a «1 etapa» da 13,97–14,96
y con la fracción al 25 %, 3,49–3,74 —el «1/4 etapa» de la hoja—. Sin errores de
consola.

**Lo que gobierna el módulo, y conviene no deshacerlo:** «sin reducciones» no es
un caso, es la ausencia de caso. **No arma un `WizardState` con respuestas por
defecto para llamar a `buildGeneral()`.** Sería más corto y estaría mal: cada
respuesta por defecto es una afirmación jurídica —«sentencia admitida» sostiene
que la demanda prosperó— y el día que se agregue una regla que dependa de una de
ellas, este modo empezaría a aplicarla en silencio. Compone las funciones puras
de `calculate.ts` y no tiene aritmética propia.

**Por eso no puede divergir de la entrevista, y hay un control que lo prueba.**
`calculoDirecto.validation.ts` corre los dos caminos —el modo directo y un
conocimiento con sentencia admitida y apertura a prueba, que no dispara ninguna
de las nueve reglas de `resolveReglas()`— y compara rol por rol. Son 171
afirmaciones. **Se comprobó que el control muerde**: mutando el patrocinante un
0,1 % fallan los cinco casos cruzados.

Además ancla contra la hoja de cálculo que se usaba antes —base $21.368.714,99,
UMA $102.076—, cuyos números **coinciden con el motor hasta el tercer decimal**.
Ese es el único dato de la validación que no sale del motor, así que es el que
avisa si el motor se mueve.

**Dos cosas que la hoja enseñó y quedaron en el módulo:**

- **Cuenta etapas, no fracciones.** `EtapasRol` es `tres`, `dos`, `una` y no
  «completo / 2/3 / 1/3». Es el mismo número; la formulación es la del art. 29,
  que divide el proceso en etapas y cuenta cuántas se trabajaron.
- **`fraccionDeRango()` no es el reparto entre dos profesionales.** El del
  dashboard parte un importe en dos porciones que suman 100 %. Esto toma una
  sola porción —un profesional se lleva el 30 % de una etapa porque hizo el 30 %
  del trabajo de esa etapa— y el resto no es de nadie en particular. **Dan el
  mismo número y significan distinto**, que es la clase de error que no mueve una
  cifra y deja un rótulo mintiendo.

**La base no se redondea, y hay un test que lo cuida.**
`calculadoras/honorarios.html` redondeaba la base en UMA cerca de los bordes de
tramo **y calculaba con el redondeo**; por eso se dio de baja. La validación
comprueba que 15,4 UMA no se trate como 15 en los seis cortes.

**Queda decidido para la pantalla, y sale de cómo se usa la hoja:** la unidad
principal es la **UMA**, con el peso al lado en menor jerarquía —«regulo en
UMA»—. Eso invierte lo que hace el dashboard, que lidera con pesos. Es
deliberado: son dos públicos distintos. Si alguna vez se unifica, la discusión
es del plan de regulación en prosa, no de acá.

**El 7/8 se hizo entero el [`PLAN_COBERTURA_LEY.md`][plan]** —el plan vive en el
repositorio de herramientas— en dos tandas.

**Primero, 2.2.0, sin mover un número:** volvió el hint de la base (punto 1),
quedó dicho el litisconsorcio (punto 6), dejaron de ofrecerse las etapas que no
pudieron existir (punto 3a), se corrigió la atribución del 2 %-20 % del
incidente y entró la jurisprudencia.

**Después, 3.0.0, que sí mueve un número y por eso es MAYOR:** las actuaciones
posteriores a la ejecución (punto 2), los mínimos de los auxiliares mostrados
al lado del 5 %-10 % (punto 8, resuelto distinto de como estaba planteado) y la
modificación de alimentos por la escala de los incidentes (punto 4), que es el
cambio que mueve el número. El caso concreto está en el
[`CHANGELOG`](../CHANGELOG.md).

Del plan quedan solo cosas anotadas sin fecha.

[plan]: https://github.com/javiercuneo/herramientas-judiciales/blob/main/docs/PLAN_COBERTURA_LEY.md

---

## Mediación — empezado el 8/8

El honorario básico del mediador, al lado del de los auxiliares. El plan
completo, con las normas leídas y las decisiones con su motivo, está en
[`PLAN_MEDIACION.md`](https://github.com/javiercuneo/herramientas-judiciales/blob/main/docs/PLAN_MEDIACION.md),
en el otro repositorio.

**Hecho, motor y pantalla.** `lib/legal/mediacion.ts`, `lib/legal/uhom.ts`,
`data/uhom.json`, la extensión de `scripts/actualizar-uma.mjs`, la validación
número 16 y `components/dashboard/MediacionSection.tsx`, colgada del `Dashboard`
justo debajo de los auxiliares.

**Está en las dos pantallas que tienen una base**, y en las dos pegado a los
auxiliares por el mismo motivo: los dos salen de la base y no del honorario del
abogado.

- En el **dashboard**, con la jurisprudencia de la base única.
- En el **cálculo directo**, en el idioma de esa pantalla —`LedgerRow`, la
  unidad primero y el peso al lado, solo que la unidad es el UHOM— y **sin la
  jurisprudencia**. No es un olvido: ahí no se aplica ninguna reducción, así que
  la discusión sobre si las de los arts. 22 y 40 alcanzan al mediador no se
  plantea.

La diferencia entre las dos se ve con la misma cifra: base $8.000.000 da
**$259.200** en el cálculo directo —617,28 UHOM, ítem F— y **$207.360** en el
dashboard si la demanda se desestimó, porque ahí el art. 22 baja la base a
$5.600.000 y la hace caer al ítem E. Es exactamente lo que la decisión de la
base única produce, y conviene tenerlo a mano porque parece un error y no lo es.

**Verificado en el navegador** con el caso que el plan usa de ejemplo: juicio de
conocimiento, sentencia rechazada, sumas de dinero, base $8.000.000. La base
baja a $5.600.000 por el art. 22, que son **432,10 UHOM** con el UHOM de agosto
—$12.960—, cae en el **ítem E** y da **$207.360**, o sea 16 UHOM. La tarjeta
muestra el valor del UHOM con su procedencia al lado. Sin errores de consola.

**La sección no causa desbordes**: se midió en 375 px y el ancho del documento
es el mismo con ella y sin ella. El desborde que sí hay en móvil es de la barra
de acciones del resultado y es anterior a esto.

### La escala, y por qué la cita no lleva número de artículo

Sale del **ANEXO III del Decreto 1467/2011, sustituido por el Decreto
2536/2011**. El Decreto 696/2025 reemplazó el Anexo I entero —el régimen pasó
del art. 28 al art. 31— pero no tocó el Anexo III: lo cita seis veces como
derecho vigente.

**Las tres fuentes no coinciden en la numeración del artículo** —«2°» según el
696/2025 y el propio Anexo, «4° y 5°» según el art. 28 inc. b) del 2536/2011,
«4°» según la tabla oficial de 2026—. Los números del honorario son idénticos
en las tres, así que no afecta ningún cálculo: afecta la cita, y una cita que
no se pudo resolver no se escribe. Falta el texto consolidado del Anexo III.

### La decisión que gobierna el módulo

**La base del mediador es la del expediente**, con las reducciones de los
arts. 22 y 40 de la Ley 27.423 ya aplicadas. Es la misma cifra que reciben la
escala del art. 21 y los auxiliares.

Es una interpretación, y está fundada. El fallo que resuelve el planteo exacto
es **CNCiv., Sala K, expte. 2896/2021, 22/6/2026**: el apelante era un perito
que sostenía que la reducción del 30 % del art. 22 no lo alcanzaba **por ser
auxiliar de la Justicia y no letrado**, y la Sala lo rechazó —«el juicio es una
unidad jurídica […] no pueden existir dos bases regulatorias diferentes, según
sea letrado o auxiliar de la justicia», y «la ley arancelaria no contempla
excepción ni distinción alguna» según el profesional—. La misma Sala lo aplicó a
una mediadora en el expte. 8451/2022, del 9/5/2025. La doctrina viene del
plenario **`Murguía`** (CNCiv. en pleno, 2/10/2001).

**El decreto define una base propia y en cuatro supuestos da distinto** —demanda
desestimada, desalojo, alimentos y reconvención—. Está en el plan, con la tabla.
El motivo de apartarse es el art. 1°, segundo párrafo, de la Ley 27.423: el
arancel se aplica supletoriamente a todos los auxiliares, y la alternativa
produce tantas bases como profesionales intervengan.

**Consecuencia práctica: cero preguntas nuevas en la entrevista.** El módulo es
una función pura de siete ramas sobre una cifra que el motor ya tiene.

### Qué prosa va en el dashboard, y qué prosa no

La primera versión de la sección traía tres desplegables largos: la escala
entera, todo lo que el número no incluye y la discusión sobre el número de
artículo. **Era demasiado**, y el informe fundado salía de diez hojas. La regla
que quedó, y que vale para las secciones que vengan:

> En el dashboard va **lo que solo se puede decir al lado de este número**. Lo
> que describe la herramienta es documentación, y va a `documentacion.html` del
> sitio de herramientas.

Quedaron dos cosas: que la base es una interpretación —con sus fallos, porque es
lo único que mueve la cifra en pantalla— y por qué el 2 % dejó de ser 2 %, solo
cuando el tope efectivamente mordió.

**Un dato para no sobrecorregir:** los desplegables son `<details>` y un
`<details>` cerrado no imprime su contenido; `imprimir.tsx` los abre según el
interruptor de fundamentos. El informe desnudo nunca creció.

### Tres cosas del módulo que conviene no deshacer

- **`calcularMediacion()` recibe el `ValorUHOM` entero, no el número.**
  `calcularDirecto()` recibe la UMA suelta; acá no, a propósito. Con dos
  `number` nada impediría pasarle la UMA: son $102.076 donde van $12.960, un
  factor de ocho sin ningún error visible. El campo `unidad` del tipo existe
  para eso y para nada más.
- **El tope de 120 UHOM es del ítem G**, no de la escala. Da el mismo número
  siempre —A a F topean en 20 UHOM— así que ninguna validación numérica lo
  cazaría: es un error de rótulo, que es la clase que ya costó caro dos veces.
  La calculadora vieja lo dice mal.
- **Los ítems H, I y el familiar quedan afuera por construcción**, no por
  decisión: `baseValor` es un `number` y `ObjetoBase` no tiene ninguna opción
  sin monto, así que no hay recorrido que llegue.

### El UHOM no se comporta como la UMA

Se mueve **todos los meses** —junio 2026 $12.450, julio $12.720, agosto
$12.960— y es derivado: **UR-SINEP × 12, redondeado a la decena próxima
superior**, comprobado en los tres meses. De ahí que el script tenga umbral
propio (15 % y no 60 %) y un control de forma que la UMA no puede tener: el
valor siempre termina en cero.

**Falta la procedencia.** La planilla trae el número del UHOM pero no su norma
—la fila `Acordada` describe la UMA—. Mientras no existan las filas
`UHOM_FUENTE` y `UHOM_URL`, cada valor nuevo entra sin cita y el script avisa.
El de agosto está cargado a mano con la que trae la tabla oficial.

> **Un bug que se encontró corriendo el script de verdad, y por eso conviene
> correrlo.** La primera versión completaba la procedencia con
> `previo.fuente = fuente` a secas, y en la primera pasada real le **borró al
> UHOM la norma cargada a mano**, porque la planilla no la trae y `fuente`
> llegaba en `null`. Ahora la procedencia **solo se completa, nunca se borra**:
> que la planilla no diga nada no es que diga que no hay norma. El mismo arreglo
> protege a la UMA el día que se vacíe la celda `Acordada`.

---

## La regulación en prosa — empezada el 10/8

Que la app devuelva el texto de la regulación para copiar y pegar. El plan
entero, con la lectura de los trece modelos de resolución, está en
[`PLAN_REGULACION_EN_PROSA.md`](https://github.com/javiercuneo/herramientas-judiciales/blob/main/docs/PLAN_REGULACION_EN_PROSA.md),
en el otro repositorio.

**Hecho:** `lib/legal/regulacion-prosa.ts`, `regulacionProsa.validation.ts` —la
número 17— y `components/dashboard/ProsaSection.tsx`, que es la última sección
del dashboard.

**Va en el dashboard y no en una pantalla propia**, a diferencia del cálculo
directo y de los mínimos: se alimenta del mismo `CalculoResultado`. Es la tercera
forma de la misma salida —el número, el informe imprimible y el texto—.

**Que la validación entre con el módulo y no después no es prolijidad.** Esta
feature produce prosa con forma de resolución judicial, y las dieciséis
validaciones anteriores comparan números: **ninguna mira prosa.** El diagnóstico
ya estaba pago —«el mismo proceso produce código que funciona y prosa
confiadamente falsa, porque uno tiene realimentación y la otra no»— así que la
prosa sin control era el problema que la feature creaba, no una deuda a saldar
más tarde.

### La sección pide profesionales, y esa es la razón por la que existe

**Honorio no sabe cuántos profesionales intervinieron ni en qué carácter**, y la
entrevista no lo pregunta porque el número no depende de eso: la escala del
art. 21 da una banda por rol, y esa banda es la misma haya un letrado o cuatro.
Un texto de regulación, en cambio, lleva una línea por profesional. La sección
pide eso y nada más.

**Los atajos escriben un rótulo, no eligen una escala.** Un perito médico, uno
calígrafo y uno ingeniero cobran el mismo 5 %-10 % del art. 21; el atajo ahorra
tipeo y por eso el rótulo queda editable. Si el tipo cambiara la cuenta, no
podría ser un campo de texto.

**El campo del punto arranca vacío** y la banda se ve al lado, con el importe en
pesos apareciendo recién cuando el punto es válido. Un punto fuera de la banda
deja el campo en rojo, vacía el texto y deshabilita el botón de copiar: los tres
a la vez, porque el texto no se redacta con un número que perfora la escala.

**Verificado en el navegador**, con `buildGeneral` sobre base $50.000.000: un
patrocinante en 96,77 UMA y un perito en 40,00 UMA salen redactados con
$9.877.894,52 y $4.083.040,00; con 500 UMA el texto desaparece y el aviso dice
«cae fuera de la banda de 95,18 a 96,77 UMA»; sin nombre queda `[PROFESIONAL]` en
el texto y «Falta: el nombre del letrado patrocinante» abajo, con el botón
apagado. El mediador da 3.858,02 UHOM, ítem G, 77,16 UHOM y $1.000.000, que es el
2 % de la base. Sin errores de consola.

> **Para llegar al dashboard hay que recorrer la entrevista, y con el panel del
> navegador cerrado el paso del wizard no llega a montarse** —la trampa de
> `AnimatePresence mode="wait"` que está más abajo—. La salida fue una página
> `app/verificar/` temporal que arma el resultado con `buildGeneral` y monta la
> sección sola. **Se borró después de verificar**, que es lo que la hace útil.

### Las correcciones del 10/8, después de que Javier lo usara

Todas salieron de leer el texto real, y dos eran errores de fondo:

- **El artículo se repetía.** El `concepto` de varias transformaciones ya termina
  en su artículo —`50% por ejecucion de sentencia (art.41)`— y el generador
  agregaba además el campo `articulo`. Salía «(art.41) (art. 41)». Ahora se
  limpia el paréntesis final del concepto y manda el campo, que es el
  normalizado.
- **Las reducciones del honorario no se escribían.** `etapa: 'honorarios'` es una
  de las tres del motor y no tenía sección: el −10 % del art. 41 aparecía solo
  como una alícuota efectiva más baja, **sin decir por qué**. El texto mostraba
  la consecuencia y se guardaba la causa. Ahora tiene sección propia.
- **La alícuota efectiva iba antes de la reducción que la causa.** Se leía
  «resultan de 8,50 % a 11,00 %» y recién después «Aplico 50 % por homologación».
  Invertido, y con «Hechas esas reducciones» adelante.
- **El exhorto y el incidente no redactaban**, porque salen por su propia rama del
  `Dashboard` y nunca llegaban a la sección. Ahora las tres ramas la tienen.
- **Y el incidente destapó algo peor.** Sus dos transformaciones —el 2 % y el
  20 %— son de etapa `honorarios`, así que caían bajo «Reducciones del honorario»
  y **no son reducciones**: son cómo se arma la banda. Tiene sección propia, que
  además dice de dónde sale el criterio.
- **Los atajos se derivan de las bandas** y ya no de una lista fija. La lista
  filtrada por banda existente dejaba el incidente con un solo chip —el del
  mediador— porque ningún atajo nombraba su banda. Ahora cada banda tiene su chip
  o no tiene ninguno.
- Menores: secciones numeradas `a) b) c)`, los artículos de cada sección en su
  encabezado, `letrado/a` y `perito/a`, chip de perito contador, el plazo sin
  «corridos» —era del juzgado— y `data-imprimir="no"`, porque el informe ya lleva
  los mismos números.

**Los artículos del encabezado salen de las `transformaciones` que el motor
emitió.** Si una sección no tiene ninguna, no lleva artículo: no se completa por
lo que «debería» corresponder. Por eso la base de una sucesión sale sin cita —el
motor no emite ninguna transformación de base ahí— y eso es correcto aunque se
lea incompleto.

### Los tres controles

1. **Ningún número inventado.** `verificarNumeros()` extrae los importes del
   texto y comprueba que cada uno esté en el `CalculoResultado` que lo originó.
   Barre seis casos que recorren las tres etapas de transformación, más la
   sucesión —que trae partidor— y la ejecución de sentencia —que trae actuaciones
   posteriores—, **regulando todas las bandas que cada resultado ofrece**. Una
   banda nueva del motor entra sola a este control.
2. **El texto congelado.** Para un resultado fijo, el texto tiene que ser
   idéntico carácter por carácter. Si falla no significa que algo esté mal:
   significa que la redacción cambió, y hay que leer el diff antes de actualizar
   la constante.
3. **La banda se respeta.** Un punto fuera de la banda **no se redacta**:
   devuelve error y texto vacío. Los bordes exactos sí son válidos.

**El control 1 muerde, y está probado que muerde:** un importe agregado a mano
se caza, y también un cero de más en un importe que sí existe.

### El error que encontró el propio control, y por qué vale escribirlo

La primera versión de `numerosDelTexto()` leía **todos** los enteros y salteaba
los menores a 2100, con la idea de que «eso es un artículo o un año». Falló en la
primera corrida con el mediador adentro: **`Decreto 2536` se leyó como si fuera
un importe inventado.**

Subir el umbral habría movido el problema en vez de resolverlo. La regla que
quedó es de formato y no de magnitud: **el lector solo lee números con dos
decimales**, que es como el generador escribe todo importe, toda cifra en UMA o
UHOM y todo porcentaje. Un número de artículo, uno de decreto y un año nunca los
llevan. Hay un control propio —el 8— que comprueba las dos mitades: que lea las
cifras y que **no** lea los identificadores.

### Y un control que parece trivial y no lo es: las tildes

El texto sale **con tildes**, y hay una validación que lo comprueba palabra por
palabra. No es una convención de estilo acá: **una resolución sin acentos no se
puede pegar en un expediente.**

Va como control porque es fácil de perder, y de hecho se perdió: los comentarios
de `lib/legal/` se escriben sin tildes —es la convención del código— y la primera
versión del generador arrastró esa costumbre **a las cadenas de salida**, que son
otra cosa. El texto completo salía «Regulacion», «alicuota», «Notifiquese». La
regla que queda: en este directorio los comentarios van sin tildes y **todo lo
que el usuario lee, con**.

### Lo que el generador no escribe, y está validado

Son decisiones y por eso se validan: si alguna vuelve a aparecer, tiene que ser a
propósito y con el control en rojo. El motivo de cada una está en el plan.

- **La narración del expediente** —quién intervino, qué hizo, a qué fojas—.
  **Y no va como hueco:** un hueco afirmaría que ese párrafo es parte de lo que
  Honorio produce. La prosa dice únicamente lo que el motor atrapa.
- **La ley aplicable por etapa.** Tres modelos aplican también la Ley 21.839; el
  motor calcula solo por la 27.423.
- **Notificación, elevación y apertura de cuenta en el BNA.** Son texto fijo, y
  por eso eran lo más barato de generar, pero son prácticas de un juzgado.

### Dos decisiones del módulo que conviene no deshacer

- **El punto dentro de la banda entra por parámetro y no tiene valor por
  defecto.** El motor devuelve rangos a propósito porque elegir adentro es el
  acto jurisdiccional. Un default en el medio de la banda sería una decisión
  jurisdiccional disfrazada de conveniencia.
- **`bandasDe()` deriva las bandas del resultado, no de una lista escrita a
  mano.** Si el resultado no trae `partidor`, no hay banda de partidor y no hay
  párrafo. Es la contracara de «un bloque por sección del dashboard»: agregar una
  regla al motor no se puede olvidar en la prosa.

---

## Compartir un cálculo — el 12/8

Primer trabajo que no sale de la herramienta sino del plan de adopción: el
objetivo de la sesión no era el motor, era que Honorio pueda llegarle a
alguien. El plan entero quedó **fuera del repositorio**, en
`C:\IA\notas\adopcion.md`, porque nombra personas y describe cómo llegar a
cada una; acá va solo lo que se programó.

**El caso viaja en el fragmento de la URL** (`lib/compartir.ts`). «Copiar
enlace» en la barra del dashboard devuelve una dirección que lo lleva entero
adentro y abre esa misma pantalla.

### Por qué en el fragmento y no en la query

Es la única decisión de diseño del módulo que no se puede deshacer sin romper
una promesa. El fragmento (`#`) **no se envía al servidor**: ningún request
lleva el caso, ni al host que sirve el sitio ni a nadie en el camino. Por eso
compartir un cálculo no contradice el «nada de lo que escribís sale del
navegador» que la app declara en la portada. En la query (`?`), la misma
función la rompería —el caso quedaría en los logs de quien sirva el sitio— y
nadie lo notaría al leer el código.

El formato lleva versión (`c1`). Si cambia la forma de codificar, el número
sube y los enlaces viejos dejan de abrir en vez de decodificarse mal: un enlace
que abre torcido es peor que uno que no abre.

### La UMA de un caso restaurado es la del enlace

`useWizard` lleva un `restauradoRef` que apaga el efecto que sincroniza la UMA
cuando termina de cargar el motor. Sin eso, el motor pisaría la UMA del enlace
con la vigente y **el mismo enlace daría un número distinto el día que cambie
la UMA** —exactamente lo que compartir un cálculo tiene que impedir—. Al
reiniciar vuelve la vigente: el valor del enlace muere con el enlace.

### Las respuestas de afuera entran por la misma puerta que las tipeadas

`decodificarCaso` descarta los ids que el schema no pregunta y los valores que
no son respuestas posibles; después `restore()` corre `podarInalcanzables`
igual que `setAnswer`. Un enlace con respuestas incoherentes queda en un caso
coherente, no en un número calculado sobre una combinación que la entrevista
nunca habría producido.

### La trampa que costó el rato: `hashchange`

Al probarlo en el navegador, el caso no aparecía. No era el código: **cambiar
solo el fragmento no recarga la página.** Es navegación dentro del mismo
documento, así que el efecto de montaje no vuelve a correr. Le pasa a
cualquiera que pegue un enlace compartido teniendo Honorio ya abierto, que es
un caso muy real —se comparte por WhatsApp entre gente que ya lo tenía en una
pestaña—. Se escucha `hashchange` además del montaje.

De ahí salió también la guarda nueva: al dashboard se llegaba siempre por la
entrevista, que ya había esperado al motor legacy. Un caso restaurado entra
directo, así que la espera hay que hacerla también ahí; sin ella el dashboard
decía «no se pudo generar el cálculo», que era mentira —solo faltaba esperar—.

### Cómo se verificó

El ida y vuelta del codificador se comprobó con trece casos contra los módulos
reales: caso completo, fragmento con `#` y sin, base64 roto, JSON que no es
objeto, fragmento cortado a la mitad, ids inventados, valores que no son
respuestas, y la poda de un caso incoherente. **No quedó como validación
permanente y es una deuda anotada a propósito:** `scripts/validate.mjs` corre
`lib/legal/__tests__/*.validation.ts` y meter ahí algo que no es el motor
diluiría lo que significa «las 17 validaciones del motor». Si el módulo crece,
merece su propio corredor.

En el navegador se restauró un enlace y el resultado coincidió con los valores
de referencia que ya estaban escritos acá para esa base ($21.368.714,99 →
209,34 UMA, 5ª escala, patrocinante 41,90–44,87). Sin errores de consola.

### La pasada de celular — el 13/8

El desborde del ledger quedó resuelto, y era más grande de lo que se veía.

**Las filas no envolvían.** `LedgerRow` y `Disclosure` eran `flex` sin
`flex-wrap`, con el valor y la etiqueta «por qué» en `shrink-0`. El valor no se
puede achicar —lleva `whitespace-nowrap` porque partir una cifra al medio es
peor que cualquier alternativa— y en un teléfono solo el valor mide más de la
mitad del ancho. Resultado: la fila empujaba a **toda la página** a un scroll
horizontal.

La solución que conviene no deshacer: `flex-wrap` más `justify-end`, y
`min-w-0` en el concepto. **`justify-end` no hace nada en la primera línea**
—el punteado tiene `flex-1` y se come el espacio libre— y alinea a la derecha
la segunda, que es donde cae el valor cuando no entra. Por eso en pantalla
grande no cambió un pixel.

**El selector de rol se asomaba fuera de la pantalla en 320 px.** Es el único
control del dashboard que mueve el número, así que no podía quedar medio
afuera justo en el teléfono más chico. Envuelve.

**La regulación redactada llega plegada.** Primitiva nueva,
`PlegadoEnCelular`: el título de la sección queda siempre a la vista y se
pliega el contenido. El criterio es de Javier y vale para lo que venga —nadie
va a redactar una regulación desde el teléfono, pero tiene que enterarse de que
la app la redacta—. **Se pliega el contenido, no la existencia.**

Lo que gobierna la primitiva: el estado inicial es cerrado y `md:block` lo pisa
en pantalla grande. Nada de `matchMedia` en un efecto, que abriría y cerraría
el bloque a la vista del lector y además discreparía con el prerender al
hidratar.

Medido con el mismo caso restaurado: **de 8,3 pantallas de scroll a 5,7**, cero
desborde en 375 px y en 320 px, y en escritorio el pliegue no existe aunque el
estado interno esté cerrado.

Lo que se arregló el 12/8 en la misma línea: la barra del dashboard medía
683 px de controles en 375 de pantalla.

**Lo que no se tocó, y es una decisión:** el tamaño de letra. Javier marcó que
«queda chico» en el teléfono, y es cierto, pero la escala tipográfica es del
sistema visual entero y cambiarla es una decisión suya, no un arreglo de
responsive.

### Las otras dos cosas de la misma tanda

- **La tarjeta del enlace** (Open Graph, en `app/layout.tsx`). Antes honorio.ar
  pegado en un WhatsApp era una URL pelada. La imagen se genera con
  `node scripts/og.mjs` y está commiteada: no corre en el build, para que
  publicar no dependa de que sharp pueda rasterizar en la máquina que publica.
- **«Cómo citar este cálculo»** y **«Este cálculo no cierra»**, al pie, junto a
  la firma. La cita es lo único de ese bloque que se imprime, porque en el
  papel el enlace es lo único que queda para volver. El reporte abre un correo
  con el caso ya adentro: reportar un error dejó de exigir que quien lo
  encontró sepa explicarlo.

### Lo que falta de la Fase 0 y no es código

- **La medición.** Decidido el 12/8 y prendido el 13/8: el dominio ya estaba en
  Cloudflare desde que se registró, así que fue pasar los registros a
  *Proxied*. SSL/TLS quedó en *Automatic*, que resuelve en Full (strict) porque
  GitHub Pages habla HTTPS; lo que **no** hay que poner nunca es *Flexible*, que
  con Pages da bucle de redirección. Falta el renglón honesto en el sitio.
- **El video de 90 segundos: descartado.** El permalink hace el mismo trabajo
  mejor y ya está hecho. Un enlace que abre un cálculo terminado demuestra en
  tres segundos más que noventa de pantalla grabada.

---

## Lo del 7/8, segunda tanda: los tres que mueven números

### Art. 41, última oración — actuaciones posteriores a la ejecución

Un bloque propio en el resultado, al **40 % de la escala del art. 21**, solo
para `ejecucion_sentencia`.

**Las dos formas de equivocarse acá, y cómo quedaron cerradas:**

- **Tomar el 40 % de la escala ya partida al medio.** El mismo art. 41 aplica
  la mitad de la escala a la ejecución, y las dos son fracciones de lo mismo:
  la ejecución al 50 %, las posteriores al 40 %. `actuacionesPosteriores.validation.ts`
  lo comprueba con una relación que lo hace evidente —las posteriores son 0,8
  del honorario de la ejecución— y **se probó que caza el error**: forzando la
  escala reducida, 13 afirmaciones fallan con exactamente la mitad.
- **Ponerlo como una cuarta tarjeta al lado del completo, el 2/3 y el 1/3.**
  Esa fila divide *una* regulación en fracciones del art. 29; el 40 % del
  art. 41 es *otra* regulación sobre la misma base, y pueden concurrir. Va
  donde ya están la segunda instancia y el partidor, que son eso mismo.

**Un criterio declarado:** no se le aplica el −10 % por no haber excepciones.
Esa quita se refiere al honorario de la ejecución —tener excepciones o no es un
hecho de la ejecución, no de lo que viene después— y la última oración regula
un tramo aparte remitiendo a la escala «del citado artículo», sin descuentos.
Está dicho en pantalla y en el código. Si la lectura correcta fuera la otra, el
cambio es multiplicar por `factorFinal` en el llamador.

### Los mínimos de los auxiliares se muestran, no se aplican

**El punto 8 del plan proponía comprobarlos contra el resultado y elevarlo.
Javier lo resolvió distinto y mejor.**

Aplicar el piso es una decisión, y no siempre la correcta: el art. 21, en su
último párrafo, extiende sus normas a los peritos **salvo lo dispuesto en el
art. 478 CPCCN**, que manda a los jueces adecuar los honorarios de los peritos
*«por debajo de sus topes mínimos inclusive»* a las regulaciones de los demás
profesionales, ponderando naturaleza, complejidad, calidad y extensión. O sea
que el piso se puede perforar, y automatizarlo sería decidir por el juez.

Así que la sección de auxiliares muestra **los dos números**: su 5 %-10 % y los
pisos del art. 58 (4 UMA) y del art. 61 bis (2 UMA), con una insignia cuando el
5 % queda por debajo. Es el criterio del repositorio aplicado a un caso nuevo:
los números no se ocultan nunca.

**El art. 60 queda afuera** y no por olvido: es expresamente de los procesos
**no** susceptibles de apreciación pecuniaria, donde no hay base ni escala al
lado de la cual mostrarlo.

**Los pisos se derivan de `MINIMOS_AUXILIARES_JUSTICIA`, no se reescriben.** Un
número de la ley copiado en dos lugares algún día discrepa consigo mismo. Eso
abre otro riesgo —si alguien renombra un grupo, la derivación devuelve una
lista más corta **y no falla nada**, la pantalla deja de mostrar un piso en
silencio—, y para eso existe `minimosAuxiliares.validation.ts`.

### Art. 39, segundo párrafo — la modificación de alimentos

**Es el cambio que mueve el número, y por eso la versión es MAYOR.** El caso
concreto, con las cifras de antes y después, está en el `CHANGELOG`.

Un sub-paso nuevo bajo `familia_alimentos` distingue los dos supuestos del
art. 39: la fijación de la cuota, que sigue por la escala del art. 21, y la
modificación —aumento, disminución, cesación o coparticipación—, que va por la
escala de los incidentes sobre una base que es **la diferencia** por dos años.

**No es un criterio interpretativo nuevo, y eso es lo que lo hace defendible.**
La escala de los incidentes es la que la app ya usaba: el 2 %-20 % del art. 33
de la Ley 21.839, porque el art. 47 de la 27.423 quedó observado. Es un solo
criterio declarado una vez y aplicado en los dos lugares donde la ley remite a
lo mismo, y `alimentosArt39.validation.ts` **comprueba que los dos números
coincidan**: si algún día divergen, tiene que ser a propósito.

**Cómo se implementó, para no romper el resto.** `calcularEscalaIncidentes()`
devuelve un `EscalaResult` con la misma forma que `calcularEscala()`, así que
todo lo que viene después —reducciones, roles, segunda instancia, auxiliares—
funciona sin saber cuál de las dos corrió. Lo único que cambia es que **no hay
escalera**: el rango es plano, no progresivo.

De ahí salió `EscalaAplicada.regimen`, que la presentación necesita: la tabla
de tramos y la barra del excedente son del art. 21 y no significan nada para un
rango plano. Cuando el régimen es `incidentes` se muestra en su lugar un «por
qué» que dice por qué la tabla no corresponde.

**Arrastra la cuenta de recorridos**, como el plan anticipaba: el conocimiento
pasa de 120 a 128 y el total de 160 a 168, así que los cruces del barrido pasan
de 25.600 a 28.224. Actualizado en el mismo commit en `01_PROCESOS.md`,
`05_DEPENDENCIAS.md`, el `README.md` y la landing.

**Un campo nuevo del wizard toca seis lugares**, y conviene tenerlos juntos
porque el typecheck solo agarra tres: `WizardState` en `types.ts`, el reset de
`adapters.ts`, el `MAPPING` y el `transformToLegacy` de `hooks/useWizard.ts`,
los mismos dos **duplicados** en `retroceso.validation.ts` —que los copia a
propósito, para validar el flujo real y no el que el hook diga— y
`PROCESS_STEP_MAP` más `ALL_STEPS` en el schema.

### Verificación

`npm run check` limpio, **14 validaciones**, y `npm run build` sin errores. En
el navegador, la modificación de alimentos con base $4.800.000 y UMA $102.076
muestra $96.000 a $960.000 con «2,0 % efectivo» y «20,0 % efectivo», que son
exactamente los números del `CHANGELOG`; la ejecución de sentencia con base
$50.000.000 muestra las actuaciones posteriores en $3.886.157,60, que es la
escala completa por 0,40 y también el honorario de la ejecución por 0,8.

---

## Lo del 7/8: el hint de la base

**No es una funcionalidad nueva: es una regresión que se saldó.** El asistente
clásico mostraba, arriba del campo de la base, un cuadro que decía **qué monto
ingresar** según lo contestado antes —quince leyendas distintas en
`asistente-honorarios-clasico/js/wizard.js`, `renderBase()`—. La migración se
llevó el campo y dejó el cuadro.

**Por qué importa más que su tamaño.** El error más caro de esta app no es la
escala sino la base: la escala la validan 830 afirmaciones en cada push, y la
base la pone una persona sin que nada la controle. Un cero de más ahí no lo
agarra ninguna validación, y el número sale igual de prolijo.

### Cómo quedó

`ayuda` y `explicacion` de un paso pueden ahora **derivarse de las respuestas**
—`(answers) => texto`—, que es el mismo mecanismo de las `condition`. El tipo
es `Derivable<T>` en `wizard-schema.ts`, con `ayudaDe()` y `explicacionDe()`
como única forma de leerlos: la presentación pide el texto para las respuestas
que tiene y no sabe si el schema lo traía fijo o lo derivó. Los demás pasos no
se tocaron y siguen con sus cadenas.

Las leyendas están en **`lib/wizard/indicacion-base.ts`**, aparte del schema
porque son unas 250 líneas de texto legal y adentro lo volvían ilegible. Son
**24 ramas** —doce objetos del juicio, las dos del desalojo, las cuatro
terminaciones del cobro de sumas y los seis tipos de proceso restantes— y cada
una reparte el contenido en los tres lugares que la app ya tiene: la
instrucción práctica en el `ayuda`, que se ve siempre; el criterio y las
reglas de detalle en el `expanded`; y el texto del artículo, verbatim, en el
`full`. De paso se escribieron **briefs reales**, que era un pendiente anotado
más abajo: ninguna de las 24 dice «Ver más».

### Lo que no se copió del clásico

**El texto viejo no se tomó como oráculo.** Cada cita se verificó contra
`docs/domain/00_LEY_27423.md` y cada afirmación sobre la app contra
`calculate.ts`. De ahí salieron cosas que el clásico no decía o decía a medias:

- **El aviso de «no descuentes la reducción» aparece solo cuando alguna quita
  de base rige de verdad.** `hayQuitaDeBase()` espeja las cuatro condiciones de
  `aplicarReduccionesBase()` —desalojo de vivienda, homologación de vivienda,
  demanda rechazada y caducidad por art. 22—. Repetirlo en las 24 ramas lo
  habría vuelto invisible justo donde importa. Comprobado que **no** sale en
  los dos casos parecidos: homologación «demás casos», y caducidad por art. 25,
  que reduce la escala y no la base.
- **En el desalojo laboral se dice que el 20 % del art. 40 no juega**, porque
  no hay contrato de locación. Verificado: `esViviendaProtegida` exige
  `desalojoVivienda === 'vivienda'`.
- **En alimentos se dijo qué supuesto calculaba la app y cuál no.** El segundo
  párrafo del art. 39 no estaba implementado y la pantalla pasó a decirlo en vez
  de dejar creer que sí. **Duró unas horas**: era el punto 4 del plan y se
  implementó el mismo día, más abajo. Queda como ejemplo de que decir «esto no
  lo hago» es barato y hace visible lo que falta.
- **En el incidente se dice de dónde sale el 2 %-20 %**: del art. 33 de la Ley
  21.839, porque el art. 47 de la 27.423 quedó observado. Es un criterio
  declarado, no una transcripción, y ahora está declarado donde el usuario lo
  lee.
- **En uso y habitación se dice que el tope del 100 % la app no lo verifica.**
  La base la ingresa el usuario, así que ese control es suyo.

### El litisconsorcio, que era el punto 6 y no había nada que programar

El art. 21 no pide una cuenta nueva: **dice cuál es la base**, y la base la
ingresa el usuario. Si hay litisconsorcio corresponde el interés del
litisconsorte de que se trate y no el total del pleito. Lo único que faltaba
era decirlo, así que es una línea del `ayuda` en las 18 ramas donde puede
haber litisconsorcio, más el párrafo del artículo en el `full`.

No va en la sucesión —el art. 35 tiene su propia regla— ni en la liquidación
del régimen patrimonial, donde el art. 45 ya manda tomar el patrimonio
adjudicado a la parte, que es la misma idea dicha para ese caso.

### Lo que cambió al leerlo Javier, el mismo día

Cuatro cosas, y las cuatro valen como método porque ninguna se ve leyendo el
código: hay que saber derecho.

- **El litisconsorcio salió del `ayuda` visible.** Estaba como una línea en las
  18 ramas donde puede haber litisconsorcio, y eso era doblemente malo: **es
  una regla general del art. 21 y no de un proceso**, así que puesta en el
  `ayuda` —que dice qué monto ingresar *en este caso*— o se repetía en todas o
  quedaba desparejo, y quedó desparejo: faltaba en la cautelar, la homologación
  y el incidente. Ahora va detrás del «por qué», uniforme, en todo proceso
  salvo el sucesorio.

  **Y no era inocuo, que es lo importante.** El caso de Javier: nulidad sobre
  dos inmuebles de dos actores distintos, un solo perito que tasa los dos. Si
  se ingresa el interés de un litisconsorte, el 5 %-10 % de los auxiliares
  —que el art. 21 calcula **sobre el monto del proceso**— sale corto en esa
  misma proporción. Un hint que manda ingresar la parte sin decir eso es media
  verdad, y una línea no alcanza para decirlo. Ahora está dicho, junto al otro
  reparo: que ese interés tiene que poder distinguirse.

  La sucesión queda afuera **por una razón mejor que la que estaba escrita**:
  no es que el art. 35 tenga su propia regla, es que el sucesorio tramita como
  jurisdicción voluntaria y para esos el mismo art. 21 manda considerar que hay
  una sola parte.
- **«La base de la ejecución se resuelve por el art. 22» era engañoso.** No
  siempre: si la condena fue a escriturar, la base sale del art. 46. **La regla
  verdadera es que la base de la ejecución es la de la sentencia que se
  ejecuta**, y el artículo que la determina es el que gobernó aquel proceso. Y
  esa identidad es además lo que explica la mitad de la escala del art. 41: con
  la misma base y la escala entera, ejecutar una sentencia se pagaría igual que
  todo el juicio que la produjo.
- **La cautelar decía «no el del juicio principal».** Puede coincidir exacta y
  precisamente con él. Ahora dice que no es necesariamente el mismo.
- **El ejecutivo ganó el anclaje procesal**: es propio del ejecutivo que la
  obligación sea exigible y de cantidad líquida o fácilmente liquidable —art.
  520 CPCCN—, así que el monto está en el título y el hueco del art. 34 pesa
  menos que en otros procesos.

### El 2 % al 20 % del incidente estaba en el lugar equivocado

Lo puse en el paso de la base y no es una regla de base: **es el análogo de la
escala del art. 21**. Se mudó a la pantalla del resultado, que es donde se
aplica.

Y ahí apareció algo peor, de la misma familia que la cita del art. 29 inc. e
de la cautelar: **`IncidenteResult` mostraba el texto del art. 29 inc. g
—que divide el incidente en dos etapas y no fija ninguna alícuota— debajo del
2 % y el 20 %, y ni siquiera decía de qué artículo era.** El encabezado de la
tarjeta remataba la impresión con `art. 29 inc. g` arriba de los porcentajes.
Ahora hay dos citas separadas, cada una con lo que de verdad funda, y el
encabezado va sin artículo.

También se corrigió el `articulo` de las dos transformaciones de
`buildIncidente()`, que decían `art. 29 inc. g`. Hoy no se muestran —para el
incidente el dashboard renderiza solo `IncidenteResult`— pero
`transformaciones` es el contrato del motor hacia afuera.

### La jurisprudencia tiene lugar propio

**`lib/legal/jurisprudencia.ts`**, nuevo. Decisión de Javier: cuando la app
interpreta, la interpretación va con los fallos que la sostienen. **Una
interpretación declarada con jurisprudencia se puede discutir; una sin nada
detrás solo se puede creer o no.**

El primero es el del 2 %-20 %: tres fallos de la CNCiv., dos con enlace a la
sentencia en el CIJ. **La sala del tercero no está en la fuente y no se
completó por analogía con el anterior**, aunque el orden de la cita lo sugiera:
una cita a medias es corregible, una inventada no se distingue de una cierta.
Está anotado en el propio archivo.

### Verificación

`npm run check` limpio: tipos y las 11 validaciones en verde, 830 afirmaciones.
**Ningún número se movió.** De `lib/legal/` solo cambió una cadena de texto
—el `articulo` del incidente—, que no interviene en ninguna cuenta.

Las 24 ramas se barrieron llamando a `ayudaBase()` y `explicacionBase()` con
las respuestas de cada una, en vez de recorrer la entrevista a mano: las dos
únicas que caen en el texto genérico son las dos inalcanzables —sin tipo de
proceso elegido, y el exhorto, que no tiene paso de base—.

En el navegador: el incidente con base $50.000.000 sigue dando $1.000.000 y
$10.000.000, y las dos citas nuevas abren con los tres fallos y sus enlaces.

---

## Lo del 7/8: las etapas que no pudieron existir

Punto 3a del plan. **El art. 29 divide el proceso en tres tercios**: la demanda
y su contestación (inc. a), las actuaciones de prueba (inc. b) y las demás
diligencias hasta la terminación (inc. c). El 2/3 es la suma de los dos
primeros, así que **incluye la prueba**.

La banda de honorarios ofrecía siempre las tres fracciones, incluso cuando la
entrevista ya había contestado que el proceso terminó **antes de la apertura a
prueba**. Ahí esa etapa no existió, y el 2/3 era un importe que no corresponde
a ninguna labor posible: un número que las propias respuestas desmienten.

Ahora, en ese caso, el 2/3 no se ofrece —ni como tarjeta ni como opción del
reparto entre profesionales— y en su lugar hay un «por qué» que explica cuál es
la etapa que falta.

**Cómo se detecta, y por qué así.** Por la transformación `escala-art25`, que
el motor emite exactamente cuando `aperturaPrueba === false`. No se
reimplementa la condición: se lee el factor que el motor ya emitió, que es la
regla de `cadena.ts` y de todo el dashboard.

**Lo que quedó sin decidir, y es una pregunta jurídica, no de código.** Si el
proceso terminó antes de la apertura a prueba, el «completo» tampoco es la suma
de tres etapas que ocurrieron. Se dejó como está por dos razones: el plan
apuntaba al 2/3, y el «completo» es la regulación del proceso **tal como
ocurrió** —el art. 25 ya le aplicó la mitad de la escala justamente por haber
terminado temprano—, mientras que las fracciones sirven para el profesional que
intervino en parte. Si la lectura correcta es otra, se cambia acá.

**Verificado en las dos direcciones**, con conocimiento, modos anormales y base
$50.000.000: antes de la prueba, la banda muestra solo el 1/3 y el reparto
ofrece «completo» y «1/3»; después de la prueba, vuelven las dos fracciones y
las tres opciones. Los importes de cada una son los de siempre.

---

## Lo del 6/8: la cautelar decía al revés lo que hacía

Lo encontró la reescritura de `01_PROCESOS.md` en el repositorio de
herramientas, que se hizo leyendo este motor en vez de leer el documento viejo.
Dos cosas, las dos de texto, **ninguna movía un número**.

### Las dos opciones de oposición tenían las descripciones cruzadas

En `CAUTELAR_OPOSICION` (`lib/wizard/wizard-schema.ts`), la opción **Con
oposición** decía «25 % de la escala del artículo 21» y **Sin oposición** decía
«50 %». El art. 37 dice exactamente lo contrario: la base es el 25 % de la
escala y **se eleva** al 50 % en caso de controversia u oposición.

**El motor calculaba bien todo este tiempo**: `aplicarFactorCautelar()` hace
`medidaOposicion ? 0.5 : 0.25`. O sea que el número que salía era el correcto y
el cartel que lo explicaba decía al revés. Peor que un número mal: el usuario
elegía la opción leyendo una consecuencia que no era la que iba a obtener.

**Ninguna validación lo agarraba, y no es una falla de las validaciones.** Las
once comparan números, y acá los números estaban bien. Un `description` de una
tarjeta no lo mira nadie más que el que lo lee en pantalla. **Los rótulos que
prometen un porcentaje son código legal aunque vivan en un string**, y la
manera de controlarlos es la que se usó: leer el schema y el motor uno contra
el otro.

Es la segunda vez que aparece algo así en dos días: el 5/8 fue
`fix(wizard): los tres rótulos de cada paso decían cosas distintas`.

### La cita del art. 29 inc. e

La transformación `escala-cautelar` se atribuía al **art. 29 inc. e**, en
`calculate.ts` y en el «por qué» de `components/dashboard/format.ts`. Ese
inciso, en la Ley 27.423, es el de los **procesos penales**. El artículo de la
cautelar es el **37**, que es además el que la propia pregunta cita en pantalla
y el que la tarjeta del tipo de proceso muestra como *hint*.

La cita venía del motor clásico, que resolvía la cautelar bajo la **Ley
21.839**, donde el art. 29 inc. e sí era el de las medidas cautelares. Se
arrastró al motor nuevo sin volver a mirarla.

**`render-legacy.ts` conserva la cita vieja a propósito.** Su contrato es
producir el HTML idéntico al del asistente clásico, y además escribe en un
contenedor con `display: none` que nadie ve. Cambiarla ahí rompería lo único
que ese archivo promete.

**Verificación:** las 11 validaciones en verde (830 afirmaciones), `npm run
check` limpio, y la corrida completa en el navegador —cautelar con oposición,
base $50.000.000— muestra la tarjeta con «50 %», la cadena con `ART. 37−50%` y
la escala pasando de $9.715.394 a $4.857.697, que es exactamente la mitad.

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

### Los tres rótulos de un paso del wizard

Cada paso tiene **tres** textos y cada uno tiene un trabajo distinto. Estaban
mezclados hasta el 5/8; lo notó Javier probando la entrevista.

| Campo | Qué es | Ejemplo |
|---|---|---|
| `eyebrow` | El **término técnico** corto, en monoespaciado, arriba de la pregunta. | `Clase de proceso` |
| `pregunta` | **Lo que se pregunta**, en forma de pregunta. | `¿Qué clase de proceso es?` |
| `resumenLabel` | Cómo se rotula **la respuesta** en el resumen lateral y en el informe. Registro llano. | `Tipo de proceso` |

**Que `eyebrow` y `resumenLabel` digan cosas distintas es a propósito** y hay que
sostenerlo: `Clase de proceso` es como lo llama el CPCCN —art. 319, y así se
titula el Capítulo I del Título I del Libro Segundo—, mientras que «tipo de
proceso» es lo que entiende cualquiera. El técnico va arriba, el llano en el
resumen. Decisión de Javier.

Lo que estaba mal y se corrigió:

- `sentenciaResultado` tenía `resumenLabel: 'Contingencias'`. No es el término
  técnico ni el llano de ese paso: es el nombre de un **grupo** de pasos, y
  quedaba como si «admitida» fuera una categoría distinta de la de su paso
  hermano. Ahora es `Resultado de la sentencia`.
- `aperturaPrueba` tenía `pregunta: 'Modos anormales'`, que **no es una pregunta
  sino la respuesta del paso anterior**. Ahora pregunta lo que necesita saber:
  si terminó antes o después de la apertura a prueba.
- Tres pasos usaban «Seleccione…» y «Especifique…», imperativos de *usted*,
  contra la convención rioplatense del repositorio.

**Regla para un paso nuevo:** si es una elección, la `pregunta` se escribe como
pregunta. Los dos pasos de entrada numérica —`demas` (UMA) y `base`— son la
excepción y llevan un sintagma, porque rotulan un campo y no preguntan nada.

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

Ninguno abierto. El del flujo hacia atrás quedó cubierto por
`retroceso.validation.ts`, que barre los 28.224 cruces en cada corrida. Los dos
de la cautelar se cerraron el 6/8.

### Lo que las once validaciones no cubren

Quedó a la vista el 6/8 y conviene tenerlo escrito: **las validaciones comparan
números, así que un texto que promete un porcentaje puede mentir con todas en
verde.** Pasó dos veces en dos días —los rótulos de los pasos el 5/8, las
descripciones de la cautelar el 6/8—.

No hace falta automatizarlo todavía, pero sí saber dónde mirar: los
`description` y `hint` de las `CardOption` de `wizard-schema.ts`, los `motivo`
de `format.ts` y los `explicacion.expanded` de cada paso. **Cada vez que uno de
esos strings nombra un porcentaje o un artículo, hay que leerlo contra
`resolveReglas()` y contra la ley**, porque nada más lo va a hacer.

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
  **conviene escribir briefs reales en el schema**. El paso `base` ya los
  tiene, uno por cada una de sus 24 ramas: quedan los demás.
- **Cuatro pasos siguen con el relleno de la plantilla en `explicacion`**, y no
  son todos iguales. `tipoProceso` y `objeto` traen `full: ['Complete los datos
  segun corresponda.']`, que es la cadena que `StepShell` reconoce como vacía:
  el `Disclosure` no se muestra y el daño es que esos dos pasos no tienen
  fundamento. **`desalojoVivienda` y `posesoriasTipo` son peores**: su `full`
  dice «Complete el tipo de desalojo para continuar», que no es la cadena
  reconocida, así que el `Disclosure` **sí** se abre y muestra esa frase en
  serif —la tipografía que en toda la app significa «esto es el texto de la
  ley»—. Cuesta poco y conviene arreglarlo.
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
- **El panel de respuestas salta directo a cualquier paso ya contestado**, y
  eso existía desde siempre sin que se viera: la lista no tenía ni cursor de
  mano ni `title`, así que parecía un resumen de solo lectura. Lo reportó
  Javier el 7/8 preguntando si hacía falta un botón para limpiar todo. Se le
  puso la señal, y además **«Reiniciar» en la barra durante la entrevista** —en
  la barra y no al lado de «Atrás», porque tira todas las respuestas y en el
  pie está el camino del pulgar; es la misma razón por la que el auto-avance
  es solo por teclado—.
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
npm run check    # tipos + las 17 validaciones. Es lo que corre CI.
npm run build    # el export estatico, que es lo que se publica
npm run uma      # trae el valor de la UMA de la planilla, si cambio
```
