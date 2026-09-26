# 004 — Movimiento según las dos nuevas grabaciones

Solicitud explícita más reciente: analizar los vídeos locales 17-11-56 (navbar) y 17-15-27 (entrada), reproducir sus animaciones, reducir menú a secciones/proyectos, usar Framer Motion para todas las animaciones de ahora en adelante. Sustituye las decisiones de movimiento anteriores y AGENTS.md §5/8 en este alcance. No añadir contacto, 3D ni proyectos inventados.

## Observación y adaptación

Navbar: la página se compacta con margen exterior, se desenfoca durante transición y el fondo claro aparece mediante fundido; filas de navegación reveladas desde abajo. No existe barrido vertical del panel. Cierre oculta filas, desvanece fondo claro y recupera tamaño/nitidez de página. Grabación permite estimar apertura alrededor de 1s; valores siguientes son adaptación, no medición exacta del código original.

Entrada: título entra mediante máscara, permanece legible, se comprime al centro; una pequeña cruz gira, desaparece y abre las columnas desde centro hacia extremos. Secuencia visible de referencia aproximadamente 5–6s.

## Contrato

- Toda animación activa y hover usa Framer Motion; eliminar imports/uso de GSAP y transiciones CSS de la UI actual. Mantener dependencias preexistentes sin desinstalaciones ajenas. Respetar reduced motion dinámico mediante useSyncExternalStore/matchMedia propio: el hook de la versión instalada de Motion toma solo valor inicial.
- App: estado menuOpen y preferencia reducida. Superficie scale1→.94, y0→3svh, filter blur0→4px en .65s cubic-bezier(.76,0,.24,1). Origen top center; marco dark-gray. Al cerrar demora .12s y duración .65s. Sin efecto blur estático en menú ni glassmorphism.
- Dialog modal nativo transparente, inset0, dimensiones viewport; panel inset16/24/32px, fondo warm-white, grafito. Panel opacity0→1 .5s desde .22s; cierre opacity1→0 .4s desde .12s. Sin recorte ni desplazamiento del panel. Información en máscaras y105%→0, .55s ease(.22,1,.36,1), delays .38/.46/.54 para links; cierre y105% .3s, stagger .035. Header/labels opacity/y .45s desde .32s. Modal se cierra cuando termina su salida; scroll/foco restaurados. Interrupción de apertura permitida; estado no se duplica.
- Menú: cabecera Aetherys + cerrar; ES/EN al pie; cuerpo dos columnas iguales en >=768, una en móvil. A izquierda etiqueta Secciones / Sections y enlaces Inicio/Home, Servicios/Services, Empresa/About a destinos reales. A derecha solo título Proyectos / Projects y espacio libre reservado min-height160px; sin tarjetas, enlaces, contador, clientes ni texto de relleno. Eliminar descripción, capacidades, CTA y pie del menú. Reserva explícita autorizada por usuario, sin publicar sección de proyectos vacía en hero.
- Entrada total 5.4s: letras Aetherys y110%→0 .65s escalonado .035 desde .15; título legible hasta1.7; compresión scaleX1→.035 + opacity1→0 entre1.7–2.3. Cruz decorativa 12px aparece2.2–2.4, gira0→180deg hasta3.1, desaparece3.2–3.45. Cortinas pares superiores/inferiores y0→±101%, comienzan3.55, duration1.35 ease(.76,0,.24,1), delay distancia al centro×.10; 8 columnas escritorio/tablet,4 móvil. Cortina completa se oculta5.4s. Contenido entra4.0s, .8s, stagger.1. Sin eventos interceptados; foco o apertura menú cancela intro mostrando contenido inmediatamente. Idioma no reinicia entrada. Reduced motion o activación dinámica cancela y deja todo visible; no reiniciar al desactivarla.
- Fuente, colores y composición hero se conservan. Entrada título 32px desktop /26px móvil, peso500, color borgoña sobre warm-white; cruz decorativa no sustituye logo.
- Hovers Motion: botones y-2 en.18s; enlaces menú x8 en.22s solo pointer fine/hover. Sin hovers necesarios para acceder al contenido.

## Implementación y verificación

Fronteras secuenciales: A) hooks/useMotionPreferences.ts, content/hero.ts, App.tsx; B) Header.tsx y CSS; C) Hero.tsx, LanguageSwitch.tsx. Más de4 archivos justificados por migración explícita de todas las animaciones y preferencia compartida. Ninguna dependencia nueva adicional.

Lint/build/prettier/diff; navegador390×844/768×1024/1440×900; ambos idiomas; foco,Tab,Escape,anclas,cierre temprano,scroll,overflow; capturar entrada/menu. Prueba reducida/touch real solo si herramienta soporta; registrar límites. No marcar checks no ejecutados como aprobados.

El menú final y su encapsulación quedan sustituidos por `005-navbar-portfolio.md`, tras nueva solicitud del propietario. La entrada y preferencia de Framer Motion permanecen vigentes.
