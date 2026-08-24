# Registro de versiones

## Por qué se versiona esto

Una app común se versiona para saber qué features tiene. Acá hay una razón
más fuerte: **un número regulado hoy tiene que poder reproducirse mañana.**

Si alguien funda una regulación en un cálculo de Honorio y seis meses después
el resultado da distinto, hay que poder decir exactamente qué cambió y
cuándo. Por eso la regla de numeración no es «cuánto código se tocó» sino
**qué le pasó al número**:

| | Cuándo |
|---|---|
| **MAYOR** (2.0.0) | Cambia el régimen entero: una reforma legal que rehace el cálculo, o un criterio que alcanza a todos los procesos a la vez. Es raro, y tiene que serlo. |
| **MENOR** (1.1.0) | Entra un tipo de proceso, una pantalla o un dato nuevo. **También** un cambio de criterio que mueve el número de un proceso en particular: ahí la entrada va marcada `MUEVE UN NÚMERO`. |
| **PARCHE** (1.0.1) | Interfaz, redacción, rendimiento. El motor no se toca y ninguna cifra cambia. |

**Lo que garantiza la reproducibilidad no es el dígito, es la marca.** Toda
entrada `MUEVE UN NÚMERO` dice **qué caso da distinto y por qué**, y ésa es la
que alguien va a leer dentro de dos años cuando tenga que explicar una
diferencia entre dos regulaciones. El número de versión sirve para nombrar el
cálculo; la marca, para entenderlo.

### Por qué esta regla cambió el 21/8/2026

Antes decía que **cualquier** cambio de criterio que moviera una cifra era
MAYOR. Aplicada literalmente, esa regla dejaba a Honorio en la versión 10 antes
de fin de año: la app está en su etapa de completar la ley, y completar la ley
es, casi siempre, mover el número de algún proceso que hasta ayer estaba mal.

Un número de versión que crece así deja de decir nada. Peor: para alguien de
afuera, un salto de MAYOR anuncia un producto nuevo, y lo que hubo fue el
arreglo de un inciso. La precisión que se necesitaba nunca estuvo en el dígito
—**estuvo en decir qué caso cambió**—, así que eso se volvió obligatorio y
explícito, y el dígito volvió a significar lo que significa en cualquier lado.

La regla anterior rigió hasta la 3.3.0 inclusive. En esas versiones las dos
reglas coinciden igual, porque ninguna movió una cifra.

El valor de la UMA no versiona esta app: es un dato, no un criterio. Pero sí
se versiona **él**, en `data/uma.json`, con la norma que lo fijó y la fecha
en que entró. Sin eso, «el mismo caso da otro número» tenía una explicación
posible —cambió la UMA— que no se podía comprobar.

---

## 3.4.1 — 24 de agosto de 2026

PARCHE. **El motor no se tocó y ninguna cifra cambia**: las 17 validaciones
están en verde y cualquier caso da exactamente el mismo número que en 3.4.0.
Lo que cambia es el orden del dashboard genérico y del cálculo directo.

### De dónde salió

De la primera devolución honesta de alguien de afuera. SG, el 21/8:

> «Al ser tan completo el resultado que arroja, lo que correspondería en 1° y 2°
> instancia como que me costó leer los datos.»

Su diagnóstico —desglosar en dos páginas— no se siguió, y su síntoma sí. Lo que
lo causaba, medido sobre un conocimiento de 200 UMA: **28 importes en una
pantalla, de los que cinco eran la respuesta.** Entre primera y segunda
instancia había ocho importes de herramientas; después venían tres secciones
dibujadas idénticas entre sí; y la cifra de primera instancia volvía a aparecer
*después* de la segunda, en la cadena de cálculo.

### Qué cambió

- **Tres zonas declaradas.** Lo que se vino a buscar —el honorario del
  profesional que se consulta, en primera y segunda instancia—; el honorario de
  otro —auxiliares, mediador, partidor—; y cómo se llegó. Entre la primera y la
  segunda hay un corte con su rótulo.
- **La segunda instancia sube, pegada a la primera**, y entra unos centímetros:
  es el mismo sujeto y lo dice el mismo color, pero está subordinada.
- **Las herramientas se pliegan.** El reparto por etapas y el reparto entre dos
  profesionales pasan a una sección plegable. **No se oculta ningún número:** el
  número es el del patrocinante, que sigue arriba y entero, y lo que se pliega
  es otra forma de mostrarlo. Es el mismo criterio que ya regía para el
  apoderado y el procurador, que viven detrás del selector de rol desde siempre.
- **La escala y la cadena bajan al pie**, detrás de un pliegue. Son lo que se
  mira cuando el número no cierra, no cuando se lo busca.
- **El caso pasa a ser pie, siempre visible.** Colgaba de la cadena de cálculo;
  es lo que contestaste, no un fundamento.
- **Cuatro cifras pierden su recuadro y se mudan adentro de su «por qué»:** los
  tres pisos de auxiliares y el ítem G del mediador. Son referencias —números de
  otro cálculo que nadie regula—. La insignia de «el 5 % queda por debajo» queda
  **afuera** del pliegue: eso hay que verlo sin abrir nada.
- **De quién es el honorario, en color.** Cobalto para el profesional que se
  consulta, grafito para los demás. No entra ningún color nuevo: cobalto ya era
  el acento de la app.
- **El cálculo directo sigue el mismo orden**, que era el único punto donde
  estaba desalineado por accidente: la segunda instancia quedaba última, después
  de auxiliares y mediador. Ahí no se plegó nada: la herramienta de etapas y
  fracción *es* esa pantalla.

