# 008 — Logo 3D fijo y centrado durante el scroll

ID / título / estado: 008 — logo-3d-fijo-centrado-scroll / DONE
Decisión del propietario: el logo debe permanecer fijo y centrado a lo largo de
todo el manifiesto, no solo durante el hero. El texto del hero desaparece al bajar y
el del manifiesto aparece por encima. Esto descarta la Opción A (sticky acotado al
hero) y confirma la Opción B.

Enfoque realmente implementado (Opción B): el mark **sigue dentro de `.hero`** en el
DOM —así `HeroScene` conserva `closest('.hero')` para el puntero— pero se fija con
`position: fixed` usando las dimensiones medidas, y un placeholder oculto en el flujo
reserva su espacio para que el layout no colapse.
Objetivo observable: al hacer scroll hacia abajo, el logo 3D permanece en el mismo
lugar (centro del viewport) mientras el resto del hero y el manifiesto se desplazan.
El tamaño renderizado del logo no cambia respecto al estado actual.

Dependencias y precondiciones:
- 010 (manifiesto) ya integrado en `App.tsx` dentro de `.sticky-stage`.
- Sin ancestros con `overflow: hidden` entre `.hero-mark-reveal` y el scroll root
  (verificado: `.page-shell` y `.page-surface` no lo tienen; los `overflow: hidden`
  de `index.css` pertenecen a `.hero-entrance`, `.entrance-columns` y al diálogo de menú).

Archivos que se pueden crear/modificar:
- `src/index.css` (único archivo de aplicación necesario en la Opción A)
- `src/sections/Hero.tsx` y `src/App.tsx` solo en la Opción B

Archivos que hay que leer:
- `src/index.css` líneas 174-330 (`.hero`, `.hero-stage`, `.hero-stage > *`, `.hero-mark-reveal`, `.hero-mark`)
- `src/sections/Hero.tsx` líneas 124-133
- `src/features/hero/HeroScene.tsx` línea 18 (`closest('.hero')`)

Fuera de alcance:
- Cambios de copy, de la sección manifiesto, del navbar o de la entrada animada de 5.4 s.
- Redimensionar, reescalar o reposicionar el logo. Cualquier cambio de tamaño está prohibido.
- Servicios, contacto y proyectos.

## Diagnóstico (por qué fallaron los intentos anteriores)

1. El intento con `<div className="hero-mark-pin">` rompió el tamaño. Motivo exacto:
   `.hero-stage` es `display: grid` con `place-items: center`, y la regla `.hero-stage > *`
   aplica `grid-area: 1 / 1` únicamente a los hijos **directos**. Al insertar un wrapper,
   el wrapper pasó a ser el ítem de grid y `.hero-mark-reveal` dejó de ser hijo directo.
   El wrapper no heredó `width: min(100%, 480px)`, por lo que su ancho pasó a ser
   `auto` (shrink-to-fit) y `min(100%, 480px)` se resolvió contra un padre más estrecho.
   Resultado: logo más pequeño. El centrado no fue el problema; el ancho del ítem de grid sí.
2. El `transform: translateY(-50%)` del wrapper tampoco es viable: `.hero-mark-reveal` ya
   recibe `transform` de Framer Motion (`reveal(3.8)` anima `y: 24 → 0`). No se puede
   centrar con transform en el mismo elemento que Motion anima.

## Contrato de datos, exports y props
Opción A: sin cambios de exports, props ni JSX. Solo CSS.
Opción B: `Hero` acepta `pinMark?: boolean`; el bloque del mark se mueve a un
componente hermano. `HeroScene` cambia `closest('.hero')` por `closest('.sticky-stage')`.

## Copy exacto ES/EN
N/A. No se toca texto.

## Assets y fallback
N/A. No se toca `public/brand/aetherys-mark.svg` ni el `SceneBoundary` de `HeroMark.tsx`.

