# Resumen técnico de Radar Útil — Entrega 3

## 1. Componentes

`HeaderComponent`, `FooterComponent` y `OpportunityCardComponent` son reutilizables. La tarjeta admite las presentaciones de Inicio, Explorar y Favoritos para conservar la distribución anterior.

Las seis vistas son `HomeComponent`, `ExploreComponent`, `DetailComponent`, `FavoritesComponent`, `PublishComponent` y `ContactComponent`. `AppComponent` contiene el encabezado, el outlet de rutas, el footer y el aviso temporal. Todos son componentes standalone.

## 2. Servicios

- `OpportunitiesService`: carga JSON, combina oportunidades iniciales y locales, consulta por ID, crea y elimina publicaciones propias.
- `FavoritesService`: consulta, agrega, retira y comprueba IDs guardados; actualiza tarjetas y contador.
- `StorageService`: centraliza lectura y escritura de localStorage; maneja datos corruptos, permisos y falta de espacio.
- `NoticeService`: muestra los avisos existentes de favoritos, publicación e inicio de sesión.

## 3. Rutas

| Ruta Angular | Vista |
| --- | --- |
| `/` | Inicio |
| `/explorar` | Búsqueda, filtros y ordenamiento |
| `/detalle/:id` | Datos de una oportunidad |
| `/favoritos` | Oportunidades guardadas |
| `/publicar` | Formulario y publicaciones propias |
| `/contacto` | Formulario de contacto |

`app.routes.ts` utiliza carga diferida de cada vista. `main.ts` configura `withHashLocation()` y restauración del scroll. En Pages las URLs tienen el formato `/RadarUtil/#/explorar`. `RouterLinkActive` diferencia la vista actual y mantiene Explorar activo en el detalle.

## 4. Bindings

| Tipo | Ejemplo | Ubicación |
| --- | --- | --- |
| Interpolación | `{{ opportunity().titulo }}` | Tarjeta reutilizable |
| Property binding | `[src]="opportunity().imagen"`, `[routerLink]` | Tarjeta y detalle |
| Event binding | `(click)="favorites.toggle(opportunity().id)"` | Tarjeta y detalle |
| Two-way binding | `[(ngModel)]="query"`, `[(ngModel)]="sort"` | Inicio y Explorar |
| Formulario reactivo | `[formGroup]="form"`, `formControlName` | Publicar y Contacto |
| Clase y atributos | `[class.active]`, `[attr.aria-pressed]` | Filtros y favoritos |

Los bloques `@for` renderizan datos dinámicos; `@if` controla estados vacíos, carga, errores y envío exitoso. Las señales y `computed` recalculan resultados sin recargar la página.

## 5. localStorage

Se mantienen las claves de la versión anterior:

- `radar_util_favoritos`: arreglo de IDs, normalizados como cadenas.
- `radar_util_publicaciones`: arreglo de oportunidades propias con IDs `user-...`.

Los datos persisten al actualizar o volver a abrir el navegador. El evento `storage` sincroniza otras pestañas del mismo origen. Los datos malformados se ignoran sin impedir la carga de oportunidades iniciales. Si una escritura falla, se informa al usuario y se conserva el estado anterior.

## 6. JSON

`src/assets/data/oportunidades.json` contiene 12 registros iniciales y las rutas de sus imágenes. Incluye ID, título, categoría, descripción corta y completa, modalidad, costo, fechas, duración, requisitos, imagen y enlace.

`OpportunitiesService` usa `HttpClient` y valida la estructura recibida. El archivo se sirve como `assets/data/oportunidades.json`, relativo al `base href`. No existen tarjetas escritas manualmente ni una copia del JSON en JavaScript.

## 7. Mini CRUD y formularios

Crear: Publicar valida título, categoría, descripción, modalidad, fecha y enlace HTTP/HTTPS. Lee una imagen opcional mediante `FileReader`, crea un ID único y guarda la oportunidad localmente.

Consultar: Explorar combina publicaciones y JSON; admite búsqueda por título, descripción y categoría, filtros y orden por fecha. Detalle resuelve el ID de la ruta y presenta sus datos. Un ID inexistente muestra un estado informativo.

