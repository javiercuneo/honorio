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
  if (!result.escala) return '<p class="text-muted-foreground">Sin datos de escala</p>'
  const { escala, honorarios, auxiliares, baseOriginal, baseFinal, valorUMA } = result
  const base = baseFinal || baseOriginal
  const baseUMA = valorUMA > 0 ? base / valorUMA : 0
  const { patrocinante, apoderado, procurador } = honorarios
  return '<div class="dashboard-card"><h3>Medida cautelar (art.29 inc.e ley 21839)</h3>' +
    '<div class="summary-box">Base: $' + formatPesos(base) + '<br>Valor UMA: $' + formatPesos(valorUMA) + '<br>Base en UMA: ' + baseUMA.toFixed(2) + '</div>' +
    '<h4>Escala: ' + escala.titulo + '</h4>' +
    '<table>' +
    '<tr><th>Concepto</th><th>%</th><th>UMA</th><th>Pesos ($)</th></tr>' +
    '<tr><td>M\u00ednimo escala</td><td>' + (escala.porcentajeMinAplicado * 100).toFixed(1) + '%</td><td>' + patrocinante.rango.minUMA.toFixed(2) + '</td><td>$' + formatPesos(patrocinante.rango.minPesos) + '</td></tr>' +
    '<tr><td>M\u00e1ximo escala</td><td>' + (escala.porcentajeMaxAplicado * 100).toFixed(1) + '%</td><td>' + patrocinante.rango.maxUMA.toFixed(2) + '</td><td>$' + formatPesos(patrocinante.rango.maxPesos) + '</td></tr>' +
    '</table>' +
    '<h4>Honorarios</h4>' +
    '<table>' +
    '<tr><th>Rol</th><th>M\u00ednimo ($)</th><th>M\u00e1ximo ($)</th></tr>' +
    '<tr><td>Patrocinante</td><td>$' + formatPesos(patrocinante.rango.minPesos) + '</td><td>$' + formatPesos(patrocinante.rango.maxPesos) + '</td></tr>' +
    '<tr><td>Apoderado</td><td>$' + formatPesos(apoderado.rango.minPesos) + '</td><td>$' + formatPesos(apoderado.rango.maxPesos) + '</td></tr>' +
    '<tr><td>Procurador</td><td>$' + formatPesos(procurador.rango.minPesos) + '</td><td>$' + formatPesos(procurador.rango.maxPesos) + '</td></tr>' +
    '</table>' +
    '<h4>Auxiliares de justicia</h4>' +
    '<table><tr><th>M\u00ednimo ($)</th><th>M\u00e1ximo ($)</th></tr>' +
    '<tr><td>$' + formatPesos(auxiliares.minPesos) + '</td><td>$' + formatPesos(auxiliares.maxPesos) + '</td></tr></table>' +
    '<div class="legal-box">ARTICULO 29 inc. e: En las medidas cautelares, la regulaci\u00f3n de honorarios se har\u00e1 sobre el 25% de la escala del art\u00edculo 21 si no media oposici\u00f3n, y sobre el 50% si la hubiere.</div></div>'
}

