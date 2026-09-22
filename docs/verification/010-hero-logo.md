# Logo 3D en el hero

Solicitud: reconstruir con volumen el símbolo de la imagen aportada. Se integra el trazado en `src/content/hero.ts` y la escena diferida en `src/features/hero/`. La reconstrucción desde raster es aproximada; el SVG original permitiría precisión final.

Extrusión de 13 unidades sobre un trazado de 193 unidades de ancho, bisel de 1 unidad, grafito metálico con luces/reflejos blanco cálido y borgoña. Sin recursos remotos. Canvas bajo demanda, DPR máximo 1.5, sin bucle ambiental. Entrada mediante Framer Motion; reduced-motion conserva la escena estática. Fallback SVG ante carga pendiente, error o pérdida de contexto.

Se conserva el ajuste anterior de ancho completo del header/hero, con margen de 20–32px; medido en escritorio: 26.64px a 1440px.

Verificado en navegador a 1440×900, 390×844 y 768×1024: canvas presente, sin overflow horizontal; capturas 010-logo-*.png. Menú abre, Escape cierra y devuelve el foco. Se produjo un error transitorio de hooks durante la recompilación de dependencias de Vite; tras recarga la escena renderiza y no aparecen errores posteriores en el registro consultado.

Lint, build y diff --check: aprobados. Prettier aplicado a los archivos modificados. Build avisa del tamaño de la escena diferida: 976.47 kB, 264.83 kB gzip, incluye Three/R3F/Drei. No se añadieron dependencias.

NO EJECUTADO: fallo forzado de WebGL, dispositivo táctil físico, medición Lighthouse y cambio dinámico de reduced-motion. Fallback implementado pero no forzado en esta revisión.
