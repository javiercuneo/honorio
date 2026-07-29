// ---------------------------------------------------------------
// components/LegacyLoader.tsx
// Cliente component que carga los scripts del motor juridico legacy.
// Renderiza un spinner mientras se cargan y provee ready state via contexto.
// Una vez cargados, inicia la carga de UMA y renderiza children.
// ---------------------------------------------------------------

'use client'

import { useEffect, useState, createContext, useContext, type ReactNode } from 'react'
import * as adapters from '@/lib/legal/adapters'
import { withBasePath } from '@/lib/basePath'

interface LegacyContextType {
  ready: boolean
  error: string | null
  umaValorCargado: number | null
}

const LegacyContext = createContext<LegacyContextType>({ ready: false, error: null, umaValorCargado: null })

export function useLegacyReady() {
  return useContext(LegacyContext)
}

const SCRIPTS = ['/legacy/core.js', '/legacy/state.js', '/legacy/calculations.js'].map(withBasePath)

async function loadScript(src: string): Promise<void> {
  const response = await fetch(src)
  if (!response.ok) {
    throw new Error('Error HTTP ' + response.status + ' al cargar: ' + src)
  }

  const code = await response.text()

  try {
    const globalEval = eval
    globalEval(code)
  } catch (e) {
    console.error('Error al evaluar ' + src, e)
    throw e
  }
}

export function LegacyLoader({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [umaValorCargado, setUmaValor] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        for (const src of SCRIPTS) {
          if (cancelled) return
          await loadScript(src)
        }

        if (!adapters.isMotorLoaded()) {
          throw new Error('Motor juridico no disponible despues de cargar scripts')
        }

                if (!cancelled) {
          try {
            await adapters.cargarUMA()
            const uma = adapters.getUMA()
            if (!cancelled) setUmaValor(uma)
          } catch {
            console.warn('No se pudo cargar la UMA desde Google Sheets, se usara el valor default')
          }
          setReady(true)
        }
      } catch (err) {
        console.error('Error en LegacyLoader.load():', err)
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error desconocido')
        }
      }
    }

    load()

    return () => { cancelled = true }
  }, [])

  return (
    <LegacyContext.Provider value={{ ready, error, umaValorCargado }}>
      {children}
    </LegacyContext.Provider>
  )
}
