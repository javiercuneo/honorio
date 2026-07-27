// ---------- core.js ----------
// Valor de la UMA (inicial 92.482), luego se actualiza desde Google Sheets
let valorUMA = 92482;
window.valorUMA = valorUMA; // exponer para otros módulos

// Parseo de números argentinos
function parseNumber(str) {
    if (!str) return NaN;
    let cleaned = String(str).replace(/\./g, '');
    cleaned = cleaned.replace(',', '.');
    return parseFloat(cleaned);
}

function formatNumber(num) {
    if (isNaN(num)) return 'N/A';
    return num.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function cargarUMA() {
    const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8tumvxptTGBCfScMwWxK7r6ATnGfMw061GKGdzfIVyThcSGzUqjI-vcpME1AtykPmjqTq0xdjgc7D/pub?output=csv';
    fetch(url)
        .then(response => response.text())
        .then(data => {
            const filas = data.split('\n');
            const cols = filas[0].split(',');
            let val = cols[1]?.replace(/"/g, '').trim();
            if (val && !isNaN(parseNumber(val))) {
                const nuevoUMA = parseNumber(val);
                valorUMA = nuevoUMA;
                window.valorUMA = valorUMA;
                // Actualizar el input solo si el usuario no lo ha modificado manualmente
                const inputUMA = document.getElementById('inputUMA');
                if (inputUMA && !inputUMA.dataset.dirty) {
                    inputUMA.value = formatNumber(valorUMA);
                }
            }
        })
        .catch(e => console.warn("Error carga UMA", e));
}

// Marcar el input como modificado cuando el usuario escribe
document.addEventListener('input', function(e) {
    if (e.target.id === 'inputUMA') {
        e.target.dataset.dirty = 'true';
    }
});

// Cálculo de escala pura (sin reducciones) - respetando tus máximos acumulados
function calcularEscalaBase(basePesos, valorUMA) {
    if (!basePesos || !valorUMA || valorUMA <= 0) return null;
    let baseEnUMA = basePesos / valorUMA;
    let minComp, maxComp, tituloEscala;
    let minPorc, maxPorc;
    let maximoEscalaAnterior = 0;
    let limiteAnterior = 0;

    if (baseEnUMA <= 15) {
        tituloEscala = "1ª escala (hasta 15 UMA): 22% a 33%";
        minComp = baseEnUMA * 0.22;
        maxComp = baseEnUMA * 0.33;
        minPorc = 22; maxPorc = 33;
    } else if (baseEnUMA <= 45) {
        tituloEscala = "2ª escala (16-45 UMA): 20% a 26%";
        minComp = (baseEnUMA-15)*0.20 + 4.95;
        maxComp = (baseEnUMA-15)*0.26 + 4.95;
        minPorc = 20; maxPorc = 26;
        maximoEscalaAnterior = 4.95;
        limiteAnterior = 15;
    } else if (baseEnUMA <= 90) {
        tituloEscala = "3ª escala (46-90 UMA): 18% a 24%";
        minComp = (baseEnUMA-45)*0.18 + 11.7;
        maxComp = (baseEnUMA-45)*0.24 + 11.7;
        minPorc = 18; maxPorc = 24;
        maximoEscalaAnterior = 11.7;
        limiteAnterior = 45;
    } else if (baseEnUMA <= 150) {
        tituloEscala = "4ª escala (91-150 UMA): 17% a 22%";
        minComp = (baseEnUMA-90)*0.17 + 21.6;
        maxComp = (baseEnUMA-90)*0.22 + 21.6;
        minPorc = 17; maxPorc = 22;
        maximoEscalaAnterior = 21.6;
        limiteAnterior = 90;
    } else if (baseEnUMA <= 450) {
        tituloEscala = "5ª escala (151-450 UMA): 15% a 20%";
        minComp = (baseEnUMA-150)*0.15 + 33;
        maxComp = (baseEnUMA-150)*0.20 + 33;
        minPorc = 15; maxPorc = 20;
        maximoEscalaAnterior = 33;
        limiteAnterior = 150;
    } else if (baseEnUMA <= 750) {
        tituloEscala = "6ª escala (451-750 UMA): 13% a 17%";
        minComp = (baseEnUMA-450)*0.13 + 90;
        maxComp = (baseEnUMA-450)*0.17 + 90;
        minPorc = 13; maxPorc = 17;
        maximoEscalaAnterior = 90;
        limiteAnterior = 450;
    } else {
        tituloEscala = "7ª escala (+750 UMA): 12% a 15%";
        minComp = (baseEnUMA-750)*0.12 + 127.5;
        maxComp = (baseEnUMA-750)*0.15 + 127.5;
        minPorc = 12; maxPorc = 15;
        maximoEscalaAnterior = 127.5;
        limiteAnterior = 750;
    }

    const auxMin = baseEnUMA * 0.05;
    const auxMax = baseEnUMA * 0.10;
    const etapaUnMin = minComp / 3;
    const etapaUnMax = maxComp / 3;
    const etapaDosMin = minComp * 2 / 3;
    const etapaDosMax = maxComp * 2 / 3;

    return {
        tituloEscala, baseEnUMA, minPorc, maxPorc,
        maximoEscalaAnterior, limiteAnterior,
        patrocinante: { full: { min: minComp, max: maxComp }, uno: { min: etapaUnMin, max: etapaUnMax }, dos: { min: etapaDosMin, max: etapaDosMax } },
        apoderado: { full: { min: minComp * 1.4, max: maxComp * 1.4 }, uno: { min: etapaUnMin * 1.4, max: etapaUnMax * 1.4 }, dos: { min: etapaDosMin * 1.4, max: etapaDosMax * 1.4 } },
        auxMin, auxMax
    };
}

// Nota: calcularHonorariosPorGrupo no se encontró en asistente.html, 
// pero se incluye en el core.js si el usuario lo solicita explícitamente.
function calcularHonorariosPorGrupo(basePesos, valorUMA, factor) {
    const escala = calcularEscalaBase(basePesos, valorUMA);
    if (!escala) return null;
    return {
        min: escala.patrocinante.full.min * factor,
        max: escala.patrocinante.full.max * factor
    };
}

// Exponer globalmente
window.cargarUMA = cargarUMA;
window.parseNumber = parseNumber;
window.formatNumber = formatNumber;
window.calcularEscalaBase = calcularEscalaBase;
window.calcularHonorariosPorGrupo = calcularHonorariosPorGrupo;