// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 L. Javier Cuneo Libarona
// ---------------------------------------------------------------
// El texto de la regulacion, en prosa, para copiar y pegar.
//
// Funcion pura: entra un CalculoResultado y los puntos que el usuario
// eligio dentro de cada banda, sale texto plano. Sin React y sin DOM,
// como todo lib/legal/.
//
// **Es deterministico y no hay ningun modelo de lenguaje detras.** El
// mismo resultado produce siempre el mismo texto, caracter por
// caracter, y hay una validacion que lo comprueba. Nada de lo que se
// escribe en la app sale del navegador.
//
// ---- La regla que gobierna el modulo ----
//
// **Cada afirmacion del texto tiene que ser rastreable a un campo del
// resultado o a algo que el usuario escribio.** Lo que no cumpla eso no
// se escribe. Hay un control que lo comprueba solo, `verificarNumeros`,
// que esta abajo y corre tambien en la validacion.
//
// De ahi sale tambien de donde salen los articulos que el texto cita:
// **de las `transformaciones` que el motor emitio**, agrupadas por
// etapa. Si una seccion no tiene ninguna, no lleva articulo. No se
// completa por lo que "deberia" corresponder.
//
// ---- Por que el texto es corto ----
//
// Los trece modelos de resolucion de docs/modelos/ traen tres cosas
// mas que este generador no escribe, y las tres por decision:
//
// 1. **La narracion del expediente** —quien intervino, en que caracter,
//    que hizo, a que fojas—. Honorio no la tiene y **no va como hueco**:
//    un hueco afirma que ese parrafo es parte de lo que el generador
//    produce. La prosa dice unicamente lo que Honorio atrapa y el
//    usuario agrega el resto segun su caso.
// 2. **La ley aplicable por etapa.** Tres modelos aplican la Ley 21.839
//    a las dos primeras etapas y la 27.423 a la tercera. El motor
//    calcula solo por la 27.423, asi que un parrafo que nombre la ley
//    anterior estaria describiendo una cuenta que no se hizo.
// 3. **Notificacion, elevacion y apertura de cuenta en el BNA.** Son
//    texto fijo, y por eso eran lo mas barato de generar, pero son
//    practicas de un juzgado y no de la ley.
//
// **Y la segunda instancia queda afuera del todo**: esto redacta una
// regulacion de primera instancia. El art. 30 se calcula y se muestra
// en el dashboard, pero no genera banda ni parrafo aca. Decision de
// Javier del 10/8.
//
// El detalle esta en PLAN_REGULACION_EN_PROSA.md del repositorio de las
// calculadoras.
//
// ---- El punto dentro de la banda ----
//
// El motor devuelve rangos a proposito: elegir adentro es el acto
// jurisdiccional. Una resolucion fija un numero, asi que **alguien
// tiene que elegirlo y ese alguien no es la app**. Por eso el punto
// entra por parametro y no tiene valor por defecto: un default en el
// medio de la banda es una decision jurisdiccional disfrazada de
// conveniencia.
// ---------------------------------------------------------------

import type { CalculoResultado, Rango, Transformacion } from './types'
import { TOPE_ITEM_G_UHOM } from './mediacion'
import type { ResultadoMediacion } from './mediacion'

// ---- Lo que se puede regular ----

export type RolAbogado = 'patrocinante' | 'apoderado' | 'procurador'

/**
 * Una banda del resultado, con lo que hace falta para redactarla.
 * `clave` es lo que la interfaz usa para referirse a ella.
 */
export interface BandaRegulable {
  clave: string
  etiqueta: string
  articulo: string
  rango: Rango
}

/** El punto que el usuario eligio dentro de una banda. */
export interface PuntoElegido {
  /** La `clave` de la banda. */
  banda: string
  /**
   * El punto elegido, **en UMA**. Es la unidad que lidera el texto,
   * como en los trece modelos: "en X UMA, equivalente al dia de la
   * fecha a $Y".
   */
  uma: number
  /**
   * Como se nombra al profesional. Si viene vacio, el texto sale con
   * un hueco visible y `huecos` lo declara.
   */
  profesional?: string
}

export interface OpcionesProsa {
  resultado: CalculoResultado
  puntos: PuntoElegido[]
  /** El honorario del mediador, si el caso lo tiene. No es una banda. */
  mediacion?: ResultadoMediacion | null
  /** El nombre del mediador, opcional, con el mismo criterio. */
  mediador?: string
}

