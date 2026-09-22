# Aetherys — contrato de trabajo para agentes

## 1. Lectura, autoridad y alcance

- Leer este archivo al iniciar la sesión. Es la fuente de contexto compartido para OpenCode y otros agentes que admitan AGENTS.md.
- Las instrucciones explícitas más recientes del propietario prevalecen. Este documento no configura automáticamente modelos, permisos ni enrutamiento en OpenCode.
- Trabajar desde la raíz que contiene este archivo y package.json. La ruta comprobada al crearlo fue `/home/galapan/Projects/Aetherys/Aetherys/Aetherys`; no confundir con `/home/galapan/Documents/ChatGPT/Aetherys`, que era otra carpeta.
- Este documento especifica trabajo futuro: no significa que el sitio, los assets o las verificaciones ya estén implementados.
- No migrar el framework, actualizar dependencias, publicar, contratar servicios ni crear infraestructura sin una tarea explícita que lo contemple.
- Preservar los cambios del usuario. No hacer reset, sobrescribir archivos ajenos a la tarea ni realizar commits/push sin solicitud.

## 2. Contexto empresarial confirmado

- Nombre: Aetherys. Startup/equipo de desarrollo de software a medida, con presupuesto limitado.
- Oferta: desde landing pages hasta plataformas SaaS completas; integración de IA, modernización de servicios y diseño de sistemas.
- Público: negocios que se incorporan por primera vez a la tecnología y empresas que necesitan mejorar soluciones existentes.
- Diferenciación declarada: calidad, contacto constante, acompañamiento paso a paso y profesionales que ayudan a concretar la idea del cliente.
- Objetivo principal del visitante: conocer la empresa y sus proyectos. Contacto es una acción secundaria relevante.
- Idiomas: español e inglés. Español por defecto.
- Proyectos: el propietario los proporcionará después. No inventar clientes, casos, capturas de productos reales, resultados, métricas, premios ni testimonios.
- Tampoco inventar integrantes, años de experiencia, certificaciones, correos, dominios, redes o compromisos de soporte.
- No prometer soporte ilimitado ni resultados garantizados. El alcance del acompañamiento posterior al lanzamiento está pendiente.

## 3. Identidad: decisiones cerradas

Solo estos cuatro colores base están autorizados:

| Token CSS | Valor | Uso |
| --- | --- | --- |
| --color-graphite | #101014 | Fondo principal y material del símbolo |
| --color-dark-gray | #1B1B23 | Superficies, bloques y tarjetas |
| --color-burgundy | #800020 | Acentos, fondos de botones y luz secundaria |
| --color-warm-white | #F4F1F6 | Texto, logo, iconos y reflejos |

- Prohibidos: morado/violeta, azul, gris lavanda y lima. Las propuestas antiguas con esos colores quedan anuladas.
- Se permiten transparencias y mezclas de los cuatro colores; no añadir nuevos colores de marca. Las fotografías de proyectos reales pueden conservar sus colores.
- Texto secundario: blanco cálido al 78%; bordes al 14%; retícula al 6%. Comprobar contraste sobre el fondo efectivo.
- Borgoña es rojo oscuro, no negro metálico. El acabado metálico se obtiene con iluminación/material, no cambiando la paleta.
- No usar borgoña para texto pequeño sobre grafito. Botón principal: fondo borgoña, texto blanco cálido y borde blanco cálido al 35%; foco blanco cálido de 2px con separación de 4px.
- Logo: una A estilizada de trazos blancos continuos, curvas superiores y huecos internos, según imagen entregada. Conservar su geometría; no sustituirla por una A tipográfica ni rediseñarla.
- La imagen adjunta tenía fondo azul oscuro: ese fondo NO pertenece a la nueva paleta.
- Fuente original aportada en la conversación: `/tmp/codex-clipboard-d6b8d88b-856e-4211-87e8-36e9a47919b2.png`. Es temporal, no una dependencia válida del sitio. Verificar existencia antes de usarla.
- Pendiente: SVG original o reconstrucción vectorial revisada por el propietario. No asumir que src/assets/hero.png sea el logo correcto sin inspección.

## 4. Referencia y adaptación

Referencia: https://metabole.studio/en