function renderHomologacionHTML(result: CalculoResultado): string {
  if (!result.escala) return '<p class="text-muted-foreground">Sin datos de escala</p>'
  const { escala, honorarios, auxiliares, baseOriginal, baseFinal, valorUMA } = result
  const base = baseFinal || baseOriginal
  const baseUMA = valorUMA > 0 ? base / valorUMA : 0
  const { patrocinante, apoderado, procurador } = honorarios
  const reduccionPct = baseOriginal > 0 ? ((1 - base / baseOriginal) * 100).toFixed(0) : '0'
  return '<div class="dashboard-card"><h3>Homologaci\u00f3n de desocupaci\u00f3n (art.40 ley 21839)</h3>' +
    '<div class="summary-box">Base original: $' + formatPesos(baseOriginal) + '<br>Base final: $' + formatPesos(base) + '<br>Valor UMA: $' + formatPesos(valorUMA) + '<br>Base en UMA: ' + baseUMA.toFixed(2) + '</div>' +
    '<h4>Escala: ' + escala.titulo + '</h4>' +
    '<table>' +
    '<tr><th>Concepto</th><th>%</th><th>UMA</th><th>Pesos ($)</th></tr>' +
    '<tr><td>M\u00ednimo escala</td><td>' + (escala.porcentajeMinAplicado * 100).toFixed(1) + '%</td><td>' + patrocinante.rango.minUMA.toFixed(2) + '</td><td>$' + formatPesos(patrocinante.rango.minPesos) + '</td></tr>' +
    '<tr><td>M\u00e1ximo escala</td><td>' + (escala.porcentajeMaxAplicado * 100).toFixed(1) + '%</td><td>' + patrocinante.rango.maxUMA.toFixed(2) + '</td><td>$' + formatPesos(patrocinante.rango.maxPesos) + '</td></tr>' +
    '</table>' +
    '<h4>Honorarios</h4>' +
    '<table>' +
    '<tr><th>Rol</th><th>M\u00ednimo ($)</th><th>M\u00e1ximo ($)</th></tr>' +
    '<tr><td>Patrocinante</td><td>$' + formatPesos(patrocinante.rango.minPesos) + '</td><td>$' + formatPesos(patrocinante.rango.maxPesos) + '</td></tr>' +
    '<tr><td>Apoderado</td><td>$' + formatPesos(apoderado.rango.minPesos) + '</td><td>$' + formatPesos(apoderado.rango.maxPesos) + '</td></tr>' +
    '<tr><td>Procurador</td><td>$' + formatPesos(procurador.rango.minPesos) + '</td><td>$' + formatPesos(procurador.rango.maxPesos) + '</td></tr>' +
    '</table>' +
    '<h4>Auxiliares de justicia</h4>' +
    '<table><tr><th>M\u00ednimo ($)</th><th>M\u00e1ximo ($)</th></tr>' +
    '<tr><td>$' + formatPesos(auxiliares.minPesos) + '</td><td>$' + formatPesos(auxiliares.maxPesos) + '</td></tr></table>' +
    (parseInt(reduccionPct) > 0 ? '<p>Reducci\u00f3n de base por vivienda: ' + reduccionPct + '%</p>' : '') +
    '<div class="legal-box">ARTICULO 40.- Cuando se trate de homologaci\u00f3n de desocupaci\u00f3n de inmuebles, los honorarios se reducir\u00e1n al 50% de la escala del art\u00edculo 21. Si el inmueble estuviere destinado a vivienda \u00fanica y de ocupaci\u00f3n permanente, la base se reducir\u00e1 al 50% del valor de la propiedad.</div></div>'
}

