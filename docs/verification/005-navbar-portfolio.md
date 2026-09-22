# 005 — Verificación del Navbar independiente

## Resultado

Implementado `src/components/layout/Navbar.tsx`, sustituyendo Header.tsx. App solo compone Navbar/Hero y gestiona idioma/preferencias. La base leída en PortafolioGalapan se utilizó para congelación del viewport, escala independiente X/Y, movimiento de cabecera, etiqueta Menú/Cerrar y secuencias; no se modificó ese proyecto.

Entrada004 conservada: 5.4s, letras/título/comprensión/cruz/cortinas, todo en Motion. No GSAP en src. Contacto y 3D excluidos; menú solo secciones reales, espacio Proyectos e idioma.

## Checks ejecutados

- `pnpm lint`: APROBADO.
- `pnpm build`: APROBADO. JS 356.36kB /112.35kB gzip, CSS17.32kB /4.39kB gzip.
- Prettier sobre archivos de aplicación y documentos de entrega: APROBADO.
- `git diff --check`: APROBADO.
- Navegador integrado, servidor local http://127.0.0.1:5174/, React StrictMode: sin errores/warnings de consola en recorrido.
- 1440×900: superficie compacta x32,y32,w1376,h836; panel coincidente (diferencia subpíxel vertical del navegador). Cabecera movida a y104. Sin overflow.
- 768×1024, redimensionado con menú abierto: x32,y32,w704,h960; sin overflow de contenido.
- 390×844: margen ~16.38px en los cuatro lados; filas legibles, panel desplazable, sin overflow horizontal.
- Escape devuelve foco; Shift+Tab desde cerrar llega al último control; dialog nativo mantiene fondo inerte.
- Abrir y cerrar inmediatamente: finaliza sin bloqueo; múltiples ciclos sin estado residual.
- ES→EN dentro del menú actualiza texto/lang y conserva `check=005`; enlace About añade #empresa y enfoca destino.
- Prueba adicional390×600: abrir desde scrollY124.6896514892578 congela exactamente translateY(-124.69px). Tras Escape recupera scrollY124.6896514892578, foco Open menu, body overflow vacío y surface position relative.
- Capturas: 005-navbar-1440.png, 005-navbar-768.png, 005-navbar-390.png. El proveedor de capturas muestra escalado/recorte del borde derecho/inferior respecto al viewport CSS; las medidas DOM anteriores verifican ancho y márgenes reales.

## Límites

Reduced-motion dinámico implementado con suscripción a matchMedia; emulación en navegador NO EJECUTADA porque esta integración no expone ese control. Touch físico y rendimiento en dispositivo real NO EJECUTADOS: dispositivo no disponible. No se publicaron cambios ni se hicieron commits.

Instalación de Framer Motion autorizada anteriormente: el aviso de peers corresponde al React19.3.0 ya presente y @react-three/fiber9.7.0 (declara React<19.3). No se actualizaron esas dependencias; este hero no monta Three/Fiber.
