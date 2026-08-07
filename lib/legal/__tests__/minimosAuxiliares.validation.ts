// ---------------------------------------------------------------
// Validacion: los pisos de los auxiliares que el dashboard muestra
// al lado del 5 %-10 % del art. 21.
//
// PISOS_AUXILIARES_CON_BASE no escribe sus numeros: los deriva de
// MINIMOS_AUXILIARES_JUSTICIA buscando los grupos por el titulo. Eso
// evita tener el mismo numero de la ley en dos lugares, pero abre
// otro riesgo: si alguien renombra un grupo, la derivacion devuelve
// una lista mas corta **y no falla nada**. La pantalla simplemente
// dejaria de mostrar un piso, en silencio.
//
// Esta validacion existe para que ese silencio sea imposible.
//
// Uso: npx tsx lib/legal/__tests__/minimosAuxiliares.validation.ts
// ---------------------------------------------------------------

import {
  MINIMOS_AUXILIARES_JUSTICIA,
  PISOS_AUXILIARES_CON_BASE,
} from '../minimos-data'

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

console.log('========================================')
console.log('Validacion: pisos de los auxiliares')
console.log('========================================\n')

// 1. La derivacion encontro los dos grupos.
chequear(
  'son exactamente dos pisos',
  PISOS_AUXILIARES_CON_BASE.length === 2,
  `hay ${PISOS_AUXILIARES_CON_BASE.length}`,
)

// 2. Y son los que dice la ley. Estos numeros no se leen del modulo
// derivado sino que se escriben aca a proposito: es el unico lugar
// donde tienen que estar dos veces, porque comparar una fuente
// consigo misma no prueba nada.
const ESPERADOS = [
  { articulo: 'art. 58', uma: 4 },
  { articulo: 'art. 61 bis', uma: 2 },
]

for (const esperado of ESPERADOS) {
  const piso = PISOS_AUXILIARES_CON_BASE.find((p) => p.articulo === esperado.articulo)
  chequear(`existe el piso del ${esperado.articulo}`, piso !== undefined)
  if (piso) {
    chequear(
      `${esperado.articulo} son ${esperado.uma} UMA`,
      piso.uma === esperado.uma,
      `es ${piso.uma}`,
    )
    chequear(
      `${esperado.articulo} tiene concepto`,
      typeof piso.concepto === 'string' && piso.concepto.length > 0,
    )
  }
}

// 3. El art. 60 queda afuera a proposito: es de los procesos NO
// susceptibles de apreciacion pecuniaria, donde no hay base ni
// escala del art. 21 al lado de la cual mostrarlo.
chequear(
  'el art. 60 no esta entre los pisos con base',
  !PISOS_AUXILIARES_CON_BASE.some((p) => p.articulo.includes('60')),
)

// 4. La categoria de la que se derivan sigue teniendo sus tres grupos.
chequear(
  'MINIMOS_AUXILIARES_JUSTICIA conserva sus tres grupos',
  MINIMOS_AUXILIARES_JUSTICIA.grupos.length === 3,
  `tiene ${MINIMOS_AUXILIARES_JUSTICIA.grupos.length}`,
)

console.log(`\n========================================`)
console.log(`Resultado: ${fail === 0 ? 'TODOS OK' : 'HUBO FALLOS'}`)
console.log(`Afirmaciones: ${ok + fail}, fallos: ${fail}`)
console.log('========================================')

process.exit(fail === 0 ? 0 : 1)
