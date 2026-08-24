"use client"

import { useMemo, useState } from "react"
import type { CalculoResultado, Rango, SegundaInstanciaRol } from "@/lib/legal/types"
import { pct } from "./format"
import { derivarCadena } from "./cadena"
import { ChipsCaso, type ChipsCasoProps } from "./ChipsCaso"
import {
  EscalaExplicacion,
  HonorariosBand,
  RepartoSection,
} from "./HonorariosBand"
import { SegundaInstanciaBand } from "./SegundaInstanciaBand"
import { ActuacionesPosterioresSection } from "./ActuacionesPosterioresSection"
import { CadenaCalculo } from "./CadenaCalculo"
import { AuxiliaresSection } from "./AuxiliaresSection"
import { MediacionSection } from "./MediacionSection"
import { ProsaSection } from "./ProsaSection"
import { PartidorSection } from "./PartidorSection"
import { ExhortoResult } from "./ExhortoResult"
import { IncidenteResult } from "./IncidenteResult"
import { CorteDeZona, SeccionPlegable, Segmented } from "./primitives"

type RolKey = "patrocinante" | "apoderado" | "procurador"

const ROL_LABEL: Record<RolKey, string> = {
  patrocinante: "Patrocinante",
  apoderado: "Apoderado",
  procurador: "Procurador",
}

const ROL_NOTA: Record<RolKey, string> = {
  patrocinante:
    "Es el honorario que sale directamente de la escala del art. 21.",
  apoderado:
    "El art. 20 reconoce al apoderado un 40% mas que al patrocinante por la gestion del mandato. Se aplica sobre el honorario ya reducido, al final de la cadena.",
  procurador:
    "El art. 20 fija el honorario del procurador en el 40% de lo que corresponde al patrocinante. Se aplica sobre el honorario ya reducido, al final de la cadena.",
}

type DashboardProps = Omit<ChipsCasoProps, "tipoProceso" | "valorUMA" | "transformaciones"> & {
  resultado: CalculoResultado
}

export function Dashboard({ resultado, ...caso }: DashboardProps) {
  const [rol, setRol] = useState<RolKey>("patrocinante")

  // El exhorto y el incidente salen por su propia rama, con su propia
  // pantalla. **La prosa va en las tres**, envuelta y no dentro de cada
  // una: es la salida del calculo y no una parte del calculo, asi que
  // no depende de como se presente el numero. Hasta el 10/8 estos dos
  // no ofrecian texto, y no era una decision.
  if (resultado.tipoProceso === "exhorto") {
    return (
      <div className="space-y-10">
        <ExhortoResult resultado={resultado} />
        <ProsaSection resultado={resultado} />
      </div>
    )
  }
  if (resultado.tipoProceso === "incidente") {
    return (
      <div className="space-y-10">
        <IncidenteResult resultado={resultado} />
        <ProsaSection resultado={resultado} />
      </div>
    )
  }

  return (
    <DashboardGeneral resultado={resultado} caso={caso} rol={rol} setRol={setRol} />
  )
}

