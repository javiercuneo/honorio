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
  return g().wizardState as WizardState
}

export function setWizardState(partial: Partial<WizardState>): void {
  Object.assign(g().wizardState, partial)
}

export function resetWizardState(): void {
  // Conserva la UMA actualizada
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
  return g().cargarUMA()
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
 *
 * El motor legacy genera HTML directamente en el DOM.
 * Esta funcion:
 *  1. Crea un contenedor oculto con el ID que espera el motor
 *  2. Llama calcularFinal()
 *  3. Captura el HTML generado
 *  4. Limpia el contenedor temporal
 *  5. Devuelve el HTML como string
 *
 * TEMPORAL: En Milestone 2 esto se reemplazara por datos estructurados.
 */
export function calcularFinalHTML(): string {
  const resultadoId = 'resultadosDinamicos'

  // Usar contenedor existente o crear uno temporal
  let container = document.getElementById(resultadoId)
  const created = !container
  if (created) {
    container = document.createElement('div')
    container.id = resultadoId
    container.style.display = 'none'
    document.body.appendChild(container)
  }

  // Ejecutar el motor (escribe en innerHTML del contenedor)
  g().calcularFinal()

  // Capturar HTML
  const html = container?.innerHTML ?? ''

  // Limpiar si creamos el contenedor
  if (created && container?.parentNode) {
    container.parentNode.removeChild(container)
  }

  return html
}

/**
 * Obtiene el HTML de las tablas de minimos.
 */
export function obtenerTablasMinimos(modo: MinimosModo): string {
  // Similar a calcularFinalHTML: el motor puede escribir en el DOM
  // o devolver un string segun el modo.
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

  // Si la funcion devuelve HTML (como en extrajudicial/art58/etc),
  // lo usamos directamente. Si escribe en el DOM (como judicial),
  // lo capturamos del contenedor.
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
