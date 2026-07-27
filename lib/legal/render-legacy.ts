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