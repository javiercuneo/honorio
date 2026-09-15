import { readdirSync, readFileSync } from 'node:fs'

// La version del motor la firma el informe: es lo que hace que un
// calculo de hoy se pueda reproducir dentro de dos anios. Se lee de
// package.json en vez de escribirse en una constante para que no
// existan dos versiones que puedan discrepar; la que vale es la que
// se publica.
const { version } = JSON.parse(readFileSync('./package.json', 'utf8'))

// Cuantas validaciones tiene que pasar un cambio antes de publicarse. La
// pantalla de inicio lo dice, y escrito a mano quedo en 17 cuando ya
// eran 18. Se cuenta con la misma regla que scripts/validate.mjs, asi el
// numero que se lee es el de las que corren.
const validaciones = readdirSync('./lib/legal/__tests__')
  .filter((f) => f.endsWith('.validation.ts')).length

/** @type {import('next').NextConfig} */
// El prefijo de publicacion viene de afuera porque Honorio se sirve
// desde dos lugares distintos mientras dura la mudanza:
//
//   honorio.ar                                    -> sin prefijo (default)
//   .../Herramientas-Judiciales-IA/honorio/       -> con prefijo
//
// El repositorio viejo lo pasa por PAGES_BASE_PATH en su workflow. Acá
// el default es vacio, que es lo correcto para un dominio propio.
//
// Solo se aplica en produccion (npm run build) para no romper el dev
// server local (npm run dev sigue sirviendo en la raiz, sin prefijo).
const isProd = process.env.NODE_ENV === 'production'
const basePath = isProd ? (process.env.PAGES_BASE_PATH ?? '') : ''

const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_VERSION: version,
    NEXT_PUBLIC_VALIDACIONES: String(validaciones),
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: process.cwd(),
  },
}

export default nextConfig
