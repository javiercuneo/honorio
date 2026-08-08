// ---------------------------------------------------------------
// Validacion del honorario basico del mediador.
//
// El control que mas vale es el segundo: **la tabla oficial del
// Ministerio, en pesos**. No deriva del motor ni de la calculadora
// vieja, asi que si el motor cambia y la tabla no, se nota. Es el
// mismo papel que cumple la hoja de calculo en calculoDirecto.
//
// El resto son los bordes. Una escala escalonada se rompe en los
// cortes y en ningun otro lado: cada limite se prueba de los dos
// lados, y se comprueba que la base no se redondee para elegir tramo
// —que es el bug que tenia honorarios.html en los seis cortes del
// art. 21—.
//
// Uso: npx tsx lib/legal/__tests__/mediacion.validation.ts
// ---------------------------------------------------------------

import {
  calcularMediacion,
  ESCALA_MEDIACION,
  PORCENTAJE_ITEM_G,
  TOPE_ITEM_G_UHOM,
} from '../mediacion'
import { esValorUHOMPlausible } from '../uhom'
import type { ValorUHOM } from '../uhom'

let totales = 0
let fallos = 0

const EPS = 1e-9

function ok(etiqueta: string, condicion: boolean, detalle?: string) {
  totales++
  if (!condicion) {
    fallos++
    console.log('  FAIL ' + etiqueta + (detalle ? '\n       ' + detalle : ''))
  }
}

function igual(etiqueta: string, actual: number, esperado: number, eps = EPS) {
  ok(
    etiqueta,
    Math.abs(actual - esperado) < eps,
    'actual=' + actual + '  esperado=' + esperado,
  )
}

/** Un UHOM de prueba. El objeto entero, que es lo que pide el motor. */
function uhom(valor: number): ValorUHOM {
  return { unidad: 'UHOM', valor, fuente: null, url: null, capturado: '2026-06-01' }
}

// Valores de la tabla oficial del Ministerio.
const JUNIO_2026 = uhom(12_450)
const AGOSTO_2026 = uhom(12_960)

// ================================================================
// 1. La escala, tramo por tramo
// ================================================================

console.log('La escala del Anexo III')

const TRAMOS: [string, number | null, number | null][] = [
  ['A', 30, 3],
  ['B', 60, 6],
  ['C', 150, 9],
  ['D', 300, 12],
  ['E', 600, 16],
  ['F', 1000, 20],
  ['G', null, null],
]

ok('la escala tiene siete items', ESCALA_MEDIACION.length === 7)

for (let i = 0; i < TRAMOS.length; i++) {
  const [item, hasta, honorario] = TRAMOS[i]!
  const real = ESCALA_MEDIACION[i]!
  ok('item ' + i + ' es ' + item, real.item === item, 'es ' + real.item)
  ok(item + ' limite ' + hasta, real.hastaUHOM === hasta, 'es ' + real.hastaUHOM)
  ok(item + ' honorario ' + honorario, real.honorarioUHOM === honorario, 'es ' + real.honorarioUHOM)
}

// ================================================================
// 2. El ancla externa: la tabla oficial, en pesos
// ================================================================
//
// "Valores vigentes desde 1 de junio de 2026", UHOM $12.450. La
// columna de la izquierda es la franja del monto del asunto y la de
// la derecha el honorario. Ninguno de estos numeros sale del motor.

console.log('Ancla externa: tabla oficial del Ministerio, junio 2026')

const TABLA_JUNIO: [string, number, number][] = [
  // item, monto del asunto en pesos (el techo de la franja), honorario en pesos
  ['A', 373_500, 37_350],
  ['B', 747_000, 74_700],
  ['C', 1_867_500, 112_050],
  ['D', 3_735_000, 149_400],
  ['E', 7_470_000, 199_200],
  ['F', 12_450_000, 249_000],
]

for (const [item, monto, honorario] of TABLA_JUNIO) {
  const r = calcularMediacion(monto, JUNIO_2026)
  if (!r) {
    ok('tabla ' + item + ' devuelve resultado', false)
    continue
  }
  ok('tabla ' + item + ' cae en el item ' + item, r.item.item === item, 'cayo en ' + r.item.item)
  igual('tabla ' + item + ' honorario en pesos', r.honorarioPesos, honorario, 1e-6)
}

