# Estado del proyecto

Documento de continuidad entre sesiones. **Leer antes de empezar a trabajar.**
Se actualiza en el mismo commit que el trabajo, para que nunca mienta.

Última actualización: 2026-08-24 · rama `main`

Lleva **sólo lo que sigue vivo**: dónde está el trabajo, qué está abierto, qué
se sabe roto, qué decisiones no hay que contradecir sin saberlo y qué trampas
ya costaron tiempo. Lo que se cerró está en [`HISTORIA.md`](HISTORIA.md) —cómo
se llegó hasta acá, qué se rompió y ya se arregló, qué se discutió y se
decidió—. **No hace falta leerlo para trabajar:** se abre cuando aparece la
pregunta «¿por qué esto quedó así?».

> **Al cerrar una sesión, este archivo se limpia.** Lo terminado baja a
> `HISTORIA.md` con su fecha y acá queda el invariante, si dejó alguno. Un
> `ESTADO.md` que acumula todo lo hecho deja de ser lo primero que se lee y
> pasa a ser lo que se saltea, que es peor que no tenerlo.

---

## Dónde estamos

Versión **3.4.1**, publicada en `honorio.ar`. Las **17 validaciones** de
`lib/legal/__tests__` están en verde y corren solas en CI. **No hay nada urgente
ni bloqueante.**

Es un PARCHE: **el motor no se tocó y ninguna cifra cambia.** Lo que cambia es el
orden del dashboard genérico y del cálculo directo, y sale de la devolución de SG
del 21/8. El detalle está en el [`CHANGELOG`](../CHANGELOG.md); lo que gobierna
las decisiones está más abajo, en «Las tres zonas del dashboard».

La 3.4.0 quedó marcada `MUEVE UN NÚMERO` porque el exhorto daba otro resultado: el
inciso a) dejó de mostrarse como un honorario de 3 UMA y pasó a ser el piso que la
ley dice que es, y el auxiliar del inciso c) tiene banda propia, que antes salía
en cero. Ningún otro tipo de proceso cambió.

**La regla de versionado cambió el 21/8 y está explicada en el
[`CHANGELOG`](../CHANGELOG.md).** Antes, cualquier cambio de criterio que moviera
una cifra era MAYOR; aplicada literalmente dejaba a Honorio en la versión 10 antes
de fin de año, porque completar la ley es casi siempre arreglar el número de algún
proceso. Ahora eso es MENOR con la marca `MUEVE UN NÚMERO`, y **la marca es la que
garantiza la reproducibilidad, no el dígito**: obliga a decir qué caso da distinto.
MAYOR queda para un cambio de régimen.

El trabajo del 20/8 —los huecos de criterio, el art. 41, el control diario de la
UMA y el verificador de datos— **ya tiene su entrada**, la 3.3.0, escrita el 21/8
con el trabajo hecho. El CHANGELOG queda sin deuda.

Todo lo que estaba planeado está hecho. Cada uno, con sus decisiones y su
motivo, está contado en [`HISTORIA.md`](HISTORIA.md):

| Qué | Cuándo | Dónde vive |
|---|---|---|
| Rediseño visual, entrevista, dashboard, portada, intro y mínimos | hasta 4/8 | `components/` |
| El flujo hacia atrás dejó de arrastrar respuestas | 3/8 | `lib/wizard/reachability.ts` |
| La UMA sale del repositorio, la firma y el informe imprimible | 5/8 | `data/uma.json`, `Firma.tsx` |
| `PLAN_COBERTURA_LEY.md`, entero, en dos tandas | 7/8 | varios |
| El cálculo directo | 7/8 | `lib/legal/calculo-directo.ts` |
| Mediación, con el UHOM versionado | 8/8 | `lib/legal/mediacion.ts`, `uhom.ts` |
| La regulación en prosa | 10/8 | `lib/legal/regulacion-prosa.ts` |
| Compartir por enlace, citar y reportar; pasada de celular | 12-13/8 | `lib/compartir.ts` |
| Ley 27.802 y los pisos de los auxiliares | 15/8 | `MINIMOS_AUXILIARES_JUSTICIA` |
| Los huecos de criterio: de 2 criterios a 8 | 19/8 | `lib/legal/jurisprudencia.ts` |
| El art. 41 abierto, con las dos lecturas | 20/8 | `ART41_POSTERIORES` |
| El exhorto: un inciso por vez, con su jurisprudencia | 21/8 | `buildExhorto()`, `ExhortoResult.tsx` |
| Las tres zonas del dashboard, y el mismo orden en el cálculo directo | 24/8 | `Dashboard.tsx`, `HonorariosBand.tsx` |

El plan de adopción está **fuera del repositorio**, en `C:\IA\notas\adopcion.md`,
porque nombra personas. La **Fase 0 quedó cerrada el 13/8**.

---

## Lo que está abierto

### El art. 41, donde los libros se contradicen entre sí

Se consultaron cuatro obras. **Dos no lo tratan** —Pesaresi y Díaz & Musich— y
las otras dos dicen cosas distintas: cada una le da la razón a Honorio en un
punto y se la quita en el otro.

| | 40 % sobre la escala entera | −10 % deja 45 % |
|---|---|---|
| Rodríguez Saiach, Kunzmann y Nigro | coincide | contradice: dice 40 % |
| Beade | contradice: «sobre lo anterior» | coincide |

**Ningún número se tocó**, y los dos motivos son de texto:

- **El 40 % va sobre la escala del art. 21**, porque el artículo dice «de la
  escala del citado artículo» y el citado es el 21. La cuenta cierra sola:
  50 % + 40 % = 90 %, o sea el 100 % menos el 10 % del propio artículo.
- **Sin excepciones queda 45 %** (`factorEscala 0,5 × factorFinal 0,9`), porque
  el artículo manda reducir un 10 % *«del que correspondiere regular»* y lo que
  correspondía ya era la mitad. El art. 34 tiene la fórmula idéntica.

**El primero se declara abierto en pantalla**, con las dos lecturas y sus
libros, en `ART41_POSTERIORES`. **El segundo no**: ahí la única voz en contra es
Rodríguez Saiach, Beade coincide con la app, y la pantalla ya dice cuánto
reduce y por qué. Si aparece un fallo o un tercer libro, entra al criterio.