export interface TextoRegulacion {
  texto: string
  /**
   * Los datos que faltan y que el texto dejo marcados. Mientras haya
   * uno, el texto no esta listo para pegar.
   */
  huecos: string[]
  /**
   * Los puntos que cayeron fuera de su banda. **Si hay alguno, `texto`
   * viene vacio**: un numero fuera de la banda no se redacta.
   */
  errores: string[]
}

// ---- Formato ----

const HUECO_PROFESIONAL = '[PROFESIONAL]'

const fmtPesos = (n: number) =>
  '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const fmtUMA = (n: number) =>
  n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const fmtPct = (n: number) =>
  n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %'

const fmtUHOM = fmtUMA

/**
 * El criterio del 2 %-20 % de los incidentes. Sale de una ley
 * derogada porque el art. 47 de la 27.423 quedo observado: el mismo
 * criterio que declara `jurisprudencia.ts`, dicho una sola vez.
 */
const ART_INCIDENTE = 'art. 33 de la ley 21.839'

/** Las letras de las secciones, en el orden en que se escriben. */
const LETRAS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

/**
 * Una banda vacia no se ofrece.
 *
 * **No es defensa de mas.** `buildExhorto()` y `buildIncidente()`
 * rellenan `honorarios` y `auxiliares` con ceros para los roles que su
 * proceso no tiene, porque el tipo los exige. Ofrecerlos daria filas
 * que solo se pueden regular en cero.
 */
const tieneAlgo = (r: Rango) => Number.isFinite(r.maxUMA) && r.maxUMA > 0

/**
 * Las bandas que un resultado ofrece, en el orden en que se redactan.
 *
 * **No inventa ninguna:** si el resultado no trae `partidor`, no hay
 * banda de partidor y no hay parrafo. Es la regla de "un bloque por
 * seccion del dashboard" — agregar una regla al motor no se puede
 * olvidar en la prosa porque la banda aparece sola.
 *
 * **La segunda instancia no esta**, a proposito: esto redacta una
 * regulacion de primera.
 */
export function bandasDe(resultado: CalculoResultado): BandaRegulable[] {
  const bandas: BandaRegulable[] = []

  // El exhorto tiene sus propios incisos y sus tres roles son el mismo
  // rango repetido: ofrecerlos daria tres filas identicas que no
  // significan tres profesionales.
  if (resultado.exhorto) {
    const e = resultado.exhorto
    if (tieneAlgo(e.incisoB)) {
      bandas.push({
        clave: 'exhorto-b',
        etiqueta: 'profesional interviniente, inscripciones y actos registrales',
        articulo: 'art. 50 inc. b)',
        rango: e.incisoB,
      })
    }
    if (tieneAlgo(e.incisoC)) {
      bandas.push({
        clave: 'exhorto-c',
        etiqueta: 'profesional interviniente, diligencias de prueba',
        articulo: 'art. 50 inc. c)',
        rango: e.incisoC,
      })
    }
    return bandas
  }

  // En el incidente la banda del 2 %-20 % vive en `patrocinante` y las
  // otras dos vienen en cero. Es una sola banda y no distingue rol.
  if (resultado.incidente) {
    const r = resultado.honorarios.patrocinante.rango
    if (tieneAlgo(r)) {
      bandas.push({
        clave: 'incidente',
        etiqueta: 'letrado/a',
        articulo: ART_INCIDENTE,
        rango: r,
      })
    }
    return bandas
  }

  const roles: { rol: RolAbogado; etiqueta: string; articulo: string }[] = [
    { rol: 'patrocinante', etiqueta: 'letrado/a patrocinante', articulo: 'art. 21' },
    { rol: 'apoderado', etiqueta: 'letrado/a apoderado/a', articulo: 'arts. 21 y 20' },
    { rol: 'procurador', etiqueta: 'procurador/a', articulo: 'arts. 21 y 20' },
  ]

  for (const { rol, etiqueta, articulo } of roles) {
    const rango = resultado.honorarios[rol].rango
    if (tieneAlgo(rango)) bandas.push({ clave: rol, etiqueta, articulo, rango })
  }

  if (tieneAlgo(resultado.auxiliares)) {
    bandas.push({
      clave: 'auxiliares',
      etiqueta: 'perito/a o auxiliar de la Justicia',
      articulo: 'art. 21, último párrafo',
      rango: resultado.auxiliares,
    })
  }

  if (resultado.partidor) {
    const p = resultado.partidor
    const rango = {
      minUMA: p.minUMA,
      maxUMA: p.maxUMA,
      minPesos: p.minPesos,
      maxPesos: p.maxPesos,
    }
    if (tieneAlgo(rango)) {
      bandas.push({ clave: 'partidor', etiqueta: 'partidor/a', articulo: 'art. 35', rango })
    }
  }

  if (resultado.actuacionesPosteriores) {
    for (const { rol, etiqueta } of roles) {
      const rango = resultado.actuacionesPosteriores[rol]
      if (!tieneAlgo(rango)) continue
      bandas.push({
        clave: 'posteriores-' + rol,
        etiqueta: 'actuaciones posteriores a la ejecución, ' + etiqueta,
        articulo: 'art. 41, última oración',
        rango,
      })
    }
  }

  return bandas
}