La inspección previa encontró composición editorial, retícula tenue, tipografía grande, símbolo 3D, scroll suave y tarjetas con recorte/zoom. Se observaron Next.js, Three.js, Lenis y recursos desde Sanity; no se confirmó GSAP como tecnología de esa web. Sus tarjetas declaran zoom 1.10, recorte interior de 20px, logo que desaparece y metadatos ascendentes, con transiciones cercanas a 1s.

La referencia guía el ritmo y la jerarquía. No copiar assets, textos, logo, colores ni código. Aetherys conserva Vite. Los valores que siguen son especificaciones propuestas para Aetherys, no mediciones adicionales de Metabole.

## 5. Tecnologías y estado comprobado

Instaladas en package.json al crear este documento:

- Vite 8 + React 19 + TypeScript 6.
- Tailwind CSS 4 y @tailwindcss/vite.
- GSAP 3 (ScrollTrigger incluido) y Lenis 1.
- Three.js 0.186, @react-three/fiber 9, @react-three/drei 10 y @types/three.
- ESLint 10 con plugins React/TypeScript; Prettier 3.
- pnpm con pnpm-lock.yaml; Git.

package.json y el lockfile son la autoridad sobre versiones exactas. No actualizar por iniciativa propia.

- Scripts existentes: dev, build, lint, preview. Build ejecuta `tsc -b && vite build`.
- No existe todavía script de tests o formato; no reportarlos como disponibles.
- vite.config.ts debe importar únicamente los plugins/configuración usados. GSAP y Lenis pertenecen a src, no a la configuración de Vite.
- Usar CSS para hovers; GSAP para secuencias/scroll; R3F/Three para 3D. No añadir Framer Motion, ScrollSmoother, otra librería de scroll ni otro motor 3D.
- No se necesitan inicialmente CMS, base de datos, autenticación ni backend propio.
- No instalar router, biblioteca de iconos o traducción por comodidad; cualquier dependencia nueva requiere justificación en el plan y autorización del propietario.

## 6. Diseño base prescrito

Estos valores son el contrato inicial de implementación. El ejecutor no puede reinterpretarlos; el planificador puede proponer cambios explícitos antes de la tarea.

