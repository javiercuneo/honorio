// ---------------------------------------------------------------
// Controla que honorio.ar este calculando con el valor que dice la
// planilla.
//
//   npm run verificar
//
// **Por que mira el sitio y no el repositorio.** Comparar
// data/uma.json contra la planilla no sirve de nada: lo escribe
// `actualizar-uma.mjs` leyendo esa misma planilla, asi que si el
// script corrio coinciden por construccion, y si no corrio tampoco
// corre el control. Seria preguntarle a la sincronizacion si
// sincronizo. Entre el repositorio y el visitante quedan ademas el
// commit y el deploy, que son dos formas mas de que el numero se
// quede quieto sin que nadie se entere.
//
// Lo unico que responde la pregunta que importa —"¿con que numero le
// esta contestando la app a quien la usa ahora?"— es mirar lo servido.
// Este control lo mira de punta a punta y por eso caza los cuatro
// casos con una sola comparacion:
//
//   1. el cron no corrio (o GitHub lo deshabilito por inactividad)
//   2. corrio y se planto en un control (salto > 60 %, etc.)
//   3. corrio y commiteo, pero el deploy fallo
//   4. deployo, pero lo servido quedo viejo
//
// El 20/8/26 el caso 1 dejo doce dias el sitio con $102.076 cuando la
// planilla ya decia $104.220, y lo que lo descubrio fue que el
// asistente legacy —que lee la planilla en vivo— mostraba otra cosa.
// Descubrirlo por casualidad, comparando con una herramienta que se
// mantiene aparte y que algun dia se va a apagar, no es un control.
//
// **No arregla nada.** Avisa. Arreglarlo es un clic —Actions → «UMA y
// UHOM» → Run workflow— y quien lo da tiene que ser una persona: si
// la sincronizacion no corrio hay una razon, y taparla corriendola de
// nuevo a ciegas es como se pierde el proximo caso 2.
//
// Salidas:
//   0  lo publicado coincide con la planilla
//   1  no coinciden, o no se pudo comprobar. **Las dos son rojo a
//      proposito.** "No pude leer el sitio" no es tranquilizador: es
//      no saber, y no saber si el numero esta bien tiene que
//      interrumpir igual que saber que esta mal.
// ---------------------------------------------------------------

import { leerPlanilla, parseImporte } from './planilla.mjs'

const SITIO = process.env.SITIO ?? 'https://honorio.ar'

const problemas = []
const avisos = []

function pesos(n) {
  return '$' + n.toLocaleString('es-AR')
}

function abortar(motivo) {
  console.error('No se pudo comprobar: ' + motivo)
  process.exit(1)
}

/** Lo que la app publica de si misma. */
async function leerPublicado(archivo) {
  const url = SITIO + '/' + archivo
  const r = await fetch(url, { cache: 'no-store' }).catch((e) => {
    abortar('no se pudo pedir ' + url + ' (' + e.message + ')')
  })

  if (!r.ok) {
    // Un 404 casi siempre significa que el build no corrio `prebuild`,
    // no que el sitio este caido. Vale la pena decirlo, porque el
    // reflejo seria mirar el deploy y el deploy va a estar verde.
    abortar(
      url +
        ' respondio HTTP ' +
        r.status +
        (r.status === 404
          ? '. ¿El build corrio `prebuild` (scripts/publicar-valores.mjs)?'
          : ''),
    )
  }

  const texto = await r.text()

  // GitHub Pages sirve su 404.html con HTML adentro; sin esto el
  // JSON.parse tiraria un error que no dice nada.
  try {
    const j = JSON.parse(texto)
    const ultimo = j.historia?.[j.historia.length - 1]
    if (!ultimo || typeof ultimo.valor !== 'number') {
      abortar(url + ' no tiene un valor legible.')
    }
    return ultimo
  } catch {
    abortar(url + ' no devolvio JSON. ¿El deploy sirvio otra cosa?')
  }
}

const tabla = await leerPlanilla(abortar)

/**
 * Compara una unidad y anota lo que encuentre. No sale del proceso:
 * que la UMA este bien no puede tapar que el UHOM este mal, ni al
 * reves. Se informan las dos y despues se decide el codigo de salida.
 */
async function comparar({ clave, etiqueta, archivo }) {
  if (!tabla.has(clave)) {
    abortar('la planilla no tiene una fila ' + clave + '.')
  }

  const enPlanilla = parseImporte(tabla.get(clave))
  if (enPlanilla === null || enPlanilla <= 0) {
    abortar(
      'la fila ' + clave + ' no tiene un numero legible: ' + JSON.stringify(tabla.get(clave)),
    )
  }

  const publicado = await leerPublicado(archivo)

  if (publicado.valor !== enPlanilla) {
    problemas.push(
      etiqueta +
        '\n' +
        '    la planilla dice   ' +
        pesos(enPlanilla) +
        '\n' +
        '    el sitio publica   ' +
        pesos(publicado.valor) +
        (publicado.fuente ? '  (' + publicado.fuente + ')' : ''),
    )
    return
  }

  console.log(etiqueta + ': ' + pesos(publicado.valor) + ' — coincide.')

  // La cita se controla aparte y no pone el control en rojo. Un numero
  // equivocado le arruina la regulacion a alguien; una cita que quedo
  // vieja se corrige sola en la proxima corrida y mientras tanto el
  // calculo es correcto. Mezclarlas haria que el rojo deje de
  // significar "el numero esta mal", que es lo unico que tiene que
  // significar para que nadie lo empiece a ignorar.
  if (!publicado.fuente) {
    avisos.push(etiqueta + ' se publica sin norma: el informe no la puede citar.')
  }
}

await comparar({ clave: 'UMA', etiqueta: 'La UMA', archivo: 'uma.json' })
await comparar({ clave: 'UHOM', etiqueta: 'El UHOM', archivo: 'uhom.json' })

for (const a of avisos) console.warn('Aviso: ' + a)

if (problemas.length === 0) {
  console.log('\nLo publicado coincide con la planilla.')
  process.exit(0)
}

console.error('\n' + SITIO + ' esta calculando con un valor que no es el de la planilla.\n')
for (const p of problemas) console.error('  ' + p + '\n')
console.error('Que hacer: GitHub → Actions → «UMA y UHOM» → Run workflow.')
console.error('Si eso no lo arregla, fijate si el ultimo Deploy Pages fallo.')
process.exit(1)
