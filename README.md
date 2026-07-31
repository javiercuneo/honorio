# Honorio

Asistente para la regulación de honorarios de la **Ley 27.423**.

Hace una entrevista corta sobre el expediente y devuelve el honorario, con
cada paso del cálculo a la vista: la base, las reducciones que se aplicaron,
la escala del art. 21, el ajuste por rol y la segunda instancia.

**No es una caja negra a propósito.** La ley es ambigua en varios puntos y la
jurisprudencia está dispersa; donde la app adopta un criterio interpretativo,
lo declara junto al número, detrás de un «por qué». Quien no quiere leerlo,
no lo lee; quien tiene que fundar una regulación, lo tiene ahí.

---

## Qué hace

- Honorarios de **primera y segunda instancia** para patrocinante, apoderado,
  procurador y auxiliares de la Justicia.
- Procesos de **conocimiento, ejecución de sentencia, ejecutivo, sucesión,
  medida cautelar, homologación de convenios de desocupación, exhorto e
  incidente**.
- Reducciones de los arts. 22, 25, 34, 35, 37, 38, 40, 41 y 49, con la
  transformación que aplicó cada una.
- **Regulaciones provisorias** del art. 12: se muestra solo el mínimo.
- **Reparto por etapas** y por porcentaje entre profesionales.
- **Mínimos arancelarios** (arts. 19, 31, 44, 48, 58, 60 y 61 bis) como tabla
  de referencia buscable.
- Toma el valor de la **UMA** vigente y convierte todo a pesos.

## Qué no hace

Está declarado también dentro de la app, en la pantalla de inicio.

- No aplica los mínimos automáticamente. Si el cálculo queda por debajo de un
  mínimo que corresponde, hay que desestimar el resultado. Por eso la tabla
  de mínimos está a un clic.
- No contempla prorrateo (art. 730 CCyCN), reajuste de precio (art. 1255
  CCyCN), ejecución hipotecaria especial (art. 60 Ley 24.441) ni régimen de
  vivienda (art. 254 CCyCN).
- No está pensada para fuero penal.
- No reemplaza el criterio del juez. Es una herramienta de referencia.

---

## Cómo se usa

Está publicada como sitio estático, sin backend ni base de datos: nada de lo
que se escribe sale del navegador.

```
https://javiercuneo.github.io/Herramientas-Judiciales-IA/honorio/
```

## Cómo se corre localmente

Todos los comandos van desde `honorio/`, no desde la raíz del repositorio.

```bash
npm install && npm run dev
```

Para el sitio estático:

```bash
npm run build
```

---

## Cómo está armado

Next.js (App Router, export estático), TypeScript y Tailwind. Cuatro capas,
con una regla que las ordena: **las reglas jurídicas viven en una sola de
ellas**.

| Capa | Dónde | Qué puede hacer |
|---|---|---|
| Motor | `lib/legal/` | Toda la aritmética y todas las reglas de la ley. No conoce React, DOM ni HTML. |
| Schema | `lib/wizard/` | Qué se pregunta, en qué orden y bajo qué condición. Datos puros. |
| Orquestación | `hooks/useWizard.ts` | Navegación, validación y estado. Ninguna regla jurídica. |
| Presentación | `components/` | Solo renderiza. Ninguna regla jurídica. |

El punto de entrada del motor es uno solo:

```ts
import { buildCalculationResult } from '@/lib/legal/calculate'

const resultado = buildCalculationResult(estado) // CalculoResultado
```

`buildCalculationResult` es una función pura: mismo estado, mismo resultado,
sin efectos. Devuelve el cálculo **y** la lista de transformaciones que lo
produjeron, que es lo que la interfaz muestra como cadena. Eso también es lo
que haría posible consumirlo desde otro lado sin la interfaz — ver
[ROADMAP](docs/ROADMAP.md).

Detalle de capas y contratos: [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md).
Decisiones de diseño vigentes y lo que está en curso:
[../docs/ESTADO.md](../docs/ESTADO.md).

---

## Cómo se verifica un cambio en el motor

El motor tiene validaciones que comparan su salida contra una implementación
de referencia, caso por caso. **Todas tienen que quedar en verde antes de
tocar nada más.**

```bash
for f in lib/legal/__tests__/*.validation.ts; do npx tsx "$f"; done
```

Y, para el resto:

```bash
npx tsc --noEmit && npm run build
```

---

## Autor

Javier Cúneo Libarona.

Los criterios interpretativos que aplica el motor no salieron de la lectura
de la ley: salieron de resolver estos cálculos. Esa parte es el trabajo, no
el código que la ejecuta.

## Licencia

Copyright © 2026 L. Javier Cúneo Libarona.

Honorio se distribuye bajo la **GNU Affero General Public License, versión 3
o posterior** ([LICENSE](LICENSE)). El resto del repositorio sigue bajo
licencia MIT; esta carpeta es la excepción, y la excepción es deliberada.

Podés usarla, copiarla, estudiarla y modificarla libremente. Lo que la AGPL
agrega sobre la MIT es una condición: **si la modificás y la ofrecés a
terceros —distribuida o como servicio en red—, tenés que publicar tu versión
bajo la misma licencia.** No prohíbe el uso comercial; impide que el trabajo
vuelva cerrado.

La app es y va a seguir siendo gratuita. Si alguien necesita integrarla en un
producto propio bajo términos distintos a los de la AGPL, se puede conversar:
escribime.

### Por qué acá sí y en el resto no

Las calculadoras de plazos son aritmética sobre reglas explícitas: cualquiera
las reescribe en una tarde y no hay motivo para ponerles condiciones.

Lo que hay en `lib/legal/` no es eso. Es el criterio para resolver los puntos
donde la ley es ambigua, la jurisprudencia está dispersa y hay que decidir:
años de regular honorarios, de sostener la coherencia entre casos y de
corregir contra resultados reales. Esa parte se comparte con gusto y no se
regala para que otro la cierre.