**Un dato para pesar a Beade en este punto**, y no es un ataque al autor: en el
mismo ejemplo calcula el máximo como el 15 % del total de la base e ignora el
factor de correlación del art. 21 —el criterio que la propia app funda con
`RINDEL` y con Díaz & Musich—. Su punto de partida arranca corrido un 5,4 %.

### Lo que la app declara abierto porque no hay nada detrás

No son deudas: son huecos de criterio dichos como lo que son, en pantalla. Si
alguno consigue jurisprudencia, entra a `jurisprudencia.ts`.

- Las **dos lecturas de los arts. 60 y 61** (pisos de peritos).
- El **«completo»** cuando el proceso terminó antes de la apertura a prueba: el
  art. 25 ya le aplicó la mitad de la escala, pero tampoco es la suma de tres
  etapas que ocurrieron. Es una pregunta jurídica, no de código.
- El **art. 61 bis contra el 5 %-10 % del art. 21**, que no fue derogado. Hasta
  que haya jurisprudencia, conviven.

### Pendiente con fecha: el certificado, hacia mediados de noviembre de 2026

**Es lo único que puede romper el sitio, y llega solo.** El certificado de
GitHub Pages es de Let's Encrypt, dura 90 días y se renueva solo unas semanas
antes; para renovarlo Let's Encrypt tiene que llegar al origen, que desde el
13/8 está detrás del proxy de Cloudflare.

Suele funcionar igual. Si no: el navegador avisa que venció, o GitHub deja de
mostrarlo como emitido. **Son dos minutos:**

1. Cloudflare → DNS → los cuatro registros A y el CNAME de `www` a **DNS only**
   (nube gris).
2. Esperar a que GitHub renueve; el estado se ve en
   `github.com/javiercuneo/honorio` → *Settings* → *Pages*.
3. Volver a **Proxied** (naranja).

**Cómo adelantarse:** mirar la fecha del certificado en *Settings → Pages*
alrededor del **10 de noviembre de 2026**. Si está emitido y vigente, no hay
nada que hacer hasta febrero. La medición se corta mientras la nube esté gris:
son unas horas y no importa.

### Deudas anotadas a propósito

- **El UHOM entra sin procedencia.** La planilla trae el número pero no su
  norma —la fila `Acordada` describe la UMA—. Mientras no existan las filas
  `UHOM_FUENTE` y `UHOM_URL`, cada valor nuevo entra sin cita y el script avisa;
  el de agosto está cargado a mano.
- **`lib/compartir.ts` no tiene validación permanente.** Se probó con trece
  casos contra los módulos reales, pero `scripts/validate.mjs` corre
  `lib/legal/__tests__/*.validation.ts` y meter ahí algo que no es el motor
  diluiría lo que significa «las 17 validaciones del motor». Si el módulo crece,
  merece su propio corredor.
- **No se guarda desde cuándo rige la UMA.** Decisión de Javier del 5/8: el dato
  no está en su planilla y levantarlo le agrega fricción diaria. El informe cita
  la norma, no su vigencia. Es el dato que faltaría para calcular con la UMA
  vigente a una fecha anterior.

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
  son todos iguales. `tipoProceso` y `objeto` traen un `full` con la cadena que
  `StepShell` reconoce como vacía: el `Disclosure` no se muestra y el daño es
  que esos dos pasos no tienen fundamento. **`desalojoVivienda` y
  `posesoriasTipo` son peores**: su `full` dice «Complete el tipo de desalojo
  para continuar», que no es la cadena reconocida, así que el `Disclosure`
  **sí** se abre y muestra esa frase en serif —la tipografía que en toda la app
  significa «esto es el texto de la ley»—. Cuesta poco y conviene arreglarlo.
- El resto está en [ROADMAP](ROADMAP.md).

---

## Bugs conocidos

