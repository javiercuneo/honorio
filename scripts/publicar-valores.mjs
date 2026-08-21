// ---------------------------------------------------------------
// Copia data/uma.json y data/uhom.json a public/, para que el sitio
// los sirva en honorio.ar/uma.json y honorio.ar/uhom.json.
//
// Corre solo, antes del build (`prebuild` en package.json).
//
// **Existe para que el sitio pueda decir con que valor calcula.** Sin
// esto, el unico lugar donde vive el numero publicado es adentro de un
// chunk de JavaScript con nombre con hash. Se puede pescar de ahi con
// un grep —se probo, funciona hoy— pero es una heuristica: el dia que
// el minificador escriba 1.0422e5 en vez de 104220, o que el valor se
// mueva a otro chunk, el control diria "todo bien" sin haber mirado
// nada. Un control que falla en silencio es peor que ninguno, porque
// ademas da tranquilidad.
//
// La copia es byte a byte y no una transformacion a proposito: lo
// unico que hay que creerle a este script es que copio bien, y eso se
// ve leyendo las dos lineas.
//
// **La copia no se versiona** (esta en .gitignore). Dos archivos con
// el mismo numero adentro del repositorio es la forma exacta de que un
// dia digan cosas distintas. La fuente es data/; public/ es una
// consecuencia del build, como out/.
// ---------------------------------------------------------------

import { copyFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')

for (const archivo of ['uma.json', 'uhom.json']) {
  copyFileSync(join(RAIZ, 'data', archivo), join(RAIZ, 'public', archivo))
  console.log('public/' + archivo + ' ← data/' + archivo)
}
