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
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: process.cwd(),
  },
}

export default nextConfig