**Ninguna explicación se eliminó.** Las diez que había siguen estando, más dos
que absorben las cifras que perdieron su recuadro.

### Lo que cambia en el papel

El informe impreso también se reordena. Y hay un efecto que conviene saber: la
tabla de tramos y la barra del excedente **no estaban dentro de un desplegable**,
así que se imprimían siempre, sin importar el interruptor «incluir los
fundamentos». Ahora sí lo están, y el interruptor las gobierna. Con los
fundamentos activados el informe sale igual de completo que antes; sin ellos,
más corto.

**Un enlace compartido de antes de esta versión abre igual**, y en el diseño
nuevo: el enlace lleva las respuestas de la entrevista, no los números, así que
el motor recalcula y lo dibuja la pantalla del día. El formato sigue en `c1`.

---

## 3.4.0 — 21 de agosto de 2026

MENOR · `MUEVE UN NÚMERO`: **el exhorto del art. 50 se regulaba mal y ahora da
otro número.** Las 17 validaciones están en verde. Ningún otro tipo de proceso
cambia: un conocimiento, un ejecutivo, una sucesión o un incidente dan
exactamente lo mismo que en 3.2.0.

Es la primera entrada con la regla nueva de versionado, que se explica arriba y
rige desde acá.

### El caso que da distinto

**Un exhorto de notificaciones (inc. a).** Antes la app mostraba `3 UMA` con la
misma tipografía que cualquier resultado, y el motor llamaba a esa
transformación *«honorario fijo»*. No es fijo: el art. 50 inc. a) dice que los
honorarios *«no podrán ser inferiores a tres (3) UMA»* y **no fija ningún
máximo**. Quien tomaba las 3 UMA como la respuesta estaba regulando el piso.
Ahora la app muestra un piso, dice que arriba no hay nada escrito, y la
resolución se redacta con el número que el usuario elija por encima.

**Un exhorto con perito (inc. c).** Antes la app no producía ningún número para
el auxiliar de justicia: el exhorto salía con `auxiliares` en cero. Ahora, si el
oficio trae el monto del juicio exhortante, sale la banda del 5 % al 10 % del
art. 21. Con la base que arma la sentencia de Sala C —capital más intereses, con
el 30 % del art. 22 descontado— eso da 53,10 UMA, muy por encima de las 30 del
inciso, **y no se topea**.

**Cualquier exhorto, en la prosa.** El texto abría diciendo *«Tomo como base
regulatoria la suma de $0,00»* y después escribía *«Aplico Inciso a)
notificaciones - honorario fijo»*, que es el nombre interno de una
transformación puesto en una resolución. Y emitía **dos párrafos** —el inc. b) y
el inc. c)— para un mismo exhorto: quien copiaba el texto regulaba el mismo acto
dos veces por dos incisos distintos.

### La app transcribía un art. 50 incompleto

Faltaba una oración entera del inciso b), la única del artículo que nombra a los
auxiliares de la Justicia y la única que nombra la base regulatoria:

> «En los casos de designaciones de auxiliares de la Justicia ante rogatorias u
> oficios provenientes de otra jurisdicción y a los efectos de poder establecer
> la base regulatoria de los honorarios por ante el juez oficiado, se deberá
> acompañar copia de la demanda, y de la reconvención, si la hubiera»

No estaba en ningún archivo del repositorio: ni en el dashboard, ni en el
renderizador legacy, ni en docs. Nada de lo que se había decidido sobre el
exhorto la había tenido en cuenta.

### Lo que se decidió, y con qué

Tres criterios nuevos en `lib/legal/jurisprudencia.ts`, dos de ellos con su
lectura contraria:

- **`EXHORTO_MONTO_PAUTA`** — el monto del juicio exhortante es pauta indiciaria
  y no base regulatoria, porque el principal sigue en trámite; el honorario es *a
  cuenta* del definitivo. Sin contraria: las dos salas coinciden. Ley 22.172
  arts. 3° inc. 2 y 12; art. 50 inc. b) in fine. CNCiv Sala C, «MONTERO c/
  SANATORIO PARQUE» (18/4/2022) y Sala J, «PEREZ c/ ZUÑIGA» (28/11/2025).
- **`EXHORTO_AUXILIARES`** — el auxiliar cobra por las reglas generales (arts. 21,
  61 y 478 CPCCN) y **la escala en UMA del inciso no lo topea**, porque el art. 50
  fija cantidades para abogados y procuradores y al auxiliar sólo lo nombra para
  mandar establecer su base. Sala C reguló 53,10 UMA en un inciso c) de techo 30,
  fundando en los arts. 16, 21 y 61 y sin citar el art. 50. **La contraria es
  fuerte y va entera**: Sala J sostiene que los porcentuales del art. 21 son
  inaplicables, y lo reitera en cuatro sentencias propias.
- **`EXHORTO_INCISO_A_TECHO`** — el inciso a) no tiene techo y la app no le
  inventa uno: muestra el orden de magnitud que la propia ley fija (10-20 del
  inc. b, 7-30 del inc. c, 10 UMA del art. 58 inc. a por un conocimiento entero).
  Es una pauta de lectura y el motor no la aplica. La contraria —las 3 UMA por
  cada acto, que plantea Pesaresi— **queda sin cita de página hasta verificarla
  contra la obra**.

### Lo que cambió en la regla de los pisos