**Ninguno abierto.** Los que hubo están en
[`HISTORIA.md`](HISTORIA.md#trampas-que-dejaron-de-serlo), con qué los cubre hoy.

### Lo que las 17 validaciones no cubren

**Las validaciones comparan números, así que un texto que promete un porcentaje
puede mentir con todas en verde.** Pasó dos veces en dos días —los rótulos de
los pasos el 5/8, las descripciones de la cautelar el 6/8— y una tercera el
19/8, con un criterio de abogados puesto en la sección de auxiliares. **Ninguna
de las 17 mira qué dice un rótulo ni dónde está puesto un párrafo.**

No hace falta automatizarlo todavía, pero sí saber dónde mirar: los
`description` y `hint` de las `CardOption` de `wizard-schema.ts`, los `motivo`
de `format.ts` y los `explicacion.expanded` de cada paso. **Cada vez que uno de
esos strings nombra un porcentaje o un artículo, hay que leerlo contra
`resolveReglas()` y contra la ley**, porque nada más lo va a hacer.

---

## Lo que gobierna cada módulo

Invariantes vivos. El relato de dónde salió cada uno está en `HISTORIA.md`; acá
está la regla y su razón, que es lo que hay que saber antes de tocar el archivo.

### El cálculo directo

- **«Sin reducciones» no es un caso, es la ausencia de caso.** No arma un
  `WizardState` con respuestas por defecto para llamar a `buildGeneral()`: cada
  respuesta por defecto es una afirmación jurídica —«sentencia admitida»
  sostiene que la demanda prosperó— y una regla nueva que dependiera de una de
  ellas se aplicaría en silencio. Compone las funciones puras de `calculate.ts`
  y no tiene aritmética propia.
- **Cuenta etapas, no fracciones.** `EtapasRol` es `tres`, `dos`, `una`, que es
  la formulación del art. 29.
- **`fraccionDeRango()` no es el reparto entre dos profesionales.** Toma una
  sola porción —un profesional se lleva el 30 % de una etapa porque hizo el
  30 % del trabajo— y el resto no es de nadie. **Dan el mismo número y
  significan distinto.**
- **La base no se redondea en UMA**, ni cerca de los bordes de tramo. La
  validación comprueba que 15,4 UMA no se trate como 15 en los seis cortes.
- **La unidad principal de esa pantalla es la UMA**, con el peso al lado. El
  dashboard lidera con pesos. Son dos públicos distintos y está invertido a
  propósito.
- **No espera al motor legacy** y no toca `public/legacy/`.

### Mediación

- **`calcularMediacion()` recibe el `ValorUHOM` entero, no el número.** Con dos
  `number` nada impediría pasarle la UMA: son $102.076 donde van $12.960, un
  factor de ocho sin ningún error visible. El campo `unidad` existe para eso.
- **La base del mediador es la del expediente**, con los arts. 22 y 40 ya
  aplicados. Es una interpretación fundada —CNCiv. Sala K y el plenario
  `Murguía`— y su consecuencia práctica es **cero preguntas nuevas en la
  entrevista**.
- **En el cálculo directo va sin jurisprudencia**, y no es un olvido: ahí no se
  aplica ninguna reducción, así que la discusión no se plantea.
- **El tope de 120 UHOM es del ítem G**, no de la escala. Ninguna validación
  numérica lo cazaría: es un error de rótulo. La calculadora vieja lo dice mal.
- **Los ítems H, I y el familiar quedan afuera por construcción**, no por
  decisión: `baseValor` es un `number` y `ObjetoBase` no tiene opción sin monto.
- **La escala es del art. 2° del ANEXO III del Decreto 1467/2011**, sustituido
  por el **art. 5° del Decreto 2536/2015 (B.O. 30/11/2015)**. El año es 2015 y
  no 2011.

### La regulación en prosa

- **El punto dentro de la banda entra por parámetro y no tiene valor por
  defecto.** Elegir adentro de la banda es el acto jurisdiccional; un default en
  el medio sería una decisión jurisdiccional disfrazada de conveniencia.
- **`bandasDe()` deriva las bandas del resultado, no de una lista escrita a
  mano.** Agregar una regla al motor no se puede olvidar en la prosa.
- **Los artículos del encabezado salen de las `transformaciones` que el motor
  emitió.** Si una sección no tiene ninguna, no lleva artículo: no se completa
  por lo que «debería» corresponder.
- **Los tres controles.** (1) Ningún número inventado: `verificarNumeros()`
  comprueba que cada importe del texto esté en el `CalculoResultado`. (2) El
  texto congelado: si falla no significa que algo esté mal, significa que la
  redacción cambió — **leer el diff antes de actualizar la constante**. (3) La
  banda se respeta: un punto afuera no se redacta.
- **El lector de números lee sólo lo que lleva dos decimales.** Es una regla de
  formato y no de magnitud, y por eso `Decreto 2536` no se confunde con un
  importe. Hay un control que comprueba las dos mitades.
- **Los comentarios de `lib/legal/` van sin tildes y todo lo que el usuario lee,
  con.** Una resolución sin acentos no se puede pegar en un expediente, y hay
  una validación que lo comprueba palabra por palabra.
- **Lo que el generador no escribe está validado**: la narración del expediente
  —ni siquiera como hueco—, la ley aplicable por etapa y la notificación,
  elevación y apertura de cuenta en el BNA. Si alguna vuelve, tiene que ser a
  propósito y con el control en rojo.

### Compartir un cálculo

- **El caso viaja en el fragmento (`#`), no en la query.** El fragmento no se
  envía al servidor: por eso compartir no contradice el «nada de lo que escribís
  sale del navegador». En la query la misma función rompería la promesa y nadie
  lo notaría leyendo el código. **Es la decisión que no se puede deshacer.**
- **El formato lleva versión (`c1`).** Si cambia la codificación, el número
  sube: un enlace que abre torcido es peor que uno que no abre.
- **La UMA de un caso restaurado es la del enlace.** `restauradoRef` apaga el
  efecto que la sincroniza; sin eso el mismo enlace daría otro número el día que
  la UMA cambie. Al reiniciar vuelve la vigente.
- **Las respuestas de afuera entran por la misma puerta que las tipeadas:**
  `decodificarCaso` descarta lo que el schema no pregunta y `restore()` corre
  `podarInalcanzables`.
- **Se escucha `hashchange` además del montaje**, porque cambiar sólo el
  fragmento no recarga la página — es el caso real de pegar un enlace teniendo
  Honorio ya abierto. Y el dashboard espera al motor legacy también cuando se
  entra directo, sin pasar por la entrevista.

### Jurisprudencia y criterios adoptados

- **Una interpretación se funda en un fallo o no se afirma.** Los ocho criterios
  de `jurisprudencia.ts` la cumplen.
- **`Doctrina` es un tipo aparte de `Fallo`, y la pantalla los separa.** Un
  fallo dice lo que un tribunal resolvió; un autor dice lo que le parece.
- **`fallos: []` es un estado válido y se declara.** Donde no hay ninguno, la
  pantalla dice «Sin jurisprudencia cargada: lo que sigue es doctrina».
- **`escala-art25` no lleva criterio y no es un olvido.** El motor emite ese id
  también para los modos anormales, donde no hay nada que interpretar. Está
  escrito arriba de `REGLA_LABEL`.
- **No se carga una lista de salas por corriente.** La Sala I aplicó el art. 25
  en 2019 y el art. 22 en 2026: una lista envejece sola y sugiere un reparto
  estable que no existe.
- **Los mínimos del art. 58 son un criterio de abogados**, y por eso van pegados
  a las fracciones del art. 29 y no a la sección de auxiliares: **el perito no
  divide su labor en etapas** —o completa la pericia, o su honorario sale por el
  art. 25 o por el ¼ de UMA del art. 61 bis—.
- **Las citas viven en `jurisprudencia.ts` y de ahí salen las dos formas:**
  `citaDe()` corta y entre paréntesis para la prosa, la carátula entera para la
  pantalla. Ninguna cita se escribe a mano en otro archivo.
- **El bloque de fundamento es la primitiva `Fundamento`**, en
  `primitives.tsx`. Estuvo escrito dos veces y ya habían divergido.
- **`Criterio.contraria` muestra la lectura que la app descarta**, con sus
  fuentes o con la falta de ellas. Un criterio mostrado solo se lee como si
  fuera el único posible. La del art. 21 va sin ninguna, y la pantalla dice que
  no se encontró quién la sostenga por escrito.

### Los pisos de los auxiliares

- **La ley separa por sujeto, no por tipo de juicio.** Está escrito arriba de
  `MINIMOS_AUXILIARES_JUSTICIA` y es la única forma de leer los pisos sin
  mezclarlos:

  | | Peritos y liquidadores de averías | Demás auxiliares |
  |---|---|---|
  | Sin monto | art. 60 — 2 UMA | normas específicas |
  | Con monto | art. 61 — 2 UMA | normas específicas; a falta de ellas, art. 58 — 4 UMA |

  El 61 **no** desplaza al 58: no hablan del mismo sujeto.
- **Un piso se aplica, salvo que una norma autorice perforarlo.** Ésta es la
  regla, y hasta el 21/8/2026 estaba escrita como *«los pisos se muestran, no se
  aplican»*, que se leía como una prohibición general y no lo es. **La excepción
  es la de los auxiliares y tiene su cita**: el art. 21 extiende sus normas a los
  peritos *salvo lo dispuesto en el art. 478 CPCCN*, que manda adecuarlos *«por
  debajo de sus topes mínimos inclusive»*. Ahí automatizar el piso sería decidir
  por el juez, así que se muestran los dos números, con una insignia cuando el
  5 % queda por debajo.
- **Donde no hay art. 478, el piso es piso.** Las 3 UMA del art. 50 inc. a) —«no
  podrán ser inferiores a»— no tienen norma que autorice perforarlas, y el motor
  las aplica como mínimo duro: la prosa rechaza un punto por debajo. No es una
  excepción a la regla de arriba, es la misma regla sobre otros hechos. La regla
  nunca fue «no topear»: fue **no decidir lo que la ley le deja al juez**.
