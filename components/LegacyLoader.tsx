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

let _loadCount = 0

async function loadScript(src: string): Promise<void> {
  _loadCount++
  const loadId = _loadCount
  console.log('[DIAG] LegacyLoader: fetch+eval #' + loadId + ' para', src)

  const response = await fetch(src)
  if (!response.ok) {
    throw new Error('Error HTTP ' + response.status + ' al cargar: ' + src)
  }

  const code = await response.text()
  console.log('[DIAG] LegacyLoader: #' + loadId + ' recibido, ' + code.length + ' bytes')

  try {
    // Ejecutar en el scope global usando eval indirecto
    const globalEval = eval
    globalEval(code)
    console.log('[DIAG] LegacyLoader: #' + loadId + ' EVALUADO OK', src)
  } catch (e) {
    console.error('[DIAG] LegacyLoader: #' + loadId + ' ERROR al evaluar', src, e)
    throw e
  }
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
          console.log('[DIAG] LegacyLoader: iniciando carga de', src)
          await loadScript(src)
          console.log('[DIAG] LegacyLoader: completado', src)
          console.log('[DIAG] LegacyLoader: despues de ' + src + ' -> window.valorUMA:', typeof (window as any).valorUMA, 'window.calcularEscalaBase:', typeof (window as any).calcularEscalaBase, 'window.wizardState:', typeof (window as any).wizardState, 'window.recolectarDatos:', typeof (window as any).recolectarDatos, 'window.calcularFinal:', typeof (window as any).calcularFinal)
        }

        // Verificar que el motor esta disponible
        console.log('[DIAG] LegacyLoader: verificando isMotorLoaded...')
        if (!adapters.isMotorLoaded()) {
          throw new Error('Motor juridico no disponible despues de cargar scripts')
        }
        console.log('[DIAG] LegacyLoader: isMotorLoaded OK')

        if (!cancelled) {
          // Iniciar carga de UMA desde Google Sheets (silenciosa)
          adapters.cargarUMA().catch(() => {
            // Fallo en carga UMA no es critico; se usara el valor default
            console.warn('No se pudo cargar la UMA desde Google Sheets')
          })

          setReady(true)
        }
      } catch (err) {
        console.error('[DIAG] LegacyLoader: ERROR en load():', err)
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