// El maximo del item G que declara la tabla: 2 % hasta 1.494.000.
igual('tabla G · tope en pesos', TOPE_ITEM_G_UHOM * JUNIO_2026.valor, 1_494_000, 1e-6)

// Agosto 2026, para que el ancla no dependa de un solo mes.
const agostoA = calcularMediacion(388_800, AGOSTO_2026)!
ok('tabla agosto · 30 UHOM cae en A', agostoA.item.item === 'A')
igual('tabla agosto · honorario A', agostoA.honorarioPesos, 3 * 12_960, 1e-6)

// ================================================================
// 3. Los bordes, de los dos lados
// ================================================================
//
// Una escala escalonada solo se puede romper en un corte. El limite
// es inclusivo: 30 UHOM exactos son item A, y un peso mas es B.

console.log('Bordes de tramo')

const CORTES: [number, string, string][] = [
  [30, 'A', 'B'],
  [60, 'B', 'C'],
  [150, 'C', 'D'],
  [300, 'D', 'E'],
  [600, 'E', 'F'],
  [1000, 'F', 'G'],
]

for (const [corte, abajo, arriba] of CORTES) {
  const v = JUNIO_2026.valor
  const justo = calcularMediacion(corte * v, JUNIO_2026)!
  const pasado = calcularMediacion(corte * v + 1, JUNIO_2026)!

  ok(corte + ' UHOM exactos son ' + abajo, justo.item.item === abajo, 'dio ' + justo.item.item)
  ok(corte + ' UHOM y un peso son ' + arriba, pasado.item.item === arriba, 'dio ' + pasado.item.item)
  igual(corte + ' UHOM exactos: base sin redondear', justo.baseEnUHOM, corte)
}

// ================================================================
// 4. La base no se redondea para elegir tramo
// ================================================================
//
// honorarios.html redondeaba baseEnUMA cerca de cada corte y calculaba
// con el redondeo, asi que 15,4 daba lo de 15. Aca 30,4 UHOM tiene que
// ser item B, no item A.

console.log('Sin redondeo en los bordes')

for (const [corte, , arriba] of CORTES) {
  const v = JUNIO_2026.valor
  const r = calcularMediacion((corte + 0.4) * v, JUNIO_2026)!
  ok(
    (corte + 0.4) + ' UHOM no se trata como ' + corte,
    r.item.item === arriba,
    'dio ' + r.item.item,
  )
  igual((corte + 0.4) + ' UHOM se conserva', r.baseEnUHOM, corte + 0.4, 1e-6)
}

// ================================================================
// 5. El item G: el porcentaje y el tope
// ================================================================

console.log('Item G: 2 % y tope de 120 UHOM')

const g = calcularMediacion(20_000_000, JUNIO_2026)!
ok('20.000.000 cae en G', g.item.item === 'G')
igual('G · 2 % del monto', g.honorarioPesos, 20_000_000 * PORCENTAJE_ITEM_G, 1e-6)
ok('G · sin tope todavia', g.porTope === false)

// El tope se alcanza cuando el 2 % supera 120 UHOM, o sea a partir de
// 6000 UHOM de base: 6000 x 12.450 = 74.700.000.
const justoAntes = calcularMediacion(74_700_000, JUNIO_2026)!
igual('G · justo en el tope', justoAntes.honorarioUHOM, TOPE_ITEM_G_UHOM, 1e-9)
ok('G · justo en el tope no lo marca todavia', justoAntes.porTope === false)

const topeado = calcularMediacion(80_000_000, JUNIO_2026)!
igual('G · topeado en 120 UHOM', topeado.honorarioUHOM, TOPE_ITEM_G_UHOM)
igual('G · topeado en pesos', topeado.honorarioPesos, 1_494_000, 1e-6)
ok('G · marca el tope', topeado.porTope === true)

// El tope es del item G y de ningun otro: A a F topean en 20 UHOM, muy
// por debajo de 120, asi que ninguno puede activarlo nunca.
for (const item of ESCALA_MEDIACION) {
  if (item.honorarioUHOM === null) continue
  ok(
    'item ' + item.item + ' no puede llegar al tope',
    item.honorarioUHOM < TOPE_ITEM_G_UHOM,
  )
}

