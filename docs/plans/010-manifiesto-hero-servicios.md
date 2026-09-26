# 010 — Sección /MANIFIESTO entre Hero y Servicios

Estado: DRAFT (copy pendiente de aprobación final del propietario).

Sustituye la suposición "no hay sección de manifiesto" implícita en AGENTS.md §7/§12 (la ruta solo lista Servicios, Proceso, Empresa). Reutiliza la escena 3D del hero; no añade segundo Canvas ni librería de scroll. Framer Motion sigue siendo el motor de UI (§8).

## Objetivo observable

- Nueva sección `/MANIFIESTO` montada entre `<Hero />` y la futura sección de Servicios, con etiqueta editorial `/MANIFIESTO`, una frase estratégica y un bloque `/SHOWREEL` reservado y vacío.
- Mientras el usuario hace scroll dentro de la sección de manifiesto, el logo 3D del hero permanece visible y centrado en el viewport; el texto del manifiesto pasa por encima.
- Cuando el usuario abandona la sección, el logo 3D sale del flujo y la siguiente sección continúa normalmente.
- ES/EN: todos los textos cambian al alternar idioma y `document.documentElement.lang` se mantiene sincronizado (sin reiniciar la entrada del hero).
- Reduced motion: el efecto sticky se neutraliza; el manifiesto aparece como bloque estático debajo del hero; el logo 3D queda estático (§8).

## Dependencias y precondiciones

- Hero implementado y estable (`src/sections/Hero.tsx`, `src/features/hero/HeroMark.tsx`, `src/features/hero/HeroScene.tsx`). DONE.
- Diccionarios ES/EN vigentes en `src/content/hero.ts`. Activos.
- Plan 004/008 (entrada, navbar, Framer Motion) vigentes. Sin scroll-driven JS.
- Sin sección Servicios implementada todavía. La sección `/MANIFIESTO` se monta como hermano directo de `<Hero />` dentro de `<main id="main">` (§10) y queda lista para que el siguiente task inserte Servicios después.

## Archivos que se pueden crear / modificar

1. `src/content/manifesto.ts` (nuevo): tipo `ManifestoContent`, exportación `content: Record<Locale, ManifestoContent>`, exportación `Locale` reutilizada de `./hero`.
2. `src/sections/Manifesto.tsx` (nuevo): componente `Manifesto({ content, reducedMotion })` con eyebrow, statement y placeholder `/SHOWREEL`. Sin estado propio.
3. `src/index.css` (modificado): estilos `.manifesto`, `.manifesto-eyebrow`, `.manifesto-statement`, `.showreel-placeholder`; reglas para que `.hero-mark-reveal` se comporte como pin sticky mientras existe contexto suficiente (ver "Arquitectura del pin").
4. `src/App.tsx` (modificado): importa `Manifesto` y `content` del nuevo diccionario; monta `<Manifesto content={…} reducedMotion={…} />` justo después de `<Hero />`. Si la arquitectura del pin lo requiere, introduce un wrapper común entre Hero y Manifesto (ver "Arquitectura del pin"); en caso contrario, montaje directo sin wrapper.

`src/sections/Hero.tsx` se modifica **solo** si la arquitectura del pin lo exige (por ejemplo, para extraer el `motion.div.hero-mark-reveal` a un wrapper con key estable). El plan prefiere una solución CSS-only para mantener Hero intacto.

## Archivos que hay que leer

- `src/App.tsx`
- `src/sections/Hero.tsx`
- `src/features/hero/HeroMark.tsx`
- `src/features/hero/HeroScene.tsx`
- `src/content/hero.ts`
- `src/index.css`
- `docs/plans/004-motion-recordings.md` (contrato Framer Motion + reduced motion)
- `AGENTS.md` §3 (paleta), §6 (diseño base), §7 (orden de página), §8 (animación), §9 (escena 3D)

## Fuera de alcance

- Sustituir el copy del hero o reordenar su contenido.
- Crear una segunda instancia de Canvas / `HeroScene` (AGENTS.md §9).
- Añadir `Lenis`, GSAP, `useScroll` u otra librería de scroll (AGENTS.md §5/§8).
- Insertar un vídeo real de showreel o un `<video>` etiquetado como tal (AGENTS.md §3/§15; sin asset aprobado).
- Cambiar paleta, tipografía, breakpoints o radio.
- Enlazar `#manifiesto` desde el menú: la navbar 005/009 sigue con Inicio / Servicios / Empresa; el ancla `#manifiesto` queda disponible en el DOM por si una tarea futura lo agrega, pero no se modifica el menú en esta tarea.
- Implementar la siguiente sección (Servicios). Esta tarea entrega el manifiesto y la composición DOM necesaria para que Servicios se monte a continuación sin colisiones.

