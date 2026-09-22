# 002 — Hero y menú próximos a Metabole

Petición actual: acercar hero, animaciones y menú a https://metabole.studio/en conservando las bases de Aetherys. Sustituye las decisiones compositivas del plan 001. Se mantiene la exclusión previa del logo 3D.

## Inspección y adaptación

Se inspeccionaron hero y menú abiertos a 1440×900. La referencia sitúa el H1 cerca del borde inferior izquierdo, capacidades en el centro, retícula vertical y menú claro casi a pantalla completa con navegación de gran tamaño. No se reutilizan assets, textos, fuente ni código. Las duraciones siguientes son decisiones para Aetherys, no mediciones de la referencia.

- Conservar tokens, contenedor 1440px, padding 20/32/64px, columnas 4/8/12, gaps 16/24/24 y tipografía de AGENTS.md.
- Cabecera 80px, sin línea inferior; nombre a izquierda, idioma y botón Menú a derecha. Menú disponible en todos los tamaños.
- Hero min-height calc(100svh - 80px), tres filas: espacio superior flexible min 96px; capacidades centradas con margen vertical 48px; contenido inferior y pie. H1 seis columnas, descripción cinco a derecha con separación de una columna. En móvil/tablet contenido apilado; H1 conserva max-width 12ch y clamp original.
- Retícula a altura completa con cuatro líneas interiores y dos exteriores en escritorio, dos interiores en tablet y una en móvil; opacidad 6%. Sin figuras nuevas que sustituyan el logo.
- Encabezado sobre descripción: / EMPRESA (ES), / ABOUT (EN). Capacidades existentes reciben id servicios; descripción id empresa. Son destinos reales dentro del hero, no nuevas secciones. Menú: Inicio / Servicios / Empresa, sin Proceso, proyectos, contacto, redes o direcciones aún inexistentes.
- CTA original, fondo borgoña, enlaza ahora al bloque empresa real del hero. Flecha diagonal CSS decorativa; foco 2px/4px; altura 48px; hover y -2px en 180ms.
- Entrada hero GSAP: H1, descripción y CTA y24→0, opacity0→1, 0.7s power2.out, stagger0.1; capacidades opacity0→1 en0.6s. Texto visible por defecto y sin scroll/parallax ni Lenis en esta portada.
- Menú dialog modal nativo: panel blanco cálido, grafito, padding32/48/64; margen16/24/32; max-height calc(100dvh - margen×2), scroll vertical si hace falta. Header logo/cerrar, cuerpo enlaces a izquierda y descripción/capacidades a derecha, pie idioma. Mobile una columna y enlaces clamp(2.75rem,6vw,6rem).
- Apertura GSAP: clip-path inset(0 0 100% 0)→inset(0), 0.55s power3.inOut; enlaces y24→0 y opacity0→1 en0.5s, stagger0.08 desde0.15s. Cierre reverso a1.5×velocidad. SVG/iconos de menú no necesarios: dos líneas CSS transformadas en cruz en botón cerrar.
- Reduced motion dinámico: sin entrada ni transición de menú; revert al cambiar preferencia; cerrar inmediatamente si el cambio ocurre durante cierre. Escape, foco contenido/inert nativos, foco devuelto al disparador al cerrar; selección navega y enfoca el destino. Scroll body bloqueado solo mientras modal abierto y restaurado al desmontar. Cleanup de media/timeline.

## Copy adicional exacto ES / EN

| Clave         | ES                   | EN              |
| ------------- | -------------------- | --------------- |
| menu          | Menú                 | Menu            |
| openMenu      | Abrir menú           | Open menu       |
| closeMenu     | Cerrar menú          | Close menu      |
| close         | Cerrar               | Close           |
| navigation    | Navegación principal | Main navigation |
| homeLabel     | Inicio               | Home            |
| servicesLabel | Servicios            | Services        |
| aboutLabel    | Empresa              | About           |

Las otras cadenas permanecen en src/content/hero.ts. No inventar ubicación, horario, premios ni proyectos.

## Tareas secuenciales

002-A: contenido/hero.ts, sections/Hero.tsx e index.css (incluye estilos del menú para compartir tokens). 002-B: components/layout/Header.tsx, LanguageSwitch.tsx y App.tsx. Sin dependencias nuevas. Verificar lint/build/prettier/diff, capturas en390×844,768×1024,1440×900, ambos idiomas, apertura/cierre/Escape/Tab/foco/idioma/enlaces/overflow/reduced motion. Usar el navegador integrado autorizado; no repetir comandos de navegador denegados en la entrega anterior.
