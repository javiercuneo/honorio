// ---------------------------------------------------------------
// Genera public/og.png, la tarjeta que se ve cuando alguien pega el
// enlace de Honorio en WhatsApp, LinkedIn o Twitter.
//
//   node scripts/og.mjs
//
// No corre en el build a proposito: la imagen es un archivo commiteado
// como cualquier otro asset. El build tiene que ser reproducible sin
// depender de que sharp pueda rasterizar en la maquina que publica, y
// esta imagen cambia una vez por anio, no una vez por push.
//
// Se compone del wordmark —que es el mismo SVG que usa la marca en
// pantalla, con currentColor reemplazado— sobre el fondo oscuro del
// tema. Oscuro y no claro porque la tarjeta se ve en miniatura dentro
// de una conversacion: lo que decide si se lee es el contraste.
// ---------------------------------------------------------------

import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const salida = join(raiz, 'public', 'og.png')

// 1200x630 es la relacion que piden Open Graph y Twitter para la
// tarjeta grande. Cualquier otra la recortan.
const ANCHO = 1200
const ALTO = 630

// Los mismos tokens del tema oscuro de app/globals.css.
const FONDO = '#0d0f13'
const TEXTO = '#edeff3'
const TENUE = '#99a1ae'
const ACENTO = '#7a99ff'

const wordmark = readFileSync(join(raiz, 'public', 'honorio-wordmark.svg'), 'utf8')
  .replace(/currentColor/g, TEXTO)

const ANCHO_MARCA = 560

const marca = await sharp(Buffer.from(wordmark))
  .resize({ width: ANCHO_MARCA })
  .png()
  .toBuffer()

const { height: altoMarca } = await sharp(marca).metadata()

// El texto va en su propia capa y no en el SVG del wordmark: asi el
// tipografiado no depende de como resuelva las fuentes el rasterizador
// del wordmark, que viene de un trazado y no tiene ninguna.
const texto = `<svg xmlns="http://www.w3.org/2000/svg" width="${ANCHO}" height="${ALTO}">
  <style>
    .titulo { font-family: "Segoe UI", Arial, Helvetica, sans-serif; font-size: 38px; fill: ${TEXTO}; }
    .bajada { font-family: "Segoe UI", Arial, Helvetica, sans-serif; font-size: 30px; fill: ${TENUE}; }
    .dominio { font-family: "Consolas", "Courier New", monospace; font-size: 24px; fill: ${ACENTO}; letter-spacing: 3px; }
  </style>
  <rect x="0" y="0" width="${ANCHO}" height="6" fill="${ACENTO}"/>
  <text class="titulo" x="90" y="392">Honorarios de la Ley 27.423</text>
  <text class="bajada" x="90" y="444">con cada paso del cálculo a la vista</text>
  <text class="dominio" x="90" y="548">HONORIO.AR</text>
</svg>`

await sharp({
  create: {
    width: ANCHO,
    height: ALTO,
    channels: 4,
    background: FONDO,
  },
})
  .composite([
    { input: marca, left: 90, top: Math.round(300 - altoMarca) },
    { input: Buffer.from(texto), left: 0, top: 0 },
  ])
  .png()
  .toFile(salida)

console.log(`og.png escrita: ${ANCHO}x${ALTO} en public/og.png`)
