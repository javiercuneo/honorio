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