## Contrato de datos, exports y props

```ts
// src/content/manifesto.ts
import type { Locale } from './hero'

export interface ManifestoContent {
  sectionLabel: string   // "Manifiesto" / "Manifesto" (aria-label y SEO)
  eyebrow: string        // "/MANIFIESTO" o "/MANIFESTO" (a decidir abajo)
  statement: string      // frase estratégica principal
  showreelLabel: string  // "/SHOWREEL"
  showreelHint: string   // subtítulo del placeholder
}

export const content: Record<Locale, ManifestoContent> = { es: {...}, en: {...} }
```

```tsx
// src/sections/Manifesto.tsx
import type { ManifestoContent } from '../content/manifesto'

interface ManifestoProps {
  content: ManifestoContent
  reducedMotion: boolean
}

export function Manifesto({ content, reducedMotion }: ManifestoProps): JSX.Element
```

## Copy exacto ES/EN (PROPUESTA — pendiente de aprobación del propietario)

ES:

- `sectionLabel`: "Manifiesto"
- `eyebrow`: "/MANIFIESTO"
- `statement`: "Estrategia y desarrollo trabajando juntos. Construimos contigo, paso a paso, desde la primera idea hasta su puesta en marcha."
- `showreelLabel`: "/SHOWREEL"
- `showreelHint`: "Próximamente."

EN:

- `sectionLabel`: "Manifesto"
- `eyebrow`: "/MANIFESTO"
- `statement`: "Strategy and development working side by side. We build with you, step by step, from the first idea through launch."
- `showreelLabel`: "/SHOWREEL"
- `showreelHint`: "Coming soon."

Notas:

- `eyebrow` usa `/MANIFIESTO` en ambos idiomas para mantener la misma etiqueta visual que el resto de secciones de la referencia. El propietario puede preferir `/MANIFESTO` (inglés) y `/MANIFIESTO` (español); en ese caso se ajusta aquí antes de pasar a IN_PROGRESS.
- `showreelHint` queda neutro. Cambiarlo requiere edición de este contrato, no del ejecutor.
- Si el propietario quiere otro copy estratégico, debe indicarlo en el campo "Pendientes" de este plan antes de mover a READY.

## Assets exactos y fallback

- Sin assets nuevos. Solo texto + el Canvas ya montado del hero.
- Bloque `/SHOWREEL`: rectángulo con `border: 1px solid var(--color-border)`, fondo `var(--color-grid)`, label `/SHOWREEL` en `var(--color-secondary)` centrada, hint debajo en `var(--color-secondary)`. Sin `<img>`, sin `<video>`, sin icono.

## Layout por breakpoint

Mobile (<768px):

- Manifiesto: `min-height: 180vh`, padding-block 64px, padding-inline `var(--page-padding)` (20px).
- Mark pin: `top: 50svh`, alto útil del mark limitado a 48svh (regla existente en `.hero-mark`).
- Apilamiento vertical: eyebrow → statement → showreel placeholder, separados 32px.
- Statement: 26px / 1.2, weight 500, letter-spacing -0.02em, max-width 18ch.
- Showreel placeholder: 100% ancho, min-height 40vh, padding 24px, label 12px uppercase tracking 0.08em, hint 14px / 1.5.

Tablet (768–1023px):

- Manifiesto: `min-height: 160vh`, padding-block 80px, padding-inline `var(--page-padding)` (32px).
- Bloques centrados horizontalmente, max-width 720px.
- Statement: 32px / 1.15.
- Showreel placeholder: max-width 720px, min-height 40vh.

Desktop (≥1024px):

- Manifiesto: `min-height: 160vh`, padding-block 104px, padding-inline `var(--page-padding)` (64px).
- Bloques centrados horizontalmente, max-width 880px.
- Statement: clamp(2rem, 3.4vw, 2.75rem) / 1.1, letter-spacing -0.025em.
- Showreel placeholder: max-width 880px, min-height 44vh.

Composición general (los tres breakpoints):

