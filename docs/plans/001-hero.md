# 001 — Hero sin escena 3D

Alcance autorizado: petición actual del propietario de crear únicamente el hero. Se implementa directamente esta entrega; no se delega ni se publica. La petición actual de implementación prevalece sobre el reparto de modelos de AGENTS.md §11.

Referencia consultada: https://metabole.studio/en. Se adopta la jerarquía editorial y el espacio negativo descritos en AGENTS.md §4, sin reutilizar recursos.

El repositorio contiene la plantilla Vite. `src/assets/hero.png` es un recurso de esa plantilla. El PNG temporal del logo existe, pero incorpora fondo azul; se reserva hasta disponer del asset válido. La cabecera muestra el nombre textual Aetherys, sin inventar un símbolo.

## Decisiones de esta entrega

- Solo cabecera mínima y hero: sin navegación a secciones inexistentes, menú vacío ni footer de sitio.
- ES/EN visible en todos los tamaños. Idioma mediante URL, preservando query y hash; historial del navegador sincronizado.
- Variante temporal sin escena: H1 en las seis primeras columnas y descripción en las columnas 8–12, dejando una columna de aire en la mitad derecha y alineada con la base del título. En móvil y tablet se apilan; en tablet la descripción ocupa las columnas 4–8. Al incorporar la escena se recuperará la distribución de AGENTS.md §7.
- CTA `Conoce Aetherys` / `Meet Aetherys` reservado en el diccionario y oculto hasta que exista `#empresa`. No se crea una sección extra ni un enlace sin destino.
- Se conservan exactamente la tipografía, cuatro tokens y medidas base de AGENTS.md §6. Cabecera de 80px; hero min-height calc(100svh - 80px); padding vertical 48/64/64px.
- Retícula decorativa de 4/8/12 columnas, gaps 16/24/24px. Tres líneas principales de retícula visibles al 6%, sin eventos.
- Eyebrow encima del H1 y una lista tipográfica de capacidades en el borde inferior del hero. No son tarjetas ni una sección de servicios.
- Entrada GSAP en H1/descripción, valores de §8. Reduced motion dinámico; cleanup con matchMedia.revert. Sin Lenis: no hay recorrido entre secciones que justifique activarlo aún.
- No dependencias nuevas. Se fija Prettier según §13.

Una tarea abarca cuatro archivos de aplicación (App, Hero, contenido y CSS). También elimina el CSS de plantilla ya no usado, limpia los metadatos iniciales de index.html y añade la configuración de formato; estas excepciones evitan dejar estilos/metadatos de Vite en la portada.

## Copy aprobado para ejecución, pendiente de aprobación editorial final

Las cadenas de H1, descripción y CTA son las de AGENTS.md §7. Cadenas adicionales ES / EN:

| Clave             | ES                                                  | EN                                              |
| ----------------- | --------------------------------------------------- | ----------------------------------------------- |
| brand             | Aetherys                                            | Aetherys                                        |
| home              | Aetherys — inicio                                   | Aetherys — home                                 |
| skip              | Ir al contenido                                     | Skip to content                                 |
| language          | Idioma                                              | Language                                        |
| spanish           | Cambiar a español                                   | Switch to Spanish                               |
| english           | Cambiar a inglés                                    | Switch to English                               |
| eyebrow           | Desarrollo de software a medida                     | Custom software development                     |
| capabilitiesLabel | Lo que creamos                                      | What we build                                   |
| capabilities      | Desarrollo web; Plataformas SaaS; Integración de IA | Web development; SaaS platforms; AI integration |
| title             | Aetherys — Software a medida                        | Aetherys — Custom software                      |

Las abreviaturas ES/EN se incluyen también en el diccionario. Meta description toma la descripción del hero. HTML inicial en español y título Aetherys; los metadatos traducidos se actualizan en cliente, sin afirmar prerenderizado.

## Verificación

Lint, build, Prettier sobre rutas concretas y diff --check. Navegador real automatizado mediante Chromium/CDP o herramienta disponible, sin instalar paquetes: capturas 390×844, 768×1024 y 1440×900; ES/EN, URL e historial, reduced motion dinámico, teclado, overflow, errores de consola/red y contraste. Registrar limitaciones reales en docs/verification/001-hero.md.
