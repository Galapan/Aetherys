# 007 — Nitidez, orientación y texto del hero

Solicitud explícita: implementar los ajustes según el video local
`/home/galapan/Videos/screenrecording-2026-09-22_22-43-18.mp4`.
Prevalece sobre el reparto de modelos de AGENTS.md §11 y sustituye el límite DPR
de §9 para esta escena. Conservar los ajustes de material e iluminación ya presentes.

El video muestra giro ágil alrededor de una posición frontal y tres etiquetas
inmóviles superpuestas en el centro del símbolo. No copiar su contenido ni assets.

- Resolución: objetivo de 1080 píxeles físicos de alto para el lienzo del símbolo,
  DPR `clamp(1080 / height, 1, 3)` actualizado al redimensionar mediante el prop de
  Canvas. Mantener la relación de aspecto del lienzo (la altura está limitada por
  48svh); el objetivo es 1080px de alto, no un video 1920×1080. En tamaños pequeños el
  límite 3 reduce el coste. Antialias explícito; entorno de 256 a 512; curvas 32 y
  bisel 8 segmentos. Mantener el render bajo demanda y fallback.
- Orientación base `[0,0,0]`. Springs Motion stiffness 420, damping 32, mass 0.6.
  Giro máximo X ±0.28 rad, Y ±0.5 rad. Coordenadas centradas en el lienzo,
  normalizadas a la mitad del hero. Según aclaración posterior del propietario,
  seguir el cursor en toda la página. Al salir el cursor o perder foco, dejar
  que los springs terminen suavemente hacia el último objetivo; conservar esa
  orientación, sin volver al frente. Esta desaceleración sustituye el frenado
  instantáneo por petición posterior del propietario. Congelar solo al ocultarse
  la pestaña o salir del viewport para pausar trabajo invisible. Retomar desde
  la orientación conservada con el siguiente movimiento.
  Solo el montaje y la activación de reduced-motion/touch restablecen el frente.
- Tres frases ES: `Software a medida`, `Integración de IA`, `Acompañamiento cercano`.
  EN: `Custom software`, `AI integration`, `Guidance at every step`.
  Campo `HeroContent.highlights: [string, string, string]`.
- Texto HTML semántico sobre el centro del logo, fuera de aria-hidden. Blanco cálido,
  12px/1.4, peso 500, mayúsculas, tracking .04em y sombra grafito para lectura.
  Escritorio/tablet: fila con separadores centrales. Móvil: tres filas con gap 8px.
  No intercepta puntero; no se mueve con el logo. Entrada existente a 4.1s, 0.8s;
  sin animación con reduced-motion. Mantener título y resto del layout.
- Cuatro archivos de aplicación: HeroScene.tsx, Hero.tsx, hero.ts e index.css.
  No dependencias nuevas ni publicación.
- Verificación: lint, build, prettier, diff; navegador 390×844, 768×1024, 1440×900
  y 1920×1080; ES/EN, resolución del canvas, respuesta y reposo frontal, menú,
  reduced-motion dinámico, touch, fallo WebGL, pausa de renders. Playwright disponible
  en el runtime local para comprobaciones de comportamiento, sin instalar framework.