- Sección `<section id="manifiesto" aria-labelledby="manifiesto-heading">`.
- Encabezado: `<p class="manifesto-eyebrow eyebrow">{eyebrow}</p>`.
- `<h2 id="manifiesto-heading" class="manifesto-statement">{statement}</h2>`.
- `<div class="showreel-placeholder" aria-label={showreelLabel} role="img"><span class="showreel-placeholder__label">{showreelLabel}</span><span class="showreel-placeholder__hint">{showreelHint}</span></div>`.

## Tokens y tipografía

- Reutiliza la paleta de AGENTS.md §3: `--color-graphite` (fondo de página), `--color-dark-gray` (fondo del showreel placeholder mezclado al 6% para que case con `--color-grid`), `--color-burgundy` (no se usa en esta sección salvo foco), `--color-warm-white` (texto principal).
- Texto secundario al 78% (`--color-secondary`), borde al 14% (`--color-border`), retícula al 6% (`--color-grid`).
- Tipografía: misma pila del proyecto (system-ui, §6). Sin descargas ni Safiro.
- Statement hereda `font-weight: 500`, `letter-spacing` negativo, `text-wrap: pretty`, `max-width` definido arriba.
- Eyebrow hereda `.eyebrow` ya definido en `src/index.css` (12px, uppercase, tracking 0.08em).
- No se introducen tokens nuevos.

## Interacción

- Sin eventos de scroll JS. Sin listeners.
- El pin del mark se logra con CSS (`position: sticky` o `position: fixed` con wrapper), sin scroll-driven library.
- Reveal del contenido del manifiesto: una vez por sesión, al entrar el bloque en viewport (IntersectionObserver implícito vía Framer Motion `whileInView` con `viewport={{ once: true, amount: 0.4 }}`):
  - Eyebrow: opacity 0 → 1, y 24 → 0, duración 0.8s, ease "easeOut", delay 0.20s.
  - Statement: misma curva, delay 0.35s.
  - Showreel placeholder: misma curva, delay 0.50s.
- Si `reducedMotion` es `true`, todos los reveal son instantáneos (initial = animate) y el pin se neutraliza (ver "Accesibilidad").
- Hovers: sin reglas nuevas (no hay botones ni enlaces en esta sección).
- Foco: el bloque `/SHOWREEL` no es interactivo; no recibe foco. El eyebrow y el `<h2>` no son interactivos.

## Accesibilidad / reduced-motion / errores / cleanup

- `<section id="manifiesto" aria-labelledby="manifiesto-heading">`.
- El bloque `/SHOWREEL` lleva `role="img"` y `aria-label={showreelLabel}` para que lectores de pantalla anuncien la etiqueta; el hint se incluye en `aria-label` junto a la etiqueta: `aria-label={`${showreelLabel} — ${showreelHint}`}`.
- Reduced motion: el `useMotionPreferences` ya existente provee `reducedMotion`. El componente recibe la prop y:
  - Omite reveal (initial coincide con animate, sin transiciones).
  - Marca una clase `.is-static` (o equivalente) que en CSS desactiva el pin: el mark vuelve al flujo natural y el manifiesto se renderiza inmediatamente debajo del hero. Sin listeners ni teardown adicional.
- Sin errores posibles: no hay assets, no hay red, no hay listeners añadidos por esta tarea. El cleanup es el implícito de Framer Motion (`whileInView` se desmonta con el componente).
- Idioma: el `<h2>` y el eyebrow se localizan vía diccionario; `document.documentElement.lang` ya lo actualiza `App.tsx`.

## Arquitectura del pin (decisión técnica recomendada)

Objetivo: que `.hero-mark-reveal` permanezca visible y centrado mientras el usuario hace scroll dentro del manifiesto, sin duplicar Canvas.

Restricciones de la base actual:

- `HeroMark` (y por tanto el Canvas) vive dentro de `<section class="hero">` → `.hero-stage` → `motion.div.hero-mark-reveal`.
- `<section class="hero">` tiene `min-height: calc(100svh - 80px)`. Por sí solo no es lo bastante alto para que un sticky hijo se mantenga pegado cuando el usuario está ya dentro de la sección siguiente (manifiesto).
- AGENTS.md §9 prohíbe un segundo Canvas.

Solución preferida (CSS-only, sin tocar `Hero.tsx`):