`ESTADO.md` decía *«los pisos se muestran, no se aplican»*, que se leía como una
prohibición general y no lo era: su fundamento siempre fue el art. 478 CPCCN,
que autoriza a ir por debajo de los topes mínimos **de los auxiliares**. Ahora
está escrita como lo que es: **un piso se aplica, salvo que una norma autorice
perforarlo**. Las 3 UMA del art. 50 inc. a) no tienen art. 478, así que son un
mínimo duro y la prosa rechaza un punto por debajo. La regla nunca fue «no
topear»: fue **no decidir lo que la ley le deja al juez**.

### La tercera clase de número

La app tenía dos: lo que el motor calcula, y la banda dentro de la cual el
usuario elige. Faltaba la que este trabajo obligó a nombrar: **un número de otro
cálculo, mostrado para orientar y que no se regula**. Los pisos de los auxiliares
ya eran eso, y el tope de la mediación también.

Se probó darle forma propia —una primitiva `Referencia`, con caja punteada y
rótulo «no se regula»— y **se quitó el mismo día**: agregaba ruido a una tarjeta
que ya tenía de más. Quedó marcada con la etiqueta del `LedgerRow`, «pauta, no
base». Con un solo uso, la primitiva no se justificaba.

**Una referencia nunca se topea.** Recortar la escala del art. 21 a la banda del
inciso borraría lo único que informa: el tamaño del pleito. Lo que se topea es la
elección, y sólo donde la ley puso un techo.

### Lo que la resolución no dice

Sala C sostiene que los honorarios del exhorto son *«a cuenta de los que en
definitiva se determinen»*. El generador llegó a escribirlo en cada texto y **se
sacó**: es una lectura razonable de ese caso y no necesariamente de todos —hay
exhortos que se agotan en sí mismos—, y ponerla en cada resolución es forzar una
interpretación en boca de quien regula. Está en la pantalla, dentro del «por
qué», con el fallo que la sostiene.

### La pantalla, sin prosa entre las cifras

La tarjeta del exhorto llegó a tener seis párrafos explicativos intercalados
entre los números y había que leer para encontrarlos. Se aplicó la regla que el
repositorio ya tenía escrita —**los números no se ocultan y las explicaciones
sí**— y todo eso pasó a los «por qué». Arriba quedó lo que hace falta para leer
una cifra: qué es, de qué artículo sale y en qué unidad está.

### La entrevista

El exhorto pasó de dos pasos a seis: se pregunta el inciso, cuántos actos
comprende (sólo en el a, y **no multiplica nada**), si el oficio consigna el
monto, y el monto. Vive en `exhortoMonto` y no en `baseValor`, a propósito: por
`baseValor` cualquier regla que mire la base lo tomaría por lo que no es.

---

## 3.3.0 — 20 de agosto de 2026

MENOR: **ningún número se movió.** Todo lo que entra es texto, citas y controles.
Las 17 validaciones en verde. Un conocimiento, un ejecutivo, una sucesión o un
incidente dan exactamente lo mismo que en 3.2.0.

*Entrada escrita el 21/8, con el trabajo ya hecho: faltaba y quedó anotada tarde.*

### Los huecos de criterio, contados

`AGENTS.md` dice desde el 8/8 que una interpretación se funda en un fallo o no se
afirma. **Se cumplía en dos lugares de doce.** Éste fue el barrido: listar cada
punto donde la app decide algo que la ley no resuelve sola, y anotar con qué está
fundado. `jurisprudencia.ts` pasó de 2 criterios a 8 —caducidad por el art. 22 y
por el 25, el factor de correlación del art. 21, los mínimos del art. 58, la
primera etapa de la sucesión, el IVA, la base única de mediación—.

Tres cosas que el tipo ganó y no son cosméticas: `Doctrina` es un tipo aparte de
`Fallo` y la pantalla los separa —un fallo dice lo que un tribunal resolvió, un
autor dice lo que le parece—; `fallos: []` es un estado válido y **se declara**,
porque que un criterio se apoye sólo en doctrina es información para quien lo va a
usar; y `Fallo` ganó `publicacion` y `transcripcion`, las dos por el plenario
Multiflex, que no tiene sentencia en línea y se cita por la doctrina que fija.

La caducidad es **el único paso donde la app no decide sino que pregunta**, así
que son dos criterios y se muestran debajo de las dos tarjetas. No se cargó una
lista de salas por corriente: la Sala I aplicó el art. 25 en 2019 y el art. 22 en
2026, así que una lista envejece sola y sugiere un reparto estable que no existe.

La cita del IVA se mudó a `jurisprudencia.ts`. Estaba a mano dentro de una cadena
de `regulacion-prosa.ts`, abreviada y sin el tomo de Fallos: era la única del
generador que no salía del archivo que existe para tenerlas.

### El art. 41, declarado abierto

Se consultaron cuatro obras sobre si el 40 % de las actuaciones posteriores se
toma de la escala del art. 21 o del honorario ya reducido. Dos no lo tratan y las
otras dos se contradicen entre sí, **y cada una le da la razón a esta app en un
punto y se la quita en el otro**. Ningún número se movió: la app sigue leyendo el
40 % sobre la escala, porque el artículo dice «de la escala del citado artículo» y
el citado es el 21, y porque la cuenta cierra —50 % + 40 % = 90 %, o sea el 100 %
menos el 10 % del propio artículo—.

De ahí salió `Criterio.contraria`: **la lectura que la app descarta, con sus
fuentes o con la falta de ellas.** Un criterio mostrado solo se lee como si fuera
el único posible. Y cuando no trae fuentes se dice: la contraria del art. 21 va
sin ninguna y la pantalla declara que no se encontró quién la sostenga por
escrito.

### El control diario de la UMA

