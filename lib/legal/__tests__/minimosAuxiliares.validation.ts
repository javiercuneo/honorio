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
  SIN_PERICIA_ART61BIS,
  baseDondeElPisoDejaDeMorder,
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

// 1. La derivacion encontro los tres grupos.
chequear(
  'son exactamente tres pisos',
  PISOS_AUXILIARES_CON_BASE.length === 3,
  `hay ${PISOS_AUXILIARES_CON_BASE.length}`,
)

// 2. Y son los que dice la ley. Estos numeros no se leen del modulo
// derivado sino que se escriben aca a proposito: es el unico lugar
// donde tienen que estar dos veces, porque comparar una fuente
// consigo misma no prueba nada.
//
// El art. 61 entro el 15/8/2026: lo sustituyo la Ley 27.802 y es el
// piso del perito en los procesos CON monto, que son todos los que
// Honorio calcula. Faltaba.
const ESPERADOS = [
  { articulo: 'art. 58', uma: 4, suponePericia: false },
  { articulo: 'art. 61', uma: 2, suponePericia: false },
  { articulo: 'art. 61 bis', uma: 2, suponePericia: true },
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
    chequear(
      `${esperado.articulo}: supone pericia = ${esperado.suponePericia}`,
      !!piso.suponePericia === esperado.suponePericia,
      `es ${!!piso.suponePericia}`,
    )
  }
}

// 2 bis. El art. 61 y el 61 bis son dos pisos distintos y la
// derivacion los busca por titulo. Sin los dos puntos en el prefijo,
// "Art. 61" tambien matchea "Art. 61 bis" y los dos pisos salen
// iguales sin que falle nada.
chequear(
  'el piso del art. 61 no es el del 61 bis',
  PISOS_AUXILIARES_CON_BASE.find((p) => p.articulo === 'art. 61')?.concepto !==
    PISOS_AUXILIARES_CON_BASE.find((p) => p.articulo === 'art. 61 bis')?.concepto,
)

// 3. El 1/4 de UMA NO es un piso: el tercer parrafo del 61 bis dice
// "se le regulara", no "un minimo de". Si algun dia aparece en la
// lista de pisos, algo se leyo mal.
chequear(
  'el cuarto de UMA no esta entre los pisos',
  !PISOS_AUXILIARES_CON_BASE.some((p) => p.uma === 0.25),
)
chequear('el cuarto de UMA existe aparte', SIN_PERICIA_ART61BIS.uma === 0.25)

// 4. El cruce con el 5 % del art. 21, que es lo que decide si un piso
// muerde o es teorico.
chequear(
  'un piso de 2 UMA deja de morder en 40 UMA de base',
  baseDondeElPisoDejaDeMorder(2) === 40,
  `da ${baseDondeElPisoDejaDeMorder(2)}`,
)
chequear(
  'un piso de 4 UMA deja de morder en 80 UMA de base',
  baseDondeElPisoDejaDeMorder(4) === 80,
  `da ${baseDondeElPisoDejaDeMorder(4)}`,
)

// 3. El art. 60 queda afuera a proposito: es de los procesos NO
// susceptibles de apreciacion pecuniaria, donde no hay base ni
// escala del art. 21 al lado de la cual mostrarlo.
chequear(
  'el art. 60 no esta entre los pisos con base',
  !PISOS_AUXILIARES_CON_BASE.some((p) => p.articulo.includes('60')),
)

// 5. La categoria de la que se derivan sigue teniendo sus cinco
// grupos: 58, 60, 61, 61 bis y el supuesto sin pericia.
chequear(
  'MINIMOS_AUXILIARES_JUSTICIA conserva sus cinco grupos',
  MINIMOS_AUXILIARES_JUSTICIA.grupos.length === 5,
  `tiene ${MINIMOS_AUXILIARES_JUSTICIA.grupos.length}`,
)

// 6. El texto legal trae los tres articulos que toco la Ley 27.802.
for (const art of ['ARTÍCULO 60', 'ARTÍCULO 61 (', 'ARTÍCULO 61 bis']) {
  chequear(
    `el texto legal incluye ${art.trim()}`,
    MINIMOS_AUXILIARES_JUSTICIA.textoLegal.includes(art),
  )
}

console.log(`\n========================================`)
console.log(`Resultado: ${fail === 0 ? 'TODOS OK' : 'HUBO FALLOS'}`)
console.log(`Afirmaciones: ${ok + fail}, fallos: ${fail}`)
console.log('========================================')

process.exit(fail === 0 ? 0 : 1)