- **El ¼ de UMA del art. 61 bis no es un piso.** El tercer párrafo dice *«se le
  regulará»*. Vive en `SIN_PERICIA_ART61BIS`, fuera de
  `PISOS_AUXILIARES_CON_BASE`, y hay una validación que falla si vuelve a
  aparecer entre los pisos.
- **Los pisos se derivan de `MINIMOS_AUXILIARES_JUSTICIA`, no se reescriben.** Y
  si alguien renombra un grupo, la derivación devuelve una lista más corta **sin
  que falle nada**: para eso está `minimosAuxiliares.validation.ts`.
- **`pisoDe('Art. 61')` también matchea «Art. 61 bis»**, así que los prefijos
  llevan los dos puntos.
- **La banda del 5 %-10 % del art. 21 alcanza a todos los auxiliares.** La
  distinción por sujeto es sólo de los pisos: la banda produce el número, el
  piso es un mínimo absoluto debajo de él. No confundir los dos planos.

### El exhorto del art. 50

- **La entrevista pregunta el inciso, y el motor devuelve uno solo.** Antes
  devolvía los tres a la vez, que es una tabla y no una respuesta: `bandasDe()`
  emitía dos bandas —el b) y el c)— para un mismo exhorto, así que el texto
  regulaba el mismo acto dos veces por dos incisos distintos, y el a), que no
  tiene banda cerrada, no se podía redactar nunca.
- **El inciso a) es un piso con el techo abierto, y los otros dos son bandas
  cerradas.** Por eso `ExhortoResultado` trae `piso` **o** `banda` y nunca los
  dos: el a) no es un `Rango` con el máximo en infinito. `BandaRegulable.techoAbierto`
  existe para eso y **es el único caso hasta hoy**.
- **Al inciso a) la app no le pone techo.** Muestra el que el sistema sugiere
  —10-20 del b), 7-30 del c), 10 UMA del art. 58 inc. a) por un conocimiento
  entero— como `EXHORTO_INCISO_A_TECHO`, una pauta de lectura que el motor no
  aplica. La contraria es la de Pesaresi (3 UMA por cada acto) y **le falta la
  página de la cita**.
- **El art. 50 no tiene base regulatoria.** El monto del juicio exhortante entra
  como `exhortoMonto`, no como `baseValor`, y eso no es un capricho de nombres:
  por `baseValor` cualquier regla que mire la base lo tomaría por lo que no es.
  `baseOriginal` y `baseFinal` quedan en cero **a propósito**.
- **El monto es pauta indiciaria y el honorario es a cuenta.** Las dos salas que
  trataron el punto coinciden en eso aunque se separen en todo lo demás; está en
  `EXHORTO_MONTO_PAUTA` con los tres textos que lo sostienen —ley 22.172 arts. 3°
  inc. 2 y 12, y art. 50 inc. b) in fine—.
- **Abogados y auxiliares no se rigen por lo mismo, y es una decisión declarada.**
  El art. 50 fija cantidades en UMA para abogados y procuradores; al auxiliar
  sólo lo nombra para mandar establecer su base regulatoria. Por eso la banda del
  inciso **no lo topea**: Sala C reguló 53,10 UMA en un inciso c) cuyo techo es
  30, fundando en los arts. 16, 21 y 61 y sin citar el art. 50. La lectura
  contraria de Sala J va entera dentro de `EXHORTO_AUXILIARES`, con sus cuatro
  sentencias.
- **La oración sobre auxiliares está escrita en el inciso b) y rige los tres.** Es
  una incoherencia del texto: en los actos del b) no interviene ningún perito
  —hay oficial de justicia, escribano o martillero con comisión—, y el auxiliar
  aparece en el c). `EXHORTO_INCISOS.admiteAuxiliares` sale de leer los actos uno
  por uno, y la pantalla lo explica en vez de dejarlo raro.
- **Hasta el 21/8/2026 la app transcribía un art. 50 incompleto.** Faltaba
  justamente esa oración, en `ExhortoResult.tsx` y en `render-legacy.ts`, y no
  estaba en ningún archivo del repositorio. Los dos únicos textos que nombran a
  los auxiliares en el exhorto son ése y el último párrafo del art. 10.
- **La cantidad de actos del inciso a) no multiplica nada.** Se pregunta, viaja en
  `cantidadActos` y sale en la prosa como hecho declarado, para que la resolución
  pueda decir por qué el número está arriba del piso.
