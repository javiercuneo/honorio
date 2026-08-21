# Roadmap

Lo que podría venir. **No es un compromiso ni un orden de trabajo**: es el
lugar donde queda anotado lo que se pensó, para no volver a pensarlo desde
cero dentro de tres meses.

Cómo usarlo:

- Escribí abajo de todo, en **Ideas sin ordenar**, en una línea y sin formato.
  Sacarlo de ahí y darle forma es trabajo de la sesión siguiente, no tuyo.
- Nada se mueve a *En estudio* sin que alguien haya mirado qué cuesta.
- Lo que se descarta **no se borra**: baja a *Descartado*, con el motivo. Un
  descarte sin motivo se vuelve a proponer solo.
- Cuando algo se hace, se va al [CHANGELOG](../CHANGELOG.md) y desaparece de
  acá. Cómo quedó y por qué, a [`HISTORIA.md`](HISTORIA.md).

---

## En estudio

### Consumo del motor desde afuera

El motor ya es una función pura sin React, sin DOM y sin estado global:

```ts
buildCalculationResult(estado) → CalculoResultado
```

Eso quiere decir que cualquier cosa que corra JavaScript puede pedirle un
cálculo, y que devuelve **la cadena de transformaciones además del número**,
que es lo que hace falta para fundar y no solo para informar.

Formas posibles, de menos a más trabajo:

| Forma | Qué habría que hacer | Para qué serviría |
|---|---|---|
| Paquete npm | Publicar `lib/legal/` como módulo con su tipado | Otra app React o Node lo importa y calcula |
| API HTTP | Una función serverless que envuelva la misma llamada | Android, iPhone, un gestor de expedientes, un sistema judicial |
| Herramienta para un modelo | Describir la entrada como esquema de tool-use | Una IA calcula bien en vez de estimar mal |
| Complemento de Word | El mismo módulo dentro de un add-in | Regular desde el documento que se está escribiendo |

Lo importante: **son la misma pieza con envoltorios distintos.** El trabajo
real no es ninguno de los cuatro, es no dejar que las reglas jurídicas se
escapen del motor hacia la interfaz. Mientras eso se sostenga, los cuatro
son baratos. El día que un cálculo viva en un componente React, los cuatro
se caen juntos.

La licencia ya no bloquea esto: `honorio/` es AGPL-3.0-or-later desde
1.0.0, que es la respuesta pensada justamente para el caso de publicar el
motor como paquete o como API. Al abrir cualquiera de las cuatro formas hay
que arrastrar el `LICENSE` y los encabezados SPDX, no solo el código.

Un matiz honesto sobre el alcance: la cláusula de red de la AGPL (art. 13)
muerde cuando alguien corre una versión modificada **en un servidor**. Como
hoy Honorio es un sitio estático y el cálculo pasa en el navegador del
lector, en ese uso el efecto principal de la AGPL es el copyleft sobre la
distribución. Donde muerde de verdad es exactamente acá: el día que el motor
esté detrás de una API.

---

## Anotado, sin estudiar

- **Briefs reales en el schema.** Varios pasos traen `brief: 'Ver más'`, que
  era el rótulo de un botón viejo. Hoy se reemplaza en presentación; el
  schema debería traer el resumen de verdad.

---

## Descartado

_(vacío)_

---

## Ideas sin ordenar

<!-- Escribí acá, una por línea. Sin formato, sin explicar. -->
