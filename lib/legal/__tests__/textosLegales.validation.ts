// ---------------------------------------------------------------
// Validacion: que un texto legal sea el texto legal.
//
// **Por que existe, y es un caso concreto.** El 9/9/2026 se encontro
// que el `textoLegal` del art. 19 en `minimos-data.ts` no era el
// art. 19: le atribuia al articulo una redaccion que no esta en la
// Ley 27.423 —"Cuando no fuere posible apreciar el valor pecuniario
// del asunto..."—, heredada del cuadro explicativo del asistente
// clasico. La pantalla de minimos la mostraba en serif, que en esta
// app significa "esto es la norma". Estuvo asi desde que el archivo
// existe.
//
// **Ninguna de las validaciones podia verlo.** Todas comparan numeros,
// y los numeros que acompanaban a ese texto eran correctos. Es la
// cuarta vez que un texto miente con todo en verde —los rotulos de los
// pasos el 5/8, las descripciones de la cautelar el 6/8, un criterio
// puesto en la seccion equivocada el 19/8—, y la primera que se puede
// automatizar: un texto que dice ser una transcripcion es la unica
// clase de string que tiene una fuente contra la cual compararse.
//
// **Que comprueba.** Cada `textoLegal` se parte en oraciones y cada
// oracion tiene que aparecer literal en `data/ley-27423.md`,
// comparando sin tildes, sin mayusculas y sin puntuacion. Lo que
// atrapa es exactamente lo que paso: una redaccion que suena a ley y
// no esta en la ley.
//
// **Que NO comprueba, y conviene tenerlo claro:** que el articulo
// citado sea el que corresponde al concepto, ni que la elision este
// bien hecha. Un texto del art. 44 rotulado como art. 58 pasaria.
// Esto cierra la clase de error de la cita inventada, no la de la cita
// mal atribuida.
//
// La copia de la ley vive en `data/ley-27423.md` y viene de
// `herramientas-judiciales/docs/domain/00_LEY_27423.md`. Es texto de
// una ley: no hay problema de licencia, y tenerla aca es lo que hace
// que este control pueda correr sin el otro repositorio.
//
// Uso: npx tsx lib/legal/__tests__/textosLegales.validation.ts
// ---------------------------------------------------------------

import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { MINIMOS_ORDENADOS, MINIMOS_EXTRAJUDICIAL } from '../minimos-data'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const LEY = join(RAIZ, 'data', 'ley-27423.md')

let ok = 0
let fail = 0

function chequear(nombre: string, condicion: boolean, detalle = '') {
  if (condicion) {
    ok++
    return
  }
  fail++
  console.log(`  FALLA ${nombre}${detalle ? ': ' + detalle : ''}`)
}

/**
 * La nota de vigencia que la app mete adentro del encabezado —
 * "ARTICULO 60 (B.O. 06/03/2026).-"— y que en la ley va en una linea
 * aparte, debajo del articulo. Se saca **antes** de partir en
 * oraciones, porque los puntos de "B.O." parten la oracion al medio.
 */
function sinNotaDeVigencia(t: string): string {
  return t.replace(/\s*\(B\.O\.[^)]*\)/g, '')
}

/**
 * Sin tildes, sin mayusculas y con toda la puntuacion vuelta espacio.
 *
 * **La comparacion tiene que ser laxa en la forma y estricta en las
 * palabras.** Una transcripcion legitima puede diferir en un guion, en
 * unas comillas o en el tipo de espacio; no puede diferir en una
 * palabra. Los `~~` son las tachaduras del markdown de la ley, que
 * marcan lo observado y no son parte del texto.
 */
function normalizar(t: string): string {
  const sinTildes = t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/~~/g, '')
  return ' ' + sinTildes.replace(/[^a-z0-9]+/g, ' ').trim() + ' '
}

/**
 * Se parten por punto, punto y coma o dos puntos, y se descartan los
 * fragmentos cortos: "a)" o "ARTICULO 48.-" no dicen nada y buscarlos
 * daria verde siempre.
 */
function oraciones(t: string): string[] {
  return sinNotaDeVigencia(t)
    .split(/(?<=[.;:])\s+/)
    .map((f) => f.trim())
    .filter((f) => f.length > 40)
}

