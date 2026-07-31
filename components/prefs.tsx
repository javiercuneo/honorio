'use client'

// ---------------------------------------------------------------
// Preferencias de lectura. No cambian ningun calculo: cambian como
// se compone la cifra.
//
//   tema          claro / oscuro
//   umaDecimales  UMA con dos decimales o redondeada
//   centavos      importes con centavos o redondeados al peso
//
// Quien redacta una resolucion necesita los centavos; quien escanea
// un resultado, no. Es una decision del lector, no nuestra.
// ---------------------------------------------------------------

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Tema = 'light' | 'dark'

export interface Prefs {
  tema: Tema
  umaDecimales: boolean
  centavos: boolean
}

const DEFAULT: Prefs = { tema: 'light', umaDecimales: true, centavos: true }
const CLAVE = 'honorio.prefs'

interface PrefsContext {
  prefs: Prefs
  set: <K extends keyof Prefs>(k: K, v: Prefs[K]) => void
  alternarTema: () => void
}

const Ctx = createContext<PrefsContext>({
  prefs: DEFAULT,
  set: () => {},
  alternarTema: () => {},
})

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT)

  // Se lee despues del montaje: el server no conoce localStorage y no
  // queremos un desajuste de hidratacion.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CLAVE)
      if (raw) setPrefs({ ...DEFAULT, ...JSON.parse(raw) })
      else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setPrefs((p) => ({ ...p, tema: 'dark' }))
      }
    } catch {
      /* preferencias no disponibles: se sigue con los valores por defecto */
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', prefs.tema === 'dark')
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(prefs))
    } catch {
      /* sin persistencia, la sesion igual funciona */
    }
  }, [prefs])

  const set = useCallback<PrefsContext['set']>((k, v) => {
    setPrefs((p) => ({ ...p, [k]: v }))
  }, [])

  const alternarTema = useCallback(() => {
    setPrefs((p) => ({ ...p, tema: p.tema === 'dark' ? 'light' : 'dark' }))
  }, [])

  const value = useMemo(
    () => ({ prefs, set, alternarTema }),
    [prefs, set, alternarTema],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePrefs() {
  return useContext(Ctx)
}
