// ---------------------------------------------------------------
// Las URL que apuntan afuera de Honorio, todas juntas.
//
// Son absolutas y eso las hace fragiles: el resto del sitio usa
// rutas relativas justamente para sobrevivir a un cambio de dominio.
// Estas no pueden, porque cruzan de un sitio a otro. Tenerlas en un
// solo archivo es lo que hace que el dia que `javiercuneo.com.ar`
// este activo el barrido sea una lectura de este archivo y no de
// todo el repositorio.
//
// Ya paso: al renombrar el repositorio en agosto de 2026, la URL
// vieja de Pages quedo con un 404 duro y hubo que salir a buscar
// enlaces sueltos a mano.
// ---------------------------------------------------------------

/** El sitio del que salio Honorio: plazos, mora, caducidad, PDF. */
export const HERRAMIENTAS = 'https://javiercuneo.github.io/herramientas-judiciales/'

/** Documentacion de dominio (Ley 27.423), publicada con ese sitio. */
export const DOCUMENTACION =
  'https://javiercuneo.github.io/herramientas-judiciales/docs/'

/**
 * Los mediadores tienen normativa propia y su calculadora se quedo
 * con el resto de las herramientas.
 */
export const CALCULADORA_MEDIACION =
  'https://javiercuneo.github.io/herramientas-judiciales/calculadoras/honorarios-mediacion.html'

/** Honorio, para que el informe impreso diga de donde salio. */
export const HONORIO = 'https://honorio.ar'

/** El codigo, que la AGPL obliga a poder mirar. */
export const REPOSITORIO = 'https://github.com/javiercuneo/honorio'

export const LICENCIA = 'https://www.gnu.org/licenses/agpl-3.0.html'

/** Para reportar un numero mal calculado. */
export const CONTACTO = 'javiercuneol@hotmail.com'

/**
 * La serie completa de valores de la UMA, mantenida por el CPACF.
 *
 * Es distinta del enlace que viaja en `data/uma.json`: aquel apunta a
 * la norma que fijo el valor vigente —lo que se cita—, este a la tabla
 * historica —lo que se consulta para verificar—. El paso de la UMA usa
 * los dos, cada uno donde corresponde.
 */
export const VALORES_UMA =
  'https://www.cpacf.org.ar/noticia/5201/valores-uma-pjn-ley-27423'
