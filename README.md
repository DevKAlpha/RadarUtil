# Radar Útil

Plataforma web de oportunidades para estudiantes y jóvenes: becas, cursos, empleo, eventos y beneficios. Tercera entrega de Desarrollo Front-end.

La aplicación utiliza Angular con componentes standalone. Conserva el diseño, el banner y los recursos visuales de la versión anterior.

## Tecnologías

- Angular 21 LTS, TypeScript y Angular Router.
- HttpClient para cargar oportunidades desde JSON.
- Reactive Forms para publicación y contacto; FormsModule para búsqueda y ordenamiento.
- HTML, CSS, Bootstrap Icons e Inter.
- localStorage para favoritos y publicaciones propias.
- GitHub Actions y GitHub Pages para compilar y publicar.
- Playwright para pruebas funcionales y responsive.

## Ejecutar localmente

Requiere Node.js 24 LTS, o Node.js 22.12 o posterior dentro de la versión 22.

```bash
npm install
npm start
```

Abre `http://localhost:4200/`. Las rutas internas utilizan hash, por ejemplo `http://localhost:4200/#/explorar`.

## Compilar y verificar

```bash
npm run build
npm run build:pages
npm run test:e2e
```

El build local utiliza `/` como base. El build de Pages utiliza `/RadarUtil/` y genera el sitio en `dist/radar-util/browser/`.

Las pruebas utilizan Microsoft Edge instalado en el equipo. Para otro entorno, cambia `channel: 'msedge'` en `playwright.config.mjs` o instala Edge mediante `npx playwright install msedge`. Ejecuta `npm run build:pages` antes de las pruebas. Cubren escritorio (1440 px), tablet (768 px) y móvil (390 px).

Para verificar el sitio público, define la variable de entorno `RADAR_BASE_URL=https://devkalpha.github.io/RadarUtil/` y ejecuta `npm run test:e2e`. Las pruebas utilizan sesiones nuevas de navegador y datos de prueba guardados únicamente en esas sesiones.

## Estructura del proyecto

```text
src/
├── app/
│   ├── components/       # Header, footer y tarjeta reutilizable
│   ├── pages/            # Inicio, explorar, detalle, favoritos, publicar, contacto
│   ├── services/         # Oportunidades, favoritos, almacenamiento y avisos
│   ├── models/           # Interfaz Opportunity y categorías
│   ├── shared/           # Validadores y formato de fechas
│   ├── app.component.ts
│   └── app.routes.ts
├── assets/
│   └── data/oportunidades.json
├── index.html
├── main.ts
└── styles.css
tests/                   # Pruebas funcionales en navegador
scripts/                 # Servidor estático para las pruebas
docs/                    # Resumen técnico para la sustentación
.github/workflows/       # Compilación y publicación automáticas
```

## Funcionamiento

El JSON contiene 12 oportunidades iniciales. Angular las carga una sola vez y combina los datos con las publicaciones guardadas en el navegador. Las tarjetas, filtros, contador y detalle se actualizan mediante bindings y señales de Angular.

Los favoritos usan la clave `radar_util_favoritos`; las publicaciones usan `radar_util_publicaciones`. Se conservan las mismas claves de la versión anterior. Los registros permanecen al actualizar o volver a abrir el navegador; no se comparten entre dispositivos o perfiles. Borrar los datos del navegador elimina ese almacenamiento.

El mini CRUD permite crear, consultar y eliminar publicaciones propias desde Publicar. El JSON original no se modifica. El formulario exige datos válidos y un enlace HTTP/HTTPS; la imagen es opcional, admite PNG, JPG, WebP o GIF hasta 2 MB.

El contacto valida campos obligatorios y correo electrónico. El envío es una simulación académica. Las convocatorias iniciales con `url: "#"` también son demostrativas; las publicaciones propias pueden enlazar convocatorias reales. El botón Iniciar sesión mantiene su aviso informativo.

## GitHub Pages

Sitio: [https://devkalpha.github.io/RadarUtil/](https://devkalpha.github.io/RadarUtil/).

El workflow `.github/workflows/deploy.yml` instala con `npm ci`, compila Angular y publica en Pages con cada push a `main`. La fuente de publicación del repositorio está configurada como **GitHub Actions**. No requiere pasos manuales después de cada cambio. Las rutas hash permiten actualizar vistas internas sin errores 404.

El respaldo local `respaldo-pre-angular-2026-10-10` conserva la versión anterior en Git. El historial existente se mantiene.

Consulta [docs/RESUMEN_TECNICO.md](docs/RESUMEN_TECNICO.md) para preparar la sustentación.
