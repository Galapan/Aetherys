# Selector de idioma solo en el menú

Solicitud: quitar ES/EN de la barra principal y mostrarlo únicamente al abrir el
menú animado. Eliminada la instancia de LanguageSwitch del header en
`src/components/layout/Navbar.tsx`. Se conserva la instancia dentro del panel,
su animación existente, sus etiquetas ES/EN y su funcionamiento con reduced-motion.

Lint, build, Prettier del archivo modificado y git diff --check: APROBADOS.
Build conserva el aviso de tamaño de la escena 3D diferida.
Verificación visual: NO EJECUTADA; se respeta la denegación previa del navegador.
