# 005 — Navbar basado en PortafolioGalapan

Petición actual: usar `/home/galapan/Projects/portafolio/PortafolioGalapan` como base, pulir navbar y separarlo como componente. Leídos Navbar.tsx, NavigationScene.tsx, CompactMenu.tsx, config.ts, useMobileNavigation.ts, useMenuDialog.ts y easing. El proyecto de referencia permanece sin cambios.

- `Navbar` independiente con children, NavigationProps y reducedMotion. Encapsula estado, congelación del viewport, cabecera, modal y transiciones; App no controla el menú.
- Capturar scrollY, innerHeight, clientWidth y documentHeight al abrir. Mantener altura exterior; escena fixed/inset0/overflow hidden con contenido trasladado -scrollY. Congelar hasta terminar cierre; restaurar scroll antes de navegar/enfocar.
- Margen igual en los cuatro lados: min(32,max(16,width*.042)); scaleX1-2gap/width, scaleY1-2gap/height; origen center. Duración .7s ease[.16,1,.3,1]; vuelta .7s con delay.12. Sin blur de la página.
- Cabecera real se oculta mientras dura snapshot; cabecera modal se desplaza desde coordenadas originales hasta gap+min(80,height*.08), con laterales gap*2. Sigue visible al cerrar; etiqueta Menú/Cerrar se funde con blur6px: salida.28s, entrada.45s con delay.12. Movimiento fuera del recorte del panel.
- Panel con margin gap, y12→0, opacity0→1 .7s; fondo claro funde.4s desde.2. Al cerrar y12/opacity0 .7s desde.12 y fondo .32s desde.12. Mantener modal hasta.82s para completar recuperación.
- Filas: y110%/opacity0→0/1 .65s, delay inicial.35/stagger.075; salida y-30%/opacity0 .22. Secciones y espacio Proyectos; idioma al pie sin otra información. Paleta y textos004 conservados.
- Mobile y desktop mismo menú, no copiar contenido/colores ni restricción móvil del portafolio. Resize abierto actualiza geometría; Escape/foco contenido y restaurado, URL/hash e idiomas intactos. Reduced motion inmediato; intro004 se mantiene y cancela por interacción.
- Archivos: Navbar.tsx sustituye Header.tsx; App.tsx, Hero.tsx (eliminar acoplamiento al menú), index.css; documentación005. No nuevas dependencias.

Verificación: lint/build/formato/diff; desktop/mobile/tablet, abrir/cerrar temprano y repetido, foco/Escape/idioma/destinos, apertura tras scroll, geometría de márgenes, ausencia de overflow. Emulaciones no disponibles se documentan.

## Actualización 2026-10-27 — transición según la referencia y coste en móvil

Sustituye los tiempos de apertura/cierre anteriores; se mantiene la regla «sin blur de la página» (2026-10-27: el blur pintaba un halo claro alrededor de la tarjeta); el código (`menuMotion.ts`) es la autoridad sobre los valores.

- Apertura: primero la cabecera hace su secuencia en el sitio (ver Etiqueta y Contacto) y la escena espera .4s; después la página se encoge a tarjeta (.8s, ease [.16,1,.3,1]), sin desenfoque; el velo blanco cálido del panel funde .6s desde .1 tras esa espera, opaco al final (sin glassmorphism en reposo). Las filas suben enmascaradas como antes (.65s, delay .35 tras la espera, stagger .075).
- Al terminar de abrir, la página queda `visibility: hidden` bajo el panel opaco, para no seguir pintando videos o marquesinas; vuelve a ser visible al empezar a cerrar.
- Cierre (propietario, 2026-10-27: espejo de la apertura): primero la cabecera hace su secuencia en el sitio durante .4s; después secciones, proyectos, redes y pie bajan por su máscara una tras otra en el orden en que subieron (y 0→110%, .5s, ease-in, sin fundido; retardo .4 + (retardo de entrada − .35)·.3); cuando han salido, la escena (escala, velo, cabecera) vuelve en .6s desde 1s.
- La capa de cabecera con `mix-blend-difference` solo cubre la franja de la cabecera y no escala: la cabecera se desplaza a gap + offset*escala del escenario. La página nunca lleva `filter`.
- Etiqueta Menú/Cerrar (sustituye el fundido con blur 6px): ambas palabras comparten una celda enmascarada en vertical, tan ancha como la mayor, para que el cambio no mueva la cabecera. La palabra saliente salta hacia arriba fuera de la máscara (.14s, ease-in, al hacer clic) y la entrante sube desde abajo (.32s, ease [.16,1,.3,1]) a .32s, igual al abrir y al cerrar.
- Botón Menú/Cerrar sin icono (se eliminan las dos rayas y la X), solo «— MENÚ»/«— CERRAR» como la referencia. Sin hover en Menú, Cerrar ni Contacto (decisión del propietario, 2026-10-27).
- Anillo de foco: `main.tsx` guarda la última modalidad (`data-input` pointer/keyboard en `<html>`); el foco movido por script tras un clic o toque (menú, transiciones, anclas) no pinta el anillo. Con teclado se mantiene; los campos de texto lo conservan siempre.
- Enlace Contacto en la cabecera (tablet y escritorio; móvil solo Menú, como la referencia), entre el audio y Menú. Al abrir, su copia en la cabecera del menú se pliega hacia su centro (ancho y hueco del flex a 0, .26s desde .1, ease [.5,0,.15,1]) mientras el guion del audio se desliza hasta Cerrar. Al cerrar se despliega igual (.26s desde .1) antes de que vuelva la escena, y la copia termina sobre el enlace real. La copia no es enfocable: el menú ya lista Contacto.