- **El «a cuenta» no se escribe en la resolución.** Sala C dice que los honorarios
  del exhorto son *«a cuenta de los que en definitiva se determinen»*, y es una
  lectura razonable **de su caso**: hay exhortos que se agotan en sí mismos.
  Ponerla en cada texto sería forzar esa interpretación en boca de quien regula.
  Vive en el «por qué», con el fallo que la sostiene.
- **La pantalla del exhorto no lleva prosa entre las cifras.** Llegó a tener seis
  párrafos explicativos intercalados y había que leer para encontrar los números.
  La regla es la del repositorio —**los números no se ocultan y las explicaciones
  sí**—, y el único modo de esconder que la app tiene es el `Disclosure`.
- **Abierto: no se buscó un fallo donde el honorario de un abogado exceda la banda
  del inciso.** Que las escalas de los incisos b) y c) obliguen en los dos
  extremos es lo que dice el texto, pero para los auxiliares ya se encontró una
  sentencia que la supera —Sala C, 53,10 UMA sobre un techo de 30—. Si aparece
  una equivalente para abogados, la banda cerrada deja de ser una lectura pacífica
  y `EXHORTO_INCISOS` pasa a necesitar su propio criterio.

### La referencia, que es la tercera clase de número

- **La app tiene tres clases de número y sólo dos tenían nombre.** Lo que el
  motor calcula; la banda dentro de la cual se elige; y **un número de otro
  cálculo, mostrado para orientar y que no se regula**. Los pisos de los
  auxiliares ya eran eso, y el tope de la mediación también.
- **La distinción se marca con una etiqueta, no con un recuadro.** El 21/8 se
  probó una primitiva `Referencia` —caja punteada, rótulo «no se regula», línea
  de origen obligatoria— y **se quitó el mismo día**: en una tarjeta que ya tenía
  seis párrafos de prosa, agregaba ruido en lugar de quitarlo. Lo que quedó es el
  `articulo` del `LedgerRow` diciendo «pauta, no base». Si algún día hay tres o
  cuatro usos, la primitiva vuelve a tener sentido; con uno solo no lo tenía.
- **Una referencia nunca se topea.** Recortar la escala del art. 21 a la banda
  del inciso borraría lo único que informa, que es el tamaño del pleito: 10 UMA y
  20.000 UMA se verían iguales. Lo que sí se topea es **la elección**, y sólo
  donde la ley puso un techo.
- **La escala del art. 21 va plegada, con el fallo en contra.** Sala J la declara
  inaplicable al exhorto y lo reitera en cuatro sentencias; Sala C la aplica. La
  app no elige en silencio: muestra las dos.
- **Las pautas del art. 16 no entran a ningún cálculo.** Son subjetivas y Honorio
  responde en matemática. El uso que sí califica es citarlas en la prosa, nunca
  computarlas.

### Las dos reglas de escala que no son la del art. 21

- **Actuaciones posteriores a la ejecución (art. 41, última oración): el 40 % es
  de la escala entera**, no de la ya partida al medio. Las posteriores son 0,8
  del honorario de la ejecución, y la validación lo comprueba con esa relación.
  **No se le aplica el −10 %** por no haber excepciones: es un criterio
  declarado, en pantalla y en el código. Si la lectura correcta fuera la otra,
  el cambio es multiplicar por `factorFinal` en el llamador.
- **Modificación de alimentos (art. 39, 2° párrafo): va por la escala de los
  incidentes**, que es el mismo 2 %-20 % del art. 33 de la Ley 21.839 —el
  art. 47 de la 27.423 quedó observado—. Es **un solo criterio aplicado en dos
  lugares**, y `alimentosArt39.validation.ts` comprueba que los dos números
  coincidan: si divergen, tiene que ser a propósito.
- **`EscalaAplicada.regimen` existe porque el rango de incidentes es plano.** No
  hay escalera, así que la tabla de tramos y la barra del excedente no
  significan nada; cuando el régimen es `incidentes` se muestra un «por qué» que
  dice por qué la tabla no corresponde.
- **Un campo nuevo del wizard toca seis lugares** y el typecheck sólo agarra
  tres: `WizardState` en `types.ts`, el reset de `adapters.ts`, el `MAPPING` y
  el `transformToLegacy` de `hooks/useWizard.ts`, **los mismos dos duplicados**
  en `retroceso.validation.ts` —que los copia a propósito, para validar el flujo
  real— y `PROCESS_STEP_MAP` más `ALL_STEPS` en el schema.

### La UMA y el UHOM

- **La UMA sale de `data/uma.json`, que lee el build y no el visitante.**
  `scripts/actualizar-uma.mjs` la baja de la planilla, la compara y agrega una
  entrada si cambió; un cron **diario** (`.github/workflows/uma.yml`) lo corre y
  el push dispara el deploy.
- **Para forzarlo sin esperar al cron:** Actions → «UMA y UHOM» →
  *Run workflow*. Es el camino cuando la UMA se movió y hay que publicar hoy.
- **Un control diario comprueba que el sitio calcule con el valor de la
  planilla** (`scripts/verificar-publicado.mjs`,
  `.github/workflows/verificar-uma.yml`, `npm run verificar`). Corre a las 11,
  tres horas después de la sincronización, y **si no coinciden falla**: el mail
  de workflow fallido de GitHub es el aviso.
  - **Mira lo servido, no el repositorio.** Comparar `data/uma.json` contra la
    planilla sería preguntarle a la sincronización si sincronizó: lo escribe el
    mismo script leyendo la misma planilla, así que coinciden por construcción,
    y si no corrió tampoco corre el control. De punta a punta caza los cuatro
    casos con una comparación —el cron no corrió, se plantó en un control, el
    deploy falló, o lo servido quedó viejo—.
  - **Por eso el sitio publica `honorio.ar/uma.json`** y `uhom.json`: copias que
    genera `prebuild` desde `data/`, gitignoreadas. Sin eso el único lugar donde
    vive el número publicado es adentro de un chunk con nombre con hash, y
    pescarlo con un grep es una heurística que un día empieza a decir «todo
    bien» sin haber mirado nada.
  - **La cita no lo pone en rojo, sólo el número.** Un valor equivocado le
    arruina la regulación a alguien; una fuente vieja se corrige en la corrida
    siguiente. Si el rojo significara las dos cosas dejaría de significar la
    primera.
  - **No arregla nada, avisa.** Si la sincronización no corrió hay una razón, y
    volver a dispararla a ciegas es como se pierde el próximo caso de «el
    script se plantó porque el número venía mal».
