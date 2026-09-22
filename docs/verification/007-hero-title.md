# 007 — Hero centrado en el título

Petición: eliminar bloque Empresa/descripción y expandir el título. Hero sin ese bloque en ES/EN. H1 ocupa todas las columnas, max-width100%, tipografía clamp(3rem,8.5vw,8rem), líneas balanceadas. Metadescripción conservada: no aparece en la página.

Servicios/Empresa del navbar quedan reservados, sin href y con aria-disabled, porque ya no existen sus destinos; Inicio sigue operativo. No se añaden secciones.

Lint/build/Prettier/git diff --check: APROBADOS. Navegador1440×900: título y contenedor1312px, descripción ausente, sin overflow.390×844: sin overflow. Capturas007-hero-1440.png y007-hero-390.png. Entrada conservada; espera inicial del navegador excedió su timeout3s porque la animación dura5.4s, posterior inspección correcta.
