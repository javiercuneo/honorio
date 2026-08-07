// ---------------------------------------------------------------
// Validacion: art. 39 segundo parrafo, modificacion de alimentos.
//
//   "En los casos de aumento, disminucion, cesacion o coparticipacion
//    en los alimentos, se tomara como base la diferencia que resulte
//    del monto de la sentencia por el termino de dos (2) anos,
//    aplicandose la escala de los incidentes."
//
// Tres cosas que esta validacion sostiene:
//
// 1. Que la modificacion va por la escala de los incidentes y la
//    fijacion sigue yendo por la del art. 21. Son numeros distintos y
//    tienen que serlo.
// 2. Que **es la misma escala de incidentes que ya usaba el motor**.
//    Eso no es un detalle de implementacion: es lo que hace que sea un
//    solo criterio interpretativo declarado una vez y no dos. Si algun
//    dia divergen, hay que decidirlo a proposito.
// 3. Que ningun otro objeto del juicio se movio.
//
// Uso: npx tsx lib/legal/__tests__/alimentosArt39.validation.ts
// ---------------------------------------------------------------

import {
  buildCalculationResult,
  buildGeneral,
  calcularEscala,
  calcularEscalaIncidentes,
  usaEscalaDeIncidentes,
} from '../calculate'
import type { WizardState } from '../types'

const UMA = 92482
const TOL = 1e-9

let ok = 0
let fail = 0

function chequear(nombre: string, actual: number, esperado: number) {
  if (Math.abs(actual - esperado) <= TOL) {
    ok++
    return
  }
  fail++
  console.log(`  FALLA ${nombre}: esperado=${esperado.toFixed(8)} actual=${actual.toFixed(8)}`)
}

function chequearVerdad(nombre: string, condicion: boolean) {
  if (condicion) {
    ok++
    return
  }
  fail++
  console.log(`  FALLA ${nombre}`)
}

function estado(overrides: Partial<WizardState>): WizardState {
  return {
    step: 0,
    valorUMA: UMA,
    tipoProceso: 'conocimiento',
    baseValor: 5000000,
    objetoBase: 'familia_alimentos',
    desalojoVivienda: null,
    sentenciaResultado: null,
    modoTerminacion: '',
    caducidadCriterio: '',
    sucesionUnicoLetrado: null,
    medidaOposicion: null,
    homologacionVivienda: null,
    aperturaPrueba: null,
    tuvoExcepciones: null,
    posesoriasTipo: null,
    alimentosTipo: null,
    esProvisorio: false,
    desdeMinimos: false,
    desdeResultado: false,
    ...overrides,
  } as WizardState
}

console.log('========================================')
console.log('Validacion: art. 39, 2do parrafo')
console.log('========================================\n')

// ---------------------------------------------------------------
// 1. La escala de los incidentes, contra su formula
// ---------------------------------------------------------------
console.log('1. La escala, contra la formula')

for (const base of [100000, 5000000, 50000000]) {
  const e = calcularEscalaIncidentes(base, UMA)!
  const baseEnUMA = base / UMA

  chequear(`base ${base}: baseEnUMA`, e.baseEnUMA, baseEnUMA)
  chequear(`base ${base}: min = 2 %`, e.patrocinante.full.min, baseEnUMA * 0.02)
  chequear(`base ${base}: max = 20 %`, e.patrocinante.full.max, baseEnUMA * 0.2)
  chequear(`base ${base}: apoderado x 1,4`, e.apoderado.full.min, baseEnUMA * 0.02 * 1.4)
  // Rango plano: no hay grado anterior ni excedente que acumular.
  chequear(`base ${base}: sin grado anterior`, e.maximoEscalaAnterior, 0)
  chequear(`base ${base}: sin limite anterior`, e.limiteAnterior, 0)
  // Los auxiliares no cambian de regimen: su 5 %-10 % es del art. 21.
  chequear(`base ${base}: auxMin sigue en 5 %`, e.auxMin, baseEnUMA * 0.05)
  chequear(`base ${base}: auxMax sigue en 10 %`, e.auxMax, baseEnUMA * 0.1)
}

chequearVerdad('base 0 devuelve null', calcularEscalaIncidentes(0, UMA) === null)

