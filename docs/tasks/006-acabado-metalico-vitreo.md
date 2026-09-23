# 006 — Acabado metálico-vítreo del símbolo del hero

ID / título / estado: 006 / Acabado metálico-vítreo del símbolo del hero / DONE

Objetivo observable: la A 3D del hero lee como metal oscuro vino (no vidrio blanco), con filetes de luz blanco cálido en cantos y un reflejo borgoña secundario perceptible en el costado derecho, manteniendo geometría, encuadre, tilt, cleanup, fallback y rendimiento existentes.

Dependencias y precondiciones: Plan 006 aprobado por el propietario (cuerpo grafito→borgoña lerp 0.45; borgoña como reflejo secundario perceptible). Tokens presentes en `src/index.css`. Sin dependencias nuevas.

Archivos que se pueden crear/modificar: `src/features/hero/HeroScene.tsx`; `docs/plans/006-acabado-metalico-vitreo.md`; `docs/tasks/006-acabado-metalico-vitreo.md`; `docs/verification/006-acabado-metalico-vitreo.md`; AGENTS.md §3, §9 y mención en §12 paso 4.

Archivos que hay que leer: AGENTS.md §§3, 8, 9, 11, 13; `src/features/hero/HeroScene.tsx`; `src/features/hero/HeroMark.tsx`; `src/content/hero.ts`.

Fuera de alcance: geometría/extrusión, cámara, DPR, `frameloop`, springs de tilt, listeners/cleanup, `HeroMark.tsx`, fallback SVG, retícula, CSS del hero, copy, dependencias, animaciones.

Contrato de datos, exports y props: sin cambios de API. `Mark()` calcula `body = new Color('--color-graphite').lerp(new Color('--color-burgundy'), 0.45)`; `HeroScene` exporta default igual. Eliminar el import `MeshTransmissionMaterial`; conservar `Color`.

Copy exacto ES/EN: N/A (escena `aria-hidden`, sin texto nuevo).

Assets exactos y fallback: N/A sin cambios; `public/brand/aetherys-mark.svg` sigue como fallback.

Layout por breakpoint (dimensiones/espaciado): N/A (no cambia).

Tokens y tipografía: solo `--color-graphite` #101014, `--color-burgundy` #800020, `--color-warm-white` #F4F1F6. Material: `meshPhysicalMaterial` color=body, metalness 0.85, roughness 0.2, clearcoat 1, clearcoatRoughness 0.08, envMapIntensity 1.6. Luces: ambient white 0.25; Environment resolution 256 frames 1; Lightformers (sin rotation): white 5 [-4,1,2] [1.2,8,1]; white 2 [0,4,1] [12,1.6,1]; burgundy 4 [4,0,2] [2,7,1]; white 1 [0,0,-5] [6,6,1]; directionals: white [-3,4,5] 2, burgundy [4,2,1] 2.5.

Interacción (evento, estado inicial/final, tiempo, easing): N/A (tilt existente intacto).

Accesibilidad / reduced-motion / errores / cleanup: sin regresión: reduced-motion desactiva tilt (ya implementado); `webglcontextlost` → fallback; IntersectionObserver/visibility/blur/listeners intactos; sin setState por frame.

Pasos numerados de implementación:

1. Import: quitar `MeshTransmissionMaterial` (línea 3).
2. En `Mark()`, tras `const colors`, añadir `body` con lerp 0.45 entre grafito y borgoña.
3. Sustituir el bloque `MeshTransmissionMaterial` (96–117) por `meshPhysicalMaterial` con los valores del contrato.
4. Sustituir el rig de luces (139–161) por ambient 0.25 + Environment 256/frames 1 con los cuatro Lightformers + dos direccionales.
5. `pnpm lint`, `pnpm build`, `git diff --check`, `pnpm exec prettier --check src/features/hero/HeroScene.tsx`.
6. Verificación visual 1440×900 y 390×844 con `pnpm dev --host 127.0.0.1`; consola sin errores ni 404; ajustar solo dentro de los rangos de plan 006 (máx. 2 rondas) y documentar valores finales aquí.
7. Actualizar AGENTS.md §3 (grafo→«Fondo principal» + línea de material del símbolo), §9 (material actual) y §12 paso 4; escribir docs/verification/006.

Comandos y verificaciones visuales aplicables: `pnpm lint`; `pnpm build`; `git diff --check`; `pnpm exec prettier --check src/features/hero/HeroScene.tsx`; `pnpm dev --host 127.0.0.1` + capturas 1440×900 y 390×844.

Criterios de aceptación binarios:

1. lint, build, diff --check y prettier pasan.
2. En 1440×900: cuerpo del símbolo oscuro vino (no blanco/claro), al menos un filete blanco cálido en cantos, reflejo borgoña perceptible a la derecha sin dominar la lectura global.
3. En 390×844: símbolo legible, sin overflow horizontal, consola sin errores ni 404.
4. Tilt con puntero sigue activo; sin render continuo 2s después de cesar el movimiento.
5. Fallback SVG visible si falla WebGL; reduced-motion sin tilt y símbolo estático.

Condiciones de bloqueo: criterio visual inalcanzable dentro de los rangos acotados; necesidad de tocar geometría, cámara, CSS del hero o retícula; incompatibilidad de `meshPhysicalMaterial`/clearcoat con three/R3F instalados.

Entrega:

- Archivos cambiados: `src/features/hero/HeroScene.tsx`, `AGENTS.md` (§3, §9, §12 paso 4), `docs/plans/006-acabado-metalico-vitreo.md`, `docs/tasks/006-acabado-metalico-vitreo.md`, `docs/verification/006-acabado-metalico-vitreo.md`.
- Valores finales tras 2 rondas de ajuste dentro de rangos del plan 006: lerp borgoña 0.45; metalness 0.75; roughness 0.26; clearcoat 1 / 0.08; envMapIntensity 2.0; ambient blanco 0.4; filete blanco 6; banda superior 2.5; panel borgoña 5; contraluz trasero 1; direccional blanca 2; direccional borgoña 2.5. Posiciones, escalas, geometría, cámara, DPR y frameloop sin cambios.
- Checks sobre el código inicial del contrato: FALLÓ→no; `pnpm lint`, `pnpm build`, `git diff --check` y `prettier --check` pasaron. Tras los microajustes numéricos (ronda 2): NO EJECUTADOS por指示 expresa del propietario de cerrar sin más verificación.
- Verificación visual: NO EJECUTADA (instrucción del propietario). Las capturas headless previas mostraron símbolo renderizado con cuerpo vino y filetes blanco cálido; el resultado final no fue validado en pantalla por una persona.
- Pendientes: revisión visual humana del acabado en 1440×900 y 390×844 (`pnpm dev --host 127.0.0.1`); volver a pasar lint/build/prettier si se desea cierre formal de checks post-ajuste.