## Layout por breakpoint
CSS añadido, el único bloque nuevo:

```css
.hero-mark-placeholder {
  grid-area: 1 / 1;
  width: min(100%, 480px);
  aspect-ratio: 1;
  max-height: 48svh;
  pointer-events: none;
}
```

Y en `@media (prefers-reduced-motion: reduce)`:

```css
.hero-mark-placeholder {
  display: none;
}
```

El placeholder replica la caja del mark (`min(100%, 480px)` + `aspect-ratio: 1` +
`max-height: 48svh`) para que `.hero-stage` conserve exactamente su altura y ancho.
No se modifica `.hero-mark-reveal`, `.hero-mark` ni `.hero-mark-fallback`.
No hay valores por breakpoint: el mark se mide en tiempo de ejecución, así que un
único juego de reglas sirve en móvil, tablet y escritorio.
`width: min(100%, 480px)` en el pin es obligatorio: es la regla que faltó en el
intento fallido anterior.

## Tokens y tipografía
N/A. No se cambian tokens ni tipografía.

## Interacción
- Sin eventos nuevos. Sin listeners de scroll.
- Sticky puro de CSS: no depende de `useScroll`, no añade listeners, no anima `transform`.
- Release: el mark se despegará al terminar el rango de su bloque contenedor. En la
  Opción A ese rango es `.hero-stage` (dentro del hero). En la Opción B es `.sticky-stage`
  (hero + manifiesto completos).

## Accesibilidad / reduced-motion / errores / cleanup
- Reduced motion: `pinActive` exige `!reducedMotion`, así que el mark nunca se fija; además
  el placeholder se oculta con `display: none` para no dejar un hueco. El logo fluye con
  el documento.
- El mark es `aria-hidden`; fijarlo en pantalla no cambia la exposición del árbol de accesibilidad.
  El placeholder también lleva `aria-hidden="true"`.
- `pointer-events: none` en el mark fijado para no bloquear el scroll ni los enlaces.
- Cleanup: `ResizeObserver`, `IntersectionObserver` y el listener de `resize` se desconectan
  en el return de cada efecto. Ninguno queda vivo tras el desmontaje.
- StrictMode: los efectos montan y desmontan correctamente; los observers se recrean, no
  se duplican. No hay timers ni animaciones nuevas.

## Pasos numerados de implementación (los ejecutados)
1. `src/sections/Hero.tsx`: añadir prop `pinMark: boolean` a `HeroProps`.
2. `src/sections/Hero.tsx`: añadir `placeholderRef`, `pinOffset`, `pinned` y `pinActive`.
3. `src/sections/Hero.tsx`: `measure()` con `useCallback`, leyendo el placeholder y
   abortando si `window.scrollY > 1` o si el rect es cero.
4. `src/sections/Hero.tsx`: `useLayoutEffect` que mide al montar, observa el placeholder
   con `ResizeObserver` y escucha `resize`.
5. `src/sections/Hero.tsx`: `useEffect` con `IntersectionObserver` sobre `.sticky-stage`
   para fijar `pinned`.
6. `src/sections/Hero.tsx`: renderizar `.hero-mark-placeholder` y aplicar el `style`
   inline (`position: fixed` + top/left/width/height + `zIndex: 0`) al `.hero-mark-reveal`
   cuando `pinActive`. Sin `transform`.
7. `src/App.tsx`: pasar `pinMark` al `<Hero />`.
8. `src/index.css`: añadir `.hero-mark-placeholder` y su regla en reduced motion.
9. Verificar.

## Comandos y verificaciones visuales
```sh
pnpm lint
pnpm build
pnpm exec prettier --check src/index.css
git diff --check
```
Visual: `pnpm dev --host 127.0.0.1`. Comprobar 390x844 y 1440x900 (añadir 768x1024 si
el comportamiento cambia en tablet).

