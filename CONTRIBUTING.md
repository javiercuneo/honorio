# Cómo contribuir

Gracias por mirar el código. Antes de abrir un pull request, dos cosas.

## 1. La licencia

Honorio es **código publicado para auditoría, con todos los derechos
reservados** ([LICENSE](LICENSE)). Un aporte sólo puede entrar si su autor
le otorga al titular los derechos para incorporarlo bajo esos términos.

Por eso, al abrir un PR, incluí esta línea en la descripción:

```
Acepto los términos de CONTRIBUTING.md para este aporte.
```

Con eso declarás dos cosas:

**a) Que el aporte es tuyo.** Que lo escribiste vos, o que tenés derecho a
entregarlo, y que no estás copiando código de un tercero con otra licencia.
Es el sentido del [Developer Certificate of Origin](https://developercertificate.org/),
que también podés dejar asentado firmando tus commits con `git commit -s`.

**b) Que autorizás a incorporarlo.** Que le otorgás a Luis Javier Cúneo
Libarona una licencia perpetua, mundial, irrevocable y sin cargo para usar,
modificar, sublicenciar y distribuir tu aporte bajo los términos que elija.
**Conservás la autoría**: no cedés el copyright ni perdés la posibilidad de
usar tu propio código donde quieras. Es un permiso, no una entrega.

Si el punto (b) no te cierra, un issue que describa el cambio alcanza: se
implementa de cero.

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
