// ---------------------------------------------------------------
// lib/legal/adapters.ts
// Capa de adaptacion framework-agnostica.
// Traduce el contrato JS del motor legacy (window.*) a una interfaz
// TypeScript tipada. SIN dependencia de React.
//
// Milestone 1: wrappers directos sobre window.*
// Milestone 2: se reemplazara la implementacion por modulos TS puros
//              (la interfaz publica NO cambiara)
// ---------------------------------------------------------------

import type {
  WizardState,
  EscalaResult,
  GrupoResult,
  MinimosModo,
} from './types'
import { buildCalculationResult, PROCESS_REGISTRY } from './calculate'
import { renderLegacyHTML } from './render-legacy'

// ---- Helpers de tipo ----
function g(): any {
  return window
}

// ---- Estado ----
export function getWizardState(): WizardState {
  const ws = g().wizardState
  if (!ws) {
    resetWizardState()
    return g().wizardState as WizardState
  }
  return ws as WizardState
}

export function setWizardState(partial: Partial<WizardState>): void {
  Object.assign(g().wizardState, partial)
}

export function resetWizardState(): void {
  const uma = g().wizardState?.valorUMA ?? g().valorUMA ?? 92482
  g().wizardState = {
    step: 0,
    valorUMA: uma,
    tipoProceso: '',
    modoTerminacion: '',
    sentenciaResultado: null,
    aperturaPrueba: null,
    caducidadCriterio: '',
    tuvoExcepciones: null,
    sucesionUnicoLetrado: null,
    medidaOposicion: null,
    homologacionVivienda: null,
    objetoBase: '',
    desalojoVivienda: null,
    posesoriasTipo: null,
    baseValor: 0,
    esProvisorio: false,
    desdeMinimos: false,
    desdeResultado: false,
  }
}

// ---- UMA ----
export function getUMA(): number {
  return (window as any).valorUMA ?? g().valorUMA ?? 92482
}

export function cargarUMA(): Promise<void> {
  const before = (window as any).valorUMA
  const result = g().cargarUMA()
  if (!result) return Promise.resolve()
  return result.then(() => {
    if ((window as any).valorUMA === before) {
      throw new Error('No se pudo cargar la UMA desde Google Sheets')
    }
  })
}

// ---- Parseo / Formato ----
export function parseNumero(str: string): number {
  return g().parseNumber(str)
}

export function formatNumero(num: number): string {
  return g().formatNumber(num)
}

// ---- Validacion ----
export function validarPaso(paso: number): string {
  return g().validarPasoActual()
}

export function recolectarDatos(): void {
  return g().recolectarDatos()
}

// ---- Calculos ----
export function calcularEscalaBase(
  basePesos: number,
  valorUMA: number,
): EscalaResult | null {
  return g().calcularEscalaBase(basePesos, valorUMA)
}

export function calcularHonorariosPorGrupo(
  basePesos: number,
  valorUMA: number,
  factor: number,
): GrupoResult | null {
  return g().calcularHonorariosPorGrupo(basePesos, valorUMA, factor)
}

/**
 * Ejecuta calcularFinal() del motor legacy.
 */
export function calcularFinalHTML(): string {
  const resultadoId = 'resultadosDinamicos'

  let container = document.getElementById(resultadoId)
  const created = !container
  if (created) {
    container = document.createElement('div')
    container.id = resultadoId
    container.style.display = 'none'
    document.body.appendChild(container)
  }

  try {
    const state = g().wizardState as WizardState
    if (state?.tipoProceso && state.tipoProceso in PROCESS_REGISTRY) {
      const result = buildCalculationResult(state)
      container!.innerHTML = renderLegacyHTML(result)
    } else {
      g().calcularFinal()
    }
  } catch (e) {
    console.error('EXCEPCION dentro de calcularFinal():', e)
  }

  const html = container?.innerHTML ?? ''

  if (created && container?.parentNode) {
    container.parentNode.removeChild(container)
  }

  return html
}

/**
 * Obtiene el HTML de las tablas de minimos.
 */
export function obtenerTablasMinimos(modo: MinimosModo, umaOverride?: number): string {
  const resultadoId = 'resultadosDinamicos'
  let container = document.getElementById(resultadoId)
  const created = !container
  if (created) {
    container = document.createElement('div')
    container.id = resultadoId
    container.style.display = 'none'
    document.body.appendChild(container)
  }

  const correctUma = umaOverride ?? getUMA()
  g().valorUMA = correctUma
  if (g().wizardState) {
    g().wizardState.valorUMA = correctUma
  }

  const result = g().mostrarTablasMinimos(modo)

  if (typeof result === 'string' && result.length > 0) {
    container!.innerHTML = result
  }

  const html = container?.innerHTML ?? ''
  if (created && container?.parentNode) {
    container.parentNode.removeChild(container)
  }
  return html
}

// ---- Loader / readiness ----
export function isMotorLoaded(): boolean {
  return typeof g().calcularEscalaBase === 'function'
}
