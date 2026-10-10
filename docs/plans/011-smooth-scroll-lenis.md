# 011 — Scroll suave con Lenis

## Decisión

Usar Lenis 1.3 como capa de scroll para suavizar la rueda y la navegación entre anclas de la misma página. La portada es editorial y extensa, con escenas sticky y progresos ligados al scroll; el suavizado busca hacer esa navegación más continua y coherente con la referencia visual.

Framer Motion continúa como único motor de animación de UI. GSAP no aporta una mejora de UX concreta frente a las animaciones actuales con Framer Motion y se elimina como dependencia.

## Contrato de implementación

- Instancia global mediante `ReactLenis root` en `src/main.tsx`; no crea wrappers DOM.
- `lerp: 0.1`, `autoRaf: true`, `syncTouch: false` y `respectReducedMotion: true`.
- `SmoothScroll` intercepta solo anclas del mismo documento que no hayan sido gestionadas por otro controlador. El skip link permanece nativo e inmediato; los enlaces del diálogo de navegación conservan su cierre animado y delegan el scroll a `useMenuScene`.
- `lenis.scrollTo(element)` respeta el `scroll-margin` CSS del destino; no fijar un offset duplicado en JavaScript.
- Menú y showreel paran Lenis al abrir y lo reanudan al cerrar. La posición previa al menú se restaura inmediatamente; el destino elegido se alcanza con el scroll de Lenis.
- `prefers-reduced-motion` desactiva el suavizado de rueda y hace inmediata la navegación programática. El scroll táctil sigue siendo nativo.

## Criterios de no regresión

- Mantener intactos los estilos y el comportamiento de `position: sticky`, el escenario del hero, la superposición de proyectos y el proceso fijado.
- Los valores de `useScroll`, los listeners nativos de scroll y la marquesina de Expertise siguen sincronizados con el scroll real de la ventana.
- Abrir el menú o showreel bloquea la página; al cerrar no hay salto ni deriva de scroll.
- El usuario puede interrumpir la navegación suave y las anclas conservan la alineación definida por CSS.
- Verificar visualmente con rueda, touch, teclado y `prefers-reduced-motion` emulado antes de publicar.
