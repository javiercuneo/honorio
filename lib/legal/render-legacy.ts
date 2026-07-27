// ---------------------------------------------------------------
// lib/legal/render-legacy.ts
// Renderizador legacy: convierte CalculoResultado al HTML exacto
// que producia calcularFinal().
//
// No contiene logica juridica ni calculos.
// Solo recibe valores ya calculados y genera el mismo HTML
// que la aplicacion clasica.
// ---------------------------------------------------------------

import type { CalculoResultado } from './types'

/**
 * Genera el HTML legacy a partir del resultado estructurado.
 * Debe producir exactamente el mismo string que calcularFinal().
 */
export function renderLegacyHTML(result: CalculoResultado): string {
  switch (result.tipoProceso) {
    case 'exhorto':
      return renderExhortoHTML(result)
    case 'incidente':
      return renderIncidenteHTML(result)
    case 'medida_cautelar':
      return renderMedidaCautelarHTML(result)
    case 'homologacion_desocupacion':
      return renderHomologacionHTML(result)
    case 'conocimiento':
    case 'ejecucion_sentencia':
    case 'ejecutivo':
    case 'sucesion':
      return renderGeneralHTML(result)
    default:
      return '<p class=\"text-muted-foreground\">Tipo de proceso no soportado.</p>'
  }
}

function renderExhortoHTML(result: CalculoResultado): string {
  throw new Error('renderExhortoHTML no implementado')
}

function renderIncidenteHTML(result: CalculoResultado): string {
  throw new Error('renderIncidenteHTML no implementado')
}

function renderMedidaCautelarHTML(result: CalculoResultado): string {
  throw new Error('renderMedidaCautelarHTML no implementado')
}

function renderHomologacionHTML(result: CalculoResultado): string {
  throw new Error('renderHomologacionHTML no implementado')
}

function renderGeneralHTML(result: CalculoResultado): string {
  throw new Error('renderGeneralHTML no implementado')
}