function renderGeneralHTML(result: CalculoResultado): string {
  const { escala, honorarios, auxiliares, segundaInstancia, partidor, baseOriginal, baseFinal, valorUMA, tipoProceso } = result
  const base = baseFinal || baseOriginal
  const baseUMA = valorUMA > 0 ? base / valorUMA : 0
  const { patrocinante, apoderado, procurador } = honorarios
  const tipoLabel: Record<string, string> = {
    conocimiento: 'Juicio de conocimiento',
    ejecucion_sentencia: 'Ejecuci\u00f3n de sentencia',
    ejecutivo: 'Juicio ejecutivo',
    sucesion: 'Sucesi\u00f3n',
  }
  const label = tipoLabel[tipoProceso] || tipoProceso
  if (!escala) return '<p class="text-muted-foreground">Sin datos de escala para ' + label + '</p>'
  let html = '<div class="dashboard-card"><h3>' + label + '</h3>' +
    '<div class="summary-box">Base original: $' + formatPesos(baseOriginal) + '<br>Base final: $' + formatPesos(base) + '<br>Valor UMA: $' + formatPesos(valorUMA) + '<br>Base en UMA: ' + baseUMA.toFixed(2) + '</div>' +
    '<h4>Escala: ' + escala.titulo + '</h4>' +
    '<table>' +
    '<tr><th>Concepto</th><th>%</th><th>UMA</th><th>Pesos ($)</th></tr>' +
    '<tr><td>Base en UMA</td><td></td><td>' + escala.baseEnUMA.toFixed(2) + '</td><td>$' + formatPesos(escala.baseEnUMA * valorUMA) + '</td></tr>' +
    '<tr><td>Porcentaje m\u00ednimo</td><td>' + (escala.porcentajeMin * 100).toFixed(1) + '%</td><td></td><td></td></tr>' +
    '<tr><td>Porcentaje m\u00e1ximo</td><td>' + (escala.porcentajeMax * 100).toFixed(1) + '%</td><td></td><td></td></tr>' +
    '<tr><td>% m\u00ednimo aplicado</td><td>' + (escala.porcentajeMinAplicado * 100).toFixed(1) + '%</td><td>' + patrocinante.rango.minUMA.toFixed(2) + '</td><td>$' + formatPesos(patrocinante.rango.minPesos) + '</td></tr>' +
    '<tr><td>% m\u00e1ximo aplicado</td><td>' + (escala.porcentajeMaxAplicado * 100).toFixed(1) + '%</td><td>' + patrocinante.rango.maxUMA.toFixed(2) + '</td><td>$' + formatPesos(patrocinante.rango.maxPesos) + '</td></tr>'
  if (escala.escalera) {
    html += '<tr><th colspan="4">Escalera art. 21</th></tr>' +
    '<tr><td>M\u00e1ximo escala anterior</td><td colspan="3">' + escala.escalera.maximoEscalaAnterior.toFixed(2) + ' UMA ($' + formatPesos(escala.escalera.maximoEscalaAnterior * valorUMA) + ')</td></tr>' +
    '<tr><td>L\u00edmite anterior</td><td colspan="3">' + escala.escalera.limiteAnterior.toFixed(2) + ' UMA ($' + formatPesos(escala.escalera.limiteAnterior * valorUMA) + ')</td></tr>' +
    '<tr><td>Excedente</td><td colspan="3">' + escala.escalera.excedente.toFixed(2) + ' UMA ($' + formatPesos(escala.escalera.excedente * valorUMA) + ')</td></tr>'
  }
  html += '</table>' +
    '<h4>Honorarios</h4>' +
    '<table>' +
    '<tr><th>Rol</th><th>M\u00ednimo ($)</th><th>M\u00e1ximo ($)</th></tr>' +
    '<tr><td>Patrocinante</td><td>$' + formatPesos(patrocinante.rango.minPesos) + '</td><td>$' + formatPesos(patrocinante.rango.maxPesos) + '</td></tr>' +
    '<tr><td>Apoderado</td><td>$' + formatPesos(apoderado.rango.minPesos) + '</td><td>$' + formatPesos(apoderado.rango.maxPesos) + '</td></tr>' +
    '<tr><td>Procurador</td><td>$' + formatPesos(procurador.rango.minPesos) + '</td><td>$' + formatPesos(procurador.rango.maxPesos) + '</td></tr>' +
    '</table>'
  if (segundaInstancia) {
    const { patrocinante: siPatro, apoderado: siApo, procurador: siProc } = segundaInstancia
    html += '<h4>Segunda instancia (art. 30)</h4>' +
    '<table>' +
    '<tr><th>Rol</th><th>M\u00ednimo ($)</th><th>M\u00e1ximo ($)</th><th>Revocada ($)</th></tr>' +
    '<tr><td>Patrocinante</td><td>$' + formatPesos(siPatro.minimo.minPesos) + '</td><td>$' + formatPesos(siPatro.maximo.maxPesos) + '</td><td>$' + formatPesos(siPatro.revocada.maxPesos) + '</td></tr>' +
    '<tr><td>Apoderado</td><td>$' + formatPesos(siApo.minimo.minPesos) + '</td><td>$' + formatPesos(siApo.maximo.maxPesos) + '</td><td>$' + formatPesos(siApo.revocada.maxPesos) + '</td></tr>' +
    '<tr><td>Procurador</td><td>$' + formatPesos(siProc.minimo.minPesos) + '</td><td>$' + formatPesos(siProc.maximo.maxPesos) + '</td><td>$' + formatPesos(siProc.revocada.maxPesos) + '</td></tr>' +
    '</table>'
  }
  html += '<h4>Auxiliares de justicia</h4>' +
    '<table><tr><th>M\u00ednimo ($)</th><th>M\u00e1ximo ($)</th></tr>' +
    '<tr><td>$' + formatPesos(auxiliares.minPesos) + '</td><td>$' + formatPesos(auxiliares.maxPesos) + '</td></tr></table>'
  if (partidor) {
    html += '<h4>Partidor (art. 35)</h4>' +
    '<table>' +
    '<tr><th>Concepto</th><th>%</th><th>UMA</th><th>Pesos ($)</th></tr>' +
    '<tr><td>M\u00ednimo</td><td>' + partidor.minPorcentaje + '%</td><td>' + partidor.minUMA.toFixed(2) + '</td><td>$' + formatPesos(partidor.minPesos) + '</td></tr>' +
    '<tr><td>M\u00e1ximo</td><td>' + partidor.maxPorcentaje + '%</td><td>' + partidor.maxUMA.toFixed(2) + '</td><td>$' + formatPesos(partidor.maxPesos) + '</td></tr>' +
    '</table>'
  }
  html += '<div class="legal-box">Ley 21.839 (modif. ley 24.432). Los honorarios se regulan sobre la base del art\u00edculo 21, con las reducciones y ampliaciones previstas en los art\u00edculos 25, 29, 30, 33, 34, 35, 38, 40, 41, 49 y 50 seg\u00fan corresponda al tipo de proceso y sus incidencias.</div></div>'
  return html
}