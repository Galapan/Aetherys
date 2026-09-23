# 009 — Cambio de idioma y hover de navegación

Fuente: video local del propietario
`/home/galapan/Videos/screenrecording-2026-09-22_23-02-52.mp4`.
Alcance actualizado: implementar cambio de idioma y hovers de secciones del menú;
proyectos pendientes porque no hay casos. La solicitud explícita de implementación
prevalece sobre AGENTS.md §11 y sustituye el hover horizontal de §8 para las filas.

## Lectura del video

En torno a 7.6–10s y 26–29s, columnas oscuras suben de izquierda a derecha hasta
cubrir el menú. La portada traducida aparece al retirarse las columnas hacia arriba;
el menú queda cerrado. No se repite la entrada del nombre de marca.

Entre 14–18s, las secciones muestran un recambio vertical del texto dentro de una
ventana de recorte y el texto activo toma el color de acento. La fila no cambia de
posición. Entre 18–24s, las etiquetas de proyectos mantienen su fondo y se aprecia
un movimiento breve del rótulo; el cursor tapa parte del detalle. No se deduce
con precisión su easing ni un desfase por letra. No implementar estos proyectos.

## Contrato implementado

- `LanguageTransition.tsx`: diálogo temporal sobre el menú, ocho columnas en
  tablet/escritorio y cuatro en móvil, fijadas al comenzar para soportar resize.
  Grafito; Motion, subida 101%→0% en 0.55s, desfase 0.055s por columna; retirada
  0%→−101% en 0.65s con el mismo desfase. Easing [0.76,0,0.24,1]. Sin espera artificial.
- Cambiar idioma y cerrar el menú solo bajo cobertura completa; restaurar la
  superficie inmediatamente bajo esa cobertura. Mantener Hero montado.
- Click en idioma activo: sin acción. Modal temporal evita interacciones duplicadas.
  Al terminar, devolver foco a Menú. Reduced-motion dinámico: completar sin barrido.
  Cancelar controles al desmontar; si falla la animación, aplicar idioma y liberar UI.
  URL, hash, parámetros y traducciones usan la lógica existente de App.
- Hover de filas: sustituir x=8 por texto doble en recorte de 1.1em. La primera
  copia hereda grafito; la segunda usa borgoña y aria-hidden. Desplazamiento interior
  0→−50%, 0.4s, easing [0.22,1,0.36,1]; invertir al salir. Sin animación CSS.
- Solo puntero fino con hover y sin reduced-motion. Reduced-motion cancela el
  desplazamiento inmediatamente. Mantener foco visible y contenido táctil estático.
- Sin copy nuevo, assets, dependencias ni cambios de proyectos. Paleta y tamaños
  de filas existentes; el recorte interior usa la misma altura de línea.

Archivos: `src/components/layout/LanguageTransition.tsx`,
`src/components/layout/Navbar.tsx`, `src/index.css`.

Verificaciones locales: lint, build, prettier y diff. Aceptación visual pendiente:
390×844, 768×1024, 1440×900; ES↔EN, idioma activo, cierre y foco, teclado,
reduced-motion dinámico, resize y reentrada rápida del puntero. No instalar tests.