- Breakpoints: móvil <768px; tablet 768–1023px; escritorio >=1024px.
- Contenedor: max-width 1440px, centrado; padding horizontal 20/32/64px respectivamente.
- Retícula: 4/8/12 columnas; gap 16/24/24px. Líneas decorativas discretas, sin capturar eventos.
- Espaciado vertical entre secciones: 80/104/144px. Escala interna: 8, 16, 24, 32, 48, 64px.
- Radio: botones 4px, tarjetas 8px. Sin botones tipo píldora, glassmorphism, gradientes multicolor ni fondos de partículas.
- Tipografía provisional fija: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`. No descargar fuentes ni usar Safiro sin licencia. La fuente definitiva es una decisión pendiente del propietario.
- H1: clamp(2.75rem, 6vw, 6rem), line-height 1.02, weight 500, letter-spacing -0.04em, ancho máximo 12ch.
- H2: clamp(2rem, 4vw, 4rem), line-height 1.1, weight 500, letter-spacing -0.03em.
- Texto: 18px/1.6, máximo 62ch. Etiquetas: 12px/1.4, mayúsculas y tracking 0.08em.
- El símbolo, la tipografía y el espacio aportan identidad. No añadir decoración o secciones fuera del plan.

## 7. Estructura de página y contenido

Orden obligatorio de la primera versión:

1. Header: logo a inicio, enlaces a servicios/proceso/empresa, selector ES/EN. En móvil, botón de menú accesible. Enlace a proyectos solo cuando existan casos publicados.
2. Hero: A protagonista, H1, descripción y CTA `Conoce Aetherys` hacia #empresa. Escritorio: texto en 6 columnas y escena en 6; móvil: texto primero, símbolo debajo. Min-height calc(100svh - 80px), permitiendo crecer con el contenido.
3. Servicios (#servicios): cuatro bloques: Desarrollo web; Plataformas SaaS y sistemas a medida; Integración de IA; Modernización de sistemas. Dos columnas en escritorio, una en móvil. Describir beneficios comprensibles, sin jerga innecesaria.
4. Proceso (#proceso): Entendemos; Diseñamos; Desarrollamos; Lanzamos y acompañamos. Cuatro columnas en escritorio, dos en tablet, una en móvil. Sin plazos ni condiciones de soporte inventados.
5. Empresa (#empresa): colaboración cercana, calidad y comunicación. No mostrar perfiles ficticios. Añadir integrantes solo con datos reales.
6. Proyectos (#proyectos): reservado para fase posterior. Lista vacía por defecto; sección y enlaces ausentes si no hay casos. No publicar tarjetas vacías, lorem ipsum ni demos como clientes reales.
7. Contacto (#contacto) y footer: datos verificados. Si falta el correo, documentar bloqueo de publicación; no usar mailto falso ni formulario sin destino. En desarrollo se puede ocultar la acción pendiente.

Copy de portada propuesto, pendiente de aprobación editorial final:

- ES H1: `Tecnología a la medida de lo que imaginas.`
- ES descripción: `Diseñamos y desarrollamos sitios web, plataformas y soluciones con IA. Te acompañamos desde la primera idea hasta su puesta en marcha.`
- EN H1: `Technology tailored to what you imagine.`
- EN descripción: `We design and build websites, platforms, and AI solutions. We work with you from the first idea through launch.`
- CTA EN: `Meet Aetherys`.

Todo texto visible, etiquetas accesibles y metadatos debe estar en diccionarios ES/EN con claves equivalentes. No traducir de manera improvisada durante una tarea de UI: el plan debe proporcionar ambas cadenas.

Primera versión: una página; idioma persistido mediante `?lang=es|en`, conservando otros parámetros/hash; valor inválido => es. Actualizar document.documentElement.lang. Rutas indexables /es/ y /en/ y prerenderizado quedan para una tarea SEO específica antes de lanzamiento si se requieren; no afirmar que metatags en cliente equivalen a HTML prerenderizado.

## 8. Contrato de animación

| Elemento | Implementación exacta inicial |
| --- | --- |
| Aparición del hero | GSAP: y 24px → 0, opacity 0 → 1, 0.7s, power2.out; stagger 0.1s entre H1/descripción/CTA |
| Entrada de secciones | ScrollTrigger start `top 85%`, una vez; y 24px → 0 y opacity 0 → 1, 0.6s, power2.out; stagger máximo 0.08s |
| Scroll suave | Una instancia Lenis, duration 1.0, smoothWheel true, syncTouch false; solo escritorio con pointer:fine y sin reduced-motion |
| Hero al salir | ScrollTrigger desde `top top` hasta `bottom top`, scrub 0.6; grupo del modelo scale 1 → 0.90, rotation.y 0 → 0.20rad. Sin fijar/pin en MVP |
| Movimiento ambiental | Grupo hijo del modelo: y = sin(t * 0.8) * 0.04 unidades; giro Y = sin(t * 0.35) * 0.06rad. Sin vueltas completas |
| Respuesta al puntero | Solo escena visible y pointer:fine; rotación X/Y adicional limitada a ±0.08rad; amortiguación independiente del frame rate |
| Botones | CSS 180ms ease-out: translateY(-2px) en hover; regreso al salir. Foco visible sin depender de hover |
| Tarjetas de servicios | CSS 220ms ease-out: borde blanco 14% → 35%; sin movimiento 3D ni cambios de altura |
| Tarjetas de proyectos futuras | Imagen scale 1 → 1.06; clip-path inset(0 round 8px) → inset(12px round 8px); 650ms cubic-bezier(.22,1,.36,1). Metadatos y 12px → 0, 300ms. Información esencial siempre visible |
| Menú móvil | opacity y translateY(-8px → 0), 180ms; aria-expanded, Escape, retorno de foco; si es modal, foco contenido e inert en el fondo |

- Integración Lenis/GSAP: un único conductor RAF para Lenis (ticker GSAP, convirtiendo segundos a ms), `lenis.on('scroll', ScrollTrigger.update)`. No activar autoRaf además del ticker.
- En desmontaje: quitar callbacks, destruir Lenis y revertir contextos/timelines propios. React StrictMode no debe duplicar listeners ni instancias.
- No animar el mismo transform desde CSS y GSAP a la vez. En 3D separar grupos padre (scroll), hijo (ambiente) e hijo (puntero).
- Actualización 3D con useFrame/refs; prohibido setState en cada frame.
- Reduced motion: sin Lenis, parallax, flotación ni animaciones ligadas al scroll; contenido visible y logo estático. Responder a cambios de preferencia durante la sesión.
- Touch: sin dependencia de hover; metadatos visibles, scroll nativo, logo estático en MVP.
- Contenido visible por defecto; ocultarlo para entradas solo una vez inicializado el efecto. Fallos de animación no deben dejar texto invisible.
- No cursor personalizado, audio automático, scroll horizontal, preloaders artificiales, showreel ni transiciones entre páginas en la primera versión.

## 9. Escena 3D y assets

- Una única escena Canvas en el hero; carga diferida mediante React.lazy/Suspense y fallback estático con dimensiones reservadas.
- Geometría de la A desde SVG aprobado o GLB verificado. Si no existe, usar el logo real estático y registrar el pendiente; no fabricar una forma supuestamente equivalente.
- Material inicial: MeshStandardMaterial, color grafito, metalness 0.85, roughness 0.30. Fondo transparente sobre grafito.
- Luces blancas cálidas y borgoña; reflejos mediante geometría/luces locales de Drei. Sin HDRI remoto, bloom, postprocesamiento ni sombras dinámicas en MVP.
- Cámara inicial: perspective fov 35, position [0,0,5]; centrar modelo y normalizar su dimensión mayor a 2.4 unidades. Ajustar solo si el plan identifica encuadre y valores sustitutos.
- Canvas con DPR limitado a [1,1.5]. Pausar frames cuando sale del viewport o document.hidden; render bajo demanda cuando no hay movimiento.
- Fallback si WebGL no está disponible, falla el contexto o el asset no carga. El texto y CTA no dependen del Canvas.
- Objetivos iniciales: modelo <=1MB, <=50k triángulos; ninguna textura >1024px sin motivo documentado. Son presupuestos a medir, no resultados garantizados.
- Logo vectorial en public/brand/aetherys-mark.svg; fallback en public/brand/aetherys-mark.webp; modelo opcional en public/models/aetherys-mark.glb. Crear solo cuando existan assets válidos.
- No descargar ni reutilizar recursos de Metabole. No generar splash arts ni comprar assets sin tarea explícita.

## 10. Organización objetivo del código

Crear progresivamente según las tareas, no carpetas vacías en masa:

```text
src/
  App.tsx                     composición de página
  main.tsx                    entrada React
  index.css                   Tailwind, tokens y estilos base
  components/layout/          Header, Footer, MobileMenu
  components/ui/              Button, Container, SectionHeading
  sections/                   Hero, Services, Process, About, Contact
  features/hero/              HeroScene, AetherysMark, HeroFallback
  features/projects/          solo al implementar casos reales
  content/                    es.ts, en.ts, projects.ts, types.ts
  hooks/                      useReducedMotion, useSmoothScroll
  lib/                        motion.ts (constantes), locale.ts
