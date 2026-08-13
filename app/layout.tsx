import type { Metadata, Viewport } from 'next'
import { Archivo, Geist, Geist_Mono, Source_Serif_4 } from 'next/font/google'
import { withBasePath } from '@/lib/basePath'
import { HONORIO } from '@/lib/enlaces'
import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

// Archivo (Omnibus-Type, Buenos Aires): grotesca de raiz DIN con cifras
// tabulares. Es la voz de las cifras y de las preguntas del wizard.
const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
})

// Source Serif se reserva al texto de la ley: si aparece serif, se esta
// leyendo la norma y no la interfaz.
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
})

// La tarjeta que se ve cuando alguien pega el enlace en WhatsApp, en
// LinkedIn o en un mail. Sin esto el enlace viaja pelado —una URL sin
// titulo ni imagen— y hay que explicar de que se trata en el mensaje,
// que es exactamente lo que un enlace tendria que evitar.
//
// `metadataBase` es el dominio y no el basePath a proposito: la imagen
// de la tarjeta la va a buscar el servidor de WhatsApp, no el
// navegador, y tiene que ser absoluta. El sitio canonico es honorio.ar
// aunque el mismo build se sirva ademas desde el repositorio viejo.
//
// **Son dos titulos distintos a proposito, y nadie ve los dos.**
//
// El de la pestana y el buscador tiene que decir lo que alguien tipea
// cuando busca: «honorarios», «27.423». El titulo es la señal mas
// fuerte que tiene un buscador y gastarla en una frase linda es caro.
//
// El de la tarjeta compite por otra cosa: la atencion de una persona
// que esta leyendo un WhatsApp. Ahi la frase gana y el nombre de la ley
// no aporta nada, porque quien recibe el enlace ya sabe de que se
// trata: se lo mando un colega.
//
// Quien busca ve el primero. Quien recibe el enlace ve el segundo.
//
// Cada uno se escribe una sola vez. Antes estaban los dos repetidos en
// tres bloques y se desincronizaron al primer cambio: la pestana decia
// una cosa y la tarjeta de WhatsApp seguia diciendo la vieja.
//
// La imagen se genera con `node scripts/og.mjs` y esta commiteada; la
// frase de abajo es la que lleva adentro. Si cambia, hay que volver a
// correr el script.
const TITULO = 'Honorio — Honorarios de la Ley 27.423'

const FRASE = 'Honorio: si querés entender la regulación, andá por una avenida'

const DESCRIPCION =
  'Asistente para la regulación de honorarios de la Ley 27.423, con cada ' +
  'paso del cálculo a la vista. Gratis, sin registro y sin enviar datos a ' +
  'ningún lado.'

export const metadata: Metadata = {
  metadataBase: new URL(HONORIO),
  title: {
    default: TITULO,
    template: '%s · Honorio',
  },
  description: DESCRIPCION,
  applicationName: 'Honorio',
  authors: [{ name: 'L. Javier Cúneo Libarona' }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: '/',
    siteName: 'Honorio',
    title: FRASE,
    description: DESCRIPCION,
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: FRASE,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: FRASE,
    description: DESCRIPCION,
    images: ['/og.png'],
  },
  icons: {
    icon: withBasePath('/honorio.png'),
    apple: withBasePath('/honorio.png'),
  },
}

// El tema lo decide el lector desde la topbar (components/prefs.tsx),
// que aplica la clase .dark sobre <html>. Declarar solo 'light' aca
// dejaba el modo oscuro muerto en el codigo.
export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#e9ebee' },
    { media: '(prefers-color-scheme: dark)', color: '#0d0f13' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} ${sourceSerif.variable} bg-background`}
    >
      {/* Sin analytics ni telemetria, a proposito: la app declara que nada
          de lo que se escribe sale del navegador, y eso tiene que ser
          literal. Si alguna vez hace falta medir uso, que sea con algo que
          no vea los datos del calculo y que este declarado en la app. */}
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}

