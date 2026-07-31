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

El valor de la UMA no versiona nada: se lee actualizado en cada cálculo y no
es un criterio, es un dato.

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
