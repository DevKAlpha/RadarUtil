# Radar Útil

Prototipo funcional de una plataforma web para consultar oportunidades académicas, laborales, tecnológicas, eventos y beneficios.

## Entrega 2 - Front End

El proyecto incluye:

- HTML, CSS y JavaScript.
- Renderizado dinámico desde `data/oportunidades.json`.
- Búsqueda y filtros por categoría.
- Vista detallada de oportunidades.
- Favoritos almacenados con `localStorage`.
- Formulario de contacto con validaciones.
- Mini CRUD para crear y eliminar oportunidades.
- Diseño responsive basado en los mockups de Figma.

## Publicación con GitHub Pages

Radar Útil está preparado para ejecutarse directamente como un sitio estático en GitHub Pages, sin Python, servidor local ni base de datos.

Una vez habilitado GitHub Pages desde la rama `main` y la carpeta raíz `/`, el proyecto estará disponible en:

https://devkalpha.github.io/RadarUtil/

Todos los enlaces, archivos CSS, JavaScript, imágenes y datos utilizan rutas relativas compatibles con GitHub Pages.

## Estructura del proyecto

```text
RadarUtil/
├── index.html
├── explorar.html
├── detalle.html
├── favoritos.html
├── publicar.html
├── contacto.html
├── assets/
├── css/
├── data/
└── js/
```

## Almacenamiento

Los favoritos y las oportunidades creadas por el usuario se guardan en el navegador mediante `localStorage`. Por esta razón, no se requiere un backend para esta versión académica del proyecto.
