# Cómo contribuir

Gracias por mirar el código. Antes de abrir un pull request, dos cosas.

## 1. La licencia

Honorio se distribuye bajo **AGPL-3.0-or-later**. Las calculadoras con las
que convivía en su repositorio de origen quedaron allá, bajo MIT; el motivo
de la diferencia está en el [README](README.md#por-qué-acá-sí-y-en-el-resto-no).

Además, **su autor se reserva la posibilidad de licenciarlo también bajo
otros términos** a quien lo necesite (por ejemplo, una empresa que quiera
integrarlo sin las obligaciones de la AGPL). Eso solo es posible si conserva
los derechos sobre todo el código, incluido el que aporten terceros.

Por eso, al abrir un PR sobre Honorio, incluí esta línea en la descripción:

```
Acepto los términos de CONTRIBUTING.md para este aporte.
```

Con eso declarás dos cosas:

**a) Que el aporte es tuyo.** Que lo escribiste vos, o que tenés derecho a
entregarlo, y que no estás copiando código de un tercero con otra licencia.
Es el sentido del [Developer Certificate of Origin](https://developercertificate.org/),
que también podés dejar asentado firmando tus commits con `git commit -s`.

**b) Que autorizás a licenciarlo bajo otros términos.** Que le otorgás a
L. Javier Cúneo Libarona una licencia perpetua, mundial, irrevocable y sin
cargo para usar, modificar y sublicenciar tu aporte, incluido el derecho de
distribuirlo bajo licencias distintas de la AGPL. **Conservás la autoría y
todos tus derechos**: no cedés el copyright, no perdés la posibilidad de usar
tu propio código donde quieras. Es un permiso, no una entrega.

Sin (b), un solo PR aceptado dejaría al proyecto sin la opción de licenciar
comercialmente, porque haría falta el permiso de cada persona que alguna vez
tocó una línea. Con (b), la app sigue gratis y abierta y la puerta queda
abierta.

Si el punto (b) no te cierra —es una objeción legítima y hay gente que no
firma CLAs por principio—, escribinos igual: se puede resolver de otra
manera, por ejemplo describiendo el cambio en un issue para que se
implemente de cero.

---

## Antes de abrir el PR

Si tocaste algo de `lib/legal/`, **las validaciones del motor tienen que
quedar todas en verde**. No son opcionales: son lo que impide que un cambio
de interfaz mueva un número.

```bash
npm run check
```

CI corre lo mismo en tu pull request, así que si falla lo vas a ver igual;
correrlo antes te ahorra la vuelta. Y para el resto, `npm run build`.

## Si tu aporte cambia un número

Decilo en el PR, con el caso concreto: qué entrada, qué daba antes, qué da
ahora y qué artículo o criterio lo justifica. Un cálculo de honorarios puede
terminar fundando una resolución judicial, así que un cambio de resultado se
documenta en el [CHANGELOG](CHANGELOG.md) aunque el código sea de una
línea.

## Ideas, dudas y errores

Un issue alcanza. Si encontraste un cálculo mal, lo más útil es el caso
completo: tipo de proceso, modo de terminación, base y el número que
esperabas.
