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
| **MAYOR** (2.0.0) | Cambia un criterio del motor y el mismo caso da un número distinto. Reforma legal, jurisprudencia que obliga a cambiar de interpretación, o un error de cálculo corregido. |
| **MENOR** (1.1.0) | Entra un tipo de proceso, una pantalla o un dato nuevo, pero los casos que ya andaban siguen dando lo mismo. |
| **PARCHE** (1.0.1) | Interfaz, redacción, rendimiento. El motor no se toca. |

Un cambio MAYOR se anota siempre con **qué caso da distinto y por qué**. Es
la entrada que alguien va a leer dentro de dos años, cuando tenga que
explicar una diferencia entre dos regulaciones.

El valor de la UMA no versiona esta app: es un dato, no un criterio. Pero sí
se versiona **él**, en `data/uma.json`, con la norma que lo fijó y la fecha
en que entró. Sin eso, «el mismo caso da otro número» tenía una explicación
posible —cambió la UMA— que no se podía comprobar.

---

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
