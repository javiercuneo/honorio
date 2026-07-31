import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Archivo, Geist, Geist_Mono, Source_Serif_4 } from 'next/font/google'
import { withBasePath } from '@/lib/basePath'
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

export const metadata: Metadata = {
  title: 'Honorio',
  description:
    'Asistente para la regulación de honorarios',
  icons: {
    icon: withBasePath('/honorio.png'),
    apple: withBasePath('/honorio.png'),
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#e9ebee' }],
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
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