const ley = normalizar(sinNotaDeVigencia(readFileSync(LEY, 'utf8')))

console.log('========================================')
console.log('Validacion: los textos legales, contra la ley')
console.log('========================================\n')

// 1. El archivo de la ley esta y es la ley.
chequear('data/ley-27423.md tiene contenido', ley.length > 50_000, `mide ${ley.length}`)
chequear(
  'y es la Ley 27.423',
  ley.includes(normalizar('Institúyese la Unidad de Medida Arancelaria').trim()),
)

// 2. Cada oracion de cada textoLegal esta en la ley.
let frasesTotales = 0

for (const categoria of MINIMOS_ORDENADOS) {
  chequear(
    `${categoria.id}: el textoLegal empieza por el articulo`,
    /^ARTÍCULO /.test(categoria.textoLegal),
    `empieza con "${categoria.textoLegal.slice(0, 24)}..."`,
  )

  const frases = oraciones(categoria.textoLegal)

  chequear(`${categoria.id}: tiene texto para comparar`, frases.length > 0)

  for (const frase of frases) {
    frasesTotales++
    chequear(
      `${categoria.id} (${categoria.articulo}): la frase esta en la ley`,
      ley.includes(normalizar(frase)),
      `no se encontro «${frase.slice(0, 90)}...»`,
    )
  }
}

chequear(
  'se compararon al menos treinta frases',
  frasesTotales >= 30,
  `fueron ${frasesTotales}`,
)

// 3. **El canario, que es la mitad que le falta a cualquier control de
// este tipo.** Sin esto, un normalizador roto que devolviera siempre
// la cadena vacia daria verde en todo lo de arriba y no estaria
// mirando nada. Se comprueba entonces que el control tambien sepa
// decir que no: esta es la frase que la app mostraba como art. 19 y
// que no esta en la Ley 27.423.
const CITA_INVENTADA =
  'Cuando no fuere posible apreciar el valor pecuniario del asunto, los jueces ' +
  'fijarán los honorarios teniendo en cuenta la naturaleza de las actuaciones y ' +
  'la gestión profesional desarrollada'

chequear(
  'el control sabe decir que no: la cita del art. 19 que no existe',
  !ley.includes(normalizar(CITA_INVENTADA)),
  'la frase inventada aparece en la ley, asi que el control no discrimina',
)

chequear(
  'y sabe decir que si: una frase que la ley tiene, palabra por palabra',
  ley.includes(
    normalizar('los honorarios mínimos que correspondan percibir a los abogados'),
  ),
)

// 4. Las cuatro filas que el Decreto 1077/2017 observo siguen
// declaradas. Sin esto, borrar un `observado` las devolveria a la
// pantalla como minimos vigentes sin que falle nada.
const observados = MINIMOS_EXTRAJUDICIAL.grupos
  .flatMap((g) => g.items)
  .filter((i) => i.observado)

chequear(
  'son cuatro las filas observadas del art. 19 inc. b)',
  observados.length === 4,
  `hay ${observados.length}`,
)

for (const item of observados) {
  chequear(
    `«${item.label.slice(0, 40)}» nombra la norma que la observo`,
    item.observado!.includes('Decreto 1077/2017'),
  )
}

// Y ninguna otra categoria tiene filas observadas: el art. 3 del
// decreto observo solo esas cuatro, todas de la tabla b).
const fueraDeLugar = MINIMOS_ORDENADOS.filter(
  (c) => c.id !== 'extrajudicial',
).flatMap((c) => c.grupos.flatMap((g) => g.items.filter((i) => i.observado)))

chequear(
  'no hay filas observadas fuera del art. 19 inc. b)',
  fueraDeLugar.length === 0,
  `hay ${fueraDeLugar.length}`,
)

console.log(`\n========================================`)
console.log(`Resultado: ${fail === 0 ? 'TODOS OK' : 'HUBO FALLOS'}`)
console.log(`Afirmaciones: ${ok + fail}, fallos: ${fail}`)
console.log(`Frases comparadas contra la ley: ${frasesTotales}`)
console.log('========================================')

process.exit(fail === 0 ? 0 : 1)