function DashboardGeneral({
  resultado,
  caso,
  rol,
  setRol,
}: {
  resultado: CalculoResultado
  caso: Omit<ChipsCasoProps, "tipoProceso" | "valorUMA" | "transformaciones">
  rol: RolKey
  setRol: (r: RolKey) => void
}) {
  const { patrocinante, apoderado, procurador } = resultado.honorarios

  const rolesDisponibles = useMemo(() => {
    const out: RolKey[] = ["patrocinante"]
    if ((apoderado?.rango?.maxPesos ?? 0) > 0) out.push("apoderado")
    if ((procurador?.rango?.maxPesos ?? 0) > 0) out.push("procurador")
    return out
  }, [apoderado, procurador])

  const rangoPorRol: Record<RolKey, Rango> = {
    patrocinante: patrocinante.rango,
    apoderado: apoderado.rango,
    procurador: procurador.rango,
  }

  const rango = rangoPorRol[rol] ?? patrocinante.rango
  const segunda: SegundaInstanciaRol | undefined = resultado.segundaInstancia?.[rol]
  const escala = resultado.escala

  const cadena = derivarCadena({
    transformaciones: resultado.transformaciones,
    final: rango,
    patrocinante: patrocinante.rango,
    escala,
    baseFinal: resultado.baseFinal,
  })

  // En provisorios solo rige el minimo: nombrar el maximo seria enunciar
  // un tope que este calculo no esta afirmando.
  const alicuota = escala
    ? resultado.esProvisorio
      ? pct(escala.porcentajeMin)
      : `${pct(escala.porcentajeMin)} a ${pct(escala.porcentajeMax)}`
    : ""

  // Lo que arroja leer la alicuota del tramo como si fuera directa sobre
  // la base. Solo tiene sentido mostrarlo cuando difiere del resultado:
  // en el primer tramo de la escala ambos coinciden y la frase mentiria.
  const ingenuoBruto = escala
    ? (resultado.baseFinal * escala.porcentajeMin) / 100
    : 0
  const ingenuo =
    escala &&
    escala.escalera &&
    Math.abs(ingenuoBruto - rango.minPesos) / Math.max(1, rango.minPesos) > 0.01
      ? ingenuoBruto
      : null

  const selectorRol =
    rolesDisponibles.length > 1 ? (
      <Segmented
        ariaLabel="Rol profesional"
        value={rol}
        onChange={setRol}
        options={rolesDisponibles.map((r) => ({ value: r, label: ROL_LABEL[r] }))}
      />
    ) : null

  const rolLabel = ROL_LABEL[rol]
  const marcaRol = (
    <span className="font-mono text-[10px] uppercase tracking-wider text-faint">
      {rolLabel}
    </span>
  )

  /*
    El orden de esta pantalla es la respuesta a la devolucion de SG del
    21/8/2026: "al ser tan completo el resultado que arroja, lo que
    correspondería en 1° y 2° instancia como que me costó leer los
    datos".

    Lo que la causaba no era que hubiera explicaciones —las elogio— ni
    que primera y segunda estuvieran juntas: era que **entre las dos
    habia ocho importes de herramientas**, que despues venian tres
    secciones dibujadas identicas entre si, y que la cifra de primera
    instancia volvia a aparecer *despues* de la segunda, en la cadena.
    Veintiocho importes en una pantalla, de los que cinco eran la
    respuesta.

    De ahi las tres zonas:

      1. Lo que se vino a buscar: el honorario del profesional que se
         consulta, en primera instancia y en las que se le suman.
      2. El honorario de otro: auxiliares, mediador, partidor.
      3. Como se llego: la escala, la cadena y el caso.

    Nada se elimino. Las herramientas y el camino se pliegan, y plegar
    una herramienta no es ocultar un numero: el numero es el mismo que
    esta arriba, mostrado de otra manera. Es el criterio que ya regia
    para el apoderado y el procurador, que viven detras del selector de
    rol desde siempre.
  */
  return (
    <div className="space-y-8">
      {/* ---------- 1. El honorario que se vino a buscar ---------- */}

      <HonorariosBand
        rango={rango}
        esProvisorio={resultado.esProvisorio}
        cadena={cadena}
      >
        {selectorRol}
      </HonorariosBand>

      {/*
        Subordinada y no par: entra unos centimetros y cuelga de la
        primera. Sigue siendo una seccion propia —quien revisa en
        camara viene a buscar estos tres numeros— pero es el mismo
        sujeto y el mismo cobalto lo dice. Un tono mas debil se comia
        contra el fondo y ademas mentia: sugeria otro sujeto donde hay
        el mismo.
      */}
      {segunda ? (
        <div className="md:ml-14">
          <SegundaInstanciaBand
            valores={segunda}
            rolLabel={rolLabel}
            esProvisorio={resultado.esProvisorio}
          >
            {marcaRol}
          </SegundaInstanciaBand>
        </div>
      ) : null}

      {resultado.actuacionesPosteriores ? (
        <div className="md:ml-14">
          <ActuacionesPosterioresSection
            rango={resultado.actuacionesPosteriores[rol]}
            rolLabel={rolLabel}
            esProvisorio={resultado.esProvisorio}
          >
            {marcaRol}
          </ActuacionesPosterioresSection>
        </div>
      ) : null}

      {/*
        Las herramientas. No son resultados: son el mismo honorario
        partido en fracciones del art. 29 o repartido entre dos. En
        provisorio no hay ninguna —el art. 12 regula en el minimo, sin
        etapas— y la banda ya lo explica.
      */}
      {!resultado.esProvisorio ? (
        <SeccionPlegable etiqueta="Repartir el honorario">
          <RepartoSection
            rango={rango}
            cadena={cadena}
            tipoProceso={resultado.tipoProceso}
          />
        </SeccionPlegable>
      ) : null}

      {/* ---------- 2. El honorario de otro ---------- */}

      {resultado.auxiliares || resultado.partidor ? (
        <CorteDeZona>Honorarios de otros intervinientes</CorteDeZona>
      ) : null}

      {/*
        Auxiliares y mediador van a la par porque comparten de donde
        salen: los dos se calculan sobre la base y no sobre el
        honorario del abogado. `items-start` para que abrir un "por
        que" de uno no estire la columna del otro: son dos sujetos
        distintos y cada uno crece solo.
      */}
      <div className="grid items-start gap-6 lg:grid-cols-2">
        {resultado.auxiliares ? (
          <AuxiliaresSection
            rango={resultado.auxiliares}
            valorUMA={resultado.valorUMA}
            esProvisorio={resultado.esProvisorio}
            aperturaPrueba={caso.aperturaPrueba}
          />
        ) : null}

        {/*
          Se le pasa `baseFinal` —la misma cifra— y no el resultado
          entero, porque mediacion no comparte la unidad: va en UHOM.
        */}
        <MediacionSection baseFinal={resultado.baseFinal} />
      </div>

      {resultado.partidor ? (
        <PartidorSection
          partidor={resultado.partidor}
          esProvisorio={resultado.esProvisorio}
        />
      ) : null}

      {/*
        La prosa es un resultado —la tercera forma de la misma salida,
        con el numero y el informe imprimible— y no una explicacion. Por
        eso va antes del pliegue de la escala y no adentro.

        Y va **despues de las dos zonas, no adentro de ninguna**: el
        texto lleva una linea por profesional, incluidos los peritos y
        el mediador, asi que redacta lo de arriba entero. La linea que
        la precede cierra la zona de los otros intervinientes; sin ella
        la seccion se leia como una mas de esa zona, que es lo que
        Javier vio el 24/8.
      */}
      <div className="border-t border-border pt-8">
        <ProsaSection resultado={resultado} />
      </div>

      {/* ---------- 3. Como se llego a ese numero ---------- */}

      {/*
        Sin corte de zona, y es una regla: **un corte encabeza un grupo,
        no un solo elemento.** La zona 2 lleva el suyo porque agrupa
        auxiliares, mediador y partidor bajo un rotulo comun. Acá hay un
        unico pliegue que ya dice lo que contiene, y el corte repetia esa
        misma frase una linea mas arriba.

        Y el pliegue **no** se llama "cómo se llegó a este número",
        aunque sea lo que hace: `CadenaCalculo` ya se titula asi adentro,
        y el problema era justamente la frase repetida. Se nombra por lo
        que contiene.
      */}
      <SeccionPlegable etiqueta="La escala y la cadena del cálculo">
        <div className="space-y-6">
          <EscalaExplicacion
            escala={escala}
            cadena={cadena}
            valorUMA={resultado.valorUMA}
            alicuota={alicuota}
            ingenuo={ingenuo}
          />

          <CadenaCalculo
            baseOriginal={resultado.baseOriginal}
            baseFinal={resultado.baseFinal}
            valorUMA={resultado.valorUMA}
            escala={escala}
            cadena={cadena}
            rango={rango}
            rolLabel={rolLabel}
            notaRol={ROL_NOTA[rol]}
            alicuota={alicuota}
            esProvisorio={resultado.esProvisorio}
          />
        </div>
      </SeccionPlegable>

      {/*
        El caso deja de colgar de la cadena y pasa al pie, siempre a la
        vista: es **lo que contestaste**, no un fundamento. Queda donde
        ya estaba la firma, que dice con que version se calculo; ahora
        tambien se lee con que datos.
      */}
      {/* Sin borde propio: `ChipsCaso` ya trae el suyo, y dos lineas
          seguidas se leen como un error de maqueta. */}
      <footer>
        <ChipsCaso
          {...caso}
          tipoProceso={resultado.tipoProceso}
          valorUMA={resultado.valorUMA}
          transformaciones={resultado.transformaciones}
        />
      </footer>
    </div>
  )
}