Comparar `data/uma.json` contra la planilla no servía: lo escribe el mismo script
leyendo la misma planilla, así que coinciden por construcción, y si el cron no
corrió tampoco corre el control. **El 20/8 eso dejó doce días el sitio con
$102.076**, y lo descubrió de casualidad el motor viejo.

El control nuevo mira **lo servido**, y de punta a punta caza los cuatro casos: el
cron no corrió, se plantó en un control, el deploy falló, o lo servido quedó
viejo.

### El verificador de datos personales

Corre en cada commit y bloquea antes de que algo salga del repositorio: DNI, CUIT,
CBU, matrícula, teléfono, enlaces al visor de expedientes del PJN. Las carátulas
se pueden relajar por repositorio —en una wiki de jurisprudencia son el contenido,
no una fuga— y en éste están en `aviso`, pero **la carátula de una causa propia no
se relaja nunca**.

### Y una cautela falsa, corregida

`ESTADO.md` decía que la sala del fallo FUNES no constaba en la fuente y que no se
había completado. **Las dos mitades eran falsas.** Se resolvió abriendo la
sentencia: el CIJ dice «CAMARA CIVIL - SALA I». La cita siempre estuvo bien y
mentía el documento, que es el modo peligroso de fallar porque tranquiliza.

---

## 3.2.0 — 15 de agosto de 2026

MENOR: **entra un piso que faltaba y ningún honorario cambia.** Las 17
validaciones siguen en verde, incluidas todas las de cálculo. Lo que cambia es
qué pisos ve quien regula, no el número que la app calcula.

Salió de un señalamiento en redes sobre la Ley 27.802 (Modernización Laboral,
B.O. 06/03/2026). Al ir al texto aparecieron cuatro cosas más.

### Faltaba el art. 61, que es el del universo entero de la app

La Ley 27.802 sustituyó los arts. 60 y 61 e incorporó el 61 bis. La app tenía
el 58, el 60 y el 61 bis. **Faltaba justo el 61**, que es el de los peritos en
procesos susceptibles de apreciación pecuniaria, primera instancia hasta la
sentencia — es decir, todos los casos que Honorio calcula. Su piso de 2 UMA
ahora está en la tabla de mínimos y entre los pisos del dashboard.

Su remisión al art. 32 quedó afuera, y a propósito: el art. 32 regula
administradores, interventores, liquidadores y árbitros con escalas sobre
utilidades realizadas o bienes liquidados. Nada de eso encaja con un perito
médico o ingeniero. **La remisión no aterriza, pero el mínimo de 2 UMA no
depende de ella:** se aplica solo.

### Los pisos dicen ahora de quién son

La ley separa por sujeto y no por tipo de juicio: los arts. 60 y 61 son de los
peritos y liquidadores de averías, y los dos cierran remitiendo a las normas
específicas «en el caso de los demás auxiliares de la Justicia», que son los
que siguen con el piso de 4 UMA del art. 58. Antes ese 4 UMA decía «Auxiliares
de la Justicia», a secas, y se leía como si alcanzara a todos.

Esto **no** distingue la banda del 5 % al 10 %: esa sale del art. 21,
antepenúltimo párrafo, que dice «auxiliares de la Justicia» y los alcanza a
todos. La distinción es solo de los pisos.

### El 1/4 de UMA dejó de figurar como mínimo, porque no lo es

El tercer párrafo del art. 61 bis dice que al perito que aceptó el cargo y no
dictaminó porque el proceso terminó por transacción, avenimiento o conciliación
**«se le regulará»** un cuarto de UMA. No dice «un mínimo de». Es el honorario
de ese supuesto, no un piso.

### Y ese supuesto ahora aparece cuando corresponde

El piso del art. 61 bis es «por cada pericia», y se mostraba también en casos
terminados **antes de la apertura a prueba**, donde no hubo ninguna. Ahora, en
esos casos, ese piso queda marcado como lo que es —presupone una pericia que no
existió— y al lado aparece el cuarto de UMA, que es el supuesto que la ley
previó para exactamente eso. **Ningún número se oculta:** se muestran los dos y
se dice cuál encaja.

### Lo que la ley no resolvió, dicho en la app

El art. 61 bis dice que los honorarios del perito «no estarán vinculados a la
cuantía del respectivo juicio», y no derogó el 5 % al 10 % del art. 21, que se
calcula sobre la cuantía. Las dos reglas conviven hasta que haya
jurisprudencia. Honorio muestra las dos y no elige — el mismo criterio que ya
aplicaba con el art. 478 CPCCN.

Y una ayuda para saber cuándo la comparación importa: el 5 % crece con la base
y los pisos no. **Un piso de 2 UMA solo muerde por debajo de una base de 40
UMA; uno de 4, por debajo de 80.** Con bases mayores el porcentaje ya los supera
y los pisos quedan teóricos.

## 3.1.2 — 15 de agosto de 2026

PARCHE: una línea, en tres pantallas. El motor no se tocó.

- **«Los cálculos no usan IA» ahora está arriba de todo resultado**: en el
  dashboard de la entrevista, en el cálculo directo y en los mínimos. Estaba
  solo en la portada y ahí llega tarde: **quien pregunta si esto lo hizo una
  inteligencia artificial no pregunta al entrar, pregunta cuando ve el
  número.** Ya pasó, y la objeción se desactivó en el acto — que es lo que la
  línea tiene que hacer sola.

  Es información de más en una app cuya regla es no agregar ruido, y entra
  igual. La razón: esta objeción no bloquea una parte de la herramienta,
  bloquea el uso entero. Una línea cuesta menos que una persona que no la puede
  usar delante de su jefa.

  **No se imprime.** En un expediente el papel tiene que decir de qué se
  calculó y con qué versión —eso ya lo hace la firma—; de qué *no* se calculó
  no le importa a nadie.

