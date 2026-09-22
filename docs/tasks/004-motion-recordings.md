# 004 / Hero y navbar en Framer Motion / IN_PROGRESS

**Objetivo observable:** secuencias y menú reducido del plan004.
**Dependencias y precondiciones:** vídeos inspeccionados; Framer Motion instalado por petición expresa; estado anterior preservado.
**Archivos que se pueden crear/modificar:** src/hooks/useMotionPreferences.ts, src/content/hero.ts, src/App.tsx, src/components/layout/Header.tsx, src/components/layout/LanguageSwitch.tsx, src/sections/Hero.tsx, src/index.css; documentación004; AGENTS.md solo para registrar preferencia nueva de Motion.
**Archivos que hay que leer:** plan004, fuentes anteriores, package.json, AGENTS.md ya leído.
**Fuera de alcance:** otras secciones,3D,contacto,proyectos ficticios,publicación.
**Contrato de datos, exports y props:** useMotionPreferences():{reducedMotion:boolean,canHover:boolean}; Header extiende NavigationProps con onMenuChange,reducedMotion,canHover; Hero recibe content,reducedMotion,canHover,skipEntrance; LanguageSwitch añade canHover opcional. Diccionarios añaden sectionsLabel/projectsLabel.
**Copy exacto ES/EN:** sectionsLabel Secciones/Sections; projectsLabel Proyectos/Projects; conservar demás cadenas.
**Assets exactos y fallback:** N/A; contenido visible sin animación, sin assets nuevos.
**Layout por breakpoint (dimensiones/espaciado):** plan004.
**Tokens y tipografía:** plan004 y AGENTS.md §3/6.
**Interacción (evento, estado inicial/final, tiempo, easing):** plan004.
**Accesibilidad / reduced-motion / errores / cleanup:** plan004; listeners desmontados, modal nativo, foco contenido y restaurado; cancelación de entrada por interacción.
**Pasos numerados de implementación:**

1. Preferencias y estado compartido, copy.
2. Superficie/navbar reducido y transiciones Motion.
3. Entrada/título y hovers Motion.
4. Checks y evidencia.
   **Comandos y verificaciones visuales aplicables:** plan004.
   **Criterios de aceptación binarios:** sin GSAP/animaciones CSS en UI; menú compacto con fundido, texto secuencial y espacio proyectos; intro pausada con título; sin enlaces falsos; URL/idioma/foco/scroll correctos; checks pasan.
   **Condiciones de bloqueo:** herramienta no soporta prueba requerida: registrar NO EJECUTADO; errores fuera alcance escalar con evidencia.
   **Entrega:** pendiente en ../verification/004-motion-recordings.md.
