// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 L. Javier Cuneo Libarona
// ---------------------------------------------------------------
// lib/legal/jurisprudencia.ts
// Los fallos que sostienen los criterios que la ley no resuelve.
//
// Por que existe: la app interpreta, y tiene que interpretar, porque
// el Decreto 1077/2017 observo articulos y dejo huecos sin norma que
// los reemplace. La regla del repositorio es que una interpretacion no
// se prueba, se declara. Esto es el paso siguiente: **una
// interpretacion declarada con jurisprudencia se puede discutir; una
// sin nada detras solo se puede creer o no.**
//
// Datos puros. Ninguna aritmetica, ningun componente: la presentacion
// decide como se ven.
// ---------------------------------------------------------------

export interface Fallo {
  /** Tribunal y sala, como se cita. Se omite si la fuente no lo precisa. */
  tribunal?: string
  expediente: string
  /** Caratula, transcripta como figura en el expediente. */
  caratula: string
  /** dd/mm/aaaa */
  fecha: string
  /** La sentencia publicada en el Centro de Informacion Judicial. */
  url?: string
}

export interface Criterio {
  /** Que sostienen los fallos, en una frase. */
  sostiene: string
  fallos: Fallo[]
}

/**
 * De donde sale el 2 % al 20 % de los incidentes.
 *
 * El art. 47 de la Ley 27.423 —el unico que fijaba porcentaje para los
 * incidentes— quedo observado por el Decreto 1077/2017 y nunca entro
 * en vigencia. El art. 29 inc. g) divide el incidente en dos etapas
 * pero no fija alicuota. El motor aplica el 2 %-20 % del art. 33 de la
 * Ley 21.839, derogada, y estos fallos son la razon por la que ese
 * criterio es defendible y no una invencion nuestra.
 */
export const INCIDENTE_ESCALA: Criterio = {
  sostiene:
    'El criterio del art. 33 de la Ley 21.839 se considera, aun pese a su derogación, como una referencia análoga para regular los honorarios de los incidentes.',
  fallos: [
    {
      tribunal: 'CNCiv., Sala H',
      expediente: 'expte. 69817/2018',
      caratula:
        'RAMOS DIAZ, SABRINA ROMINA Y OTRO c/ FRIDMAN, PABLO ERNESTO s/ DAÑOS Y PERJUICIOS (ACC. TRAN. C/ LES. O MUERTE)',
      fecha: '27/10/2023',
      url: 'https://www.cij.gov.ar/d/sentencia-SGU-2b2f59bf-ca96-4860-9c92-41b6d6dcc6d1.pdf',
    },
    {
      tribunal: 'CNCiv., Sala I',
      expediente: 'expte. CIV 45030/2017',
      caratula:
        'TRIAM SRL c/ CONS DE PROP AV 3 N 568 VILLA GESELL PBA s/ ACCION DECLARATIVA (ART. 322 COD. PROCESAL)',
      fecha: '08/10/2019',
      url: 'https://scw.pjn.gov.ar/scw/viewer.seam?id=ioQ58TOKX%2BOUPhLNmhCrq7kcrVYsUBrK8HhRx9QWCRc%3D&tipoDoc=despacho'
    },
    {
      tribunal: 'CNCiv., Sala I',
      expediente: 'expte. CIV 14821/2016',
      caratula:
        'FUNES, HERNAN IGNACIO c/ COSN PROP AV CALLAO 1364/70/74 Y OTRO s/ NULIDAD DE ASAMBLEA',
      fecha: '16/07/2019',
      url: 'https://www.cij.gov.ar/d/sentencia-SGU-49143e63-904a-4eae-89eb-4b3238401fa9.pdf',
    },
  ],
}