1. En `App.tsx`, envolver `<Hero />` y `<Manifesto />` en un nuevo contenedor `<div class="sticky-stage">` (sin estilos adicionales salvo `position: relative` para servir de contexto de apilamiento). Este contenedor es el padre común que da altura suficiente para que un hijo sticky se mantenga pegado.
2. En `src/index.css`, añadir:
   ```css
   .sticky-stage {
     position: relative;
   }
   .hero-mark-reveal {
     position: sticky;
     top: 50svh;
     transform: translateY(-50%);
     z-index: 0;
   }
   ```
   - `top: 50svh` mantiene el mark centrado verticalmente en el viewport.
   - `transform: translateY(-50%)` compensa la mitad de su altura para que el centro del mark coincida con la mitad del viewport.
   - `z-index: 0` (o el que asegure que el texto pasa por encima); el contenido textual del manifiesto debe tener `position: relative; z-index: 1` o superior para superponerse.
3. El pin se desactiva automáticamente cuando `sticky-stage` termina (cuando el usuario sale de la sección de manifiesto): el mark vuelve al flujo y desaparece con el final del contenedor.
4. En reduced motion, una clase `.is-static` en el `<body>` (o en `.sticky-stage`) anula la regla:
   ```css
   .is-static .hero-mark-reveal {
     position: static;
     transform: none;
   }
   ```
   El componente `App.tsx` ya conoce `reducedMotion`; el ejecutor añade la clase al elemento raíz si quiere un control imperativo, o el ejecutor lo resuelve con un selector `[data-reduced-motion='true']` (la forma concreta la decide el ejecutor; lo importante es que exista un selector estable).

Solución alternativa (si la preferida interfiere con el grid/highlights del hero):

- Mantener `sticky-stage` pero aplicar sticky solo a `.hero-mark` (no a `.hero-mark-reveal`) usando el mismo principio. El ejecutor ajusta según lo que vea al inspeccionar.

Lo que el ejecutor **no** debe hacer:

- Duplicar `<HeroMark />` ni crear una segunda instancia de Canvas.
- Usar `position: fixed` para el mark sin controlar cuándo se oculta al final del manifiesto (quedaría flotando sobre secciones siguientes).
- Añadir un `<IntersectionObserver>` adicional si puede resolverse con CSS.

## Pasos numerados de implementación

1. Crear `src/content/manifesto.ts` con la interfaz y el diccionario ES/EN de arriba. Reexportar o importar `Locale` desde `./hero` para mantener una sola fuente de tipos de idioma.
2. Crear `src/sections/Manifesto.tsx`:
   - Recibe `{ content, reducedMotion }`.
   - Renderiza eyebrow, `<h2>`, y el placeholder `/SHOWREEL` con `whileInView` y `viewport={{ once: true, amount: 0.4 }}`.
   - Si `reducedMotion`, pasa `initial={false}` y omite `transition`.
   - Sin estado, sin efectos, sin refs.
3. Modificar `src/index.css`:
   - Añadir bloque al final del archivo (antes del media query `prefers-reduced-motion`):
     - `.sticky-stage { position: relative; }`
     - `.hero-mark-reveal { position: sticky; top: 50svh; transform: translateY(-50%); z-index: 0; }`
     - `.manifesto { position: relative; z-index: 1; padding-block: …; padding-inline: var(--page-padding); display: grid; place-items: center; min-height: …svh; }`
     - `.manifesto-eyebrow { margin: 0 0 24px; }` (hereda `.eyebrow`)
     - `.manifesto-statement { margin: 0; max-width: …ch; }` con las medidas por breakpoint indicadas arriba.
     - `.manifesto-inner { width: 100%; max-width: …px; display: grid; gap: 32px; }` con las medidas por breakpoint.
     - `.showreel-placeholder { border: 1px solid var(--color-border); background: var(--color-grid); border-radius: 8px; padding: 24px; min-height: …vh; display: grid; place-items: center; gap: 8px; max-width: …px; width: 100%; }`
     - `.showreel-placeholder__label { font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-secondary); }`
     - `.showreel-placeholder__hint { font-size: 14px; line-height: 1.5; color: var(--color-secondary); }`
   - Añadir override para reduced motion dentro del bloque `@media (prefers-reduced-motion: reduce)` y/o de la clase `.is-static`:
     ```css
     .hero-mark-reveal { position: static; transform: none; }
     .sticky-stage .hero-mark-reveal { position: static; transform: none; }
     ```
   - Asegurar que el hero stage no interfiere: verificar que `.hero-stage` mantiene `flex: 1` y `place-items: center` y que el mark queda visualmente donde estaba en flujo normal cuando sticky se desactiva.