- **El lector de la planilla es `scripts/planilla.mjs`,** compartido por el que
  sincroniza y el que controla. **El control no puede tener su propio lector:**
  si los dos interpretaran el CSV distinto, se equivocarían juntos y el control
  daría verde justo cuando no. Era la tercera copia de `parseImporte`.
- **La planilla es la superficie de edición y eso era el requisito.** Javier la
  actualiza todos los días para su trabajo; cualquier alternativa que le pidiera
  un segundo acto de actualización se iba a pudrir.
- **El formato de la planilla es `clave,valor` por fila** y el script la lee como
  diccionario: agregar una fila o cambiarlas de orden no puede romper el número.
- **La URL de la norma va en una fila propia** (`URL`), porque **el hipervínculo
  de una celda no viaja** en un CSV publicado.
- **La procedencia sólo se completa, nunca se borra.** Que la planilla no diga
  nada no es que diga que no hay norma. Y se completa aunque el valor no cambie
  —pero **nunca el valor**: completar el registro no es reescribir historia—.
- **`public/legacy/core.js` conserva su `cargarUMA()` y no se toca.** Es copia
  del asistente clásico, que se mantiene en el otro repositorio y todavía la
  usa. Simplemente no se la llama: `adapters.setUMA()` pisa `window.valorUMA`.
- **El UHOM no se comporta como la UMA.** Se mueve todos los meses y es
  derivado: **UR-SINEP × 12, redondeado a la decena próxima superior**. De ahí
  que el script tenga umbral propio (15 % y no 60 %) y un control de forma que
  la UMA no puede tener: el valor siempre termina en cero.

### El campo numérico de la base

- **El último separador con una o dos cifras detrás es el decimal; cualquier
  otro separa miles.** Entran las dos convenciones. La regla está escrita en
  `numeric-field.tsx`.
- **El script de la UMA usa la misma función, copiada a mano** porque es `.mjs`
  y no puede importar TS. **Si una cambia, la otra también**: mostrar un número
  y calcular con otro es el peor resultado posible acá.
- **Invariante: el valor que se ve y el valor que entra al motor no se pueden
  separar.** Se confirma en `onChange`, no en `onBlur`. Si algún día se agrega
  otro campo de entrada, va igual.

### El informe imprimible y la firma

- **Es CSS de impresión, no PDF armado.** Se descartó la librería: sería una
  segunda maqueta que se desvía de la primera sin que nadie se entere hasta que
  alguien imprime algo mal. El costo aceptado es el encabezado del navegador y
  cuidar los saltos a mano (`break-inside: avoid` en `section` y en
  `[data-ledger-row]`).
- **Un `<details>` cerrado no imprime su contenido.** Se abren o se cierran
  todos en `beforeprint` y se restaura el estado exacto en `afterprint`, **al
  evento y no al botón**, porque `Ctrl+P` tiene que dar el mismo informe. De ahí
  también que agregar desplegables no engorde el informe desnudo.
- **La fecha se resuelve después del montaje**, a propósito: el sitio es un
  export estático y en el HTML sería la fecha del build.
- **La firma va sin matrícula.** Javier es abogado no matriculado y trabaja en
  el Poder Judicial; el rol dice «autor de Honorio», que es lo exacto.

### La pantalla en el teléfono

- **`LedgerRow` y `Disclosure` envuelven:** `flex-wrap` más `justify-end`, y
  `min-w-0` en el concepto. El valor lleva `whitespace-nowrap` porque partir una
  cifra al medio es peor que cualquier alternativa. `justify-end` no hace nada
  en la primera línea y alinea la segunda, que es donde cae el valor: por eso en
  pantalla grande no cambió un pixel.
- **`PlegadoEnCelular` pliega el contenido, no la existencia.** El título de la
  sección queda siempre a la vista. Estado inicial cerrado y `md:block` lo pisa
  en pantalla grande: **nada de `matchMedia` en un efecto**, que abriría y
  cerraría el bloque a la vista y discreparía con el prerender al hidratar.
- **El tamaño de letra no se toca.** Queda chico en el teléfono y es cierto,
  pero la escala tipográfica es del sistema visual entero: es una decisión de
  Javier, no un arreglo de responsive.

---

## Decisiones vigentes

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

### Las tres zonas del dashboard

Salió de la devolución de SG del 21/8/2026 —«me costó leer los datos»— y de
medir la pantalla: **28 importes, de los que cinco eran la respuesta.** Lo que
lo causaba no eran las explicaciones, que ella elogió, sino que primera y
segunda instancia estuvieran separadas por ocho importes de herramientas, que
tres secciones se dibujaran idénticas entre sí, y que la cifra de primera
volviera a aparecer *después* de la segunda.

**El orden es el invariante**, y está escrito arriba de `DashboardGeneral`:

1. **Lo que se vino a buscar.** El honorario del profesional que se consulta:
   primera instancia, segunda, actuaciones posteriores. Después, plegadas, las
   herramientas que lo reparten.
2. **El honorario de otro.** Auxiliares, mediador, partidor, detrás de un corte
   con su rótulo. Auxiliares y mediador van a la par —comparten que se calculan
   sobre la base y no sobre el honorario del abogado— con `items-start`, para
   que abrir un «por qué» de uno no estire la columna del otro.
3. **Cómo se llegó.** La escala, la cadena y el caso.

- **Plegar una herramienta no es ocultar un número, y la regla no cambió.** La
  regla protege **el número**, no cada forma de derivarlo: «por etapas» y «el
  reparto entre dos» muestran el mismo honorario del patrocinante de otra
  manera. El precedente es el apoderado y el procurador, **literalmente ocultos
  detrás del selector de rol** desde siempre. Leída tan literal, la regla haría
  ilegal ese selector. Es una corrección de Javier del 24/8.
