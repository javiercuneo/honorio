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

// La misma que la constante FRASE de app/layout.tsx —la de la tarjeta,
// no la del buscador—, sin el «Honorio:» adelante porque el wordmark ya
// lo dice arriba. Si cambia alla, cambia aca y se vuelve a correr el
// script.
const FRASE = 'Si querés entender la regulación, andá por una avenida'

const ANCHO_MARCA = 520

const marca = await sharp(Buffer.from(wordmark))
  .resize({ width: ANCHO_MARCA })
  .png()
  .toBuffer()

const { height: altoMarca } = await sharp(marca).metadata()

// Todo centrado sobre el eje del lienzo. La composicion anterior estaba
// alineada a la izquierda y dejaba media tarjeta vacia a la derecha:
// en la miniatura de una conversacion eso se lee como un error de
// carga, no como aire.
const CENTRO = Math.round(ANCHO / 2)

// El bloque —marca, frase y dominio— se centra vertical como una sola
// pieza, en vez de acomodar cada linea a ojo.
const ALTO_BLOQUE = altoMarca + 58 + 62
const ARRIBA = Math.round((ALTO - ALTO_BLOQUE) / 2)

// El texto va en su propia capa y no en el SVG del wordmark: asi el
// tipografiado no depende de como resuelva las fuentes el rasterizador
// del wordmark, que viene de un trazado y no tiene ninguna.
const texto = `<svg xmlns="http://www.w3.org/2000/svg" width="${ANCHO}" height="${ALTO}">
  <style>
    .frase { font-family: "Segoe UI", Arial, Helvetica, sans-serif; font-size: 37px; fill: ${TEXTO}; }
    .dominio { font-family: "Consolas", "Courier New", monospace; font-size: 21px; fill: ${ACENTO}; letter-spacing: 4px; }
  </style>
  <rect x="0" y="0" width="${ANCHO}" height="6" fill="${ACENTO}"/>
  <text class="frase" x="${CENTRO}" y="${ARRIBA + altoMarca + 58}" text-anchor="middle">${FRASE}</text>
  <text class="dominio" x="${CENTRO}" y="${ARRIBA + altoMarca + 120}" text-anchor="middle">HONORIO.AR · LEY 27.423</text>
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
    { input: marca, left: CENTRO - Math.round(ANCHO_MARCA / 2), top: ARRIBA },
    { input: Buffer.from(texto), left: 0, top: 0 },
  ])
  .png()
  .toFile(salida)

console.log(`og.png escrita: ${ANCHO}x${ALTO} en public/og.png`)