4. Modificar `src/App.tsx`:
   - Importar `Manifesto` y `content` desde `./content/manifesto`.
   - Importar `useMemo` si se quiere memoizar el diccionario seleccionado (opcional).
   - Envolver `<Hero />` y `<Manifesto />` en `<div className="sticky-stage">` dentro de `<main>`.
   - Si el ejecutor decide controlar `is-static` desde JS, aplicar el atributo `data-reduced-motion={reducedMotion}` al `<div className="page-shell">` (no se introduce estado nuevo).
5. Verificación visual en los tres breakpoints. Confirmar que:
   - El mark se ve centrado en el viewport durante el scroll dentro del manifiesto.
   - El texto del manifiesto pasa por encima del mark.
   - Al salir del manifiesto, el mark desaparece y la siguiente sección (o el fondo) se ve correctamente.
   - El navbar sigue funcionando (z-index superior al mark).
6. Verificación de reduced motion y de los idiomas.

## Comandos y verificaciones aplicables

Desde la raíz real (`C:\Astra\Astra\Aetherys`):

```sh
pnpm lint
pnpm build
pnpm exec prettier --check src/sections/Manifesto.tsx src/content/manifesto.ts src/index.css src/App.tsx
pnpm dev --host 127.0.0.1
```

- Inspección manual con DevTools a 390×844, 768×1024 y 1440×900.
- Alternar `?lang=en` y `?lang=es`; comprobar cambios de copy y `document.documentElement.lang`.
- DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce"; comprobar que el pin se desactiva.
- Lighthouse / DevTools Performance: el coste del pin debe ser ~0; no debe introducir layout shifts (CLS) al entrar/salir del manifiesto.
- Consola sin errores ni 404.

## Criterios de aceptación binarios

- [ ] Existe `src/content/manifesto.ts` con la interfaz y el diccionario ES/EN.
- [ ] Existe `src/sections/Manifesto.tsx` exportando `Manifesto` con la firma de props indicada.
- [ ] `src/App.tsx` monta `<Manifesto />` entre `<Hero />` y la siguiente sección, dentro de `<main>`.
- [ ] El mark 3D permanece visible y centrado mientras el usuario hace scroll dentro de `#manifiesto`.
- [ ] El eyebrow, el `<h2>` y el placeholder `/SHOWREEL` aparecen por encima del mark (visualmente, no hay oclusión del texto).
- [ ] Al salir del manifiesto, el mark vuelve al flujo y desaparece sin solapar las secciones siguientes.
- [ ] El placeholder `/SHOWREEL` no contiene `<img>`, `<video>` ni `<iframe>`.
- [ ] Alternar idioma cambia todos los textos y mantiene `document.documentElement.lang` sincronizado.
- [ ] Reduced motion: pin desactivado, sin animaciones, contenido visible inmediatamente, sin listeners huérfanos tras navegar o remontar.
- [ ] `pnpm lint` y `pnpm build` pasan sin warnings nuevos.
- [ ] Prettier `--check` pasa en los archivos modificados.
- [ ] Consola del navegador sin errores ni warnings introducidos por esta tarea.
- [ ] Sin segunda instancia de Canvas (verificable buscando `lazy(() => import('./HeroScene'))` en el árbol).

## Condiciones de bloqueo

- Copy no aprobado por el propietario.
- Conflicto de z-index entre el mark sticky y el navbar (no debería: navbar tiene z-index 1 en `.site-header`; si aparece, se eleva el z-index del navbar o se reduce el del mark a -1, decisión del ejecutor dentro del contrato).
- Si la arquitectura preferida (sticky dentro de `.sticky-stage`) rompe el layout del hero en algún breakpoint, el ejecutor debe reportarlo y proponer alternativa dentro de los mismos límites (sin segundo Canvas, sin librería de scroll), en lugar de introducir desviaciones no autorizadas.

## Pendientes antes de pasar a READY

- Aprobación del copy ES/EN propuesto (o sustitución por variantes del propietario).
- Decisión sobre si la etiqueta editorial es `/MANIFIESTO` (igual en ambos idiomas) o si el inglés usa `/MANIFESTO` y el español `/MANIFIESTO`.

## Entrega (al cerrar)

- Lista de archivos cambiados.
- Resultado de `pnpm lint`, `pnpm build` y `pnpm exec prettier --check …`.
- Notas visuales por breakpoint.
- Cualquier desviación técnica respecto a "Arquitectura del pin" con su justificación.
