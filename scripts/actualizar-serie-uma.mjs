// ---------------------------------------------------------------
// Trae la serie historica de la UMA del sitio de herramientas y la
// escribe en data/serie-uma.json si cambio.
//
//   npm run serie-uma
//
// La serie se reconstruyo alla, de los actos de la CSJN uno por uno, y
// alla se mantiene. Aca es una copia **byte a byte**: lo unico que hay
// que creerle a este script es que copio bien, y que lo que copio tiene
// la forma que lib/legal/serie-uma.ts espera.
//
// La lee este script —el cron, o quien lo corra—, nunca el navegador
// del visitante. Es la misma razon que lib/legal/uma.ts da para la
// planilla: una afirmacion de privacidad no puede depender de a quien
// le pide un archivo la pagina.
//
// **No reemplaza a data/uma.json ni compite con ella.** La app calcula
// con la UMA vigente de la planilla; la serie sirve para decir que valor
// regia a otra fecha y de que norma sale un valor escrito a mano. Si la
// copia queda vieja, lo que falta lo completa data/uma.json (ver
// SERIE_UMA): una corrida que falla no deja a nadie calculando mal.
//
// Salidas:
//   0  con o sin cambios
//   1  no se pudo leer, o lo que trajo no pasa los controles. No toca
//      el archivo.
// ---------------------------------------------------------------

import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const DESTINO = join(RAIZ, 'data', 'serie-uma.json')
const FUENTE = 'https://javiercuneo.com.ar/data/serie-uma.json'
const ISO = /^\d{4}-\d{2}-\d{2}$/

function fallar(motivo) {
  console.error('serie-uma: ' + motivo + '. No se toco data/serie-uma.json.')
  process.exit(1)
}

const respuesta = await fetch(FUENTE).catch((e) => fallar('no se pudo leer ' + FUENTE + ' (' + e.message + ')'))
if (!respuesta.ok) fallar(FUENTE + ' respondio ' + respuesta.status)
const crudo = await respuesta.text()

let nueva
try {
  nueva = JSON.parse(crudo)
} catch {
  fallar('lo que trajo no es JSON')
}

const valores = nueva?.valores
if (!Array.isArray(valores) || valores.length === 0) fallar('no trae "valores"')

let anterior = ''
for (const v of valores) {
  if (!Number.isInteger(v.valor) || v.valor <= 0) fallar('valor invalido: ' + JSON.stringify(v.valor))
  if (typeof v.vigencia !== 'string' || !ISO.test(v.vigencia)) fallar('vigencia mal formada: ' + v.vigencia)
  if (v.vigencia <= anterior) fallar('las vigencias no van en orden: ' + v.vigencia + ' despues de ' + anterior)
  if (typeof v.norma !== 'string' || !v.norma) fallar('un valor sin norma: ' + v.vigencia)
  anterior = v.vigencia
}

const actual = JSON.parse(readFileSync(DESTINO, 'utf8'))

// Una serie se completa, no se reescribe. Si un valor que ya estaba
// cambio, puede ser una correccion legitima de alla —la serie se leyo a
// mano en parte— pero eso lo decide una persona mirando el acto, no
// este script.
const porVigencia = new Map(valores.map((v) => [v.vigencia, v.valor]))
for (const v of actual.valores) {
  if (!porVigencia.has(v.vigencia)) fallar('la serie nueva no trae la vigencia ' + v.vigencia + ', que ya estaba')
  if (porVigencia.get(v.vigencia) !== v.valor) {
    fallar('el valor vigente desde ' + v.vigencia + ' paso de ' + v.valor + ' a ' + porVigencia.get(v.vigencia) + '; revisalo contra el acto antes de copiarlo')
  }
}

if (crudo === readFileSync(DESTINO, 'utf8')) {
  console.log('serie-uma: sin cambios (' + valores.length + ' valores).')
} else {
  writeFileSync(DESTINO, crudo)
  console.log('serie-uma: ' + actual.valores.length + ' -> ' + valores.length + ' valores.')
}