Eliminar: el listado de Publicar elimina exclusivamente registros locales y retira su ID de Favoritos. Los datos iniciales del JSON permanecen intactos. La edición no forma parte de esta entrega.

Contacto: Reactive Forms verifica campos obligatorios, textos no vacíos y correo válido. El envío muestra “Tu mensaje fue enviado correctamente.” como simulación académica.

## 8. Estructura

`src/app/components/`, `pages/`, `services/`, `models/` y `shared/` organizan presentación, navegación, datos y validación. `src/assets/` conserva logo, favicon, banner e imágenes originales utilizados. `src/styles.css` reutiliza el CSS anterior con ajustes mínimos para hosts Angular, accesibilidad y pantallas pequeñas.

`tests/` contiene las pruebas de navegador. `scripts/serve-build.mjs` sirve únicamente la compilación estática para verificar el subdirectorio de Pages. No constituye un backend de la aplicación.

## 9. Archivos principales

- `package.json` y `package-lock.json`: dependencias y comandos reproducibles.
- `angular.json`, `tsconfig.json`, `tsconfig.app.json`: compilación Angular y TypeScript estricto.
- `src/main.ts`, `src/app/app.component.ts`, `src/app/app.routes.ts`: arranque y navegación.
- `src/app/components/`, `src/app/pages/`, `src/app/services/`: componentes y lógica funcional.
- `src/app/models/opportunity.ts`: interfaz, categorías y normalización.
- `src/app/shared/`: validadores y pipe de fechas en español de Colombia.
- `src/assets/data/oportunidades.json`, `src/styles.css`, `src/index.html`: datos, diseño y favicon.
- `.github/workflows/deploy.yml`: instalación, compilación y publicación automáticas.
- `playwright.config.mjs`, `tests/application.spec.mjs`: verificación funcional y responsive.
- `README.md`: instalación, estructura y uso.

Los HTML, JavaScript, CSS y recursos antiguos que dejaron de utilizarse se retiran del árbol actual. La etiqueta local `respaldo-pre-angular-2026-10-10` y el historial Git conservan la versión previa.

## 10. Publicación y verificaciones

URL: [https://devkalpha.github.io/RadarUtil/](https://devkalpha.github.io/RadarUtil/).

El workflow compila con `--base-href /RadarUtil/` y publica `dist/radar-util/browser/`. Las rutas hash resuelven la navegación directa y la actualización de vistas internas en un sitio estático.

Verificación local: `npm install` sin errores ni vulnerabilidades y `npm run build:pages` sin errores ni warnings. Las 18 pruebas de navegador pasan en escritorio (1440 × 1000), tablet (768 × 1024) y móvil (390 × 844).

Las pruebas verifican las seis vistas, navegación activa, buscador, cinco categorías, contador, ordenamiento, detalle por ID, persistencia de favoritos, publicación con imagen, eliminación local, validaciones de contacto, imágenes, favicon y ausencia de desbordamiento horizontal. La navegación normal no presenta errores ni warnings de consola. También se comprueba la recuperación ante almacenamiento corrupto y fallo de carga del JSON.

La aplicación Angular quedó publicada en `main` y en GitHub Pages el 10 de octubre de 2026. El workflow [Publica Radar Útil](https://github.com/DevKAlpha/RadarUtil/actions/runs/38078516420) completó instalación, compilación y despliegue correctamente.

Las mismas 18 pruebas pasan contra el sitio público, incluidas las rutas internas al actualizar, los favoritos persistentes, los formularios, el mini CRUD y los recursos visuales. Para repetirlas, define `RADAR_BASE_URL=https://devkalpha.github.io/RadarUtil/` antes de ejecutar `npm run test:e2e`.

La fuente anterior de Pages también sigue activando su publicación automática. Falta seleccionar **GitHub Actions** en Settings → Pages → Source para utilizar exclusivamente el workflow Angular. Este ajuste se realiza una sola vez y requiere una sesión del propietario en GitHub.
