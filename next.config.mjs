/** @type {import('next').NextConfig} */
// Solo se aplica en produccion (npm run build) para no romper el dev
// server local (npm run dev sigue sirviendo en la raiz, sin prefijo).
const isProd = process.env.NODE_ENV === 'production'
const basePath = isProd ? '/Herramientas-Judiciales-IA/honorio' : ''

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
