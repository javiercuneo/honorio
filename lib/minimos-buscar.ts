// ---------------------------------------------------------------
// lib/minimos-buscar.ts
// Busqueda sobre la tabla de minimos arancelarios.
//
// Es busqueda textual, no semantica, y a proposito: son ~45 conceptos
// fijos que solo cambian cuando cambia la ley. Un indice semantico
// traeria un modelo, un build y una desincronizacion posible, para
// resolver algo que se resuelve normalizando tildes.
//
// Lo que la acerca a "semantica" sin costo:
//   - insensible a tildes, mayusculas y orden de las palabras;
//   - cada item hereda el texto de su categoria, asi que "19" o
//     "no pecuniario" traen el articulo entero;
//   - `alias` en los datos, solo donde el nombre de tribunal no
//     coincide con el de la ley ("insania" por "restricciones a la
//     capacidad").
//
// Sin estado, sin React: se puede probar sola.
// ---------------------------------------------------------------

import { MINIMOS_ORDENADOS, type MinimoCategoria } from './legal/minimos-data'

/**
 * Minusculas y sin tildes, conservando la posicion de cada caracter.
 * La correspondencia uno a uno es lo que permite resaltar la
 * coincidencia sobre el texto original, con sus tildes puestas.
 */
export function normalizar(texto: string): string {
  let out = ''
  for (const ch of texto.toLowerCase()) {
    const base = ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    out += base.length === 1 ? base : ch
  }
  return out
}

/** La consulta partida en palabras normalizadas. */
export function tokenizar(consulta: string): string[] {
  return normalizar(consulta).split(/\s+/).filter(Boolean)
}

/**
 * Un token coincide si aparece entero, o si aparece sin sus ultimas
 * una o dos letras. En castellano ahi viven el plural y el genero, que
 * es casi toda la distancia entre como se busca y como esta escrita la
 * ley: "pecuniario" contra "pecuniaria", "peritos" contra "perito",
 * "acciones" contra "accion".
 *
 * Cuanto mas se recorta, mas larga tiene que quedar la raiz: asi "art"
 * o "bis" no se vuelven comodines, y "perito" no termina trayendo
 * "pericia" por haberse quedado en "peri".
 */
const RAIZ_MINIMA: Record<number, number> = { 1: 4, 2: 5 }

function raices(token: string): string[] {
  const out = [token]
  for (const corte of [1, 2]) {
    const raiz = token.slice(0, token.length - corte)
    if (raiz.length >= RAIZ_MINIMA[corte]) out.push(raiz)
  }
  return out
}

function coincide(heno: string, token: string): boolean {
  return raices(token).some((r) => heno.includes(r))
}

function textoCategoria(cat: MinimoCategoria): string {
  return normalizar([cat.titulo, cat.articulo, ...(cat.alias ?? [])].join(' '))
}

/**
 * Filtra las categorias dejando solo los items que coinciden con
 * todos los tokens. Una categoria vacia se descarta entera.
 *
 * Consulta vacia devuelve la referencia completa: la pantalla arranca
 * mostrando todo, no esperando que el lector elija algo.
 */
export function buscarMinimos(consulta: string): MinimoCategoria[] {
  const tokens = tokenizar(consulta)
  if (tokens.length === 0) return MINIMOS_ORDENADOS

  const resultado: MinimoCategoria[] = []

  for (const cat of MINIMOS_ORDENADOS) {
    const base = textoCategoria(cat)

    const grupos = cat.grupos
      .map((grupo) => {
        const conGrupo = base + ' ' + normalizar(grupo.titulo ?? '')
        const items = grupo.items.filter((item) => {
          const heno = conGrupo + ' ' + normalizar([item.label, ...(item.alias ?? [])].join(' '))
          return tokens.every((t) => coincide(heno, t))
        })
        return items.length > 0 ? { ...grupo, items } : null
      })
      .filter((g): g is NonNullable<typeof g> => g !== null)

    if (grupos.length > 0) resultado.push({ ...cat, grupos })
  }

  return resultado
}

export function contarConceptos(categorias: MinimoCategoria[]): number {
  return categorias.reduce(
    (n, cat) => n + cat.grupos.reduce((m, g) => m + g.items.length, 0),
    0,
  )
}

/** Total de conceptos en la tabla, para el contador de resultados. */
export const TOTAL_CONCEPTOS = contarConceptos(MINIMOS_ORDENADOS)

/**
 * Parte un texto en tramos, marcando los que coinciden con algun
 * token. Devuelve tramos alternados para que la vista los pinte sin
 * conocer la logica de busqueda.
 */
export function resaltar(
  texto: string,
  tokens: string[],
): { texto: string; marcado: boolean }[] {
  if (tokens.length === 0) return [{ texto, marcado: false }]

  const norm = normalizar(texto)
  // Si la normalizacion corrio los indices, no se resalta: preferible
  // texto sin marcar que marcas en el lugar equivocado.
  if (norm.length !== texto.length) return [{ texto, marcado: false }]

  const marcas = new Array<boolean>(texto.length).fill(false)
  for (const token of tokens) {
    // Marcar "de" o "no" en cada fila es ruido, no orientacion.
    if (token.length < 3) continue

    // Las mismas variantes que acepta `coincide`, para que lo marcado
    // sea exactamente lo que hizo entrar a la fila en el resultado.
    for (const v of raices(token)) {
      let desde = norm.indexOf(v)
      while (desde !== -1) {
        for (let i = desde; i < desde + v.length; i++) marcas[i] = true
        desde = norm.indexOf(v, desde + 1)
      }
    }
  }

  const tramos: { texto: string; marcado: boolean }[] = []
  let inicio = 0
  for (let i = 1; i <= texto.length; i++) {
    if (i === texto.length || marcas[i] !== marcas[inicio]) {
      tramos.push({ texto: texto.slice(inicio, i), marcado: marcas[inicio] })
      inicio = i
    }
  }
  return tramos
}
