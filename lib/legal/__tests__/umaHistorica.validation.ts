// ---------------------------------------------------------------
// Validacion de la UMA que no es la de hoy.
//
// Existe por un bug que llego por correo: el primer paso de la
// entrevista tenia `min: 50000` y el campo hacia clamp en cada tecla,
// asi que una UMA historica —15.000, 700— entraba al motor como 50.000
// sin aviso. La UMA del cierre de una planilla de 2023 es exactamente
// una de esas, y hay un fallo que manda usarla (UMA_CIERRE_PLANILLA).
//
// Cuatro cosas, y cada una caza una forma distinta de que vuelva:
//
// 1. **El schema acepta UMAs chicas y grandes.** Si alguien le vuelve a
//    poner piso o techo al paso, falla aca y no en el expediente.
// 2. **El motor calcula con la UMA que recibe**, sin piso propio.
// 3. **La serie dice lo que dicen los actos**, y concuerda con
//    data/uma.json donde las dos tienen la misma vigencia.
// 4. **El ancla del fallo**: la UMA a julio de 2023 es $20.595, la de la
//    Acordada 29/2023, que es la que la CFed. Rosario, Sala A, tomo.
//
// Uso: npx tsx lib/legal/__tests__/umaHistorica.validation.ts
// ---------------------------------------------------------------

import { buildGeneral } from '../calculate'
import { UMA_VIGENTE, HISTORIA_UMA } from '../uma'
import { SERIE_UMA, PRIMERA_VIGENCIA, umaAl, procedenciaDe, tramosConValor } from '../serie-uma'
import { UMA_CIERRE_PLANILLA } from '../jurisprudencia'
import { LEGAL_STEPS, STEP_EXHORTO_ACTOS, fueraDeRango, type NumericStepDef } from '../../wizard/wizard-schema'
import type { WizardState } from '../types'

let totales = 0
let fallos = 0

function ok(etiqueta: string, condicion: boolean, detalle?: string) {
  totales++
  if (!condicion) {
    fallos++
    console.log('  FAIL ' + etiqueta + (detalle ? '\n       ' + detalle : ''))
  }
}

const cerca = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) < eps

function estado(parcial: Partial<WizardState>): WizardState {
  return {
    step: 0,
    valorUMA: UMA_VIGENTE.valor,
    tipoProceso: 'conocimiento',
    modoTerminacion: 'sentencia',
    sentenciaResultado: 'admitida',
    aperturaPrueba: true,
    caducidadCriterio: '',
    tuvoExcepciones: null,
    sucesionUnicoLetrado: null,
    medidaOposicion: null,
    homologacionVivienda: null,
    objetoBase: 'sumas_dinero',
    desalojoVivienda: null,
    posesoriasTipo: null,
    alimentosTipo: null,
    baseValor: 1_000_000,
    exhortoInciso: '',
    exhortoMontoTipo: '',
    exhortoMonto: 0,
    exhortoActos: 0,
    esProvisorio: false,
    desdeMinimos: false,
    desdeResultado: false,
    ...parcial,
  }
}

// ================================================================
console.log('1. El paso de la UMA acepta cualquier valor positivo')
// ================================================================

const pasoUma = LEGAL_STEPS.find((p) => p.id === 'umaInicio') as NumericStepDef

ok('el paso existe y es numerico', !!pasoUma && pasoUma.kind === 'numeric')
for (const uma of [1, 700, 15_000, 20_595, 45_000, 49_999, UMA_VIGENTE.valor, 200_001, 1_000_000]) {
  ok('acepta una UMA de ' + uma, fueraDeRango(pasoUma, uma) === null, String(fueraDeRango(pasoUma, uma)))
}
ok('rechaza cero, con motivo', fueraDeRango(pasoUma, 0) !== null)

// Los demas pasos numericos conservan su rango: el control dejo de ser
// un recorte, no dejo de existir.
ok('exhortoActos sigue rechazando lo que excede su maximo', fueraDeRango(STEP_EXHORTO_ACTOS, STEP_EXHORTO_ACTOS.max + 1) !== null)
ok('exhortoActos acepta su maximo', fueraDeRango(STEP_EXHORTO_ACTOS, STEP_EXHORTO_ACTOS.max) === null)

// ================================================================
console.log('2. El motor calcula con la UMA que recibe')
// ================================================================

