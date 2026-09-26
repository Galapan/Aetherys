# 001 — Evidencia del hero

Implementación terminada. Cierre de verificación pendiente de revalidar el favicon y la activación del selector por teclado: la ejecución adicional de Chromium fue denegada por el usuario. No se volvió a intentar por otra vía.

## Entrega

- Hero y cabecera mínima responsive, ES/EN, URL e historial, metadatos de cliente, entrada GSAP y reduced motion dinámico.
- Los archivos originales de planificación y contrato se retiraron al adoptar el handoff conversacional descrito en AGENTS.md §11; esta ficha conserva la evidencia histórica de verificación.
- Sin escena ni logo reconstruido. CTA reservado hasta que exista #empresa. Sin nuevas dependencias, commits ni publicación.
- Preview de desarrollo iniciado por el agente: http://127.0.0.1:5174/. El puerto 5173 estaba ocupado y no se modificó su proceso.

## Checks

| Comprobación                                             | Resultado                                                       |
| -------------------------------------------------------- | --------------------------------------------------------------- |
| pnpm lint                                                | PASÓ                                                            |
| pnpm build                                               | PASÓ; repetido tras ajuste del favicon                          |
| Prettier sobre los archivos modificados                  | PASÓ                                                            |
| git diff --check                                         | PASÓ                                                            |
| 390×844, 768×1024, 1440×900, ambos idiomas               | PASÓ; seis capturas inspeccionadas                              |
| Overflow horizontal y solapamiento título/descripción    | PASÓ; scrollWidth coincide con viewport                         |
| Selector, lang, title, URL con query/hash                | PASÓ                                                            |
| Historial atrás/adelante, valor inválido → es            | PASÓ                                                            |
| Tab: skip link, foco visible; Enter: foco en main        | PASÓ                                                            |
| Controles de idioma 44×44px                              | PASÓ                                                            |
| Activación del selector por Enter                        | NO EJECUTADO; comprobación adicional denegada                   |
| Reduced motion inicial y cambio durante animación        | PASÓ; opacity 1, transform none                                 |
| Touch emulado a 390px                                    | PASÓ; contenido visible sin depender de hover                   |
| Consola: excepciones JS y console.error                  | No registradas durante la ronda inicial                         |
| Red sin 404                                              | FALLÓ inicialmente: favicon.ico; se añadió favicon vacío data:, |
| Red tras corregir favicon                                | NO EJECUTADO; comprobación adicional denegada                   |
| Contraste principal/secundario sobre grafito             | PASÓ: 16.96:1 / 10.47:1, cálculo sRGB                           |
| Dispositivo físico / Lighthouse / pruebas de lanzamiento | NO EJECUTADO; fuera de esta entrega                             |
| Fallback WebGL / pausa 3D / menú                         | N/A; no existen en este alcance                                 |

Los comandos de servidor y Chromium necesitaron ejecución fuera del sandbox por bloqueo de sockets. La ronda inicial se autorizó; el seguimiento posterior no. El build es comprobación de compilación, no evidencia de navegador del último cambio de favicon.

## Capturas y datos

- [Escritorio ES](hero-1440-es.png), [EN](hero-1440-en.png).
- [Tablet ES](hero-768-es.png), [EN](hero-768-en.png).
- [Móvil ES](hero-390-es.png), [EN](hero-390-en.png).
- [Resultados originales de Chromium/CDP](hero-browser-checks.json), incluido el 404 inicial.

Pendientes de producto: símbolo oficial preparado para web, CTA cuando se implemente Empresa y aprobación editorial. Los bloqueos generales de publicación siguen en AGENTS.md §15.
