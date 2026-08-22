// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 L. Javier Cuneo Libarona
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
  CalculoResultado,
} from './types'
import { buildCalculationResult, PROCESS_REGISTRY } from './calculate'
import { renderLegacyHTML } from './render-legacy'
import { UMA_VIGENTE } from './uma'

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
  const uma = g().wizardState?.valorUMA ?? g().valorUMA ?? UMA_VIGENTE.valor
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
    alimentosTipo: null,
    baseValor: 0,
    exhortoInciso: '',
    exhortoMontoTipo: '',
    exhortoMonto: 0,
    exhortoActos: 0,
    esProvisorio: false,
    desdeMinimos: false,
    desdeResultado: false,
  }
}

// ---- UMA ----
export function getUMA(): number {
  return (window as any).valorUMA ?? g().valorUMA ?? UMA_VIGENTE.valor
}

/**
 * Instala el valor de la UMA en el motor legacy.
 *
 * `core.js` abre con un valor escrito a mano y trae su propio
 * `cargarUMA()`, que va a buscarlo a la planilla desde el navegador.
 * Esa funcion sigue ahi y no se toca: `public/legacy/*.js` es una
 * copia del asistente clasico, que se mantiene en el otro repositorio
 * y todavia la usa. Parchear la copia la haria divergir de su fuente,
 * que es exactamente lo que AGENTS.md prohibe.
 *
 * Asi que no se la llama y se pisa el valor: la fuente de la UMA es
 * `lib/legal/uma.ts`, versionada, y el visitante no le pide nada a
 * Google.
 */
export function setUMA(valor: number): void {
  g().valorUMA = valor
  if (g().wizardState) g().wizardState.valorUMA = valor
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
 * Construye el resultado estructurado del calculo de honorarios.
 * Retorna CalculoResultado directamente desde el motor TS puro,
 * sin pasar por renderizado HTML.
 * Usado por el Dashboard React como fuente unica de datos.
 */
export function calcularResultadoEstructurado(): CalculoResultado {
  const state = getWizardState()
  return buildCalculationResult(state)
}

/**
 * Ejecuta calcularFinal() del motor legacy.
 * Se mantiene temporalmente como fallback de validacion
 * contra la salida del Dashboard React.
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
