# 003 / Hero y transiciones de la grabación / IN_PROGRESS

**Objetivo observable:** entrada por columnas y menú animado según ../plans/003-recording-hero.md.
**Dependencias y precondiciones:** base 002 presente; grabación inspeccionada; petición explícita de implementación.
**Archivos que se pueden crear/modificar:** src/sections/Hero.tsx, src/components/layout/Header.tsx, src/index.css; documentos 003.
**Archivos que hay que leer:** AGENTS.md, plan003, archivos anteriores, src/content/hero.ts y package.json.
**Fuera de alcance:** 3D, contacto, otras secciones, instalaciones, publicación, commits.
**Contrato de datos, exports y props:** mantener Hero({content}: {content:HeroContent}) y Header(NavigationProps), exports nombrados. Refs locales para timelines; sin estado por frame.
**Copy exacto ES/EN:** conservar íntegro src/content/hero.ts; entrada utiliza content.brand (Aetherys en ambos).
**Assets exactos y fallback:** N/A; solo paneles CSS decorativos. Sin animación: contenido inmediato y completo.
**Layout por breakpoint (dimensiones/espaciado):** plan003 y composición002 conservada.
**Tokens y tipografía:** AGENTS.md §3/6 sin cambios.
**Interacción (evento, estado inicial/final, tiempo, easing):** plan003.
**Accesibilidad / reduced-motion / errores / cleanup:** plan003; mantener dialog nativo, Escape/foco, reversión GSAP y restauración de scroll.
**Pasos numerados de implementación:**

1. Crear cortina decorativa y secuencia hero.
2. Adaptar apertura/cierre y máscaras de filas del menú.
3. Verificar y registrar evidencia.
   **Comandos y verificaciones visuales aplicables:** plan003.
   **Criterios de aceptación binarios:** cortina termina y revela todo; no se repite con idioma; menú abre/cierra con foco correcto incluso al interrumpirse; reduced-motion sin movimiento; sin contacto/3D; sin overflow; checks pasan.
   **Condiciones de bloqueo:** decisiones ajenas al alcance o comprobaciones no disponibles se documentan.
   **Entrega:** pendiente en ../verification/003-recording-hero.md.
