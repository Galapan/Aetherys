# 007 / Hero nítido, frontal y responsivo / BLOCKED

Objetivo observable: logo frontal al inicio, giro ágil, conserva la orientación al salir el cursor, render de mayor definición
y tres frases de empresa delante del símbolo.

Dependencias y precondiciones: escena y material actuales; solicitud explícita de implementación.

Archivos que se pueden crear/modificar: `src/features/hero/HeroScene.tsx`,
`src/sections/Hero.tsx`, `src/content/hero.ts`, `src/index.css`; evidencia en
`docs/verification/007-hero-nitidez-respuesta.md` y capturas asociadas.

Archivos que hay que leer: los anteriores, AGENTS.md, HeroMark.tsx,
useMotionPreferences.ts, `docs/plans/007-hero-nitidez-respuesta.md`.

Fuera de alcance: material/colorimetría, navegación, dependencias, publicación.

Contrato de datos, exports y props: `HeroContent.highlights` tupla de tres strings;
resto de APIs sin cambios.

Copy exacto ES/EN: las seis cadenas del plan 007.

Assets exactos y fallback: `heroMark.path` y `heroMark.fallback`, sin cambios.

Layout por breakpoint (dimensiones/espaciado): centro de la escena, fila ≥768px,
tres filas <768px, gap 8px móvil / 12px tablet y escritorio. Dimensiones actuales.

Tokens y tipografía: plan 007; sin colores nuevos.

Interacción (evento, estado inicial/final, tiempo, easing): plan 007, springs físicos
y entrada de Motion; no animaciones CSS.

Accesibilidad / reduced-motion / errores / cleanup: texto HTML accesible; puntero
atraviesa etiquetas; logo estático con touch/reduced-motion; fallback por pérdida
de contexto; limpiar listeners, suscripciones y observadores.

Pasos numerados de implementación:

1. Actualizar resolución, geometría, orientación y springs.
2. Añadir diccionario y etiquetas superpuestas responsive.
3. Ejecutar checks y pruebas de navegador descritas en el plan; registrar evidencia.

Comandos y verificaciones visuales aplicables: AGENTS.md §13 y plan 007.

Criterios de aceptación binarios: checks pasan; lienzo alcanza 1080px alto cuando
el límite DPR lo permite; orientación base cero; reacción medida más rápida que
spring anterior; tres frases accesibles en ES/EN; sin overflow ni errores de consola;
menú, reduced-motion y fallback conservados.

Condiciones de bloqueo: fallo reproducible fuera de alcance o herramienta de
verificación indispensable inaccesible tras intentos permitidos.

Entrega: implementación terminada en los cuatro archivos autorizados. Checks
locales aprobados; evidencia en `docs/verification/007-hero-nitidez-respuesta.md`.
Bloqueo de aceptación visual: se denegó la nueva ejecución de navegador tras
corregir la resolución. No marcar DONE sin completar esas verificaciones.
La última aclaración de movimiento permite terminar suavemente el spring al
salir el cursor; no frenar de golpe ni volver al frente.
