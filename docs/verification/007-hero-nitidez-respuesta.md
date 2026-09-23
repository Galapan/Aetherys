# 007 — Resultado y límites de verificación

Implementado en HeroScene.tsx, Hero.tsx, hero.ts e index.css:

- Orientación inicial frontal; material y colores previos conservados.
- Springs de seguimiento 420/32/0.6. Simulación con el generador `spring` de la
  versión instalada de Framer Motion: 90% del recorrido en 150ms frente a 535ms
  con los valores anteriores. Es una medición del modelo físico, no de FPS.
- Al salir el cursor o perder foco, el spring termina su recorrido suavemente
  hacia el último objetivo y conserva esa orientación. No hay reset ni frenado
  en pointerleave/blur. Se detiene al ocultarse la pestaña o salir del viewport.
- Objetivo de render de 1080px de alto, DPR máximo 3, antialias, entorno 512,
  curvas 32 y bisel 8. Resolución controlada por el prop DPR del Canvas.
- Tres frases de empresa superpuestas, ES/EN, fila en escritorio/tablet y tres
  líneas en móvil; permanecen accesibles fuera de aria-hidden.

## Checks

Lint, build, Prettier de archivos modificados y diff --check: APROBADOS.
Build conserva aviso de escena diferida superior a 500kB (aprox. 982kB / 267kB gzip).
No se añadieron dependencias.

## Navegador: parcial, no aprobación final

Chromium headless con SwiftShader, viewport 1440×900: orientación inicial [0,0,0],
12.020 triángulos, antialias activo, tres frases y ausencia de overflow/errores
registrados. Captura `007-quality-1440.png`: corresponde a la revisión ANTERIOR
a la corrección final de DPR; no representa la nitidez final.

La primera comprobación de resolución FALLÓ: 480×432 físicos en lugar de
1200×1080. Causa: actualizar setDpr desde dentro de la escena mientras Canvas
conservaba dpr=1. Corregido pasando el valor calculado al prop Canvas.dpr.

NO EJECUTADO tras esa corrección: medición final de resolución, vistas móvil/tablet/
1920, ES/EN en navegador, salida suave y reentrada, menú/teclado, reduced-motion
dinámico, touch, pausa fuera de pantalla y pérdida de WebGL. La nueva ejecución
del navegador fue rechazada por el usuario en la solicitud de permisos; no se
intentó eludir esa decisión. `007-quality-results.json` conserva el fallo previo,
no un resultado posterior a la corrección. Dispositivo físico y FPS: NO EJECUTADO.

La implementación está entregada; aceptación visual completa pendiente.
