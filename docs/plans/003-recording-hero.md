# 003 — Hero según la grabación del propietario

Solicitud: implementar solo hero y navegación, entrada y apertura/cierre similares al vídeo local `screenrecording-2026-09-22_17-01-03.mp4`; excluir 3D y contacto. Esta petición actual autoriza la ejecución y sustituye las animaciones del plan 002 y AGENTS.md §8 en este alcance. No cambia dependencias, marca ni textos.

## Referencia observada

Fotogramas 4–10s: fondo claro, nombre centrado y apertura en columnas desde el centro, escalonada del centro a los extremos. 14.5–19.5s: menú claro con margen, aparición suave de superficie y textos en secuencia; cierre contrae/desvanece superficie y textos. No reutilizar el cursor, logo, datos, colores ni pausa de carga de la referencia.

## Decisiones de implementación

- Mantener composición responsive del hero 002, H1, descripción, capacidades, CTA real y ES/EN existentes. Contenedor/padding/retícula/tokens/tipografía de AGENTS.md.
- Entrada decorativa fija, aria-hidden y sin eventos: nombre Aetherys centrado en borgoña sobre blanco cálido. 8 columnas escritorio/tablet, 4 móvil. Cada columna tiene dos mitades claras que salen arriba/abajo con yPercent ±101. Duración .95s power3.inOut, escalonado .07s desde centro, comienza .3s; nombre sale y -12/opacity 0 en .24s. Sin espera de recursos, contador ni spinner. Ocultar al completar.
- Contenido entra a partir de .65s con y24/opacity0 a estado natural, .7s power2.out, stagger .1s. Capacidades .6s. CSS visible por defecto; overlay oculto por defecto y activado únicamente al iniciar GSAP. Entrada única por montaje; cambios de idioma no reinician. Preferencia reducida inicial o dinámica cancela/revierte y muestra contenido inmediatamente. Foco/menú abierto ocultan la cortina para permitir interacción inmediata.
- Menú conserva dialog modal, margen 16/24/32px y padding existentes. Sustituir recorte vertical por panel opacity0, y24, scale .97 a opacity1,y0,scale1 en .65s power3.out. Revelar filas dentro de máscaras: yPercent105 a0, opacity0 a1, .55s power3.out, stagger .07 desde .12s. Header/footer/about usan y16/opacity0, .4s desde .2s.
- Cierre: textos yPercent -35/opacity0 .2s, panel y-16,scale.985,opacity0 .4s power2.inOut, desde .08s. Escape o selección durante apertura cancela la entrada y cierra desde valores actuales. Reduced motion instantáneo. Enlaces reales, focus trap, retorno de foco, scroll lock/restauración y cleanup existentes se conservan. Cambiar preferencia durante cierre termina cierre.
- No agregar assets, secciones, paquetes ni datos. Referencia disponible localmente; no requiere navegación externa.

## Verificación

Lint/build/prettier/diff. Navegador integrado: 390×844,768×1024,1440×900, ES/EN, menú/CTA/Escape/Tab/retorno foco, URL e idioma, overflow y consola. Capturas representativas. No instalar herramientas; registrar como NO EJECUTADO cualquier emulación o captura no disponible.

## Corrección explícita del propietario: compactar la página y usar Framer Motion

La corrección más reciente sustituye la transición de menú anterior y autoriza añadir `framer-motion` (13.4.0 resuelto por pnpm); excepción expresa a AGENTS.md §5. GSAP sigue encargado únicamente de la entrada del hero. Framer Motion controla navbar/menú y la compactación.

- App incorpora una superficie que contiene header y hero. Al abrir: scale1→.94, y0→12, .55s cubic-bezier(.22,1,.36,1). Fondo exterior dark-gray, superficie grafito, origen center top; conserva altura y scroll. Sin blur.
- El dialog permanece en la capa modal nativa. Panel claro se despliega con clip-path inset(0 0 100% 0)→inset(0) en .6s desde .18s. Cabecera entra a .35s; enlaces desde .42s, stagger .08s, y105%→0, .55s; descripción/capacidades a .58s y pie a .66s. Sin contacto ni rutas falsas.
- Cierre: información y-20/opacity0 en .18s, panel se recoge en .42s tras .16s; página recupera escala y posición en .55s tras .25s. Dialog se cierra al terminar panel; restaura foco y scroll. Cierre temprano interrumpe objetivos actuales sin saltos.
- Reduced motion: valores finales instantáneos, sin compactación ni recorte animado. Preferencia reactiva mediante hook de Framer Motion. No se anima un transform desde CSS y Motion simultáneamente.
- Ampliación de archivos justificada por integración entre superficies: App.tsx (estado y superficie), Header.tsx (modal Motion), index.css (fondo/superficie), package.json/pnpm-lock.yaml (dependencia autorizada). Hero.tsx conserva entrada003.
- Verificar de nuevo lint/build/formato/diff y comportamiento real. Revisar aviso de peers de instalación sin actualizar dependencias ajenas.
