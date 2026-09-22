# 005 / Navbar independiente basado en portafolio / DONE

**Objetivo observable:** componente Navbar que reproduce compactación, cabecera y secuencia del portafolio según plan005.
**Dependencias y precondiciones:** vídeos inspeccionados; Framer Motion instalado por petición expresa; estado anterior preservado.
**Archivos que se pueden crear/modificar:** src/components/layout/Navbar.tsx (sustituye Header.tsx), src/App.tsx, src/sections/Hero.tsx, src/index.css; documentación005.
**Archivos que hay que leer:** plan005, fuentes anteriores, package.json, AGENTS.md ya leído.
**Fuera de alcance:** otras secciones,3D,contacto,proyectos ficticios,publicación.
**Contrato de datos, exports y props:** Navbar extiende NavigationProps con children:ReactNode y reducedMotion:boolean; export nombrado Navbar. Hero elimina skipEntrance. App solo idioma/preferencias/composición. Snapshot interno; sin datos ficticios.
**Copy exacto ES/EN:** sectionsLabel Secciones/Sections; projectsLabel Proyectos/Projects; conservar demás cadenas.
**Assets exactos y fallback:** N/A; contenido visible sin animación, sin assets nuevos.
**Layout por breakpoint (dimensiones/espaciado):** plan005.
**Tokens y tipografía:** plan005 y AGENTS.md §3/6.
**Interacción (evento, estado inicial/final, tiempo, easing):** plan005.
**Accesibilidad / reduced-motion / errores / cleanup:** plan005; listeners desmontados, modal nativo, foco contenido y restaurado; cancelación de entrada por interacción.
**Pasos numerados de implementación:**

1. Preferencias y estado compartido, copy.
2. Superficie/navbar reducido y transiciones Motion.
3. Entrada/título y hovers Motion.
4. Checks y evidencia.
   **Comandos y verificaciones visuales aplicables:** plan005.
   **Criterios de aceptación binarios:** Navbar independiente y sin estado de menú en App; viewport congelado con margen uniforme; cabecera móvil y etiqueta fundida; filas secuenciales; scroll/foco/URL restaurados; intro004 conservada; checks pasan.
   **Condiciones de bloqueo:** herramienta no soporta prueba requerida: registrar NO EJECUTADO; errores fuera alcance escalar con evidencia.
   **Entrega:** Navbar independiente implementado; checks y límites documentados en ../verification/005-navbar-portfolio.md. Sin publicación ni cambios al proyecto de referencia.
