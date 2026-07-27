// --------------------------------------------------------------
// CÁLCULO FINAL (completo y corregido)
// --------------------------------------------------------------
function calcularFinal() {
if (validarPasoActual() !== '') return;
    recolectarDatos();
    const tipo = wizardState.tipoProceso;
    const uma = wizardState.valorUMA;

    // EXHORTO
    if (tipo === 'exhorto') {
        const minA=3, minB=10, maxB=20, minC=7, maxC=30;
        const valA=minA*uma, valBmin=minB*uma, valBmax=maxB*uma, valCmin=minC*uma, valCmax=maxC*uma;
        const html = `<div class="dashboard-card"><h3>Exhorto (art. 50)</h3>
            <table>
                <tr><th colspan="2">Inc. a) - notificaciones</th></tr>
                <tr><td colspan="2">Mínimo 3 UMA: $${formatNumber(valA)}</td></tr>
                <tr><th colspan="2">Inc. b) - inscripciones y actos registrales</th></tr>
                <tr><td colspan="2">Mínimo: 10 UMA ($${formatNumber(valBmin)})<br>Máximo: 20 UMA ($${formatNumber(valBmax)})</td></tr>
                <tr><th colspan="2">Inc. c) - diligencias de prueba</th></tr>
                <tr><td colspan="2">Mínimo: 7 UMA ($${formatNumber(valCmin)})<br>Máximo: 30 UMA ($${formatNumber(valCmax)})</td></tr>
            </table>
            <div class="legal-box">ARTÍCULO 50.- Los honorarios por diligenciamiento de exhortos u oficios contemplados en la ley 22.172 serán regulados de conformidad a las siguientes pautas:<br>
            a) Si se tratare de notificaciones o actos semejantes, los honorarios no podrán ser inferiores a 3 UMA;<br>
            b) Si se solicitaren inscripciones de dominios, hijuelas, testamentos, gravámenes, secuestros, embargos, inhibiciones, inventarios, remates, desalojos, o cualquier otro acto registral, los honorarios se regularán en una escala entre 10 y 20 UMA. (...)<br>
            c) Si se tratare de diligencias de prueba y se hubiera intervenido en su producción o contralor, el juez exhortado regulará los honorarios proporcionalmente a la labor desarrollada, en una escala entre 7 y 30 UMA.</div></div>`;
        document.getElementById('resultadosDinamicos').innerHTML = html;
        return;
    }

    // INCIDENTE
    if (tipo === 'incidente') {
        const base = wizardState.baseValor;
        if (base <= 0) { alert("Por favor ingrese la base del incidente"); return; }
        const baseUMA = base / uma;
        const minUMA = baseUMA * 0.02;
        const maxUMA = baseUMA * 0.20;
        const minPesos = minUMA * uma;
        const maxPesos = maxUMA * uma;
        const html = `<div class="dashboard-card">
            <div class="summary-box">📋 Resumen del juicio<br>Tipo de proceso: Incidente<br>Base: $${formatNumber(base)}<br>Valor UMA: $${formatNumber(uma)}<br>Base en UMA: ${baseUMA.toFixed(2)}</div>
            <h3>Incidente (art.33 ley 21839)</h3>
            <table>
                <tr><th>Concepto</th><th>UMA</th><th>Pesos ($)</th></tr>
                <tr><td>Mínimo (2%)</td><td>${minUMA.toFixed(2)}</td><td>$${formatNumber(minPesos)}</td></tr>
                <tr><td>Máximo (20%)</td><td>${maxUMA.toFixed(2)}</td><td>$${formatNumber(maxPesos)}</td></tr>
            </table>
            <div class="legal-box">Tener en cuenta que según el inc. g) del art. 29, “los incidentes se dividirán en 2 etapas; la primera se compone del planteo que lo origine, sea verbal o escrito, y la segunda, del desarrollo hasta su conclusión”.</div></div>`;
        document.getElementById('resultadosDinamicos').innerHTML = html;
        return;
    }

    // MEDIDA CAUTELAR
    if (tipo === 'medida_cautelar') {
        let baseFinal = wizardState.baseValor;
        if (baseFinal <= 0) { alert("Base inválida"); return; }
        let factorEscala = wizardState.medidaOposicion ? 0.5 : 0.25;
        const calcBase = calcularEscalaBase(baseFinal, uma);
        if (!calcBase) return;
        const minComp = calcBase.patrocinante.full.min * factorEscala;
        const maxComp = calcBase.patrocinante.full.max * factorEscala;
        const minApo = calcBase.apoderado.full.min * factorEscala;
        const maxApo = calcBase.apoderado.full.max * factorEscala;
        const minProc = minComp * 0.4;
        const maxProc = maxComp * 0.4;
        const esProvisorio = wizardState.esProvisorio;
        const oposicionTexto = wizardState.medidaOposicion ? "Con oposición → 50% de la escala" : "Sin oposición → 25% de la escala";
        let html = `<div class="dashboard-card">
            <div class="summary-box">📋 Resumen del juicio<br>Tipo de proceso: Medida cautelar<br>Base: $${formatNumber(baseFinal)}<br>Valor UMA: $${formatNumber(uma)}<br>Base en UMA: ${calcBase.baseEnUMA.toFixed(2)}<br>Escala: ${calcBase.tituloEscala}<br>Reducción: ${oposicionTexto}<br>Porcentajes reducidos: ${(calcBase.minPorc * factorEscala).toFixed(1)}% a ${(calcBase.maxPorc * factorEscala).toFixed(1)}%</div>
            <div class="dashboard-card"><h4>👨‍⚖️ Patrocinante</h4>
            <table><thead><tr><th>Concepto</th>${esProvisorio ? '<th>Mínimo UMA</th><th>Mínimo $</th>' : '<th>Mínimo UMA</th><th>Máximo UMA</th><th>Mínimo $</th><th>Máximo $</th>'}</tr></thead>
            <tbody><tr><td>Honorarios</td>${esProvisorio ? `<td>${minComp.toFixed(2)}</td><td>$${formatNumber(minComp * uma)}` : `<td>${minComp.toFixed(2)}</td><td>${maxComp.toFixed(2)}</td><td>$${formatNumber(minComp * uma)}</td><td>$${formatNumber(maxComp * uma)}`}</tr></tbody>
            </table></div>
            <div class="dashboard-card"><h4>📑 Apoderado (+40%)</h4>
            <table><thead><tr><th>Concepto</th>${esProvisorio ? '<th>Mínimo UMA</th><th>Mínimo $</th>' : '<th>Mínimo UMA</th><th>Máximo UMA</th><th>Mínimo $</th><th>Máximo $</th>'}</tr></thead>
            <tbody><tr><td>Honorarios</td>${esProvisorio ? `<td>${minApo.toFixed(2)}</td><td>$${formatNumber(minApo * uma)}` : `<td>${minApo.toFixed(2)}</td><td>${maxApo.toFixed(2)}</td><td>$${formatNumber(minApo * uma)}</td><td>$${formatNumber(maxApo * uma)}`}</tr></tbody>
            </table></div>
            <div class="legal-box">ARTÍCULO 20.- Los honorarios de los procuradores se fijarán en un 40% de los que por esta ley corresponda fijar a los abogados patrocinantes. Si el abogado actuare en carácter de apoderado sin patrocinio, percibirá la asignación total que hubiere correspondido a ambos.</div>
            <div class="dashboard-card"><h4>📋 Procurador (40% del patrocinante)</h4>
            <table><thead><tr><th>Concepto</th>${esProvisorio ? '<th>Mínimo UMA</th><th>Mínimo $</th>' : '<th>Mínimo UMA</th><th>Máximo UMA</th><th>Mínimo $</th><th>Máximo $</th>'}</tr></thead>
            <tbody><tr><td>Honorarios</td>${esProvisorio ? `<td>${minProc.toFixed(2)}</td><td>$${formatNumber(minProc * uma)}` : `<td>${minProc.toFixed(2)}</td><td>${maxProc.toFixed(2)}</td><td>$${formatNumber(minProc * uma)}</td><td>$${formatNumber(maxProc * uma)}`}</tr></tbody>
            </table></div>
            <div class="dashboard-card"><h4>🛠️ Auxiliares de justicia (5% y 10% de la base)</h4>
            <table><thead><tr><th>Mínimo UMA</th>${esProvisorio ? '<th>Mínimo $</th>' : '<th>Máximo UMA</th><th>Mínimo $</th><th>Máximo $</th>'}</tr></thead>
            <tbody><tr>${esProvisorio ? `<td>${calcBase.auxMin.toFixed(2)}</td><td>$${formatNumber(calcBase.auxMin * uma)}` : `<td>${calcBase.auxMin.toFixed(2)}</td><td>${calcBase.auxMax.toFixed(2)}</td><td>$${formatNumber(calcBase.auxMin * uma)}</td><td>$${formatNumber(calcBase.auxMax * uma)}`}</tr></tbody>
            </table></div>`;
        document.getElementById('resultadosDinamicos').innerHTML = html;
        return;
    }

    // HOMOLOGACIÓN DESOCUPACIÓN
    if (tipo === 'homologacion_desocupacion') {
        let baseFinal = wizardState.baseValor;
        if (wizardState.homologacionVivienda) baseFinal *= 0.8;
        const calcBase = calcularEscalaBase(baseFinal, uma);
        if (!calcBase) return;
        const minFinal = calcBase.patrocinante.full.min * 0.5;
        const maxFinal = calcBase.patrocinante.full.max * 0.5;
        const minApoFinal = calcBase.apoderado.full.min * 0.5;
        const maxApoFinal = calcBase.apoderado.full.max * 0.5;
        const minProc = minFinal * 0.4;
        const maxProc = maxFinal * 0.4;
        const esProvisorio = wizardState.esProvisorio;
        const motivoBase = wizardState.homologacionVivienda ? "Homologación con vivienda: -20% sobre base (art.40) luego -50% por homologación" : "Homologación de desocupación: -50% (art.40)";
        function genFila(e, minU, maxU, minP, maxP) {
            if (esProvisorio) return `<tr><td>${e}</td><td>${minU.toFixed(2)}</td><td>$${formatNumber(minP)}</td></tr>`;
            else return `<tr><td>${e}</td><td>${minU.toFixed(2)}</td><td>${maxU.toFixed(2)}</td><td>$${formatNumber(minP)}</td><td>$${formatNumber(maxP)}</td></tr>`;
        }
        let html = `<div class="dashboard-card"><h3>📊 Resumen del juicio</h3><div class="grid-2col"><div class="stat-card"><div class="badge">Tipo de proceso</div><div class="stat-number">Homologación de convenio de desocupación</div></div><div class="stat-card"><div class="badge">Base regulatoria</div><div class="stat-number">$${formatNumber(baseFinal)}</div>${wizardState.baseValor !== baseFinal ? `<small>Original: $${formatNumber(wizardState.baseValor)}<br>${motivoBase}</small>` : ''}</div><div class="stat-card"><div class="badge">Valor UMA</div><div class="stat-number">$${formatNumber(uma)}</div></div><div class="stat-card"><div class="badge">Base en UMA</div><div class="stat-number">${calcBase.baseEnUMA.toFixed(2)}</div></div></div><div><strong>Escala aplicada:</strong> ${calcBase.tituloEscala} (${calcBase.minPorc}% a ${calcBase.maxPorc}%)<br><strong>Reducción sobre honorarios (50% por homologación de desocupación):</strong> 50% del resultado anterior</div></div>`;
        html += `<div class="dashboard-card"><h4>👨‍⚖️ Patrocinante</h4><table><thead><tr><th>Etapas</th>${esProvisorio ? '<th>Mínimo UMA</th><th>Mínimo $</th>' : '<th>Mínimo UMA</th><th>Máximo UMA</th><th>Mínimo $</th><th>Máximo $</th>'}</tr></thead><tbody>${genFila("Juicio completo", minFinal, maxFinal, minFinal*uma, maxFinal*uma)}${genFila("Una etapa (1/3)", minFinal/3, maxFinal/3, (minFinal/3)*uma, (maxFinal/3)*uma)}${genFila("Dos etapas (2/3)", minFinal*2/3, maxFinal*2/3, (minFinal*2/3)*uma, (maxFinal*2/3)*uma)}</tbody></table></div>`;
        html += `<div class="dashboard-card"><h4>📑 Apoderado (+40%)</h4><table><thead><tr><th>Etapas</th>${esProvisorio ? '<th>Mínimo UMA</th><th>Mínimo $</th>' : '<th>Mínimo UMA</th><th>Máximo UMA</th><th>Mínimo $</th><th>Máximo $</th>'}</tr></thead><tbody>${genFila("Juicio completo", minApoFinal, maxApoFinal, minApoFinal*uma, maxApoFinal*uma)}${genFila("Una etapa (1/3)", minApoFinal/3, maxApoFinal/3, (minApoFinal/3)*uma, (maxApoFinal/3)*uma)}${genFila("Dos etapas (2/3)", minApoFinal*2/3, maxApoFinal*2/3, (minApoFinal*2/3)*uma, (maxApoFinal*2/3)*uma)}</tbody></table></div>`;
        html += `<div class="legal-box">ARTÍCULO 20.- Los honorarios de los procuradores se fijarán en un 40% de los que por esta ley corresponda fijar a los abogados patrocinantes...</div>`;
        html += `<div class="dashboard-card"><h4>📋 Procurador (40% del patrocinante)</h4><table><thead><tr><th>Etapas</th>${esProvisorio ? '<th>Mínimo UMA</th><th>Mínimo $</th>' : '<th>Mínimo UMA</th><th>Máximo UMA</th><th>Mínimo $</th><th>Máximo $</th>'}</tr></thead><tbody>${genFila("Juicio completo", minProc, maxProc, minProc*uma, maxProc*uma)}${genFila("Una etapa (1/3)", minProc/3, maxProc/3, (minProc/3)*uma, (maxProc/3)*uma)}${genFila("Dos etapas (2/3)", minProc*2/3, maxProc*2/3, (minProc*2/3)*uma, (maxProc*2/3)*uma)}</tbody></table></div>`;
        html += `<div class="dashboard-card"><h4>🛠️ Auxiliares de justicia (5% y 10% de la base)</h4><table><thead><tr><th>Mínimo UMA</th>${esProvisorio ? '<th>Mínimo $</th>' : '<th>Máximo UMA</th><th>Mínimo $</th><th>Máximo $</th>'}</tr></thead><tbody><tr>${esProvisorio ? `<td>${calcBase.auxMin.toFixed(2)}</td><td>$${formatNumber(calcBase.auxMin * uma)}` : `<td>${calcBase.auxMin.toFixed(2)}</td><td>${calcBase.auxMax.toFixed(2)}</td><td>$${formatNumber(calcBase.auxMin * uma)}</td><td>$${formatNumber(calcBase.auxMax * uma)}`}</tr></tbody></table></div>`;
        document.getElementById('resultadosDinamicos').innerHTML = html;
        return;
    }

    // CASO GENERAL (conocimiento, ejecución sentencia, ejecutivo, sucesión)
    let baseReducida = wizardState.baseValor;
    let motivoBase = [];
    if (tipo === 'conocimiento' && wizardState.objetoBase === 'desalojo' && wizardState.desalojoVivienda === 'vivienda') {
        baseReducida *= 0.8;
        motivoBase.push("Desalojo para vivienda: -20% (art.40)");
    }
    if ((tipo === 'conocimiento' || tipo === 'ejecucion_sentencia' || tipo === 'ejecutivo') && wizardState.sentenciaResultado === 'rechazada') {
        baseReducida *= 0.7;
        motivoBase.push("Demanda rechazada: -30% (art.22)");
    }
    if ((tipo === 'conocimiento' || tipo === 'ejecucion_sentencia' || tipo === 'ejecutivo') && wizardState.modoTerminacion === 'caducidad' && wizardState.caducidadCriterio === 'art22') {
        baseReducida *= 0.7;
        motivoBase.push("Caducidad tratada como demanda desestimada: -30% (art.22)");
    }
    const baseFinal = baseReducida;
    const hayReduccionBase = (wizardState.baseValor !== baseFinal);
    const calcBase = calcularEscalaBase(baseFinal, uma);
    if (!calcBase) return;

    // Reducciones de escala
    let factorEscala = 1;
    let motivosEscala = [];
    if (tipo === 'sucesion' && wizardState.sucesionUnicoLetrado) {
        factorEscala *= 0.5;
        motivosEscala.push("50% por único letrado en sucesión (art.35)");
    }
    if (tipo === 'ejecucion_sentencia') {
        factorEscala *= 0.5;
        motivosEscala.push("50% por ejecución de sentencia (art.41)");
    }
    if ((tipo === 'conocimiento' || tipo === 'ejecucion_sentencia' || tipo === 'ejecutivo') && wizardState.modoTerminacion === 'modos_anormales' && wizardState.aperturaPrueba === false) {
        factorEscala *= 0.5;
        motivosEscala.push("50% por terminación anormal antes de apertura a prueba (art.25)");
    }
    if ((tipo === 'conocimiento' || tipo === 'ejecucion_sentencia' || tipo === 'ejecutivo') && wizardState.modoTerminacion === 'caducidad' && wizardState.caducidadCriterio === 'art25' && wizardState.aperturaPrueba === false) {
        factorEscala *= 0.5;
        motivosEscala.push("50% por caducidad tratada como modo anormal antes de prueba (art.25)");
    }
    const minEscala = calcBase.patrocinante.full.min * factorEscala;
    const maxEscala = calcBase.patrocinante.full.max * factorEscala;
    const minApoEscala = calcBase.apoderado.full.min * factorEscala;
    const maxApoEscala = calcBase.apoderado.full.max * factorEscala;

    // Reducciones sobre honorarios finales
    let factorFinal = 1;
    let motivoFinal = "";
    if (tipo === 'ejecutivo' && wizardState.tuvoExcepciones === false) {
        factorFinal = 0.9;
        motivoFinal = "10% por ejecutivo sin excepciones (art.34)";
    } else if (tipo === 'ejecucion_sentencia' && wizardState.tuvoExcepciones === false) {
        factorFinal = 0.9;
        motivoFinal = "10% adicional por ejecución de sentencia sin excepciones (art.41 + art.34)";
    }
    // Reducciones adicionales (art. 38 y 49)
    if (tipo === 'conocimiento' && wizardState.objetoBase === 'posesorias_interdictos' && wizardState.posesoriasTipo === 'beneficio') {
        factorFinal *= 0.8;
        motivoFinal = motivoFinal ? motivoFinal + ' + 20% por art. 38 (posesorias/interdictos beneficio exclusivo)' : '20% por art. 38 (posesorias/interdictos beneficio exclusivo)';
    }
    if (tipo === 'conocimiento' && wizardState.objetoBase === 'incidencia_colectiva') {
        factorFinal *= 0.75;
        motivoFinal = motivoFinal ? motivoFinal + ' + 25% por art. 49 (incidencia colectiva)' : '25% por art. 49 (incidencia colectiva)';
    }
    const minFinal = minEscala * factorFinal;
    const maxFinal = maxEscala * factorFinal;
    const minApoFinal = minApoEscala * factorFinal;
    const maxApoFinal = maxApoEscala * factorFinal;
    const minProc = minFinal * 0.4;
    const maxProc = maxFinal * 0.4;
    const auxMin = calcBase.auxMin;
    const auxMax = calcBase.auxMax;
    const esProvisorio = wizardState.esProvisorio;

    // Transparencia de escala anterior
    let transparenciaHtml = "";
    if (calcBase.maximoEscalaAnterior > 0) {
        const excedente = calcBase.baseEnUMA - calcBase.limiteAnterior;
        transparenciaHtml = `<div class="legal-box" style="margin-top:10px;"><strong>Máximo de la escala anterior:</strong> ${calcBase.maximoEscalaAnterior.toFixed(2)} UMA<br><strong>Excedente de ${calcBase.limiteAnterior} UMA sobre el que aplican los porcentajes de la escala:</strong> ${excedente.toFixed(2)} UMA</div>`;
    }

    let html = `<div class="dashboard-card"><h3>📊 Resumen del juicio</h3><div class="grid-2col"><div class="stat-card"><div class="badge">Tipo de proceso</div><div class="stat-number" style="font-size:1.2rem;">${tipo === 'conocimiento' ? 'De conocimiento' : tipo === 'ejecucion_sentencia' ? 'Ejecución de sentencia' : tipo === 'ejecutivo' ? 'Ejecutivo' : tipo === 'sucesion' ? 'Sucesión' : tipo}</div></div><div class="stat-card"><div class="badge">Base regulatoria</div><div class="stat-number">$${formatNumber(baseFinal)}</div>${hayReduccionBase ? `<small class="badge" style="background:#f0e6d2;">Original: $${formatNumber(wizardState.baseValor)}</small><br><small>${motivoBase.join("; ")}</small>` : ''}</div><div class="stat-card"><div class="badge">Valor UMA</div><div class="stat-number">$${formatNumber(uma)}</div></div><div class="stat-card"><div class="badge">Base en UMA</div><div class="stat-number">${calcBase.baseEnUMA.toFixed(2)}</div></div></div>
    <div><strong>Escala aplicada:</strong> ${calcBase.tituloEscala} (${calcBase.minPorc}% a ${calcBase.maxPorc}%)${motivosEscala.length ? `<br><strong>Reducción de escala (${motivosEscala.join("; ")}):</strong> ${(calcBase.minPorc * factorEscala).toFixed(1)}% a ${(calcBase.maxPorc * factorEscala).toFixed(1)}%` : ''}${factorFinal !== 1 ? `<br><strong>Reducción sobre honorarios (${motivoFinal}):</strong> ${factorFinal*100}% del resultado anterior` : ''}
    <br><details style="margin-top:8px; font-size:0.9rem;">
        <summary style="cursor:pointer; color:var(--btn-primary); font-weight:600;">ℹ️ ¿Cómo se calcula el honorario mínimo? (click para ver)</summary>
        <div class="info-text" style="margin-top:8px; padding:12px; border-radius:12px; background:var(--legal-bg);">
            <strong>Interpretación literal del artículo 21:</strong><br>
            “En ningún caso los honorarios podrán ser inferiores al <u>máximo del grado inmediato anterior</u> de la escala, con más el incremento por aplicación al excedente de la alícuota que corresponde al grado siguiente.”<br><br>
            <strong>¿Qué significa esto?</strong><br>
            Cada vez que la base supera un escalón, el honorario mínimo se calcula así:<br>
            1️⃣ Se toma el <strong>máximo alcanzable en la escala anterior</strong> (por ejemplo, para la 2ª escala: 15 UMA × 33% = 4.95 UMA).<br>
            2️⃣ Se suma el resultado de aplicar la <strong>alícuota mínima del nuevo escalón</strong> sobre el excedente (la parte de la base que supera el límite anterior).<br><br>
            <strong>Ejemplo:</strong> Base = 50 UMA (3ª escala: 46-90 UMA).<br>
            • Máximo de la 2ª escala: 11.70 UMA<br>
            • Excedente sobre 45 UMA: 5 UMA<br>
            • Cálculo mínimo: 11.70 + (5 × 18%) = 11.70 + 0.90 = <strong>12.60 UMA</strong><br><br>
            ⚠️ <em>Este asistente aplica la interpretación literal (máximo del grado inmediato anterior). No utiliza una acumulación de todos los máximos previos, por considerarla contraria al texto expreso de la ley.</em>
        </div>
    </details>
        </div>${transparenciaHtml}</div>`;

    function generarFila(e, minU, maxU, minP, maxP) {
        if (esProvisorio) return `<tr><td>${e}</td><td>${minU.toFixed(2)}</td><td>$${formatNumber(minP)}</td></tr>`;
        else return `<tr><td>${e}</td><td>${minU.toFixed(2)}</td><td>${maxU.toFixed(2)}</td><td>$${formatNumber(minP)}</td><td>$${formatNumber(maxP)}</td></tr>`;
    }

    // Patrocinante con calculadora
    html += `<div class="dashboard-card"><h4>👨‍⚖️ Patrocinante</h4>
    <table><thead><tr><th>Etapas</th>${esProvisorio ? '<th>Mínimo UMA</th><th>Mínimo $</th>' : '<th>Mínimo UMA</th><th>Máximo UMA</th><th>Mínimo $</th><th>Máximo $</th>'}</tr></thead>
    <tbody>${generarFila("Juicio completo", minFinal, maxFinal, minFinal*uma, maxFinal*uma)}${generarFila("Una etapa (1/3)", minFinal/3, maxFinal/3, (minFinal/3)*uma, (maxFinal/3)*uma)}${generarFila("Dos etapas (2/3)", minFinal*2/3, maxFinal*2/3, (minFinal*2/3)*uma, (maxFinal*2/3)*uma)}</tbody></table>
    <div class="check-group" style="margin-top:15px;">
        <label><input type="checkbox" id="calcPorcPatro"> Calcular porcentaje de una etapa</label>
        <div id="porcPatroInput" class="percentage-input" style="display:none; margin-top:10px;">
            <input type="number" id="porcPatroVal" placeholder="%" min="1" max="100" style="width:80px;">
            <button id="aplicarPorcPatro">Aplicar</button>
            <div id="resultadoPorcPatro" class="resultado-porcentaje" style="display:none;"></div>
        </div>
    </div></div>`;

    // Apoderado con calculadora
    html += `<div class="dashboard-card"><h4>📑 Apoderado (+40%)</h4>
    <table><thead><tr><th>Etapas</th>${esProvisorio ? '<th>Mínimo UMA</th><th>Mínimo $</th>' : '<th>Mínimo UMA</th><th>Máximo UMA</th><th>Mínimo $</th><th>Máximo $</th>'}</tr></thead>
    <tbody>${generarFila("Juicio completo", minApoFinal, maxApoFinal, minApoFinal*uma, maxApoFinal*uma)}${generarFila("Una etapa (1/3)", minApoFinal/3, maxApoFinal/3, (minApoFinal/3)*uma, (maxApoFinal/3)*uma)}${generarFila("Dos etapas (2/3)", minApoFinal*2/3, maxApoFinal*2/3, (minApoFinal*2/3)*uma, (maxApoFinal*2/3)*uma)}</tbody></table>
    <div class="check-group" style="margin-top:15px;">
        <label><input type="checkbox" id="calcPorcApo"> Calcular porcentaje de una etapa</label>
        <div id="porcApoInput" class="percentage-input" style="display:none; margin-top:10px;">
            <input type="number" id="porcApoVal" placeholder="%" min="1" max="100" style="width:80px;">
            <button id="aplicarPorcApo">Aplicar</button>
            <div id="resultadoPorcApo" class="resultado-porcentaje" style="display:none;"></div>
        </div>
    </div></div>`;

    html += `<div class="legal-box">ARTÍCULO 20.- Los honorarios de los procuradores se fijarán en un 40% de los que por esta ley corresponda fijar a los abogados patrocinantes. Si el abogado actuare en carácter de apoderado sin patrocinio, percibirá la asignación total que hubiere correspondido a ambos.</div>`;

    // Procurador con calculadora
    html += `<div class="dashboard-card"><h4>📋 Procurador (40% del patrocinante)</h4>
    <table><thead><tr><th>Etapas</th>${esProvisorio ? '<th>Mínimo UMA</th><th>Mínimo $</th>' : '<th>Mínimo UMA</th><th>Máximo UMA</th><th>Mínimo $</th><th>Máximo $</th>'}</tr></thead>
    <tbody>${generarFila("Juicio completo", minProc, maxProc, minProc*uma, maxProc*uma)}${generarFila("Una etapa (1/3)", minProc/3, maxProc/3, (minProc/3)*uma, (maxProc/3)*uma)}${generarFila("Dos etapas (2/3)", minProc*2/3, maxProc*2/3, (minProc*2/3)*uma, (maxProc*2/3)*uma)}</tbody></table>
    <div class="check-group" style="margin-top:15px;">
        <label><input type="checkbox" id="calcPorcProc"> Calcular porcentaje de una etapa</label>
        <div id="porcProcInput" class="percentage-input" style="display:none; margin-top:10px;">
            <input type="number" id="porcProcVal" placeholder="%" min="1" max="100" style="width:80px;">
            <button id="aplicarPorcProc">Aplicar</button>
            <div id="resultadoPorcProc" class="resultado-porcentaje" style="display:none;"></div>
        </div>
    </div></div>`;

    // Tabla de segunda instancia
    const patMinSeg = minFinal * 0.30;
    const patMaxSeg = maxFinal * 0.35;
    const patMaxRev = maxFinal * 0.40;
    const apoMinSeg = minApoFinal * 0.30;
    const apoMaxSeg = maxApoFinal * 0.35;
    const apoMaxRev = maxApoFinal * 0.40;
    const procMinSeg = minProc * 0.30;
    const procMaxSeg = maxProc * 0.35;
    const procMaxRev = maxProc * 0.40;

    html += `<div class="dashboard-card"><h4>📌 Honorarios de segunda instancia (art. 30)</h4>
    <table><thead><tr><th>Carácter</th><th>Mínimo (30%) UMA</th><th>Máximo (35%) UMA</th><th>Máximo (sentencia revocada, 40%) UMA</th><th>Mínimo $</th><th>Máximo $</th><th>Máximo (revocada) $</th></tr></thead>
    <tbody>
    <tr><td>Patrocinante</td><td>${patMinSeg.toFixed(2)}</td><td>${patMaxSeg.toFixed(2)}</td><td>${patMaxRev.toFixed(2)}</td><td>$${formatNumber(patMinSeg * uma)}</td><td>$${formatNumber(patMaxSeg * uma)}</td><td>$${formatNumber(patMaxRev * uma)}</td></tr>
    <tr><td>Apoderado</td><td>${apoMinSeg.toFixed(2)}</td><td>${apoMaxSeg.toFixed(2)}</td><td>${apoMaxRev.toFixed(2)}</td><td>$${formatNumber(apoMinSeg * uma)}</td><td>$${formatNumber(apoMaxSeg * uma)}</td><td>$${formatNumber(apoMaxRev * uma)}</td></tr>
    <tr><td>Procurador</td><td>${procMinSeg.toFixed(2)}</td><td>${procMaxSeg.toFixed(2)}</td><td>${procMaxRev.toFixed(2)}</td><td>$${formatNumber(procMinSeg * uma)}</td><td>$${formatNumber(procMaxSeg * uma)}</td><td>$${formatNumber(procMaxRev * uma)}</td></tr>
    </tbody></table>
    <div class="legal-box">Art. 30: "Por las actuaciones correspondientes a la segunda o ulterior instancia, se regularán en cada una de ellas del 30% al 35% de la cantidad que se fije para honorarios en primera instancia...Si la sentencia recurrida fuera revocada en todas sus partes en favor del apelante, los honorarios profesionales por los trabajos en esa instancia de apelación se fijarán entre el 30% y 40% de los correspondientes a la primera instancia".</div></div>`;

    // Auxiliares de justicia
    html += `<div class="dashboard-card"><h4>🛠️ Auxiliares de justicia (5% y 10% de la base)</h4><table><thead><tr><th>Mínimo UMA</th>${esProvisorio ? '<th>Mínimo $</th>' : '<th>Máximo UMA</th><th>Mínimo $</th><th>Máximo $</th>'}</tr></thead><tbody><tr>${esProvisorio ? `<td>${auxMin.toFixed(2)}</td><td>$${formatNumber(auxMin * uma)}` : `<td>${auxMin.toFixed(2)}</td><td>${auxMax.toFixed(2)}</td><td>$${formatNumber(auxMin * uma)}</td><td>$${formatNumber(auxMax * uma)}`}</tr></tbody></table><div class="legal-box">La tabla muestra la regla general del art. 21 antepenúltimo párrafo según el cual el monto no puede ser inferior al 5% ni superior al 10% del monto del proceso.<br>Tené en cuenta que:<br>i) Ante labores altamente complejas o extensas el juez puede aplicar un porcentaje mayor (art. 21)<br>ii) Según el art. 21 es aplicable el art. 478 del CPCCN (principio de proporcionalidad con los demás profesionales y posibilidad de perforar los mínimos arancelarios)<br>iii) Según el art. 61 bis (incorporado por ley 27.802), los honorarios de los peritos no están vinculados a la cuantía del juicio ni al porcentaje de incapacidad y la regulación responde exclusivamente a la apreciación judicial. El monto mínimo es 2 UMA. Si el proceso finaliza por transacción, avenimiento y conciliación, sin que se haya presentado la pericia se regula 1/4 de UMA si aceptó el cargo.<br>iv) También sigue vigente el inc. b) del art. 25 según el cual si no se presentó la pericia se efectúa una regulación compensatoria adecuada en base al art. 16, pudiendo el perito detallar las tareas realizadas desde la aceptación del cargo.</div></div>`;

    // TABLA DEL PARTIDOR (solo para sucesión)
    if (tipo === 'sucesion') {
        const partidorMin = baseFinal * 0.02;
        const partidorMax = baseFinal * 0.03;
        html += `<div class="dashboard-card"><h4>💰 Honorarios del partidor</h4><table><thead><tr><th>Concepto</th><th>Porcentaje</th><th>Monto (UMA)</th><th>Monto ($)</th></tr></thead><tbody><tr><td>Mínimo</td><td>2%</td><td>${(partidorMin/uma).toFixed(2)}</td><td>$${formatNumber(partidorMin)}</td></tr><tr><td>Máximo</td><td>3%</td><td>${(partidorMax/uma).toFixed(2)}</td><td>$${formatNumber(partidorMax)}</td></tr></tbody></table><div class="legal-box">Art. 35 última parte: …Los honorarios del abogado o abogados partidores en conjunto, se fijarán sobre el valor del haber a dividirse, aplicando una escala del 2 % al 3% del total. Si se trata del auxiliar de Justicia, los honorarios derivados de la actuación como perito partidor para realizar y suscribir las cuentas particionarias juntamente con el letrado, será regulada en una escala del 2 % al 3% del valor de los bienes objeto de la partición.</div></div>`;
    }

    html += `<div style="margin-top:20px; text-align:center;">
        <button id="btnIrAMinimosDesdeResultado" class="btn-outline" style="padding:10px 24px;">
            📋 Ver mínimos arancelarios para contrastar
        </button>
        <p style="font-size:0.8rem; margin-top:8px; color: var(--text-secondary);">
            Si el resultado parece inferior a los mínimos legales, consultá la tabla de mínimos.
        </p>
    </div>`;

    document.getElementById('resultadosDinamicos').innerHTML = html;

    // Eventos de porcentaje de etapa
    function setupPorc(cbId, inputId, btnId, resId, baseMinUMA, baseMaxUMA, uma) {
        const chk = document.getElementById(cbId);
        const div = document.getElementById(inputId);
        const inp = document.getElementById(inputId === 'porcPatroInput' ? 'porcPatroVal' : (inputId === 'porcApoInput' ? 'porcApoVal' : 'porcProcVal'));
        const btn = document.getElementById(btnId);
        const res = document.getElementById(resId);
        if (!chk || !div || !inp || !btn || !res) return;
        chk.addEventListener('change', () => {
            div.style.display = chk.checked ? 'flex' : 'none';
            if (!chk.checked) res.style.display = 'none';
        });
        btn.addEventListener('click', () => {
            let val = parseInt(inp.value);
            if (isNaN(val)) val = 100;
            if (val < 1) val = 1;
            if (val > 100) val = 100;
            const minVal = baseMinUMA * (val / 100);
            const maxVal = baseMaxUMA * (val / 100);
            const minPesos = minVal * uma;
            const maxPesos = maxVal * uma;
            res.innerHTML = `<strong>Resultado del ${val}% de una etapa:</strong><br>Mínimo: ${minVal.toFixed(2)} UMA ($${formatNumber(minPesos)})<br>Máximo: ${maxVal.toFixed(2)} UMA ($${formatNumber(maxPesos)})`;
            res.style.display = 'block';
        });
    }
    const etapaMinUno = minFinal/3;
    const etapaMaxUno = maxFinal/3;
    const etapaMinApoUno = minApoFinal/3;
    const etapaMaxApoUno = maxApoFinal/3;
    const etapaMinProcUno = (minFinal/3) * 0.4;
    const etapaMaxProcUno = (maxFinal/3) * 0.4;
    setupPorc('calcPorcPatro', 'porcPatroInput', 'aplicarPorcPatro', 'resultadoPorcPatro', etapaMinUno, etapaMaxUno, uma);
    setupPorc('calcPorcApo', 'porcApoInput', 'aplicarPorcApo', 'resultadoPorcApo', etapaMinApoUno, etapaMaxApoUno, uma);
    setupPorc('calcPorcProc', 'porcProcInput', 'aplicarPorcProc', 'resultadoPorcProc', etapaMinProcUno, etapaMaxProcUno, uma);
}

