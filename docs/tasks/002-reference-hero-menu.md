# 002-A y 002-B / Hero y menú / READY

**Objetivo observable:** hero y menú según ../plans/002-reference-hero-menu.md.

**Dependencias y precondiciones:** implementación001; 002-B depende de contenido y CSS de002-A. Solicitud actual autoriza refinamiento y menú.

**Archivos que se pueden crear/modificar:** 002-A: src/content/hero.ts, src/sections/Hero.tsx, src/index.css. 002-B: src/components/layout/Header.tsx, src/components/layout/LanguageSwitch.tsx, src/App.tsx. Documentación/evidencia de002.

**Archivos que hay que leer:** AGENTS.md ya leído, plan002, archivos anteriores y package.json ya verificado.

**Fuera de alcance:** logo, 3D, otras secciones, dependencias, publicación, contactos ficticios.

**Contrato de datos, exports y props:** HeroContent añade cadenas exactas del plan. LanguageSwitch({content,locale,onChange}): HeroContent,Locale,(locale:Locale)=>void. Header mismas props. Exports nombrados. Hero conserva props; App conserva estado URL/metadatos.

**Copy exacto ES/EN:** tabla del plan002 y diccionario existente.

**Assets exactos y fallback:** N/A; sin imágenes ni símbolos nuevos.

**Layout por breakpoint (dimensiones/espaciado):** plan002. Tokens y tipografía: AGENTS.md §3/6, sin cambios.

**Interacción (evento, estado inicial/final, tiempo, easing):** plan002; GSAP secuencias, CSS hovers; anchors a inicio/servicios/empresa existentes.

**Accesibilidad / reduced-motion / errores / cleanup:** plan002; dialog nativo para focus trap/inert; restaura scroll; cleanup media/timelines. Contenido visible antes de animar. Sin WebGL ni fallbacks de assets: N/A.

**Pasos numerados de implementación:**

1. Completar002-A: diccionario, composición y estilos.
2. Completar002-B: selector compartido y modal accesible.
3. Checks y navegador; registrar evidencia.

**Comandos y verificaciones visuales aplicables:** pnpm lint; pnpm build; prettier --check rutas modificadas; git diff --check. Navegador integrado con viewport y lectura de DOM/logs, interacciones nativas teclado/click.

**Criterios de aceptación binarios:** composición del plan; menú funcional en todos los tamaños; enlaces reales; foco y Escape; scroll restaurado; ES/EN conserva URL; reduced motion dinámico; sin overflow; checks pasan.

**Condiciones de bloqueo:** conflictos/datos de producto necesarios fuera del alcance; una comprobación no disponible se registra NO EJECUTADO.

**Entrega:** pendiente; evidencia en ../verification/002-reference-hero-menu.md.