## 3.1.1 — 13 de agosto de 2026

PARCHE: interfaz y redacción. El motor no se tocó.

- **«Los cálculos no usan inteligencia artificial», en la portada.** No es un
  detalle técnico y por eso no está en la letra chica: es lo que alguien
  necesita poder señalar cuando tenga que defender haberla usado. La confusión
  entre *construido con asistencia de un modelo* y *calcula con un modelo* es
  real, ya dejó a una usuaria sin poder decir que la usa, y no se arregla
  difundiendo más. El desarrollo está en «Información adicional», con lo que
  hace verificable la afirmación: funciones deterministas, 17 suites de
  validación, y si alguna falla el sitio no se publica.

- **La medición, dicha al lado de la promesa que matiza.** Desde agosto de 2026
  se cuentan las visitas en forma agregada y del lado del servidor —sin
  cookies, sin identificar a nadie y sin ningún código de seguimiento en la
  página—. Que el cálculo no salga del navegador sigue siendo cierto; decir lo
  primero y callar lo segundo sería administrar la verdad.

- **Dos títulos, y nadie ve los dos.** El de la pestaña y el buscador dice lo
  que alguien tipea cuando busca —«honorarios», «27.423»—, porque el título es
  la señal más fuerte que tiene un buscador y gastarla en una frase linda es
  caro. El de la tarjeta compite por otra cosa: la atención de alguien leyendo
  un WhatsApp, donde el nombre de la ley no aporta nada porque el enlace se lo
  mandó un colega. Quien busca ve el primero, quien recibe el enlace ve el
  segundo.

- **La tarjeta, centrada.** Estaba compuesta a la izquierda y dejaba media
  imagen vacía a la derecha, que en una miniatura se lee como un error de carga
  y no como aire.

## 3.1.0 — 12 de agosto de 2026

MENOR: **un cálculo se puede compartir, citar y discutir.** Ningún número se
movió: el motor no se tocó y las 17 validaciones siguen en verde. Lo que entra
es la manera de que un número salga de la pantalla sin perder de dónde vino.

- **El caso viaja en el enlace.** «Copiar enlace» en la barra del dashboard
  devuelve una dirección que lleva el caso entero adentro y abre exactamente
  esa pantalla. Quien lo recibe ve el mismo número con las mismas respuestas.

  Va en el **fragmento** de la dirección (`#`) y no en la query (`?`), y eso no
  es una preferencia de estilo: el fragmento no se envía al servidor. Ningún
  request lleva el caso, ni al host que sirve el sitio ni a nadie en el camino,
  así que compartir un cálculo no contradice la promesa de que nada de lo que
  se escribe sale del navegador. En la query, la misma función la rompería.

  El formato lleva versión (`c1`). Si alguna vez cambia, el número sube y los
  enlaces viejos dejan de decodificarse en vez de decodificarse mal: un enlace
  que abre torcido es peor que uno que no abre.

- **Un caso restaurado se queda con su UMA.** La del enlace, no la de hoy. Es
  la que produjo el número que alguien compartió o citó; si el motor la pisara
  al terminar de cargar, el mismo enlace daría distinto el día que cambie la
  UMA, que es justamente lo que compartir un cálculo tiene que impedir. Al
  empezar de nuevo vuelve la vigente.

- **Las respuestas que entran por la URL pasan por la misma puerta que las
  tipeadas.** Se descartan los ids que el schema no pregunta y los valores que
  no son respuestas posibles, y después se poda igual que siempre. Un enlace
  con respuestas incoherentes queda en un caso coherente, no en un número
  calculado sobre una combinación que la entrevista nunca habría producido.

- **Cómo citar este cálculo**, al pie, junto a la firma: versión, fecha, UMA y
  el enlace, en una línea para copiar. Es lo único de ese bloque que también se
  imprime, porque en el papel el enlace es lo único que queda para volver.

- **«Este cálculo no cierra»**, al lado de la cita: abre un correo con el caso
  ya adentro. Reportar un error dejó de exigir que quien lo encontró sepa
  explicarlo.

- **La tarjeta del enlace.** Título, descripción e imagen para cuando alguien
  pega honorio.ar en WhatsApp, LinkedIn o un correo. La imagen se genera con
  `node scripts/og.mjs` y está commiteada; no corre en el build.

- **La barra ya no empuja la página de costado en un teléfono.** Los controles
  del dashboard envuelven en vez de desbordar. Antes medían más que la pantalla
  y arrastraban a todo el informe a un scroll horizontal.

- **El informe entra en un teléfono.** Eran tres cosas distintas y una sola
  causa:

  Las filas del ledger no envolvían. Un rango como «$4.277.105,25 a
  $4.579.971,00» no se puede achicar —parte una cifra al medio— y solo el valor
  ya mide más de la mitad de un teléfono, así que la fila empujaba a toda la
  página. Ahora el valor cae a la línea de abajo, alineado a la derecha. En
  pantalla grande no cambia nada: el punteado se come el espacio libre y la
  fila entra igual que siempre.

  El selector de rol —patrocinante, apoderado, procurador— se asomaba fuera de
  la pantalla en 320 px. Es el único control del dashboard que mueve el número;
  ahora envuelve.

  Y la **regulación redactada llega plegada en el teléfono**, con el título a
  la vista. Es la sección más larga del informe y la que menos sentido tiene
  ahí —nadie carga cuatro profesionales y copia una regulación con el pulgar—,
  pero tiene que saber que existe para buscarla después en la computadora. Se
  pliega el contenido, no la existencia. En pantalla grande el pliegue no
  existe.

  Medido: de **8,3 pantallas de scroll a 5,7**, y cero desborde horizontal en
  375 px y en 320 px.

