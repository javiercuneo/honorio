// ---------------------------------------------------------------
// lib/basePath.ts
// Unica fuente de verdad para el basePath de deploy (GitHub Pages
// sirve honorio en una subcarpeta, ver next.config.mjs).
// Usar para cualquier ruta absoluta a /public que no pase por
// next/image o next/link (fetch() de scripts, <img src> crudo).
// ---------------------------------------------------------------

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export function withBasePath(path: string): string {
  return BASE_PATH + path
}