// ---- El texto ----

const EPS = 1e-6

/**
 * El texto de la regulacion.
 *
 * Devuelve `texto: ''` si algun punto cae fuera de su banda. No es
 * defensivo de mas: la banda es lo unico que la ley acota, y redactar
 * un numero que la perfora seria producir un documento que se defiende
 * solo hasta que alguien mire la escala.
 */
export function generarProsa(opciones: OpcionesProsa): TextoRegulacion {
  const { resultado, puntos, mediacion, mediador } = opciones
  const huecos: string[] = []
  const errores: string[] = []

  const bandas = new Map(bandasDe(resultado).map((b) => [b.clave, b]))

  for (const punto of puntos) {
    const banda = bandas.get(punto.banda)
    if (!banda) {
      errores.push('No hay banda «' + punto.banda + '» en este resultado.')
      continue
    }
    if (!Number.isFinite(punto.uma)) {
      errores.push(banda.etiqueta + ': el punto no es un número.')
      continue
    }
    if (punto.uma < banda.rango.minUMA - EPS || punto.uma > banda.rango.maxUMA + EPS) {
      errores.push(
        banda.etiqueta +
          ': ' +
          fmtUMA(punto.uma) +
          ' UMA cae fuera de la banda de ' +
          fmtUMA(banda.rango.minUMA) +
          ' a ' +
          fmtUMA(banda.rango.maxUMA) +
          ' UMA.',
      )
    }
  }

  if (errores.length > 0) return { texto: '', huecos, errores }

  const p: string[] = ['AUTOS Y VISTOS:', '']
  let n = 0
  const encabezado = (titulo: string, articulos: string[]) => {
    const cita = articulos.length > 0 ? ' (' + articulos.join('; ') + ')' : ''
    p.push(LETRAS[n++] + ') ' + titulo + cita + ':')
  }

  // ---- Base ----
  const trBase = visibles(resultado, 'base')
  encabezado('Base regulatoria', articulosDe(trBase))
  p.push(seccionBase(resultado, trBase))
  p.push('')

  // ---- Escala ----
  //
  // El incidente no tiene `escala`: su banda sale del 2 %-20 % del
  // art. 33 de la Ley 21.839, y el motor la emite como dos
  // transformaciones de etapa `honorarios`. **Escribirlas como
  // "reducciones del honorario" seria mentir sobre lo que son**: no
  // reducen nada, son la forma de calcular la banda.
  if (resultado.incidente) {
    encabezado('Escala aplicable', [ART_INCIDENTE])
    p.push(
      'La ley 27.423 no contiene una pauta para la fijación de honorarios por ' +
        'incidentes, dado que su art. 47 fue observado por el Decreto 1077/2017. ' +
        'Aplico en consecuencia los lineamientos del art. 33 de la ley 21.839, y ' +
        'regulo entre el ' +
        fmtPct(resultado.incidente.porcentajeMin) +
        ' y el ' +
        fmtPct(resultado.incidente.porcentajeMax) +
        ' de lo que corresponde al proceso principal, atendiendo a la ' +
        'vinculación mediata o inmediata con su solución definitiva.',
    )
    p.push('')
  } else {
    const trEscala = visibles(resultado, 'escala')
    const escala = seccionEscala(resultado, trEscala)
    if (escala) {
      encabezado('Escala aplicable', articulosDe(trEscala, articuloEscala(resultado)))
      p.push(escala)
      p.push('')
    }
  }

  // ---- Reducciones del honorario ----
  //
  // Es una etapa propia del motor —`etapa: 'honorarios'`— y hasta el
  // 10/8 no se escribia. El resultado era que el -10 % del art. 41
  // aparecia solo como una alicuota efectiva mas baja, sin decir por
  // que: el texto mostraba la consecuencia y se guardaba la causa.
  const trHon = resultado.incidente ? [] : visibles(resultado, 'honorarios')
  if (trHon.length > 0) {
    encabezado('Reducciones del honorario', articulosDe(trHon))
    for (const t of trHon) p.push(cadenaTransformacion(t))
    p.push('')
  }

  // ---- Regulacion ----
  if (puntos.length > 0) {
    encabezado('Regulación', ['art. 16'])
    p.push(
      'En función del monto del asunto referenciado, la complejidad del ' +
        'procedimiento, el resultado obtenido, el mérito de la labor profesional, ' +
        'la calidad, eficacia y extensión del trabajo realizado y lo dispuesto por ' +
        'el art. 16 de la ley 27.423, regulo los honorarios del siguiente modo:',
    )
    for (const punto of puntos) {
      const banda = bandas.get(punto.banda)!
      const nombre = (punto.profesional || '').trim()
      if (!nombre) huecos.push('El nombre del ' + banda.etiqueta)
      const pesos = punto.uma * resultado.valorUMA
      p.push(
        '- ' +
          (nombre || HUECO_PROFESIONAL) +
          ', ' +
          banda.etiqueta +
          ' (' +
          banda.articulo +
          '): ' +
          fmtUMA(punto.uma) +
          ' UMA, equivalente al día de la fecha a ' +
          fmtPesos(pesos) +
          '.',
      )
    }
    p.push('')
  }

  // ---- Mediador ----
  if (mediacion) {
    encabezado('Honorarios del mediador', ['ley 26.589'])
    const nombre = (mediador || '').trim()
    if (!nombre) huecos.push('El nombre del mediador')
    p.push(
      'La base expresada en UHOM es ' +
        fmtUHOM(mediacion.baseEnUHOM) +
        ', que corresponde al ítem ' +
        mediacion.item.item +
        ' de la escala del art. 2° del Anexo III del Decreto 1467/2011, ' +
        'sustituido por el Anexo I del Decreto 2536/2015.' +
        (mediacion.porTope
          ? ' El honorario quedó limitado por el tope de 120,00 UHOM previsto para ese ítem.'
          : ''),
    )
    p.push(
      '- ' +
        (nombre || HUECO_PROFESIONAL) +
        ', mediador/a: ' +
        fmtUHOM(mediacion.honorarioUHOM) +
        ' UHOM, equivalente al día de la fecha a ' +
        fmtPesos(mediacion.honorarioPesos) +
        ' (UHOM de ' +
        fmtPesos(mediacion.uhom.valor) +
        ').',
    )
    p.push('')
  }

  // ---- IVA y plazo ----
  encabezado('IVA y plazo', ['art. 54'])
  p.push(
    'La regulación de honorarios no contiene la alícuota que establece ese ' +
      'impuesto. En consecuencia el beneficiario que se encuentre inscripto ' +
      'deberá acreditar su condición y el obligado al pago adicionarle el monto ' +
      'correspondiente (conf. CSJN, 16/06/1993, “Cía. General de Combustibles SA”).',
  )
  p.push('Los honorarios deberán ser abonados en el plazo de 10 días (art. 54 de la ley 27.423).')
  p.push('Notifíquese.')

  return { texto: p.join('\n').trimEnd() + '\n', huecos, errores }
}