## 3.0.0 — 7 de agosto de 2026

MAYOR: **un caso da distinto que ayer, y da distinto a propósito.**

### Qué caso, y por qué

La modificación de una cuota alimentaria —aumento, disminución, cesación o
coparticipación— iba por la escala progresiva del art. 21. Va por la escala de
los incidentes, que es lo que manda el **art. 39 segundo párrafo**. Antes la
app ni siquiera preguntaba de qué supuesto se trataba.

Un aumento con diferencia de $200.000 mensuales, base de 2 años $4.800.000,
UMA $102.076:

```
ANTES  escala del art. 21, 3ª (46-90 UMA)   $1.231.473,60  a  $1.243.868,40
AHORA  escala de los incidentes, 2 % a 20 %     $96.000,00  a    $960.000,00
```

No es un ajuste: es otra escala, y el mínimo cae a menos de la décima parte.
La ley lo dice con todas las letras y la app no lo hacía.

**La base también cambia, y esa parte la pone el usuario:** en la modificación
son dos años de **la diferencia** entre la cuota vieja y la nueva, no de la
cuota entera. El hint del paso de la base ahora lo dice con el ejemplo, porque
es el error más caro de esta rama.

**No es un criterio interpretativo nuevo.** La escala de los incidentes es la
misma que la app ya usaba para los incidentes —el 2 % al 20 % del art. 33 de la
Ley 21.839, porque el art. 47 de la 27.423 quedó observado—. Es un criterio
declarado una vez y aplicado en los dos lugares donde la ley remite a lo mismo,
y `alimentosArt39.validation.ts` comprueba que los dos números coincidan: si
algún día divergen, tiene que ser a propósito.

**Arrastra la cuenta de recorridos.** El sub-paso nuevo lleva el conocimiento
de 120 a 128 recorridos y el total de 160 a 168, así que los cruces del barrido
pasan de 25.600 a 28.224. Actualizado en el mismo commit acá, en el `README` y
en la landing.

### Lo demás

- **Actuaciones posteriores a la ejecución (art. 41, última oración).** Un
  bloque propio, al 40 % de la escala del art. 21. **Es de la escala completa,
  no de la mitad que el mismo artículo aplica a la ejecución**, y no le entra el
  10 % por no haber excepciones: eso último es un criterio y está declarado en
  pantalla. No se pone entre las fracciones por etapas porque no es una etapa
  sino otra regulación sobre la misma base, y pueden concurrir.
- **Los mínimos de los auxiliares, al lado de su 5 %-10 %.** Se muestran los
  dos números y no se aplica el piso, que era la propuesta original. **Aplicarlo
  es una decisión, y no siempre la correcta:** el art. 21 deja a salvo el
  art. 478 CPCCN, que manda adecuar los honorarios de los peritos «por debajo de
  sus topes mínimos inclusive» a lo que se regule a los demás profesionales.
  Cuando el 5 % queda por debajo de un piso, la pantalla lo señala. Decisión de
  Javier.

## 2.2.0 — 7 de agosto de 2026

MENOR: entra contenido que no existía y ningún caso da distinto. Las 11
validaciones siguen en verde y `lib/legal/calculate.ts` solo cambió en una
cita, que no interviene en ninguna cuenta.

- **Volvió el hint de la base.** El asistente clásico decía, arriba del campo,
  **qué monto ingresar** según lo contestado antes; la migración se llevó el
  campo y dejó el cuadro. Ahora son **24 ramas** en
  `lib/wizard/indicacion-base.ts`, y para eso `ayuda` y `explicacion` de un
  paso pueden derivarse de las respuestas —el tipo es `Derivable<T>`—.

  Es la mitad del valor de la entrevista: la escala la controlan 830
  afirmaciones en cada push, y la base la pone una persona sin que nada la
  controle.
- **Las leyendas dicen también qué *no* hace la app**, que es lo que el
  clásico no tenía por qué decir: el segundo párrafo del art. 39 —aumento o
  cesación de alimentos, que va por la escala de los incidentes y acá va por
  la del 21— y el tope del 100 % del art. 23 inc. h), que la app no verifica
  porque la base la ingresa el usuario.
- **El litisconsorcio del art. 21 quedó dicho**, detrás del «por qué» y en
  todos los procesos salvo el sucesorio, que tramita como jurisdicción
  voluntaria y para el que el mismo artículo manda considerar una sola parte.
  Va con el reparo que lo hace usable: **el 5 %-10 % de los auxiliares se
  calcula sobre el monto del proceso**, no sobre el interés de un
  litisconsorte, así que quien ingresa una parte se lleva un honorario de
  perito corto en esa proporción.
- **El 2 % al 20 % del incidente dejó de colgar del art. 29 inc. g.** Esa
  pantalla mostraba el texto del inciso —que divide el incidente en dos etapas
  y no fija ninguna alícuota— debajo de los dos porcentajes, y sin nombrar de
  qué artículo era. Ahora hay dos citas separadas, cada una con lo que de
  verdad funda, y el criterio del art. 33 de la Ley 21.839 va con la
  jurisprudencia que lo sostiene: tres fallos de la CNCiv., dos con enlace a la
  sentencia en el CIJ. Es el mismo error que la cita del art. 29 inc. e en la
  cautelar, corregida el 6/8.