public/brand/
public/models/
docs/plans/                   especificaciones del planificador
docs/tasks/                   contratos pequeños para ejecución
docs/verification/            evidencia y bloqueos por entrega
```

Una sola fuente de tokens y diccionarios. No dispersar colores literales ni copias de contenido entre componentes. Evitar abstracciones genéricas que solo tengan un consumidor salvo frontera clara como la escena diferida.

## 11. Planificador caro / ejecutor económico

La asignación la hace el propietario en OpenCode. Nombres como Kimi K3 y Qwen 3.8 Max son ejemplos proporcionados por él, no IDs de proveedor verificados.

### PLANIFICADOR

- Modelos caros/complejos SOLO analizan y planean. Pueden leer el repo, ejecutar diagnósticos no destructivos y escribir planes/tareas. No implementan código de producción, instalan paquetes ni corrigen archivos de aplicación.
- Leer únicamente este contrato, el estado Git y los archivos relevantes. Convertir el objetivo en tareas pequeñas, ordenadas y con dependencias explícitas.
- Registrar decisiones en docs/plans/NNN-tema.md; contratos ejecutables en docs/tasks/NNN-tema.md. No crear estos archivos hasta que exista trabajo solicitado.
- Resolver antes de delegar todos los detalles visuales, funcionales y técnicos relevantes. Prohibidas instrucciones como «hazlo premium», «mejora el diseño» o «usa tu criterio» sin valores y resultados verificables.
- Especificar rutas exactas, nombres de exports/props, cadenas ES/EN, tokens, medidas por breakpoint, assets, animaciones, estados de error/carga, cleanup y criterios de aceptación.
- Planificar una tarea normal para 1–4 archivos de aplicación. Si exige más, dividir por fronteras funcionales o justificar en el plan.

### EJECUTOR

- Modelos económicos implementan UNA tarea cuyo estado sea READY y cuyas dependencias estén completas.
- Leer AGENTS.md, esa tarea y los archivos necesarios. No replanificar el sitio ni navegar por referencias por iniciativa propia.
- Ejecutar exactamente el contrato: sin libertad para cambiar colores, copy, layout, librerías, nombres de componentes, assets, tiempos o arquitectura.
- Puede tomar decisiones mecánicas locales que no cambien el contrato (por ejemplo nombres de variables internas). No puede llenar decisiones de producto ausentes.
- Si falta un dato necesario, hay conflicto o la implementación exige salir del alcance: marcar BLOCKED, indicar archivo/decisión y devolver al planificador. Continuar solo subtareas independientes ya especificadas.
- No sustituir assets faltantes por arte inventado. No ocultar errores, desactivar lint, usar ts-ignore o any para pasar verificaciones.
- Máximo dos intentos de corregir el mismo fallo dentro del alcance; después devolver evidencia y causa probable, sin ciclos de cambios especulativos.
- No modificar el plan para justificar divergencias propias. Registrar resultado y pruebas en la tarea/evidencia.

### Plantilla obligatoria de tarea

```text
ID / título / estado: DRAFT | READY | IN_PROGRESS | BLOCKED | DONE
Objetivo observable:
Dependencias y precondiciones:
Archivos que se pueden crear/modificar:
Archivos que hay que leer:
Fuera de alcance:
Contrato de datos, exports y props:
Copy exacto ES/EN:
Assets exactos y fallback:
Layout por breakpoint (dimensiones/espaciado):
Tokens y tipografía:
Interacción (evento, estado inicial/final, tiempo, easing):
Accesibilidad / reduced-motion / errores / cleanup:
Pasos numerados de implementación:
Comandos y verificaciones visuales aplicables:
Criterios de aceptación binarios:
Condiciones de bloqueo:
Entrega: archivos cambiados, resultado de checks, evidencia, pendientes.
```

El planificador debe completar los campos aplicables y marcar explícitamente N/A los demás. Una tarea con decisiones pendientes no puede ser READY. DONE exige cumplir los criterios, no solo terminar de editar.

## 12. Secuencia de implementación

1. Confirmar asset del logo, definir SVG/fallback y cerrar el diseño de portada. Puede avanzar contenido/tokens mientras se espera el vector.
2. Base: tokens, layout responsive, diccionarios ES/EN y navegación.
3. Portada estática y contenido de servicios/proceso/empresa.
4. Prototipo 3D: carga, material, encuadre y fallback. Validar antes de extender movimiento.
5. Animaciones especificadas, accesibilidad y adaptación móvil.
6. Contacto real, metadatos, estrategia SEO acordada y verificaciones de lanzamiento.
7. Posteriormente: casos de estudio reales. CMS, blog, showreel o más 3D solo con alcance nuevo.

## 13. Verificación: comandos y criterios

Ejecutar desde la raíz real. No inventar resultados ni usar un servidor arrancado como evidencia de que el sitio funciona.

Para cambios de código/configuración al cerrar una tarea:

```sh
pnpm lint
pnpm build
git diff --check
```

Formato: `pnpm exec prettier --check <archivos-modificados>` con rutas concretas. Prettier aún no tiene configuración propia; la primera tarea de tooling debe fijar semicolons false, singleQuote true, trailingComma all, tabWidth 2 y printWidth 100. No reformatear todo el repo por un cambio pequeño. Si se usa la configuración por defecto antes de esa tarea, informar discrepancias previas sin mezclarlas con cambios ajenos.

Para inspección visual local:

```sh
pnpm dev --host 127.0.0.1
# Para inspeccionar el build ya generado:
pnpm preview --host 127.0.0.1
```

- Usar la URL/puerto real que devuelve el comando. Detener solo procesos iniciados por el agente.
- Tras cambios visuales: comprobar 390x844 y 1440x900; añadir 768x1024 cuando cambie comportamiento de tablet. Capturar una vista representativa por breakpoint relevante.
- Revisar consola sin errores, assets sin 404, ausencia de overflow horizontal y contenido sin solapamientos.
- Comprobar ES/EN, actualización de lang, navegación/anclas, menú con teclado/Escape/foco y enlaces reales.
- Comprobar reduced-motion, touch sin hover, fallback 3D y contenido visible con fallo de la escena.
- Texto normal: contraste mínimo 4.5:1; texto grande y controles según WCAG AA. Objetivo táctil mínimo 44x44px.
- Al incorporar 3D: comprobar pausa fuera de pantalla, ausencia de múltiples loops tras montaje/desmontaje y rendimiento en dispositivo real cuando esté disponible.
- Antes de publicar: medir build con Lighthouse o herramienta equivalente. Objetivos orientativos: LCP <=2.5s, CLS <=0.1; INP <=200ms requiere medición adecuada de interacciones/campo. Registrar entorno y resultados; no prometer puntuaciones ni confundir pruebas de laboratorio con datos de usuarios.
- No instalar un framework de tests para cambios de copy/estilo. Para lógica no trivial, el plan debe definir pruebas de comportamiento y herramienta antes de ejecutar.
- Cambio solo documental: revisar exactitud, rutas y `git diff --check`; no ejecutar build/lint sin motivo.
- Un check no ejecutado se reporta como NO EJECUTADO con causa. Un check fallido se reporta como FALLÓ. Nunca marcar como aprobado por inspección visual del código.

## 14. Ahorro de tokens y control del alcance

- Leer este archivo una vez por sesión; después solo tareas y fragmentos que cambiaron. Tras compactación, recuperar el resumen de la tarea y verificar el diff.
- Usar `rg` y lecturas por rango. Excluir node_modules, dist, .git, lockfile completo y binarios de exploraciones generales.
- Consultar package.json para dependencias; abrir secciones del lockfile solo por un problema de resolución.
- Agrupar búsquedas independientes; limitar salida al error relevante. No volcar archivos largos ni logs repetidos.
- No volver a analizar Metabole durante cada tarea. Este documento conserva la referencia; investigar de nuevo solo si una tarea exige un comportamiento no especificado.
- No delegar subagentes ni abrir trabajos paralelos automáticamente. El reparto planificador/ejecutor es secuencial, salvo solicitud explícita del propietario.
- No pedir al modelo caro que escriba o revise cada línea: escalar decisiones, conflictos y fallos reproducibles. El ejecutor verifica con herramientas.
- Una sola ronda de checks por lote coherente; repetir únicamente checks afectados después de una corrección.
- No mantener explicaciones duplicadas entre README, planes y este archivo. Referenciar por ruta/sección.
- Handoff máximo orientativo de 12 líneas: ID, estado, archivos, decisiones, checks, bloqueo y próximo paso. Sin transcribir el historial de conversación.
- Reducir contexto y repetición; nunca ahorrar tokens omitiendo criterios, inventando resultados o dejando trabajo autorizado incompleto.

## 15. Pendientes del propietario / bloqueos de publicación

- SVG original o aceptación de una reconstrucción fiel del logo.
- Correo, dominio y redes reales.
- Integrantes/roles/fotos, si se mostrarán.
- Alcance real del acompañamiento y soporte.
- Aprobación editorial de textos y traducción.
- Proyectos y material autorizado, en fase posterior; su ausencia no bloquea una primera web corporativa sin esa sección.
- Tipografía definitiva, si se desea sustituir la pila de sistema.

No preguntar otra vez por datos ya aportados. Avanzar las tareas independientes mientras se resuelven pendientes; no publicar con enlaces ficticios ni información sin validar.