/** Las transformaciones visibles de una etapa, en el orden del motor. */
function visibles(r: CalculoResultado, etapa: Transformacion['etapa']): Transformacion[] {
  return r.transformaciones.filter((t) => t.etapa === etapa && t.visible)
}

/** El artículo de la escala que corrió, que no viene en ninguna transformación. */
function articuloEscala(r: CalculoResultado): string | null {
  if (!r.escala) return null
  return r.escala.regimen === 'incidentes' ? ART_INCIDENTE : 'art. 21'
}

/**
 * Los articulos que una seccion cita, sin repetir y en orden de
 * aparicion. **Salen de lo que el motor emitio**, no de lo que
 * corresponderia: si una transformacion no trae articulo, no se
 * completa.
 */
function articulosDe(trs: Transformacion[], extra?: string | null): string[] {
  const vistos: string[] = []
  const agregar = (a: string | null | undefined) => {
    const limpio = (a || '').trim()
    if (limpio && !vistos.includes(limpio)) vistos.push(limpio)
  }
  agregar(extra)
  for (const t of trs) agregar(t.articulo)
  return vistos
}

function seccionBase(r: CalculoResultado, reducciones: Transformacion[]): string {
  const lineas: string[] = []

  lineas.push('Tomo como base regulatoria la suma de ' + fmtPesos(r.baseOriginal) + '.')

  for (const t of reducciones) {
    lineas.push(
      cadenaTransformacion(t) +
        ' De ' +
        fmtPesos(t.valorPrevio) +
        ' resulta ' +
        fmtPesos(t.valorPosterior) +
        '.',
    )
  }

  if (reducciones.length > 0) {
    lineas.push('En consecuencia, fijo la base en ' + fmtPesos(r.baseFinal) + '.')
  }

  if (r.escala) {
    lineas.push(
      'Expresada en UMA, con el valor vigente de ' +
        fmtPesos(r.valorUMA) +
        ', la base es de ' +
        fmtUMA(r.escala.baseEnUMA) +
        ' UMA.',
    )
  }

  return lineas.join('\n')
}