- **`SeccionPlegable` no dice «por qué», y no puede.** El «por qué» es un signo
  único de la app y usarlo para plegar una sección entera sería inventar una
  variante. Dice «Ver» / «Ocultar».
- **Va en `<details>` y no en estado de React**, para que el interruptor
  «incluir los fundamentos» del imprimible lo gobierne. Con `useState` el
  informe saldría con lo que el lector hubiera abierto al leer, que es el bug
  que `imprimir.tsx` existe para evitar.
- **La tabla de tramos y la barra del excedente estaban fuera de todo
  desplegable**, así que se imprimían siempre y el interruptor no las tocaba.
  Al bajar a la zona 3 quedaron adentro, y ahora sí las gobierna.
- **El sujeto del honorario es un cuarto eje de color y no se confunde con los
  tres del cálculo.** Los tres ejes dicen *qué parte de la cuenta* toca una
  regla; el sujeto dice *a quién* se le regula. `propio` reusa cobalto —que ya
  era `primary`— y `otro` es grafito: **no entró ningún color nuevo**. El verde
  sigue siendo el ajuste por rol del art. 20 y no se tocó.
- **Los pisos de auxiliares y el ítem G del mediador viven adentro de su «por
  qué».** Son referencias, la tercera clase de número. **La insignia de «el 5 %
  queda por debajo» queda afuera del pliegue**: es la única razón por la que los
  dos números conviven en pantalla, así que verla no puede depender de abrir
  nada.
- **El caso es pie y no parte de la cadena.** Es lo que contestaste, no un
  fundamento, y va sin borde propio porque `ChipsCaso` ya trae el suyo.
- **La prosa cierra la zona 1**, no la página: es un resultado —la tercera forma
  de la misma salida— y no una explicación.
- **Se quitó el realce del «Revocada · 40 %».** Con la sección ya marcada por
  sujeto, ese `destacado` competía con la marca. Dos jerarquías encimadas no son
  una jerarquía.
- **`Disclosure` envuelve sólo cuando hay un valor.** El `flex-wrap` estaba
  siempre, y sin valor hacía caer la etiqueta «por qué» sola a la segunda línea,
  alineada a la derecha: se leía como una tabulación caprichosa. **Sólo se ve a
  partir de 1024 px**, que es donde auxiliares y mediador pasan a dos columnas y
  el ancho se parte al medio; en una sola columna nunca aparece. Sin valor va
  `flex-nowrap` y el concepto se achica —para eso tiene `min-w-0`— y envuelve
  como texto.
- **Un corte de zona encabeza un grupo, no un solo elemento.** La zona 2 lleva
  el suyo porque agrupa auxiliares, mediador y partidor. La zona 3 no lleva:
  tiene un único pliegue que ya se nombra solo, y el corte repetía esa frase una
  línea más arriba. Por lo mismo el pliegue **no** se llama «cómo se llegó a
  este número»: `CadenaCalculo` ya se titula así adentro.
- **La prosa no lleva marca de sujeto y va después de las dos zonas.** El texto
  lleva una línea por profesional —incluidos peritos y mediador—, así que no es
  de un sujeto: las redacta a las dos. Lleva una línea arriba que cierra la zona
  de los otros intervinientes; sin ella se leía como una sección más de esa
  zona.
- **Los encabezados de sección salen todos de `EncabezadoSeccion`.** Estaban los
  cinco escritos a mano y ya habían divergido en separaciones. `ProsaSection`
  era el más distinto y por eso era el único sin separación visible.
- **El mediador no anuncia «si hubo mediación previa».** Es una condición obvia
  —equivale a aclarar «si se designaron peritos» arriba de los auxiliares— y la
  insignia envolvía a una segunda línea, que desalineaba la sección de la de al
  lado. Decisión de Javier del 24/8.
- **El cálculo directo sigue el mismo orden y no pliega nada.** Su segunda
  instancia quedaba última, después de auxiliares y mediador, y eso no era una
  decisión: era el orden en que se fue escribiendo. Pero ahí la herramienta de
  etapas y fracción **es** la pantalla, y su balance es otro a propósito: filas
  en vez de recuadros, los tres roles juntos, y la UMA como unidad principal.

### Las tres reglas que gobiernan el contenido

1. **Toda la información importante debe estar.** Es software didáctico y
   deliberadamente transparente, no una caja negra.
2. **Pero solo se le muestra a quien quiere entender.** De ahí:

   > **Los números no se ocultan nunca; las frases, siempre.**

   Un número es una decisión (el efectivo, el piso, la quita): se ve. Una frase
   es un fundamento (la norma, el criterio): va detrás de un `Disclosure`.
3. **En el dashboard va lo que solo se puede decir al lado de este número.** Lo
   que describe la herramienta es documentación, y va a `documentacion.html` del
   sitio de herramientas. La regla salió de que el informe fundado llegara a
   diez hojas, y vale para las secciones que vengan.

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
- **Segunda instancia no es un colapsable**: la van a consumir mucho quienes
  revisan regulaciones en cámara. Desde el 24/8 tampoco es una sección *par*:
  es **subordinada** —entra 56 px y la cifra baja un escalón—, pero sigue
  siempre a la vista y lleva el mismo cobalto, porque es el mismo sujeto.
- **No numerar los ejes.** "Eje 1 / 01" es una convención nuestra, no de la ley.
- **No hay honorario promedio.** El punto medio no lo señala nada de la 27.423,
  sería la única cifra en pantalla sin un artículo al lado y por su forma («el
  justo medio») se citaría como «lo que corresponde».
- **Si no hubo reducción, no se imprime el total de ese eje.** Los tres ejes
  siguen apareciendo —se ve que se consideraron— pero ninguna cifra se repite
  sin agregar algo.

### «Los cálculos no usan IA» va en la portada y en las tres pantallas de resultado

Es la **excepción declarada** a la regla de no agregar información: la objeción
no bloquea una parte de la herramienta, bloquea el uso entero. Salió de una
usuaria real que usa Honorio y **no lo puede decir en su juzgado**, porque su
jefa no distingue entre *construido con asistencia de un modelo* y *calcula con
un modelo*. Eso no se arregla difundiendo más: se arregla dándole una frase para
señalar.

