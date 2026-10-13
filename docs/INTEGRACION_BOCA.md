# Informe de integración de BOCA con la interfaz de Radar Útil

Entrega final del módulo Desarrollo de Front-end. Verificación realizada entre el 12 y el 13 de octubre de 2026. La aplicación utiliza el código oficial de BOCA y una capa de presentación propia basada en la identidad visual del proyecto anterior. Este informe describe lo ejecutado y distingue las funciones comprobadas de los procesos pendientes.

## 1. Versión de BOCA utilizada

Se utilizó **BOCA 1.5.24**, identificado por `src/versionnum.php` como `boca-1.5.24`. La revisión fijada es **`5a6232c7dd4691dfc728014819c74264058891ba`**. El archivo `debian/changelog` identifica el paquete `1.5.24-1+ubuntu24.04`, fechado el 22 de septiembre de 2025.

Se seleccionó esta revisión publicada y mantenida del código oficial porque sus requisitos de empaquetado incluyen Ubuntu 24.04 y PHP 8.3. No se utilizó una etiqueta antigua como si representara esta versión. La procedencia se registra en `integrations/boca/ORIGEN.json` y los 602 archivos originales tienen hashes SHA-256 en `upstream.sha256.json`.

## 2. Fuente desde donde se obtuvo

El software procede del [repositorio oficial cassiopc/boca](https://github.com/cassiopc/boca), conservando su licencia GPL-3.0 o posterior, avisos de autoría y estructura. Se consultó la [revisión utilizada](https://github.com/cassiopc/boca/tree/5a6232c7dd4691dfc728014819c74264058891ba).

Antes de modificar la presentación se revisaron los manuales oficiales incluidos `doc/INSTALL.txt` y `doc/ADMIN.txt`, las cabeceras de los perfiles, los formularios, la configuración privada, la instalación de tablas y los requisitos de `debian/control`. La URL académica `https://www.ime.usp.br/~cassio/boca/` respondió HTTP 404 durante la consulta; el repositorio oficial permitió obtener el software y los manuales.

El directorio `integrations/boca/upstream/` contiene el árbol oficial completo exportado de esa revisión. No incluye su directorio `.git`, pero su origen queda identificado y el historial del proyecto Radar Útil se conserva.

## 3. Sistema operativo utilizado

El anfitrión utilizado para realizar las pruebas fue **Windows**, con **Docker Desktop 29.6.1** y **Docker Compose 5.3.0**. El servidor web de BOCA se ejecutó en un contenedor **Ubuntu 24.04.5 LTS**. PostgreSQL se ejecutó en un contenedor independiente basado en Debian.

Esto comprueba el funcionamiento del servidor en Ubuntu mediante contenedores. No equivale a haber instalado Ubuntu de forma nativa en el computador ni a haber probado la instalación de Docker Engine sobre un anfitrión Ubuntu nuevo. El README contiene los pasos para reproducir el mismo entorno sobre Ubuntu 24.04 LTS. La zona horaria configurada en el servidor es `America/Bogota`.

## 4. Tecnologías requeridas por BOCA

| Tecnología | Uso real | Versión observada |
|---|---|---|
| Apache | Servir las páginas y ejecutar PHP mediante su módulo | 2.4.58 |
| PHP | Autenticación, administración, formularios y lógica original | 8.3.6 |
| PostgreSQL | Persistencia de competencias, usuarios, problemas, envíos y respuestas | 16.15 |
| HTML y CSS | Estructura original de las páginas y presentación | Original de BOCA y tema propio |
| JavaScript | Hash de login, confirmaciones y comportamiento original; organización visual añadida | Scripts originales y `radar-boca.js` |
| Docker y Compose | Entorno reproducible, red interna y volúmenes | 29.6.1 / 5.3.0 |

El Dockerfile instala PHP con extensiones PostgreSQL, GD, XML y ZIP, además de herramientas para archivos comprimidos, cliente PostgreSQL, Perl y Matplotlib que forman parte de las necesidades del paquete. Node.js 24.14.1 se utilizó para los scripts de comprobación; BOCA no necesita Node ni Angular para ejecutarse.

El manual histórico describe una instalación antigua con PHP 5. La configuración de Apache se adaptó a sus directivas actuales y las dependencias se seleccionaron teniendo en cuenta el paquete oficial para Ubuntu 24.04. Estas adaptaciones pertenecen al entorno de ejecución.

## 5. Procedimiento de instalación

Antes de los cambios se creó la etiqueta Git **`respaldo-pre-boca-2026-10-12`**, sobre el commit **`fb138c5c55a1e64543683540866b16572458288e`**. El proyecto Angular, sus imágenes y su historial se mantuvieron. BOCA se agregó en una carpeta independiente para conservar el trabajo anterior.

La instalación utiliza dos servicios: un servidor web Ubuntu y PostgreSQL. Desde la raíz del paquete extraído, con Docker y Compose disponibles:

```bash
cd integrations/boca
bash scripts/preparar.sh
sudo docker compose up -d --build --wait web
sudo docker compose ps
```

En el Windows utilizado, los comandos ejecutados fueron la preparación PowerShell y `docker compose up -d --build --wait web`, sin `sudo`. El [README de instalación](../integrations/boca/README.md) incluye todos los comandos de preparación de Docker para Ubuntu y la alternativa para Windows.

El Dockerfile conserva una etapa `original` y otra `personalizado`. Ambas ejecutan BOCA real. La segunda incorpora el tema. Al iniciar, el script espera la disponibilidad de PostgreSQL y comprueba si existe `bocadb`. Para una base nueva invoca el instalador original `src/private/createdb.php`; para una base existente conserva los datos. Un bloqueo de PostgreSQL evita que los servicios original y personalizado inicialicen simultáneamente la misma base.

Se comprobó una instalación limpia adicional bajo `radar-boca-limpio-final`, con volúmenes nuevos y puerto 8090. Se reutilizó la imagen web final ya construida, pero la base y los archivos privados se inicializaron desde cero. Las 15 comprobaciones funcionales pasaron en ese entorno.

## 6. Procedimiento de configuración

Los scripts `scripts/preparar.sh` y `scripts/preparar.ps1` generan `.env` con una contraseña de base de datos y una clave aleatorias. El archivo se conserva entre ejecuciones, se excluye de Git y no forma parte de la entrega. `.env.example` muestra las variables necesarias sin secretos.

`BOCA_DB_PASSWORD` configura PostgreSQL y su conexión; `BOCA_KEY` configura la clave interna; `BOCA_BASE_PASSWORD=boca` establece la contraseña inicial de las cuentas de demostración. Los puertos opcionales son `BOCA_PORT=8088` y `BOCA_ORIGINAL_PORT=8089`. Cambiar la contraseña inicial después de crear una cuenta no modifica esa cuenta.

`docker/conf.php` mantiene la función `globalconf()` esperada por BOCA y lee las variables del entorno. Se utiliza `db:5432`, base `bocadb` y usuario `bocauser`. El usuario tiene capacidad de crear la base para el instalador; esta configuración corresponde al entorno local de entrega.

Apache publica `/boca`, bloquea por HTTP `private/` y no permite listar directorios. La web queda vinculada a `127.0.0.1`; PostgreSQL solo es accesible por la red interna de los servicios. Los volúmenes almacenan la base y los archivos privados de BOCA. Se configuraron zona horaria, carga máxima PHP y registro de errores.

Dentro de BOCA se crea y activa la competencia mediante sus formularios. Para la demostración se configuraron tanto la fecha global de inicio como la de la sede antes de la hora actual. BOCA conserva su validación original: una sede en curso no basta para mostrar problemas si la competencia global aún no comienza.

## 7. Comandos para iniciar la aplicación

Primera instalación o reconstrucción del tema, desde `integrations/boca`:

```bash
sudo docker compose up -d --build --wait web
```

Inicio posterior con la misma configuración y datos:

```bash
sudo docker compose up -d --wait web
sudo docker compose ps
```

Comparación con el aspecto original:

```bash
sudo docker compose --profile comparacion up -d --build --wait original
```

Detención y retirada de contenedores conservando los volúmenes:

```bash
sudo docker compose --profile comparacion stop
sudo docker compose --profile comparacion down
```

Los comandos de Windows son los mismos sin `sudo`. No se utiliza `down -v`, porque eliminaría la base y los archivos privados persistentes. Se comprobó detener e iniciar el servicio web: el envío `689752901` de la competencia 11 continuó registrado como `judged`, respuesta 1.

## 8. URL utilizada para acceder

La interfaz final se comprobó en **[http://localhost:8088/boca/](http://localhost:8088/boca/)**. La instalación limpia adicional utilizó **`http://localhost:8090/boca/`**.

Las primeras capturas de comparación utilizaron **`http://localhost:8089/boca/`** para el aspecto original. Para repetir la comparación se recomienda **`http://127.0.0.1:8089/boca/`** junto con `localhost:8088`, porque las cookies no se separan por puerto y dos sesiones sobre el mismo host pueden sobrescribirse.

El sitio público de Radar Útil permanece en `https://devkalpha.github.io/RadarUtil/`. GitHub Pages ejecuta el Front-end Angular estático; para BOCA se utiliza el servidor PHP y PostgreSQL descrito aquí.

## 9. Credenciales de prueba, solo si son seguras

| Usuario | Contraseña | Perfil y condición |
|---|---|---|
| `system` | `boca` | Cuenta inicial de BOCA, creada al inicializar la base |
| `admin` | `boca` | Administrador original de una competencia creada |
| `teamradar` | `boca` | Equipo sintético importado por la prueba |
| `juezradar` | `boca` | Juez sintético importado por la prueba |

Estas cuentas son exclusivas de la demostración local, sin credenciales personales. La contraseña de PostgreSQL y la clave interna son distintas, aleatorias y no se publican. Los participantes de prueba aparecen después de ejecutar `node tests/verificar.mjs` o importarlos con el formato original.

## 10. Archivos originales utilizados

Los **602 archivos oficiales** se encuentran en `integrations/boca/upstream/`, sin modificaciones. Su integridad se verifica con `node integrations/boca/tests/verificar-origen.mjs`, comparando sus bytes con el manifiesto SHA-256.

La estructura conserva `src/` para la aplicación, `src/private/` para instalación y configuración, `doc/` para manuales y ejemplos, `tools/` para herramientas y `debian/` para empaquetado. También se conservan recursos, traducciones y demás archivos oficiales.

Se ejecutaron directamente páginas de `system/`, `admin/`, `team/` y `judge/`; el acceso de `index.php`; `db.php` y los módulos originales de consultas; el instalador `private/createdb.php`; `sha256.js` y `hex.js`; y el paquete de ejemplo `doc/problemexamples/bits.zip`. El [manifiesto completo](ARCHIVOS_ENTREGA.md) identifica individualmente todos los archivos incluidos.

## 11. Archivos modificados

Los originales permanecen disponibles. La imagen final utiliza estas adaptaciones, cuyas copias revisables se incluyen en `integrations/boca/modified/`:

| Archivo efectivo de BOCA | Modificación |
|---|---|
| `src/Css.php` | Añade al final del CSS original la lectura de `custom/radar-boca.css`, para que el tema tenga prioridad por cascada. |
| `src/version.php` | Añade viewport y carga diferida de `custom/radar-boca.js` únicamente en ejecución web. Se mantienen la identificación de versión y el contenido previo. |
| `src/private/conf.php` | Sustituye valores de instalación por configuración de entorno mediante la función `globalconf()` original. |

El verificador confirma que `Css.php` y `version.php` modificados comienzan con los bytes exactos de sus originales. La copia de `conf.php` coincide con `docker/conf.php`. No se modificaron controladores de autenticación, páginas administrativas, consultas SQL ni algoritmos de competencias o evaluación.

En Radar Útil se actualizó el README raíz para enlazar esta entrega. La configuración `.gitattributes` preserva los bytes de los archivos oficiales y las terminaciones LF de los scripts de instalación.

## 12. Archivos nuevos

| Grupo | Archivos agregados y finalidad |
|---|---|
| Interfaz | `custom/radar-boca.css`, `custom/radar-boca.js`, `custom/marca-boca.svg`: paleta, organización de la presentación y marca adaptada. |
| Entorno | `Dockerfile`, `compose.yaml`, `docker/apache.conf`, `docker/php.ini`, `docker/conf.php`, `docker/entrypoint.sh`, `docker/initialize.php`: servicios e instalación real. |
| Preparación | `scripts/preparar.sh`, `scripts/preparar.ps1`, `scripts/aplicar-tema.php`: variables locales y aplicación repetible del tema. |
| Verificación | `tests/verificar.mjs`, `tests/verificar-origen.mjs`: operaciones HTTP reales y comprobación del código original. |
| Procedencia | `ORIGEN.json`, `upstream.sha256.json`, `upstream/`: referencia exacta e inclusión íntegra de BOCA. |
| Revisión | `modified/src/Css.php`, `modified/src/version.php`, `modified/src/private/conf.php`: copias de los archivos efectivos adaptados. |
| Configuración segura | `.env.example`, `.gitignore`, `.dockerignore`: modelo sin secretos y exclusiones de archivos locales. |
| Documentación | README de instalación, este informe, `ARCHIVOS_ENTREGA.md`, README de evidencias, capturas PNG y reportes JSON. |

El manifiesto contiene la lista individual de rutas. Los resultados temporales del script y `.env` no se entregan. El proyecto Angular anterior sigue incluido con sus recursos y documentación.

## 13. Páginas de BOCA modificadas

La personalización actúa sobre páginas reales mediante los recursos compartidos, sin reemplazar sus archivos PHP:

| Página original | Perfil/función utilizada |
|---|---|
| `index.php` | Login original |
| `system/contest.php` | Crear, editar y activar competencias |
| `admin/user.php` | Gestionar usuarios, equipos y jueces e importar registros |
| `admin/contest.php` y `admin/site.php` | Consultar configuración y ajustar la sede |
| `admin/problem.php` | Cargar y consultar problemas |
| `admin/run.php` y `admin/runedit.php` | Consultar y evaluar manualmente envíos |
| `admin/score.php` y `team/score.php` | Consultar resultados |
| `team/run.php` | Formulario y listado de envíos del equipo |
| `judge/run.php` y `judge/allrunlist.php` | Listados del juez |
| Cabeceras de perfiles y `admin/clar.php` | Navegación compartida y acceso a aclaraciones |

Otras páginas que incluyen las mismas cabeceras reciben estilos compartidos. Esa propagación visual no implica que todas sus operaciones hayan sido probadas. Las funciones detalladas en el apartado 16 delimitan la verificación realizada.

## 14. Mejoras realizadas en cada página

| Página o elemento | Mejora aplicada |
|---|---|
| Login | Tarjeta central blanca, título y explicación de acceso, espaciado, campos de lectura clara, botón azul y etiquetas accesibles de usuario y contraseña. Mantiene nombres de campos y hash original. |
| Competencia | Título de página, introducción, formulario en panel, bordes y espaciado uniforme; controles originales de fechas, duración y activación. |
| Usuarios, equipos y jueces | Título que explica los tipos administrados, tabla con filas alternas y encabezado visible, regiones de desplazamiento para columnas extensas, formularios agrupados visualmente. |
| Problemas | Panel de carga original con controles y botones consistentes; tabla con nombre, archivo y datos originales legibles. El paquete y sus metadatos se procesan en BOCA. |
| Envíos | Tabla con estados y respuestas originales, espaciado y desplazamiento; formulario del equipo conserva problema, lenguaje y archivo. |
| Revisión de envío | Jerarquía de título y panel del formulario, manteniendo el selector de respuesta y la acción `Judge`. |
| Resultados | Presentación uniforme de la clasificación que calcula BOCA, sin reemplazar la puntuación por datos del Front-end. |
| Sede y aclaraciones | Título descriptivo, formularios y enlaces con estilos compartidos. No se alteran horarios ni mensajes emitidos por BOCA. |
| Navegación principal | Menú flexible, enlaces más amplios, resaltado de página actual, estado de usuario y reloj en panel separado. Se conservan rutas, nombres originales y enlaces según permisos. |
| Pantallas pequeñas | La marca se simplifica, los menús se distribuyen en varias líneas y los datos extensos se desplazan horizontalmente dentro de sus regiones. Se comprobó la vista de equipo a 390 × 844 px. |

La paleta adapta el azul, turquesa y tonos oscuros de Radar Útil. La tipografía utiliza una familia legible con alternativas locales; no requiere descargar fuentes. Se añadieron contornos de foco y regiones de tabla accesibles mediante teclado. Estas mejoras no constituyen una certificación completa de accesibilidad.

## 15. Explicación de cómo se integró el Front-end

Radar Útil aportó la referencia visual: colores, marca de radar, jerarquía, paneles, botones y separación de contenidos. Se adaptó esa identidad a una herramienta de competencias de programación. No se trasladaron categorías de oportunidades, favoritos, becas ni publicaciones a BOCA.

BOCA continúa generando su HTML y procesando peticiones PHP. `Css.php` incorpora la hoja de estilo propia por cascada. `version.php`, incluido por las cabeceras y el login, carga el script diferido. El script añade marca, títulos, clases de presentación, etiquetas accesibles y envoltorios para tablas, trabajando sobre el documento original.

Los formularios siguen perteneciendo a sus páginas y conservan `name`, `id`, método, acción, eventos `onclick` y `onchange`. No se interceptan peticiones ni se reemplaza `computeHASH()`. La comparación de firmas DOM de `admin/user.php` antes y después produjo igualdad; los JSON de esa comparación se entregan sin valores de campos ni contraseñas.

La integración es una personalización Front-end aplicada al BOCA ejecutable dentro del mismo repositorio. El proyecto Angular conserva su funcionamiento separado. No se creó una API innecesaria ni se presentó una conexión de datos entre Angular y BOCA.

## 16. Funciones de BOCA comprobadas después de la integración

Se ejecutó el script de verificación contra la instalación principal y contra una instalación limpia. Cada ejecución completó las siguientes **15 comprobaciones**:

| Comprobación | Evidencia/resultado |
|---|---|
| Login y carga del tema | HTML real de BOCA 1.5.24 incluye la carga JavaScript. |
| CSS, JavaScript y SVG | Recursos propios y `sha256.js`/`hex.js` originales responden HTTP correctamente. |
| Protección de acceso | `private/conf.php` devuelve 403; el área administrativa rechaza una sesión no autenticada. |
| Autenticación system | Se usa el challenge y SHA-256 originales para iniciar sesión. |
| Crear y editar competencia | El nombre y duración guardados aparecen al volver a consultar. |
| Activación | La competencia queda identificada como activa en el selector original. |
| Administración y navegación | Acceso autenticado a usuarios, problemas, competencia, envíos, resultados y aclaraciones. |
| Sede en curso | Horario de sede guardado y reloj original de tiempo restante. |
| Equipo y juez | Importador original almacena y muestra ambos usuarios. |
| Problema oficial | Carga multipart de `bits.zip` y lectura posterior de sus metadatos. |
| Formulario de equipo | Login y presencia comprobada de la opción A dentro del selector de problemas. |
| Envío de archivo | BOCA recibe `solucion.c` y lo muestra en la administración. |
| Perfil de juez | Login y acceso al listado original de envíos. |
| Evaluación manual y clasificación | Acción `Judge` de administración, respuesta `YES` y equipo presente en resultados. |
| Logout | El equipo pierde acceso a su área después de cerrar sesión. |

La instalación principal final registró competencia **11**, envío **689752901**. La instalación limpia final registró competencia **1**, envío **690386101**. Los reportes incluyen fecha UTC, URL y resultado de cada comprobación; no contienen sesiones ni contraseñas. La segunda instalación fue retirada conservando sus volúmenes.

Además, se inició sesión desde el navegador real, se recorrieron páginas, se visualizó el resultado del equipo y el listado del juez, y se obtuvieron capturas del servidor original y del personalizado. La prueba móvil registró viewport de 390 px y ancho de documento de 375 px: la página no sobrepasó el ancho de pantalla, mientras la tabla de 650 px se desplazaba dentro de una región visible de 345 px. No se registraron advertencias o errores de consola en la pestaña de esa prueba.

Se verificaron los 602 originales mediante hashes, la igualdad de firmas de formularios original/personalizado y la persistencia de un envío evaluado después de reiniciar la web. Las capturas y reportes se encuentran en [docs/evidencias-boca](evidencias-boca/README.md). Las imágenes muestran pantallas reales y se entregan en PNG; las capturas funcionales corresponden a distintas ejecuciones de prueba, identificadas en el índice de evidencias.

## 17. Limitaciones conocidas

- **Autojudge pendiente:** no se configuró ni probó la compilación o ejecución automática de soluciones. Se comprobó evaluación manual administrativa. Un resultado manual `YES` no demuestra corrección algorítmica del código enviado.
- **Entorno local:** se comprobó Ubuntu dentro de Docker sobre Windows. Los pasos de Docker Engine para un anfitrión Ubuntu se documentaron a partir de su fuente oficial, pero no se ejecutaron en un anfitrión Ubuntu recién instalado.
- **Hosting:** GitHub Pages conserva el sitio Angular y no ejecuta BOCA, PHP ni PostgreSQL. La URL comprobada de BOCA es local.
- **Alcance funcional:** no se probaron competencias multisedes, sincronización con servidores remotos, impresiones, copias operativas de seguridad, evaluación por múltiples jueces ni una competencia real con numerosos participantes. El acceso a aclaraciones se comprobó; no se probó un intercambio de mensajes.
- **Presentación heredada:** BOCA utiliza tablas y mensajes originales en inglés. Los textos añadidos son españoles, pero no se tradujo completamente el software. Los datos extensos requieren desplazamiento horizontal en móviles.
- **Tiempo y caché originales:** los cambios realizados en el mismo segundo que la creación de un registro pueden ser ignorados por el control temporal de BOCA. Las pruebas esperan más de un segundo y guardan fechas válidas tanto globales como de sede.
- **Sesiones durante comparación:** dos servicios sobre `localhost` con puertos diferentes comparten dominio de cookies. Para comparar sesiones se utilizan hosts distintos o perfiles separados del navegador.
- **Repetición de pruebas:** el verificador crea y activa una competencia nueva, por lo que no debe ejecutarse sobre una competencia real en producción. No borra los datos anteriores.
- **Distribución:** se entregan fuentes, scripts y configuración, no imágenes Docker binarias ni una base precargada. La primera construcción necesita Internet. Las imágenes base están fijadas por digest, pero los paquetes apt pueden recibir revisiones posteriores.
- **Credenciales y administración:** las cuentas sencillas y el usuario PostgreSQL con permisos de creación corresponden a la demostración local. La entrega no configura un despliegue público con TLS, separación de privilegios y administración operativa.
