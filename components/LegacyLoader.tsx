// ---------------------------------------------------------------
// components/LegacyLoader.tsx
// Cliente component que carga los scripts del motor juridico legacy.
// Renderiza un spinner mientras se cargan y provee ready state via contexto.
// Una vez cargados, inicia la carga de UMA y renderiza children.
// ---------------------------------------------------------------

'use client'

import { useEffect, useState, createContext, useContext, type ReactNode } from 'react'
import * as adapters from '@/lib/legal/adapters'

interface LegacyContextType {
  ready: boolean
  error: string | null
}

const LegacyContext = createContext<LegacyContextType>({ ready: false, error: null })

export function useLegacyReady() {
  return useContext(LegacyContext)
}

const SCRIPTS = ['/legacy/core.js', '/legacy/state.js', '/legacy/calculations.js']

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Error al cargar: ' + src))
    document.head.appendChild(script)
  })
}

export function LegacyLoader({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        // Cargar scripts en orden
        for (const src of SCRIPTS) {
          if (cancelled) return
          await loadScript(src)
        }

        // Verificar que el motor esta disponible
        if (!adapters.isMotorLoaded()) {
          throw new Error('Motor juridico no disponible despues de cargar scripts')
        }

        if (!cancelled) {
          // Iniciar carga de UMA desde Google Sheets (silenciosa)
          adapters.cargarUMA().catch(() => {
            // Fallo en carga UMA no es critico; se usara el valor default
            console.warn('No se pudo cargar la UMA desde Google Sheets')
          })

          setReady(true)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error desconocido')
        }
      }
    }

    load()

    return () => { cancelled = true }
  }, [])

  return (
    <LegacyContext.Provider value={{ ready, error }}>
      {!ready ? (
        <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent mx-auto" />
            <p className="font-mono text-[13px] text-muted-foreground">
              {error ? error : 'Cargando motor juridico...'}
            </p>
            {error && (
              <p className="mt-2 text-[12px] text-destructive">
                Verifique que los archivos en /public/legacy/ existen.
              </p>
            )}
          </div>
        </div>
      ) : (
        children
      )}
    </LegacyContext.Provider>
  )
}