// --------------------------------------------------------------
// TABLA DE MÍNIMOS (art. 19 a) - asuntos no susceptibles de apreciación pecuniaria
// --------------------------------------------------------------
function mostrarTablasMinimos(modo) {
    if (modo === 'judicial') {
        const uma = wizardState.valorUMA;
        const items = [
            { asunto: 'Divorcio', uma: 10 },
            { asunto: 'Acción sobre efectos del divorcio y responsabilidad parental', uma: 25 },
            { asunto: 'Adopción', uma: 20 },
            { asunto: 'Tutela', uma: 20 },
            { asunto: 'Restricciones a la capacidad e inhabilitación', uma: 25 },
            { asunto: 'Reclamación e impugnación de filiación', uma: 25 },
            { asunto: 'Acciones de estado y familia', uma: 25 },
            { asunto: 'Veeduría', uma: 10 },
            { asunto: 'Información sumaria', uma: 2 },
            { asunto: 'Trámite administrativo ante autoridad de aplicación', uma: 2 },
            { asunto: 'Trámite ante la Inspección General de Justicia', uma: 3 },
            { asunto: 'Presentación de denuncias penales con firma de letrado', uma: 8 },
            { asunto: 'Incidente de excarcelación o exención de prisión o audiencia de control de detención o medidas de coerción', uma: 10 },
            { asunto: 'Pedido y audiencia de suspensión de juicio a prueba', uma: 10 },
            { asunto: 'Acta de juicio abreviado', uma: 15 },
            { asunto: 'Actuación hasta la clausura de la instrucción o de control de la acusación', uma: 15 },
            { asunto: 'Actuación desde la clausura de la instrucción o de control de la acusación hasta la sentencia', uma: 20 },
            { asunto: 'Acción de incidencia colectiva, hábeas corpus, hábeas data', uma: 25 }
        ];
        let rows = '';
        items.forEach(item => {
            const pesos = item.uma * uma;
            rows += `<tr><td>${item.asunto}</td><td>${item.uma} UMA</td><td>$${formatNumber(pesos)}</td></tr>`;
        });
        const html = `<div class="dashboard-card"><h3>Mínimos en asuntos judiciales no susceptibles de apreciación pecuniaria (art. 19 inc. a)</h3>
            <div class="legal-box">ARTÍCULO 19.- Cuando no fuere posible apreciar el valor pecuniario del asunto, los jueces fijarán los honorarios teniendo en cuenta la naturaleza de las actuaciones y la gestión profesional desarrollada, con arreglo a las siguientes pautas:<br>a) En asuntos judiciales:</div>
            <table><thead><tr><th>Asunto</th><th>UMA</th><th>$</th></tr></thead><tbody>${rows}</tbody></table></div>`;
        document.getElementById('resultadosDinamicos').innerHTML = html;
    } else if (modo === 'extrajudicial') {
        const uma = wizardState.valorUMA;
        const items = [
            { labor: 'Consulta verbal', uma: 0.5 },
            { labor: 'Consulta con informe', uma: 1 },
            { labor: 'Redacción de carta documento', uma: 1 },
            { labor: 'Estudio o información de actuaciones judiciales o administrativas', uma: 1.5 },
            { labor: 'Asistencia y asesoramiento del cliente en la realización de actos jurídicos', uma: 1.5 },
            { labor: 'Redacción de contrato de locación', uma: 2 },
            { labor: 'Redacción de boleto de compraventa', uma: 3 },
            { labor: 'Redacción de contrato o estatuto de sociedades comerciales, asociaciones o fundaciones y constitución de personas jurídicas en general', uma: 5 },
            { labor: 'Redacción de otros contratos', uma: 2 },
            { labor: 'Arreglo extrajudicial', uma: 1 },
            { labor: 'Gastos administrativos de estudio para iniciación de juicios', uma: 0.5 },
            { labor: 'Redacción de denuncia penal (sin firma de letrado)', uma: 3 },
            { labor: 'Asistencia a una audiencia de mediación o conciliación', uma: 2 }
        ];
        let rows = '';
        items.forEach(item => {
            const pesos = item.uma * uma;
            rows += `<tr><td>${item.labor}</td><td>${item.uma} UMA</td><td>$${formatNumber(pesos)}</td></tr>`;
        });
        return `<div class="dashboard-card"><h3>Mínimos por labor extrajudicial (art. 19 inc. b)</h3>
            <div class="legal-box">ARTÍCULO 19.- Cuando no fuere posible apreciar el valor pecuniario del asunto, los jueces fijarán los honorarios teniendo en cuenta la naturaleza de las actuaciones y la gestión profesional desarrollada, con arreglo a las siguientes pautas:...<br>b) En asuntos extrajudiciales:</div>
            <table><thead><tr><th>Labor</th><th>UMA</th><th>$</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    } else if (modo === 'art58') {
        const uma = wizardState.valorUMA;
        return `<div class="dashboard-card">
            <h3>📌 Mínimos del art. 58 (juicios susceptibles de apreciación pecuniaria que no estuviesen previstos en otros artículos)</h3>
            <table><thead><tr><th>Inciso</th><th>Mínimo (UMA)</th><th>Mínimo $</th></tr></thead>
            <tbody>
                <tr><td>a) procesos de conocimiento</td><td>10 UMA</td><td>$${formatNumber(10 * uma)}</td></tr>
                <tr><td>b) ejecutivos</td><td>6 UMA</td><td>$${formatNumber(6 * uma)}</td></tr>
                <tr><td>c) mediación</td><td>2 UMA</td><td>$${formatNumber(2 * uma)}</td></tr>
                <tr><td>d) Auxiliares de la Justicia</td><td>4 UMA</td><td>$${formatNumber(4 * uma)}</td></tr>
            </tbody></table>
            <div class="legal-box">Art. 58: Mínimo establecido para regular honorarios de juicios susceptibles de apreciación pecuniaria que no estuviesen previstos en otros artículos.</div>
        </div>`;
    } else if (modo === 'recursos_csjn') {
        return `<div class="dashboard-card">
            <h4>📌 Recursos ante la CSJN (art. 31)</h4>
            <table>
                <thead>
                    <tr><th colspan="3">Recursos ante la CSJN (art. 31)</th></tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Queja por denegación de recurso</td>
                        <td>15 UMA</td>
                        <td>$${formatNumber(15 * wizardState.valorUMA)}</td>
                    </tr>
                    <tr>
                        <td>Interposición de recurso extraordinario, etc.</td>
                        <td>20 UMA</td>
                        <td>$${formatNumber(20 * wizardState.valorUMA)}</td>
                    </tr>
                </tbody>
            </table>
            <div class="legal-box">Art. 31: La interposición ante la CSJN de los recursos extraordinarios, de inconstitucionalidad, de revisión, de casación, ordinarios, directos y otros similares o que no sean los normales de acceso, no podrá remunerarse en una cantidad inferior a 20 UMA. Las quejas por denegación de estos recursos no podrán remunerarse en una cantidad inferior a 15 UMA. Si dichos recursos fueren concedidos y se tramitaren, se estará a lo dispuesto en el artículo 21.</div>
        </div>`;
    } else if (modo === 'auxiliares_justicia') {
        return `<div class="dashboard-card">
            <h3>📌 Auxiliares de justicia</h3>
            <table>
                <thead>
                    <tr><th colspan="2">Mínimos del art. 58: juicios susceptibles de apreciación pecuniaria no previstos en otros artículos</th></tr>
                </thead>
                <tbody>
                    <tr>
                        <td>4 UMA</td>
                        <td>$${formatNumber(4 * wizardState.valorUMA)}</td>
                    </tr>
                </tbody>
            </table>
            <table style="margin-top:16px;">
                <thead>
                    <tr><th colspan="3">Mínimos del art. 60: Procesos no susceptibles de apreciación pecuniaria</th></tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Peritos y liquidadores de averías</td>
                        <td>2 UMA</td>
                        <td>$${formatNumber(2 * wizardState.valorUMA)}</td>
                    </tr>
                </tbody>
            </table>
            <div class="legal-box">ARTÍCULO 60 (B.O. 06/03/2026).- En los procesos no susceptibles de apreciación pecuniaria, los honorarios de los peritos y de los peritos liquidadores de averías serán fijados conforme a las pautas valorativas del artículo 16 y en un mínimo de 2 UMA, siendo suficiente para la fijación de los honorarios mínimos, la aceptación del cargo conferido. En el caso de los demás auxiliares de la Justicia, se aplicarán las normas específicas.</div>
            <table style="margin-top:16px;">
                <thead>
                    <tr><th colspan="3">Mínimos del art. 61 bis: controversias judiciales</th></tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Peritos</td>
                        <td>2 UMA por pericia</td>
                        <td>$${formatNumber(2 * wizardState.valorUMA)}</td>
                    </tr>
                    <tr>
                        <td>Peritos que aceptaron el cargo y no presentaron dictamen por transacción, avenimiento o conciliación</td>
                        <td>¼ de UMA</td>
                        <td>$${formatNumber(0.25 * wizardState.valorUMA)}</td>
                    </tr>
                </tbody>
            </table>
            <div class="legal-box">Artículo 61 bis (B.O. 06/03/2026) Los honorarios de los peritos que intervengan en las controversias judiciales, no estarán vinculados a la cuantía del respectivo juicio, ni al porcentaje de incapacidad que se dictamine en caso de producirse una pericia médica. Su regulación responderá exclusivamente a la apreciación judicial de la labor técnica realizada en el pleito y su relevancia; calidad y extensión en lo concreto y deberá fijarse en un monto que asegure una adecuada retribución al perito. Por cada pericia, se fijará un monto mínimo de 2 UMA. En caso de finalizar el proceso por transacción, avenimiento y conciliación, sin que el perito haya presentado la pericia encargada, se le regulará 1/4 de UMA en tanto el perito haya aceptado el cargo.</div>
        </div>`;
    }
}
window.mostrarTablasMinimos = mostrarTablasMinimos;