- **`lib/legal/jurisprudencia.ts`**, nuevo. Una interpretación declarada con
  jurisprudencia se puede discutir; una sin nada detrás solo se puede creer o
  no.

## 2.1.1 — 5 de agosto de 2026

PARCHE: el motor no se toca. Termina de cablear la procedencia de la UMA y
el acceso a la documentación de dominio, que quedaron a medio camino en
2.1.0 porque faltaban datos.

- **La norma de la UMA es un enlace.** Un AppScript de la planilla escribe
  la URL en una celda propia (`URL`), porque el hipervínculo de una celda no
  viaja en el CSV. El script la levanta y ahora el enlace al PDF de la Corte
  está en el paso de la UMA y en la firma del informe.
- **El script completa la procedencia sin esperar a que cambie el valor.**
  Si la UMA es la misma pero la norma o la URL llegaron después, actualiza
  esos dos campos de la última entrada. El valor no se toca nunca: sin esto,
  una URL agregada hoy entraba recién dentro de meses.
- **La serie completa de valores, en el «por qué» del paso de la UMA.** El
  texto ya mandaba al CPACF sin enlazarlo. Es la tabla histórica, distinta
  del enlace a la norma: una se consulta para verificar, la otra se cita.
- **La documentación de dominio se enlaza desde la app**, en la firma y en
  la información adicional de la intro. No en la portada: su trabajo es que
  se apriete «Comenzar».
- CI pasa a Node 24 y a las acciones v7; las de Node 20 estaban deprecadas y
  el runner ya las forzaba a correr en 24.

---

## 2.1.0 — 5 de agosto de 2026

MENOR y no MAYOR porque **ningún criterio del motor cambió**: las 11
validaciones dan exactamente lo mismo que en 2.0.0. Entran el informe
imprimible y la firma, y cambia de dónde sale el valor de la UMA.

### Qué puede dar distinto, y no es el motor

Un caso armado **pegando** la base regulatoria pudo haber salido mal. El
campo suponía formato es-AR —punto de miles, coma de decimales— y no
avisaba cuando lo que llegaba no lo era:

| Se pegaba | Se cargaba antes | Se carga ahora |
|---|---|---|
| `66316779.77` | `$6.631.677.977` | `$66.316.779,77` |
| `66,316,779.77` | volvía al valor anterior, sin avisar | `$66.316.779,77` |
| `1.5` | `15` | `1,5` |

Y había un segundo problema encima: el valor se confirmaba recién al salir
del campo, así que **pegar un número y apretar «Calcular» calculaba con el
anterior**. Había que hacer clic en cualquier otro lado primero.

Los dos fallaban en silencio y el número que salía se veía perfectamente
normal. Si hay un cálculo guardado de antes del 5/8/2026 con la base pegada,
conviene rehacerlo.

La regla nueva es una sola y está escrita: **el último separador con una o
dos cifras detrás es el decimal; cualquier otro separa miles.** Entran las
dos convenciones. La misma regla la usa el script que lee la planilla, para
que lo que se muestra y lo que se calcula no puedan discrepar.

### El valor de la UMA sale del repositorio, no de Google

Lo buscaba el navegador de cada visitante a una planilla publicada, en cada
carga. Ahora lo lee el build (`npm run uma`, más un cron mensual) y queda
en `data/uma.json` con su norma y su fecha.

- La app declaraba que nada de lo que se escribe sale del navegador, y con
  ese pedido la afirmación dependía de Google. Mismo criterio con el que se
  sacó `@vercel/analytics` el 4/8.
- Si el pedido fallaba, el motor seguía con `92482` escrito a mano —un valor
  de meses atrás— y solo avisaba por `console.warn`.
- El script se planta y no toca el archivo si la planilla no responde, si
  devuelve HTML, o si el valor saltó más de un 60 %.

`public/legacy/core.js` conserva su `cargarUMA()` y no se toca: es copia del
asistente clásico, que se mantiene en el otro repositorio. Simplemente no se
la llama más.

### Informe imprimible y autoría

- **Firma al pie del cálculo**: autor, versión del motor, la UMA con su
  norma, la fecha, el contacto, el código y la licencia. Es lo que hace que
  el número se pueda defender cuando sale de la pantalla.
- **Imprimir**, con interruptor para incluir u omitir los fundamentos: el
  cálculo desnudo para adjuntar, o el cálculo fundado para sostenerlo. Se
  imprime el mismo DOM que se ve, con `@media print`; no hay una segunda
  maqueta que pueda desviarse de la primera.

### Interfaz

- **Vuelta a las herramientas.** Desde `honorio.ar` no había manera de
  llegar al resto de las calculadoras. Ahora hay un enlace en la cabecera.
- La cadena de cálculo deja de repetir cifras: cuando un eje no reduce
  nada, no imprime un total que diga lo mismo que la línea de arriba.
- Un campo numérico sin responder muestra vacío en vez de `0`.
- `Enter` en un campo numérico avanza, que es lo que prometía la pista del
  pie.
- Las URL que cruzan a otro sitio viven todas en `lib/enlaces.ts`.

---

## 2.0.0 — 3 de agosto de 2026

Volver atrás en la entrevista arrastraba respuestas que el proceso nuevo ya
no pregunta. Es MAYOR y no PARCHE porque un caso armado volviendo atrás pudo
haber dado un número distinto del que da hoy.

### Qué caso da distinto

Solo los que se llegaron **volviendo atrás y cambiando una respuesta ya
contestada**. Una entrevista corrida de principio a fin sin retroceder da
exactamente lo mismo que en 1.0.0.

