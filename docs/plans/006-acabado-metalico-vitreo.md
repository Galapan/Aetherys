# 006 — Acabado metálico-vítreo del símbolo del hero

Alcance autorizado: petición explícita del propietario de que la A 3D del hero abandone el estilo «muy iluminado» y adopte un acabado metálico-vítreo con más reflejos, según la lectura de la referencia (M oscura definida por filetes de luz), conservando la paleta AGENTS.md §3. La petición actual prevalece sobre el reparto de modelos de §11.

## Diagnóstico de partida

- `src/features/hero/HeroScene.tsx` usaba `MeshTransmissionMaterial` con `color` blanco cálido y `transmission 1`: vidrio blanco que lava el símbolo.
- Iluminación excesiva: `ambientLight 1.5`, tres direccionales a 9/5/15 y cinco Lightformers hasta intensidad 5.

## Decisiones cerradas con el propietario

- Cuerpo del símbolo: grafito teñido de borgoña. Mezcla de tokens autorizada por §3: `Color(graphite).lerp(Color(burgundy), 0.45)` (aprox. #590E1C en pantalla).
- Borgoña en reflejos: secundario perceptible. Los filetes principales son blanco cálido; el panel borgoña marca el costado derecho sin dominar.
- Física del material: `meshPhysicalMaterial` con `clearcoat 1` aporta la capa vítrea sobre el metal oscuro; la transmisión se elimina y con ella sus pases FBO (menos GPU). Geometría, extrusión, cámara, DPR, `frameloop="demand"`, springs de tilt, cleanup y fallback quedan intactos.

## Contrato de valores (ejecución)

Material: metalness 0.85, roughness 0.2, clearcoat 1, clearcoatRoughness 0.08, envMapIntensity 1.6.

Luces: ambient blanco cálido 0.25; `Environment resolution 256 frames 1` con cuatro Lightformers sin `rotation` (target por defecto [0,0,0]): filete blanco `intensity 5 position [-4,1,2] scale [1.2,8,1]`; banda superior blanca `intensity 2 position [0,4,1] scale [12,1.6,1]`; panel borgoña `intensity 4 position [4,0,2] scale [2,7,1]`; contraluz blanco `intensity 1 position [0,0,-5] scale [6,6,1]`. Direccionales: blanca `[-3,4,5] intensity 2`, borgoña `[4,2,1] intensity 2.5`.

Rangos de ajuste acotados (máx. dos rondas, valores finales documentados en la tarea): lerp borgoña 0.35–0.55; metalness 0.75–0.95; roughness 0.14–0.26; envMapIntensity 1.3–2.0; filete blanco 3.5–7; banda superior 1.5–3; panel borgoña 3–5.5; contraluz 0.6–1.5; ambient 0.15–0.4; direccional blanca 1.5–3; direccional borgoña 2–3.5. Fuera de esos rangos o tocando geometría/cámara/CSS: BLOCKED.

## Documentación asociada

- AGENTS.md §3: grafito pasa a «Fondo principal»; nueva línea de material del símbolo. §9: material actual = `meshPhysicalMaterial` con clearcoat. §12 paso 4: «material de vidrio» → «material metálico-vítreo» (exactitud documental).
- La evidencia histórica de implementación y verificación está en `docs/verification/006-acabado-metalico-vitreo.md`; los valores vigentes también se resumen en AGENTS.md §3 y §9.