function seccionEscala(r: CalculoResultado, reducciones: Transformacion[]): string | null {
  const e = r.escala
  if (!e) return null

  const lineas: string[] = []

  if (e.regimen === 'incidentes') {
    // El rango es plano: no hay tramos, no hay correlacion y no hay
    // excedente. Escribir la escalera aca seria describir el art. 21.
    lineas.push(
      'Aplico la escala de los incidentes, con alícuotas de ' +
        fmtPct(e.porcentajeMin) +
        ' a ' +
        fmtPct(e.porcentajeMax) +
        ' sobre lo que corresponde al proceso principal.',
    )
  } else {
    // El `titulo` que emite el motor ya trae el tramo y sus alicuotas
    // —"6ta escala (451-750 UMA): 13% a 17%"—, asi que repetirlas al
    // lado solo agrega ruido.
    lineas.push('Aplico la ' + e.titulo + ' (art. 21).')

    if (e.escalera) {
      lineas.push(
        'Tengo en consideración el factor de correlación, en cuanto a que los ' +
          'honorarios no pueden ser inferiores al máximo del grado inmediato ' +
          'anterior de la escala más el excedente de la alícuota que corresponde ' +
          'al grado siguiente (art. 21). En el caso, el máximo de la escala ' +
          'anterior es de ' +
          fmtUMA(e.escalera.maximoEscalaAnterior) +
          ' UMA, y las alícuotas se aplican sobre el excedente de ' +
          fmtUMA(e.escalera.excedente) +
          ' UMA por sobre las ' +
          fmtUMA(e.escalera.limiteAnterior) +
          ' UMA del límite anterior.',
      )
    }
  }

  // Las reducciones **antes** que las alicuotas efectivas: la efectiva
  // es la consecuencia de las quitas, y decirla primero deja al lector
  // preguntandose de donde salio.
  for (const t of reducciones) lineas.push(cadenaTransformacion(t))

  if (
    Math.abs(e.porcentajeMinAplicado - e.porcentajeMin) > EPS ||
    Math.abs(e.porcentajeMaxAplicado - e.porcentajeMax) > EPS
  ) {
    lineas.push(
      'Hechas esas reducciones, las alícuotas efectivas sobre la base resultan de ' +
        fmtPct(e.porcentajeMinAplicado) +
        ' a ' +
        fmtPct(e.porcentajeMaxAplicado) +
        '.',
    )
  }

  return lineas.join('\n')
}

/**
 * La frase de una transformacion, armada desde sus propios campos.
 *
 * **No reimplementa ninguna formula legal**: el concepto y el articulo
 * los emite el motor. Es la misma regla que gobierna `cadena.ts` del
 * dashboard.
 *
 * El `concepto` de varias transformaciones ya termina en su articulo
 * —"50% por ejecucion de sentencia (art.41)"— asi que se lo saca antes
 * de agregar el campo `articulo`, que es el que esta normalizado. Sin
 * esto salia "Aplico 50% por ejecucion de sentencia (art.41) (art. 41)".
 */
