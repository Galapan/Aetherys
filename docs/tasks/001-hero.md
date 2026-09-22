# 001 / Hero sin escena / IN_PROGRESS

**Objetivo observable:** sustituir Vite por la portada responsive ES/EN especificada en ../plans/001-hero.md.

**Dependencias y precondiciones:** tecnologías instaladas; Git limpio al iniciar; alcance actual solo hero, sin 3D.

**Archivos que se pueden crear/modificar:** src/App.tsx, src/sections/Hero.tsx, src/content/hero.ts, src/index.css, src/App.css (eliminar), index.html, .prettierrc.json y documentación de esta entrega.

**Archivos que hay que leer:** AGENTS.md, plan 001, package.json, src/main.tsx y los archivos sustituidos.

**Fuera de alcance:** otras secciones, escena/logo, dependencias, backend, publicación, commits, SEO prerenderizado.

**Contrato de datos, exports y props:** content/hero.ts exporta Locale = 'es' | 'en', HeroContent y content: Record<Locale, HeroContent>. Hero exporta función nombrada Hero({ content }: { content: HeroContent }). App mantiene export default, idioma local y sincronización popstate.

**Copy exacto ES/EN:** AGENTS.md §7 y tabla del plan 001; sin otras cadenas visibles.

**Assets exactos y fallback:** N/A; nombre textual, sin símbolo provisional ni imágenes.

**Layout por breakpoint:** plan 001 y AGENTS.md §6; desktop título6/descripción6, mobile/tablet apilado; controles >=44px; cabecera 80px.

**Tokens y tipografía:** AGENTS.md §3 y §6. CSS único en index.css, sin colores fuera de paleta.

**Interacción:** selector cambia URL mediante pushState y actualiza contenido/lang/title/meta; navegación atrás/adelante restaura idioma. Animación GSAP 24→0px, opacity 0→1, 0.7s, power2.out, stagger 0.1s. CTA oculto hasta destino real.

**Accesibilidad / reduced-motion / errores / cleanup:** botones nativos con aria-pressed y etiquetas traducidas; foco 2px/4px; skip link a main; contenido visible antes de efecto; gsap.matchMedia y revert al desmontar/cambiar preferencia; listener popstate eliminado. Sin canvas/scroll custom/menú modal: N/A.

**Pasos numerados de implementación:**

1. Crear diccionario y sustituir tokens/estilos de plantilla.
2. Crear Hero y componer cabecera mínima/idioma en App.
3. Limpiar HTML inicial y fijar formato.
4. Ejecutar checks y verificación visual, documentar evidencia.

**Comandos y verificaciones visuales aplicables:** plan 001, sección Verificación.

**Criterios de aceptación binarios:** solo portada; copy exacto; cambios de idioma mantienen query/hash; sin dependencias nuevas; sin enlaces inexistentes; dimensiones prescritas; teclado y reduced motion funcionales; lint/build/formato/diff pasan; capturas sin overflow ni solapamientos.

**Condiciones de bloqueo:** fallos reproducibles fuera de alcance; imposibilidad de verificación se registra como NO EJECUTADO, no como aprobado. Logo y contacto no bloquean esta entrega sin ellos; siguen pendientes para publicación.

**Entrega:** implementación terminada; evidencia en ../verification/001-hero.md. Estado IN_PROGRESS únicamente por revalidación pendiente del favicon y activación del selector por teclado: el usuario denegó la ejecución adicional de Chromium. Lint, build y formato pasan; seis capturas revisadas. No se marca DONE con comprobaciones pendientes.