| Camino | Antes | Ahora |
|---|---|---|
| Terminación «honorarios provisorios» → atrás → **sucesión** (o cautelar, homologación, exhorto, incidente) | El resultado salía marcado como provisorio: una sola cifra, sin máximo | Regulación normal, con mínimo y máximo |
| Sentencia «rechazada» → atrás → **modos anormales** o **caducidad** | La base seguía reducida un 30 % (art. 22) | Base sin reducir |
| Modos anormales «antes de prueba» → atrás → **caducidad / art. 22** | La escala seguía reducida un 50 % (art. 25) | Escala sin reducir |

El primero, además de un estado imposible, era un error jurídico: en el
proceso sucesorio no se admiten regulaciones provisorias salvo excepción, y
en esa excepción —el letrado renuncia con la sucesión sin terminar— la
regulación es definitiva y se enuncia con mínimo y máximo, que es justo lo
contrario de lo que manda el art. 12.

### Motor

- **La caducidad vuelve a tener dos criterios excluyentes.** `resolveReglas`
  aplicaba el −50 % del art. 25 también cuando la caducidad se trataba por
  art. 22, acumulando la quita de base del 22 y la de escala del 25 sobre el
  mismo hecho. El motor clásico nunca tuvo esa rama. Elegido el art. 22, la
  instancia cae como demanda desestimada y el momento de la apertura a prueba
  no juega; recién con el art. 25 importa.
- **`esRegulacionProvisoria` mira el tipo de proceso.** El art. 12 solo puede
  aplicarse donde la entrevista pregunta la forma de terminación. Un estado
  que diga `sucesion` y `provisorios` a la vez lo rechaza el motor por su
  cuenta, sin depender de que el llamador lo haya limpiado.

### Entrevista

- **Una respuesta vive mientras su paso se pregunte**
  (`lib/wizard/reachability.ts`). Al cambiar una respuesta se podan las que
  dependían de ella, en cascada y hasta punto fijo. Reemplaza el nuleo
  ad-hoc de las sub-opciones de «objeto», que era este mismo problema
  resuelto para un solo caso.
- **El estado del motor se reconstruye entero antes de calcular**, en vez de
  parchearse. `wizardState` es un objeto mutable de larga vida; parchearlo
  dejaba adentro lo que la poda ya había descartado.
- Consecuencia visible: volver atrás y cambiar el tipo de proceso ahora
  vacía las respuestas que ese proceso no comparte. Si se vuelve al proceso
  anterior hay que responderlas de nuevo. Es el precio de que no queden
  respuestas que el usuario no dio.

### Validación

- `lib/legal/__tests__/retroceso.validation.ts`. Enumera las 160 corridas
  limpias posibles y barre los **25.600 cruces** de «volver atrás y cambiar
  de rumbo», exigiendo que el estado podado sea indistinguible de una
  corrida limpia y dé el mismo cálculo. Son 11 validaciones en total.

---

## 1.0.0 — 31 de julio de 2026

Primera versión pública.

### Licencia

- **`honorio/` pasa a AGPL-3.0-or-later.** El resto del repositorio sigue bajo
  MIT. No prohíbe el uso comercial: obliga a que quien modifique el motor y lo
  ofrezca a terceros publique su versión bajo la misma licencia.
- `CONTRIBUTING.md` en la raíz, con la cesión de licencia que hace falta para
  conservar la opción de licenciar bajo otros términos. Sin eso, un solo PR
  aceptado cerraría esa puerta.
- Encabezados `SPDX-License-Identifier` en `lib/legal/`, para que la licencia
  viaje con el motor si alguien copia los archivos sueltos.

### Motor

- **Arreglados los honorarios provisorios del art. 12.** El wizard mandaba
  `modoTerminacion: 'provisorios'` pero nunca se marcaba el resultado como
  provisorio, así que el dashboard mostraba una banda mínimo–máximo donde
  corresponde una sola cifra. Ahora la condición se **deriva del modo de
  terminación** dentro del motor, y no de una bandera que el llamador tenga
  que acordarse de poner: cualquier consumidor obtiene el mismo resultado
  mandando solo el modo.
  Las cifras no cambiaron: el art. 12 no reduce nada, dice cuál del rango se
  fija. Queda cubierto por `lib/legal/__tests__/provisorios.validation.ts`.

### Mínimos arancelarios

- **Pantalla rehecha.** Antes había que elegir una categoría en un `<select>`
  heredado del asistente clásico para ver un solo número. Ahora abre
  mostrando los 44 conceptos y se filtra escribiendo.
- **Buscador** sobre toda la tabla: sin tildes, sin importar mayúsculas ni el
  orden de las palabras, y tolerante al plural y al género («pecuniario»
  encuentra «pecuniaria»). Marca la coincidencia sobre el texto. `/` lleva al
  campo, `Escape` lo limpia.
- **Orden corregido.** Se leía el inciso b) del art. 19 antes que el a),
  porque ese era el orden en que se habían agregado las opciones al `<select>`.
  Ahora es el del articulado: 19 a, 19 b, 31, 44, 48, 58, 60 y 61 bis.
- Se compone con las mismas piezas que el dashboard, y el texto de cada
  artículo pasó detrás del mismo «por qué» del resto de la app.

### Marca

- La ilustración se pinta con el color de texto vía máscara, así que sigue al
  tema claro/oscuro sin recuadro de papel y sin dos archivos que mantener
  sincronizados (`components/brand.tsx`).
- Borrados los assets que venían de la plantilla y no usaba nadie
  (`placeholder-*`, `icon.svg`).
- El paquete dejó de llamarse `my-project`.
