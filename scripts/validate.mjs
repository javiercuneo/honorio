// ---------------------------------------------------------------
// Corre todas las validaciones del motor y falla si alguna falla.
//
// Existe para que la afirmacion "ningun cambio puede mover un numero
// sin que una validacion falle" sea cierta y no aspiracional: un solo
// comando, un solo codigo de salida, y CI lo puede ejecutar.
//
//   npm run validate
//
// Cada archivo *.validation.ts es un script independiente que compara
// la salida del motor contra casos conocidos y sale con codigo != 0
// si algo no coincide. No hay framework de tests a proposito: las
// validaciones tienen que poder leerse como lo que son, casos con su
// resultado esperado al lado.
// ---------------------------------------------------------------

import { spawnSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const dirTests = join(raiz, 'lib', 'legal', '__tests__')

const archivos = readdirSync(dirTests)
  .filter((f) => f.endsWith('.validation.ts'))
  .sort()

if (archivos.length === 0) {
  console.error('No se encontro ninguna validacion en lib/legal/__tests__/.')
  console.error('Eso no es un exito: es una senal de que algo se rompio.')
  process.exit(1)
}

console.log(`Corriendo ${archivos.length} validaciones del motor\n`)

const fallaron = []

for (const archivo of archivos) {
  const res = spawnSync(
    process.execPath,
    [join(raiz, 'node_modules', 'tsx', 'dist', 'cli.mjs'), join(dirTests, archivo)],
    { cwd: raiz, encoding: 'utf8' },
  )

  const salida = `${res.stdout ?? ''}${res.stderr ?? ''}`.trim()

  if (res.status === 0) {
    console.log(`  ok    ${archivo}`)
  } else {
    fallaron.push(archivo)
    console.log(`  FALLA ${archivo}`)
    if (salida) {
      console.log(salida.split('\n').map((l) => `        ${l}`).join('\n'))
    }
  }
}

console.log('')

if (fallaron.length > 0) {
  console.error(`${fallaron.length} de ${archivos.length} validaciones fallaron:`)
  for (const f of fallaron) console.error(`  - ${f}`)
  console.error('\nUn numero se movio. Si fue a proposito, va al CHANGELOG con el')
  console.error('caso concreto y el articulo que lo funda. Si no, es un bug.')
  process.exit(1)
}

console.log(`Las ${archivos.length} validaciones pasaron.`)
