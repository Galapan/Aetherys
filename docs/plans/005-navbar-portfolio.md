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
