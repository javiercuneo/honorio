'use client'

// ---------------------------------------------------------------
// La ilustración de marca: un abogado que hace mal los números.
//
// Una sola pieza para los dos temas. `honorio-marca.svg` traza la
// tinta del dibujo y deja el papel transparente, así que se pinta con
// el color de texto y el fondo lo pone la página: en claro queda tinta
// negra sobre el fondo claro, en oscuro tinta clara sobre el oscuro,
// sin recuadro de papel que no pertenece a ninguno de los dos.
//
// Va por `mask-image` y no por `<img>` porque una imagen externa no
// hereda `currentColor`. La máscara usa el canal alfa: el `fill` del
// archivo es indiferente, y por eso no hay que mantener sincronizadas
// dos variantes de color.
//
// El logotipo de la app no vive acá: es la palabra "Honorio" compuesta
// en `font-meter`, en la portada y en la topbar. La ilustración
// acompaña, no rotula.
// ---------------------------------------------------------------

import { cn } from '@/lib/utils'
import { withBasePath } from '@/lib/basePath'

/** Proporción del trazado original: 295 × 300. */
export function Ilustracion({ className }: { className?: string }) {
  const url = `url("${withBasePath('/honorio-marca.svg')}")`
  return (
    <span
      role="presentation"
      className={cn('block aspect-[295/300] bg-current', className)}
      style={{
        maskImage: url,
        WebkitMaskImage: url,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
    />
  )
}
