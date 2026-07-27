// Estado global
let wizardState = {
    step: 0,
    valorUMA: 92482,   // valor inicial realista
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
    desdeResultado: false
};

function recolectarDatos() {
    if (wizardState.step === 0) {
        const input = document.getElementById('inputUMA');
        if (input) wizardState.valorUMA = parseNumber(input.value) || valorUMA;
    }
    if (wizardState.step === 4) {
        const input = document.getElementById('baseInputNum');
        if (input) wizardState.baseValor = parseNumber(input.value) || 0;
    }
}

function validarPasoActual() {
    const step = wizardState.step;
    if (step === 'minimos') return '';
    if (step === 1) {
        if (!wizardState.tipoProceso) {
            return 'Debe seleccionar un tipo de proceso.';
        }
        return '';
    }
    if (step === 2) {
        if (wizardState.tipoProceso === 'minimos_judiciales') return '';
        if (wizardState.tipoProceso === 'conocimiento' || wizardState.tipoProceso === 'ejecucion_sentencia' || wizardState.tipoProceso === 'ejecutivo') {
            if (!wizardState.modoTerminacion) {
                return 'Debe seleccionar una forma de terminación.';
            }
            if (wizardState.modoTerminacion === 'sentencia' && !wizardState.sentenciaResultado) {
                return 'Debe seleccionar si la demanda fue admitida o rechazada.';
            }
            if (wizardState.modoTerminacion === 'modos_anormales' && wizardState.aperturaPrueba === null) {
                return 'Debe indicar si se produjo antes o después de la apertura a prueba.';
            }
            if (wizardState.modoTerminacion === 'caducidad' && !wizardState.caducidadCriterio) {
                return 'Debe seleccionar un criterio para la caducidad.';
            }
            if (wizardState.modoTerminacion === 'caducidad' && wizardState.caducidadCriterio === 'art25' && wizardState.aperturaPrueba === null) {
                return 'Debe indicar si la caducidad se declaró antes o después de la apertura a prueba.';
            }
            if ((wizardState.tipoProceso === 'ejecucion_sentencia' || wizardState.tipoProceso === 'ejecutivo') && wizardState.tuvoExcepciones === null) {
                return 'Debe indicar si se dedujeron excepciones.';
            }
        } else if (wizardState.tipoProceso === 'sucesion') {
            if (wizardState.sucesionUnicoLetrado === null) {
                return 'Debe indicar si intervino un solo abogado o varios.';
            }
        } else if (wizardState.tipoProceso === 'medida_cautelar') {
            if (wizardState.medidaOposicion === null) {
                return 'Debe indicar si hubo oposición en la medida cautelar.';
            }
        } else if (wizardState.tipoProceso === 'homologacion_desocupacion') {
            if (wizardState.homologacionVivienda === null) {
                return 'Debe indicar si la locación era para vivienda.';
            }
        }
        return '';
    }
    if (step === 3 && wizardState.tipoProceso === 'conocimiento') {
        if (!wizardState.objetoBase) {
            return 'Debe seleccionar el objeto del juicio.';
        }
        if (wizardState.objetoBase === 'desalojo' && wizardState.desalojoVivienda === null) {
            return 'Debe indicar si el alquiler es para vivienda o demás casos.';
        }
        if (wizardState.objetoBase === 'posesorias_interdictos' && wizardState.posesoriasTipo === null) {
            return 'Debe seleccionar el tipo de actuación posesoria.';
        }
        return '';
    }
    if (step === 4) {
        if (!wizardState.baseValor || wizardState.baseValor <= 0) {
            return 'Debe ingresar un monto válido para la base regulatoria.';
        }
        return '';
    }
    return '';
}

// Exponer globalmente
window.wizardState = wizardState;
window.recolectarDatos = recolectarDatos;
window.validarPasoActual = validarPasoActual;