Está en la portada **y** en el dashboard, el cálculo directo y los mínimos,
porque la objeción no aparece al entrar sino **mirando el número**. Vive en
`SinIA`, en `primitives.tsx`, y **no se imprime**: en un expediente importa de
qué se calculó y con qué versión —eso lo hace la firma—, no de qué no.

El desarrollo, que es lo que la hace verificable, está en «Información
adicional»: funciones deterministas, 17 suites de validación, y si alguna falla
el sitio no se publica.

**Y si vas a contar el caso del art. 22/25, copialo, no lo parafrasees.** La
versión correcta está en el README de `herramientas-judiciales`, sección «Sobre
el uso de IA», y en `index.html` del sitio. Ya se contó mal una vez: **el
criterio nunca estuvo en duda** —está resuelto desde hace seis años y el
asistente clásico ya lo distinguía—, y lo que falló fue la reescritura del
código, en una capa que no es la jurídica.

### Los tres rótulos de un paso del wizard

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

**Regla para un paso nuevo:** si es una elección, la `pregunta` se escribe como
pregunta. Los dos pasos de entrada numérica —`demas` (UMA) y `base`— son la
excepción y llevan un sintagma, porque rotulan un campo y no preguntan nada. Y
en registro rioplatense: nada de «Seleccione…» ni «Especifique…».

### `ayuda` y `explicacion` pueden derivarse de las respuestas

`Derivable<T>` en `wizard-schema.ts`, con `ayudaDe()` y `explicacionDe()` como
única forma de leerlos: la presentación pide el texto para las respuestas que
tiene y no sabe si el schema lo traía fijo o lo derivó. Es el mismo mecanismo de
las `condition`.

Las **24 ramas** del paso `base` viven en `lib/wizard/indicacion-base.ts`, aparte
del schema porque son unas 250 líneas de texto legal. Cada una reparte el
contenido en los tres lugares que la app ya tiene: la instrucción práctica en el
`ayuda`, el criterio en el `expanded` y el texto del artículo, verbatim, en el
`full`.

**El aviso de «no descuentes la reducción» sale sólo cuando alguna quita de base
rige de verdad.** `hayQuitaDeBase()` espeja las cuatro condiciones de
`aplicarReduccionesBase()`; repetirlo en las 24 ramas lo volvería invisible justo
donde importa.

**El litisconsorcio va detrás del «por qué», uniforme, en todo proceso salvo el
sucesorio**, y no en el `ayuda`: es una regla general del art. 21 y no de un
proceso. El sucesorio queda afuera porque tramita como jurisdicción voluntaria y
para esos el mismo art. 21 manda considerar que hay una sola parte.

### Arquitectura del rediseño

- `components/dashboard/primitives.tsx` — `Cifra`, `LedgerRow`, `Disclosure`,
  `Segmented`, `Tile`, `Prosa`, `Insignia`, `Fundamento`, `SinIA`,
  `PlegadoEnCelular`, `SeccionPlegable`, `CorteDeZona`, `EncabezadoSeccion`, y
  los mapas de color: el de los tres ejes y el del sujeto.
- `components/dashboard/HonorariosBand.tsx` exporta **tres** piezas y el orden
  lo arma el `Dashboard`: `HonorariosBand` (la cifra, sola), `RepartoSection`
  (las fracciones del art. 29 y el reparto entre dos) y `EscalaExplicacion` (el
  tramo y el excedente). Estaban las tres en un solo componente y por eso el
  orden no se podía cambiar sin partirlo.
- `components/prefs.tsx` — tema y preferencias de lectura. Persisten en
  `localStorage`. **Solo cambian cómo se escribe la cifra, nunca el cálculo.**
- `components/interview/app-topbar.tsx` — la única cabecera de la app.
- `lib/enlaces.ts` — **todas las URL absolutas hacia afuera, juntas.** El
  resto del sitio usa rutas relativas para sobrevivir a un cambio de dominio;
  estas no pueden porque cruzan de un sitio a otro, y tenerlas en un archivo
  es lo que hizo que el cambio a `javiercuneo.com.ar` fuera una sola lectura.

**Invariante importante:** el paso de la escala en la cadena se expresa
**siempre en términos del patrocinante**, y el ajuste por rol es un paso
posterior.

Los invariantes de capas —el motor no conoce React, `cadena.ts` no reimplementa
fórmulas, el alias `@/*`, los encabezados SPDX— están en
[`AGENTS.md`](../AGENTS.md) y no se repiten acá.

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
  **Consecuencia deliberada:** cambiar el tipo de proceso vacía las respuestas
  que ese proceso no comparte. Si alguna vez molesta, la salida **no** es dejar
  de podar: sería guardar las respuestas viejas en un cajón aparte, que es
  exactamente el estado oculto que causó el bug del flujo hacia atrás.
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
  Al tocar una workflow, tocar las tres: quedar desparejas es cómo vuelve el
  aviso.
- **Nunca escribir `92482` ni ningún otro valor de UMA en el código.** El
  único lugar es `data/uma.json`, y `UMA_VIGENTE` es la única forma de
  leerlo. Un valor por defecto escrito a mano es un número equivocado
  esperando el día que algo falle.

---
- **Para verificar una sección del dashboard sin recorrer la entrevista**, la
  salida es una página `app/verificar/` temporal que arma el resultado con
  `buildGeneral` y monta la sección sola. **Se borra después de verificar**, que
  es lo que la hace útil.
- **El nombre de un archivo de `docs/` no es una fuente.** `decreto 2536-11.md`
  se llama así por el decreto que modifica, no por su año, y de ahí se arrastró
  una cita equivocada a dos pantallas, un módulo, una validación y cuatro
  documentos del repositorio de herramientas.

---

## Cómo verificar un cambio

```bash
npm run check    # tipos + las 17 validaciones. Es lo que corre CI.
npm run build    # el export estatico, que es lo que se publica
npm run uma      # trae el valor de la UMA de la planilla, si cambio
npm run verificar # controla que honorio.ar calcule con el valor de la planilla
```

Qué son las validaciones y qué pasa si una falla está en
[`AGENTS.md`](../AGENTS.md).