// ================================================================
// 6. La base unica: la reduccion del art. 22 puede cambiar de tramo
// ================================================================
//
// Es el unico lugar donde la decision de usar la base del expediente
// —con las reducciones de los arts. 22 y 40 ya aplicadas— mueve el
// numero del mediador. En una escala escalonada, reducir la base casi
// siempre no cambia nada, y cuando cambia salta un escalon entero.
//
// El caso esta en PLAN_MEDIACION.md con estos mismos numeros.

console.log('Base unica: la reduccion del art. 22 cruza un corte')

const sinReducir = calcularMediacion(8_000_000, JUNIO_2026)!
const reducida = calcularMediacion(8_000_000 * 0.7, JUNIO_2026)!

ok('8.000.000 sin reducir cae en F', sinReducir.item.item === 'F', 'dio ' + sinReducir.item.item)
igual('8.000.000 sin reducir da 20 UHOM', sinReducir.honorarioUHOM, 20)
igual('8.000.000 sin reducir en pesos', sinReducir.honorarioPesos, 249_000, 1e-6)

ok('con el -30 % cae en E', reducida.item.item === 'E', 'dio ' + reducida.item.item)
igual('con el -30 % da 16 UHOM', reducida.honorarioUHOM, 16)
igual('con el -30 % en pesos', reducida.honorarioPesos, 199_200, 1e-6)

// Y el caso donde la misma reduccion no cambia nada, que es el normal.
const antes = calcularMediacion(7_000_000, JUNIO_2026)!
const despues = calcularMediacion(7_000_000 * 0.7, JUNIO_2026)!
ok('7.000.000: el -30 % no cruza ningun corte', antes.item.item === despues.item.item)
igual('7.000.000: mismo honorario', despues.honorarioUHOM, antes.honorarioUHOM)

// ================================================================
// 7. Invariantes y entradas invalidas
// ================================================================

console.log('Invariantes y bordes')

for (const base of [500_000, 8_000_000, 20_000_000, 900_000_000]) {
  const r = calcularMediacion(base, JUNIO_2026)!
  igual('base ' + base + ': pesos = UHOM x valor', r.honorarioPesos, r.honorarioUHOM * JUNIO_2026.valor, 1e-6)
  igual('base ' + base + ': base en UHOM', r.baseEnUHOM, base / JUNIO_2026.valor)
  ok('base ' + base + ': el limite anterior queda por debajo', r.limiteAnterior <= r.baseEnUHOM)
  ok('base ' + base + ': devuelve el UHOM usado', r.uhom.valor === JUNIO_2026.valor)
}

ok('base 0 devuelve null', calcularMediacion(0, JUNIO_2026) === null)
ok('base negativa devuelve null', calcularMediacion(-1, JUNIO_2026) === null)
ok('UHOM 0 devuelve null', calcularMediacion(1_000_000, uhom(0)) === null)
ok('UHOM negativo devuelve null', calcularMediacion(1_000_000, uhom(-1)) === null)
ok('base NaN devuelve null', calcularMediacion(NaN, JUNIO_2026) === null)

// ================================================================
// 8. El control de forma del UHOM
// ================================================================
//
// El UHOM es la UR-SINEP por doce, redondeada a la decena proxima
// superior: siempre termina en cero. Es lo unico que se puede
// comprobar sin tener la UR-SINEP al lado, y alcanza para cazar un
// separador mal leido.

console.log('Forma del UHOM')

ok('12.450 es plausible', esValorUHOMPlausible(12_450))
ok('12.720 es plausible', esValorUHOMPlausible(12_720))
ok('12.960 es plausible', esValorUHOMPlausible(12_960))
ok('12,96 no es plausible', !esValorUHOMPlausible(12.96))
ok('12.955 no es plausible', !esValorUHOMPlausible(12_955))
ok('0 no es plausible', !esValorUHOMPlausible(0))

// La formula, comprobada en los tres meses publicados.
const SINEP: [number, number][] = [
  [1036.67, 12_450],
  [1059.48, 12_720],
  [1079.61, 12_960],
]
for (const [ur, esperado] of SINEP) {
  igual('UR-SINEP ' + ur + ' x 12 a la decena superior', Math.ceil((ur * 12) / 10) * 10, esperado)
}

// ================================================================

console.log('\n========================================')
console.log('Resultado: ' + (fallos === 0 ? 'TODOS OK' : 'HUBO FALLOS'))
console.log('Tests totales: ' + totales + ', fallos: ' + fallos)
console.log('========================================')

process.exit(fallos === 0 ? 0 : 1)