for (const uma of [700, 15_000, 45_000]) {
  const r = buildGeneral(estado({ valorUMA: uma }))
  ok('UMA ' + uma + ': hay resultado', !!r)
  if (!r) continue
  ok('UMA ' + uma + ': el resultado lleva esa UMA', r.valorUMA === uma, 'dio ' + r.valorUMA)
  ok(
    'UMA ' + uma + ': la base en UMA es base / UMA',
    !!r.escala && cerca(r.escala.baseEnUMA, 1_000_000 / uma),
    'dio ' + r.escala?.baseEnUMA,
  )
  const rango = r.honorarios.patrocinante.rango
  ok(
    'UMA ' + uma + ': pesos = UMA x valor',
    cerca(rango.minPesos, rango.minUMA * uma, 1e-6) && cerca(rango.maxPesos, rango.maxUMA * uma, 1e-6),
  )
}

// ================================================================
console.log('3. La serie')
// ================================================================

ok('la serie no esta vacia', SERIE_UMA.length > 0)
ok('la primera vigencia es la de la ley 27.423 (B.O. 22/12/2017)', PRIMERA_VIGENCIA === '2017-12-22')
ok(
  'las vigencias van en orden y sin repetir',
  SERIE_UMA.every((t, i) => i === 0 || SERIE_UMA[i - 1].vigencia < t.vigencia),
)
ok('ningun valor es cero o negativo', SERIE_UMA.every((t) => Number.isInteger(t.valor) && t.valor > 0))

// Donde la serie y la planilla tienen la misma vigencia, dicen lo mismo.
// Si no, una de las dos esta mal y no hay forma de saber cual sin el acto.
for (const h of HISTORIA_UMA) {
  if (!h.vigencia) continue
  const t = SERIE_UMA.find((x) => x.vigencia === h.vigencia)
  ok('vigencia ' + h.vigencia + ': serie y planilla coinciden', !!t && t.valor === h.valor, 'serie ' + t?.valor + ', planilla ' + h.valor)
}

ok('la UMA vigente esta en la serie', tramosConValor(UMA_VIGENTE.valor).length > 0)
ok('hoy rige la UMA vigente', umaAl('2999-12-31')?.valor === SERIE_UMA[SERIE_UMA.length - 1].valor)
ok('antes de la ley no hay UMA', umaAl('2017-12-21') === null)
ok('el primer dia de la ley hay UMA', umaAl('2017-12-22')?.valor === 1350)
ok('una fecha en otro formato no se adivina', umaAl('03/07/2026') === null && umaAl('2026-7-3') === null)

ok('procedencia de la vigente', procedenciaDe(UMA_VIGENTE.valor).tipo === 'vigente')
ok('procedencia de una historica', procedenciaDe(20_595).tipo === 'historica')
ok('procedencia de una que no fijo nadie', procedenciaDe(45_000).tipo === 'manual' && procedenciaDe(45_000).norma === null)

// ================================================================
console.log('4. El ancla del fallo: CFed. Rosario, Sala A, 19/10/2026')
// ================================================================
//
// La sentencia: planilla con corte a julio de 2023, aprobada en febrero
// de 2024, regulada en marzo de 2024. Toma la UMA de $20.595 "conforme
// Acordada C.S.J.N. 29/2023" y fija 28 UMA = $576.660.

ok('el criterio esta cargado con su fallo', UMA_CIERRE_PLANILLA.fallos.length === 1 && UMA_CIERRE_PLANILLA.fallos[0].fecha === '19/10/2026')

const cierre = umaAl('2023-07-31')
ok('la UMA a julio de 2023 es $20.595', cierre?.valor === 20_595, 'dio ' + cierre?.valor)
ok('y la fija la Acordada 29/2023', cierre?.norma === 'Acordada 29/2023', 'dio ' + cierre?.norma)
ok('28 UMA a ese valor son $576.660, como dice la sentencia', 28 * 20_595 === 576_660)

// Lo que el criterio cambia, en este caso: la misma base cae en otro
// tramo del art. 21 segun la UMA con la que se divida.
const regulacion = umaAl('2024-03-31')
ok('la UMA a marzo de 2024 es otra', !!regulacion && regulacion.valor !== 20_595)
{
  const conCierre = buildGeneral(estado({ tipoProceso: 'ejecucion_sentencia', tuvoExcepciones: true, baseValor: 5_632_463.3, valorUMA: 20_595 }))
  ok(
    'con la UMA del cierre, la base es 273,49 UMA',
    !!conCierre?.escala && Math.abs(conCierre.escala.baseEnUMA - 273.49) < 0.005,
    'dio ' + conCierre?.escala?.baseEnUMA,
  )
}

console.log('\n========================================')
console.log(fallos === 0 ? 'Resultado: TODOS OK' : 'Resultado: HUBO FALLOS')
console.log('Tests totales: ' + totales + ', fallos: ' + fallos)
console.log('========================================')
process.exit(fallos === 0 ? 0 : 1)
