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
https://honorio.ar
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

El motor tiene 11 suites de validación que comparan su salida contra una
implementación de referencia, caso por caso. **Todas tienen que quedar en verde
antes de tocar nada más.**

```bash
npm run check
```

Eso corre los tipos y las validaciones, y es exactamente lo que ejecuta CI en
cada push y cada pull request. Si alguna falla, no se publica.

Por separado: `npm run typecheck`, `npm run validate`, `npm run build`.

---

## Autor

Luis Javier Cúneo Libarona.

Los criterios interpretativos que aplica el motor no salieron de la lectura
de la ley: salieron de resolver estos cálculos. Esa parte es el trabajo, no
el código que la ejecuta.

## Licencia

**Copyright © 2026 Luis Javier Cúneo Libarona. Todos los derechos reservados.**

El código está publicado para que se pueda **auditar**: cualquiera puede
leerlo y verificar cómo se obtiene cada número. Un cálculo que puede fundar
una resolución judicial no tiene que ser una caja negra.

Publicarlo no es licenciarlo. Sin autorización previa y por escrito no se
permite usar, copiar, modificar, distribuir ni publicar este código ni obras
derivadas de él, tampoco en una red interna. El texto completo está en
[LICENSE](LICENSE).

**Usar la calculadora en [honorio.ar](https://honorio.ar) es libre y gratuito.**
La reserva alcanza al código, no al uso del sitio.

Si querés usar el código para algo concreto, escribime a
javier@javiercuneo.com.ar contando para qué. Las autorizaciones se dan caso
por caso.
