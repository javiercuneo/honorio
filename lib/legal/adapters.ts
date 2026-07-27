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

// ---- Helpers de tipo ----
function g(): any {
  return window
}

// ---- Estado ----
export function getWizardState(): WizardState {
  const ws = g().wizardState
  if (!ws) {
    console.warn('[DIAG] adapters.getWizardState(): window.wizardState es undefined - inicializando')
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
  return g().valorUMA ?? 92482
}

export function cargarUMA(): Promise<void> {
  const result = g().cargarUMA()
  if (!result) return Promise.resolve()
  return result
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
  console.group('[DIAG] adapters.recolectarDatos()')
  console.log('window.recolectarDatos:', typeof g().recolectarDatos)
  console.log('window.wizardState:', typeof g().wizardState)
  console.log('window.calcularEscalaBase:', typeof g().calcularEscalaBase)
  console.log('window.parseNumber:', typeof g().parseNumber)
  console.log('window.calcularFinal:', typeof g().calcularFinal)
  console.log('window.valorUMA:', typeof g().valorUMA)
  console.log('window.cargarUMA:', typeof g().cargarUMA)
  console.log('window.mostrarTablasMinimos:', typeof g().mostrarTablasMinimos)
  console.log('window.validarPasoActual:', typeof g().validarPasoActual)
  console.groupEnd()
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

let _calcularFinalCount = 0

/**
 * Ejecuta calcularFinal() del motor legacy.
 */
export function calcularFinalHTML(): string {
  _calcularFinalCount++
  const callId = _calcularFinalCount
  const resultadoId = 'resultadosDinamicos'

  const motorFn = g().calcularFinal
  console.group('[DIAG] adapters.calcularFinalHTML() #' + callId)
  console.log('window.calcularFinal existe:', typeof motorFn === 'function')
  console.log('window.wizardState existe:', typeof g().wizardState)
  if (g().wizardState) {
    console.log('wizardState.tipoProceso:', g().wizardState.tipoProceso)
    console.log('wizardState.baseValor:', g().wizardState.baseValor)
    console.log('wizardState.modoTerminacion:', g().wizardState.modoTerminacion)
    console.log('wizardState.valorUMA:', g().wizardState.valorUMA)
    console.log('wizardState.step:', g().wizardState.step)
  }

  let container = document.getElementById(resultadoId)
  const created = !container
  console.log('contenedor encontrado:', !created)
  if (created) {
    container = document.createElement('div')
    container.id = resultadoId
    container.style.display = 'none'
    document.body.appendChild(container)
    console.log('contenedor creado')
  }

  try {
    g().calcularFinal()
    console.log('calcularFinal() ejecutado sin excepcion')
  } catch (e) {
    console.error('[DIAG] EXCEPCION dentro de calcularFinal():', e)
    if (e instanceof Error) {
      console.error('[DIAG] Stack:', e.stack)
    }
  }

  const html = container?.innerHTML ?? ''
  console.log('HTML generado length:', html.length)
  console.log('HTML generado (primeros 300 chars):', html.substring(0, 300))
  console.groupEnd()

  if (created && container?.parentNode) {
    container.parentNode.removeChild(container)
  }

  return html
}

/**
 * Obtiene el HTML de las tablas de minimos.
 */
export function obtenerTablasMinimos(modo: MinimosModo): string {
  const resultadoId = 'resultadosDinamicos'
  let container = document.getElementById(resultadoId)
  const created = !container
  if (created) {
    container = document.createElement('div')
    container.id = resultadoId
    container.style.display = 'none'
    document.body.appendChild(container)
  }

  g().mostrarTablasMinimos(modo)

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