function cadenaTransformacion(t: Transformacion): string {
  return 'Aplico ' + sinArticulo(t.concepto) + ' (' + t.articulo + ').'
}

/** Saca un "(art. N)" final del concepto, con o sin espacio y en plural. */
function sinArticulo(concepto: string): string {
  return concepto.replace(/\s*\(\s*arts?\.?\s*[^)]*\)\s*$/i, '').trim()
}

// ---- El control mecanico ----

/**
 * Todos los importes y porcentajes que aparecen en un texto, como
 * numeros.
 *
 * **Lee unicamente el formato de dos decimales que este modulo
 * produce**, y esa es la regla que separa una cifra del calculo de un
 * identificador. Todo importe, toda cifra en UMA o UHOM y todo
 * porcentaje que el generador escribe lleva dos decimales; un numero
 * de articulo, un numero de decreto y un anio nunca los llevan.
 *
 * La primera version leia tambien los enteros sueltos y salteaba los
 * menores a 2100 como heuristica de "esto es un articulo o un anio".
 * **No funcionaba:** `Decreto 2536` daba un falso positivo, y subir el
 * umbral solo mueve el problema. El formato es un criterio y no una
 * corazonada.
 */
export function numerosDelTexto(texto: string): number[] {
  const encontrados: number[] = []
  for (const m of texto.matchAll(/\d{1,3}(?:\.\d{3})*,\d{2}|\d+,\d{2}/g)) {
    const n = Number(m[0].replace(/\./g, '').replace(',', '.'))
    if (Number.isFinite(n)) encontrados.push(n)
  }
  return encontrados
}

/** Los numeros que el resultado autoriza a escribir. */
export function numerosDelResultado(opciones: OpcionesProsa): Set<number> {
  const { resultado: r, puntos, mediacion } = opciones
  const s = new Set<number>()

  const agregar = (n: number | undefined | null) => {
    if (typeof n === 'number' && Number.isFinite(n)) s.add(redondear(n))
  }
  const agregarRango = (rango: Rango) => {
    agregar(rango.minUMA)
    agregar(rango.maxUMA)
    agregar(rango.minPesos)
    agregar(rango.maxPesos)
  }

  agregar(r.baseOriginal)
  agregar(r.baseFinal)
  agregar(r.valorUMA)

  for (const t of r.transformaciones) {
    agregar(t.valorPrevio)
    agregar(t.valorPosterior)
  }

  if (r.escala) {
    agregar(r.escala.baseEnUMA)
    agregar(r.escala.porcentajeMin)
    agregar(r.escala.porcentajeMax)
    agregar(r.escala.porcentajeMinAplicado)
    agregar(r.escala.porcentajeMaxAplicado)
    if (r.escala.escalera) {
      agregar(r.escala.escalera.maximoEscalaAnterior)
      agregar(r.escala.escalera.limiteAnterior)
      agregar(r.escala.escalera.excedente)
    }
  }

  for (const banda of bandasDe(r)) agregarRango(banda.rango)

  for (const punto of puntos) {
    agregar(punto.uma)
    agregar(punto.uma * r.valorUMA)
  }

  if (mediacion) {
    agregar(mediacion.baseEnUHOM)
    agregar(mediacion.honorarioUHOM)
    agregar(mediacion.honorarioPesos)
    agregar(mediacion.uhom.valor)
    // El tope del item G, que el texto nombra cuando efectivamente
    // mordio. Sale de la escala, no del resultado, y por eso hay que
    // declararlo: si no, el control lo leeria como inventado.
    agregar(TOPE_ITEM_G_UHOM)
  }

  return s
}

/** Dos decimales, que es la precision con la que el texto escribe. */
function redondear(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Los numeros del texto que **no** salen del resultado.
 *
 * Es el mismo razonamiento que el control de citas de
 * `verificar-docs.mjs`: no dice que el texto sea correcto —eso no se
 * puede automatizar— pero caza la clase de error mas cara, que es el
 * importe inventado.
 *
 * **Lo que no caza, para no confiarse:** un numero correcto puesto en
 * la frase equivocada. Eso sigue siendo leer el texto.
 */
export function verificarNumeros(texto: string, opciones: OpcionesProsa): number[] {
  const permitidos = numerosDelResultado(opciones)
  const intrusos: number[] = []

  for (const n of numerosDelTexto(texto)) {
    if (permitidos.has(redondear(n))) continue
    intrusos.push(n)
  }

  return intrusos
}
