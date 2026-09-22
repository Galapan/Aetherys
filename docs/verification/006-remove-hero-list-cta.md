# 006 — Eliminar lista de servicios y CTA

Solicitud explícita: quitar Desarrollo web / Plataformas SaaS / Integración de IA y Conoce Aetherys. Eliminadas lista y CTA en ambos idiomas, sus cadenas y estilos exclusivos; el espacio superior y la entrada se conservan. El destino #servicios pasa al párrafo existente que describe servicios para preservar la navegación. Sin nuevas secciones.

Archivos: Hero.tsx, App.tsx (prop sin uso eliminada), content/hero.ts e index.css.

Checks: lint, build, Prettier de los cuatro archivos y git diff --check APROBADOS. Navegador: DOM sin listas ni enlaces CTA en hero; 390×844 sin overflow. Capturas390 y1440 en esta carpeta. No se cambiaron dependencias ni se publicó.
