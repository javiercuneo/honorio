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

function formatPesos(num: number): string {
  if (isNaN(num)) return 'N/A'
  return num.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function renderExhortoHTML(result: CalculoResultado): string {
  if (!result.exhorto) return ''
  const { incisoA, incisoB, incisoC } = result.exhorto

  return '<div class="dashboard-card"><h3>Exhorto (art. 50)</h3>' +
    '<table>' +
    '<tr><th colspan="2">Inc. a) - notificaciones</th></tr>' +
    '<tr><td colspan="2">M\u00ednimo 3 UMA: $' + formatPesos(incisoA) + '</td></tr>' +
    '<tr><th colspan="2">Inc. b) - inscripciones y actos registrales</th></tr>' +
    '<tr><td colspan="2">M\u00ednimo: 10 UMA ($' + formatPesos(incisoB.minPesos) + ')<br>M\u00e1ximo: 20 UMA ($' + formatPesos(incisoB.maxPesos) + ')</td></tr>' +
    '<tr><th colspan="2">Inc. c) - diligencias de prueba</th></tr>' +
    '<tr><td colspan="2">M\u00ednimo: 7 UMA ($' + formatPesos(incisoC.minPesos) + ')<br>M\u00e1ximo: 30 UMA ($' + formatPesos(incisoC.maxPesos) + ')</td></tr>' +
    '</table>' +
    '<div class="legal-box">ARTICULO 50.- Los honorarios por diligenciamiento de exhortos u oficios contemplados en la ley 22.172 ser\u00e1n regulados de conformidad a las siguientes pautas:<br>' +
    'a) Si se tratare de notificaciones o actos semejantes, los honorarios no podr\u00e1n ser inferiores a 3 UMA;<br>' +
    'b) Si se solicitaren inscripciones de dominios, hijuelas, testamentos, grav\u00e1menes, secuestros, embargos, inhibiciones, inventarios, remates, desalojos, o cualquier otro acto registral, los honorarios se regular\u00e1n en una escala entre 10 y 20 UMA. (...)<br>' +
    'c) Si se tratare de diligencias de prueba y se hubiera intervenido en su producci\u00f3n o contralor, el juez exhortado regular\u00e1 los honorarios proporcionalmente a la labor desarrollada, en una escala entre 7 y 30 UMA.</div></div>'
}

function renderIncidenteHTML(result: CalculoResultado): string {
  const { baseOriginal, baseFinal, valorUMA, honorarios } = result
  const base = baseFinal || baseOriginal
  const baseUMA = valorUMA > 0 ? base / valorUMA : 0
  const { minUMA, maxUMA, minPesos, maxPesos } = honorarios.patrocinante.rango

  return '<div class="dashboard-card">' +
    '<div class="summary-box">\uD83D\uDCCB Resumen del juicio<br>Tipo de proceso: Incidente<br>Base: $' + formatPesos(base) + '<br>Valor UMA: $' + formatPesos(valorUMA) + '<br>Base en UMA: ' + baseUMA.toFixed(2) + '</div>' +
    '<h3>Incidente (art.33 ley 21839)</h3>' +
    '<table>' +
    '<tr><th>Concepto</th><th>UMA</th><th>Pesos ($)</th></tr>' +
    '<tr><td>M\u00ednimo (2%)</td><td>' + minUMA.toFixed(2) + '</td><td>$' + formatPesos(minPesos) + '</td></tr>' +
    '<tr><td>M\u00e1ximo (20%)</td><td>' + maxUMA.toFixed(2) + '</td><td>$' + formatPesos(maxPesos) + '</td></tr>' +
    '</table>' +
    '<div class="legal-box">Tener en cuenta que seg\u00fan el inc. g) del art. 29, "los incidentes se dividir\u00e1n en 2 etapas; la primera se compone del planteo que lo origine, sea verbal o escrito, y la segunda, del desarrollo hasta su conclusi\u00f3n".</div></div>'
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