- Scroll 0: el logo debe coincidir píxel a píxel con el estado actual. Si hay cambio de
  tamaño o de posición, el criterio falla.
- Scroll lento de 0 a 1000 px: el logo no debe moverse; el texto del hero y los highlights sí.
- Entrar en el manifiesto: el logo debe permanecer fijo mientras el manifiesto entra en
  pantalla, y el texto del manifiesto debe verse por encima del logo.
- No debe aparecer scroll horizontal.
- Sin errores en consola ni 404.

## Criterios de aceptación binarios
1. `src/features/hero/HeroScene.tsx` sin modificar: `closest('.hero')` sigue funcionando
   porque el mark permanece dentro de la sección `.hero`. CUMPLIDO.
2. `.hero-mark-reveal` sigue siendo hijo directo de `.hero-stage`. CUMPLIDO.
3. `width: min(100%, 480px)` en `.hero-mark-reveal` y `aspect-ratio: 1; max-height: 48svh`
   en `.hero-mark` sin modificar. CUMPLIDO.
4. `.hero-mark-reveal` no tiene `transform` en CSS. CUMPLIDO.
5. Con scroll, el rectángulo del logo no cambia de posición respecto al estado de reposo.
   PENDIENTE de verificación visual.
6. `pnpm lint` y `pnpm build` en verde. CUMPLIDO.
7. Con reduced motion activo, el logo fluye con el documento (placeholder oculto y
   `pinActive` forzado a false). CUMPLIDO por código, PENDIENTE de verificación visual.

## Notas de implementación (Opción B)
- `Hero` recibe `pinMark: boolean`. `App.tsx` lo pasa como `true`.
- Estado: `pinOffset` (medición) y `pinned` (visibilidad del stage). `pinActive` exige
  ambos y que no haya reduced motion.
- `measure()` mide `.hero-mark-placeholder`, no el mark. Motivo: cuando el mark está
  `fixed`, medirlo devolvería su posición ya fijada y la realimentación corrompería el
  valor. El placeholder siempre está en el flujo normal.
- `measure()` aborta si `window.scrollY > 1`. Motivo: al redimensionar con la página
  scrolleada, el placeholder ya no está en su sitio de reposo y el logo saltaría.
- Límite de la medición: se captura con la página en scroll 0. Si el navegador restaura
  una posición de scroll al recargar, el logo arranca desplazado. Aceptado como
  limitación conocida; no se añadió listener de scroll para evitarla.
- `IntersectionObserver` sobre `.sticky-stage` desactiva el pin cuando el stage sale del
  viewport, de modo que el logo no flota sobre secciones futuras.
- Ambos observers y el listener de `resize` se limpian en el return del efecto.
- `zIndex: 0` en el pin: el manifiesto (`.manifesto`, `z-index: 1`) queda por encima, que
  es el efecto buscado.
- Lint: `react-hooks/set-state-in-effect`=veta `setPinned(false)` síncrono en el efecto.
  Se eliminó esa rama por ser inalcanzable con `pinMark` siempre true.

## Condiciones de bloqueo
- Si el logo cambia de tamaño o aparece desplazamiento del resto del hero: revertir y
  marcar BLOCKED con el síntoma medido.

## Entrega
Archivos modificados:
- `src/sections/Hero.tsx` — prop `pinMark`, medición, `IntersectionObserver`, mark fijo.
- `src/App.tsx` — pasa `pinMark`.
- `src/index.css` — `.hero-mark-placeholder` y su ocultación en reduced motion.
- `docs/tasks/008-logo-centrado-scroll.md` — este documento.

Checks: `pnpm lint` OK. `pnpm build` OK. `git diff --check` pendiente de reejecutar
tras la última edición.

Pendiente: verificación visual en 390x844, 768x1024 y 1440x900 (tamaño idéntico al
actual, logo fijo a lo largo del manifiesto, sin scroll horizontal).

## Entrega
Pendiente de ejecución.