// ---------------------------------------------------------------
// 2. Es LA MISMA escala que la de los incidentes del motor
// ---------------------------------------------------------------
console.log('2. Es la misma escala que aplica buildIncidente()')

for (const base of [100000, 5000000, 50000000]) {
  const porArt39 = buildGeneral(
    estado({ baseValor: base, alimentosTipo: 'modificacion' }),
  )
  const comoIncidente = buildCalculationResult(
    estado({ baseValor: base, tipoProceso: 'incidente' }),
  )

  chequear(
    `base ${base}: el minimo coincide`,
    porArt39.honorarios.patrocinante.rango.minUMA,
    comoIncidente.honorarios.patrocinante.rango.minUMA,
  )
  chequear(
    `base ${base}: el maximo coincide`,
    porArt39.honorarios.patrocinante.rango.maxUMA,
    comoIncidente.honorarios.patrocinante.rango.maxUMA,
  )
}

// ---------------------------------------------------------------
// 3. La fijacion sigue yendo por el art. 21, y da otra cosa
// ---------------------------------------------------------------
console.log('3. La fijacion sigue por el art. 21')

for (const base of [100000, 5000000, 50000000]) {
  const fijacion = buildGeneral(estado({ baseValor: base, alimentosTipo: 'fijacion' }))
  const art21 = calcularEscala(base, UMA)!

  chequear(
    `base ${base}: fijacion = escala del art. 21`,
    fijacion.honorarios.patrocinante.rango.minUMA,
    art21.patrocinante.full.min,
  )
  chequearVerdad(
    `base ${base}: fijacion y modificacion dan distinto`,
    Math.abs(
      fijacion.honorarios.patrocinante.rango.minUMA -
        buildGeneral(estado({ baseValor: base, alimentosTipo: 'modificacion' }))
          .honorarios.patrocinante.rango.minUMA,
    ) > TOL,
  )
  chequearVerdad(
    `base ${base}: la fijacion se marca como art21`,
    fijacion.escala?.regimen === 'art21',
  )
}

// ---------------------------------------------------------------
// 4. La bandera y la condicion
// ---------------------------------------------------------------
console.log('4. Cuando se activa, y cuando no')

chequearVerdad(
  'modificacion activa la escala de incidentes',
  usaEscalaDeIncidentes(estado({ alimentosTipo: 'modificacion' })),
)
chequearVerdad(
  'fijacion no la activa',
  !usaEscalaDeIncidentes(estado({ alimentosTipo: 'fijacion' })),
)
chequearVerdad(
  'sin contestar no la activa',
  !usaEscalaDeIncidentes(estado({ alimentosTipo: null })),
)
chequearVerdad(
  'otro objeto no la activa aunque diga modificacion',
  !usaEscalaDeIncidentes(
    estado({ objetoBase: 'sumas_dinero', alimentosTipo: 'modificacion' }),
  ),
)
chequearVerdad(
  'otro tipo de proceso no la activa',
  !usaEscalaDeIncidentes(
    estado({ tipoProceso: 'ejecutivo', alimentosTipo: 'modificacion' }),
  ),
)
chequearVerdad(
  'la modificacion se marca como incidentes',
  buildGeneral(estado({ alimentosTipo: 'modificacion' })).escala?.regimen ===
    'incidentes',
)

// ---------------------------------------------------------------
// 5. Ningun otro objeto se movio
// ---------------------------------------------------------------
console.log('5. Los demas objetos no se movieron')

for (const objeto of ['sumas_dinero', 'inmuebles', 'escrituracion', 'familia_liquidacion']) {
  const r = buildGeneral(estado({ objetoBase: objeto as never, baseValor: 5000000 }))
  const art21 = calcularEscala(5000000, UMA)!
  chequear(
    `${objeto} sigue en la escala del art. 21`,
    r.honorarios.patrocinante.rango.minUMA,
    art21.patrocinante.full.min,
  )
}

console.log('\n========================================')
console.log(`Resultado: ${fail === 0 ? 'TODOS OK' : 'HUBO FALLOS'}`)
console.log(`Afirmaciones: ${ok + fail}, fallos: ${fail}`)
console.log('========================================')

process.exit(fail === 0 ? 0 : 1)
