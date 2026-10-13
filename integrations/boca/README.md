# BOCA con la interfaz de Radar Útil

Esta carpeta contiene BOCA real, su código original completo y los recursos de presentación desarrollados para la entrega final. Apache ejecuta sus páginas PHP y PostgreSQL almacena competencias, usuarios, problemas y envíos. La personalización agrega estilos y organización visual a esas páginas; los procesos de BOCA continúan usando su implementación original.

## Versión y requisitos

| Elemento | Configuración de la entrega |
|---|---|
| BOCA | 1.5.24; revisión `5a6232c7dd4691dfc728014819c74264058891ba` |
| Sistema del servidor web | Ubuntu 24.04 LTS dentro del contenedor |
| Servidor | Apache 2.4 y módulo PHP |
| Runtime | PHP 8.3 con pgsql, GD, XML y ZIP |
| Base de datos | PostgreSQL 16, servicio independiente sin puerto público |
| Ejecución | Docker Engine/Desktop y Docker Compose con soporte para `--wait` |
| Acceso | Navegador actual; puertos locales 8088 y, opcionalmente, 8089 libres |
| Verificación automatizada | Node.js 24, solamente para los scripts de pruebas |

La verificación se hizo desde Windows con Docker Desktop 29.6.1 y Compose 5.3.0. El servidor ejecutado fue Ubuntu **24.04.5 LTS**, Apache **2.4.58**, PHP **8.3.6** y PostgreSQL **16.15**. No se realizó una instalación nativa de Ubuntu en el equipo anfitrión. Las instrucciones siguientes permiten reproducir el mismo servidor mediante contenedores sobre Ubuntu 24.04.

La primera construcción requiere Internet para descargar las imágenes y los paquetes. El código de BOCA ya está incluido. Los digest de las imágenes base están fijados en Dockerfile y compose.yaml; las revisiones de paquetes apt pueden cambiar con las actualizaciones de Ubuntu. No se incluyen imágenes binarias ni una base de datos precargada.

## Preparar Docker en Ubuntu 24.04

Si Docker y Compose ya funcionan, continúa con la instalación de la aplicación. Para un Ubuntu nuevo sin instalaciones de Docker que entren en conflicto, prepara el repositorio oficial y los paquetes. Estos comandos de preparación del anfitrión siguen la [documentación oficial de Docker](https://docs.docker.com/engine/install/ubuntu/); la prueba realizada utilizó Docker Desktop en Windows.

```bash
sudo apt update
sudo apt install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: noble
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo docker version
sudo docker compose version
```

En Ubuntu se utiliza `sudo docker` para evitar modificar los grupos del usuario. En Windows, Docker Desktop debe estar iniciado y configurado para contenedores Linux; se utiliza `docker` sin `sudo`.

## Instalar la aplicación en Ubuntu

Descomprime el paquete de entrega y abre su carpeta `RadarUtil`. Si utilizas Git, debes obtener la revisión que incluya `integrations/boca`; una revisión anterior solo contiene el proyecto Angular. Ejecuta desde la raíz extraída:

```bash
cd integrations/boca
bash scripts/preparar.sh
sudo docker compose up -d --build --wait web
sudo docker compose ps
curl --fail http://localhost:8088/boca/
```

El script genera `.env` con dos valores aleatorios de 32 bytes para la contraseña de PostgreSQL y la clave interna de BOCA. Si el archivo ya existe, lo conserva. No instala software ni elimina datos. El Dockerfile instala las dependencias, copia el código oficial y aplica el tema. El proceso de inicio espera a PostgreSQL y ejecuta **`upstream/src/private/createdb.php`**, el instalador original, únicamente cuando `bocadb` aún no existe. Luego inicia Apache.

No hace falta ejecutar XAMPP, instalar PHP en el anfitrión ni ejecutar Angular para usar BOCA. Los recursos del tema ya están disponibles dentro del servidor.

## Instalar desde Windows

Desde la raíz del repositorio, con Docker Desktop iniciado:

```powershell
Set-Location integrations\boca
& .\scripts\preparar.ps1
docker compose up -d --build --wait web
docker compose ps
```

## Configuración

`.env.example` contiene el modelo de configuración. Los scripts de preparación escriben `.env`, excluido de Git y del paquete de entrega.

| Variable | Valor que debe suministrarse |
|---|---|
| `BOCA_DB_PASSWORD` | Generada por el script; letras, números, guiones o guiones bajos. Debe conservarse para acceder al volumen PostgreSQL existente. |
| `BOCA_KEY` | Generada por el script; conservarla entre reinicios. |
| `BOCA_BASE_PASSWORD` | `boca` para esta demostración local. Se utiliza al inicializar los usuarios originales; cambiarla posteriormente no modifica cuentas ya creadas. |
| `BOCA_PORT` | Opcional, `8088` por defecto. Cambiarlo si ese puerto ya está ocupado. |
| `BOCA_ORIGINAL_PORT` | Opcional, `8089` para la comparación. |

`docker/conf.php` implementa la función original `globalconf()` leyendo estas variables. El host de base de datos es `db`, puerto `5432`, base `bocadb` y usuario local `bocauser`. La inicialización requiere crear la base, por lo que este usuario tiene privilegios administrativos dentro del contenedor de demostración. La base no expone puertos al anfitrión y la web se publica solamente en `127.0.0.1`.

Apache utiliza el alias `/boca` y deniega el acceso HTTP a `private/`. El directorio privado contiene archivos de trabajo originales y se conserva en un volumen independiente. La zona horaria es `America/Bogota`. PHP admite cargas de 32 MB y peticiones de 40 MB; los límites de cada competencia siguen siendo los que BOCA configure en sus formularios.

## Primer acceso y datos de demostración

Abre **[http://localhost:8088/boca/](http://localhost:8088/boca/)**. Una base nueva crea el usuario original `system` con contraseña `boca`. Desde `Contest`, selecciona `new`, configura nombre, fecha de inicio, duración y sede, guarda con `Send` y activa con `Activate`. BOCA solicita volver a iniciar sesión. El administrador de la nueva competencia es `admin`, contraseña `boca`.

Para que los equipos vean los problemas, configura una fecha de inicio válida tanto en la competencia como en `Site`, anterior a la hora actual si deseas probar inmediatamente. La fecha de la sede por sí sola no libera los problemas. El reloj y la disponibilidad conservan las condiciones originales de BOCA.

En `Users` pueden crearse participantes y jueces con los tipos originales. En `Problems` se carga un ZIP de problema. Se incluye el ejemplo oficial `upstream/doc/problemexamples/bits.zip`, con la estructura que BOCA espera. El importador de usuarios necesita una línea vacía entre los registros, según el formato original.

También puede prepararse una demostración comprobada mediante el script de pruebas, con Node.js 24 instalado. Desde `integrations/boca`:

```bash
node tests/verificar-origen.mjs
node tests/verificar.mjs
```

La segunda orden **crea y activa una competencia nueva en cada ejecución**, importa los usuarios de prueba, carga el ejemplo oficial, envía un archivo y registra una evaluación manual. Debe utilizarse en el entorno local de demostración. No borra competencias existentes. Solo admite URLs `localhost` o `127.0.0.1`.

| Usuario | Contraseña de demostración | Disponibilidad |
|---|---|---|
| `system` | `boca` | Base recién inicializada |
| `admin` | `boca` | Competencia creada y activada |
| `teamradar` | `boca` | Después de ejecutar `verificar.mjs` |
| `juezradar` | `boca` | Después de ejecutar `verificar.mjs` |

Son cuentas sintéticas de prueba, sin información personal. Si la base se inicializó con otra contraseña, suministra esa contraseña al script mediante `BOCA_TEST_PASSWORD`. `BOCA_TEST_URL` permite seleccionar otro puerto, por ejemplo `http://localhost:8090/boca/`.

## Comparar con la interfaz original

```bash
sudo docker compose --profile comparacion up -d --build --wait original
```

Abre la versión original en **`http://127.0.0.1:8089/boca/`** y la personalizada en **`http://localhost:8088/boca/`**. Usar hosts diferentes evita que las cookies de sesión se sobrescriban: las cookies no se aíslan por puerto. Los dos servicios utilizan la misma base para comparar datos reales. El servicio original incorpora la misma configuración de ejecución, pero sus estilos y páginas no reciben el tema.

## Iniciar, detener y revisar

Desde `integrations/boca`, después de la primera instalación:

```bash
sudo docker compose up -d --wait web
sudo docker compose ps
sudo docker compose logs --tail=80 web
sudo docker compose logs --tail=80 db
sudo docker compose --profile comparacion stop
```

Para retirar los contenedores y la red conservando la base y los archivos privados:

```bash
sudo docker compose --profile comparacion down
```

Volver a ejecutar `up -d --wait web` reutiliza los volúmenes. No agregues `-v` si deseas conservar competencias y envíos. Los nombres de volúmenes usan el proyecto `radar-boca`; mantén ese nombre y el mismo `.env` al reanudar.

Si cambias CSS, JavaScript, scripts o configuración de la imagen, reconstruye:

```bash
sudo docker compose up -d --build --wait web
```

## Prueba de instalación limpia

Se ejecutó realmente el mismo conjunto de 15 comprobaciones con volúmenes nuevos, bajo el proyecto independiente `radar-boca-limpio-final`, puerto 8090. Para repetir esa prueba por primera vez, desde `integrations/boca`:

```bash
BOCA_PORT=8090 sudo -E docker compose -p radar-boca-limpio-final up -d --build --wait web
BOCA_TEST_URL=http://localhost:8090/boca/ node tests/verificar.mjs
BOCA_PORT=8090 sudo -E docker compose -p radar-boca-limpio-final down
```

El nombre debe ser nuevo para comprobar una base vacía. Reutilizarlo conserva sus volúmenes y deja de constituir una instalación limpia. La prueba limpia descargó/creó servicios y datos nuevos, reutilizando la imagen web previamente construida. Los registros de resultados se incluyen en `../../docs/evidencias-boca/`.

## Archivos y alcance

```text
upstream/                Código oficial completo, sin cambios
custom/                  CSS, JavaScript y SVG propios
modified/src/            Copias revisables de los tres archivos adaptados
docker/                  Apache, PHP, configuración, inicio e inicialización
scripts/                 Preparación local y aplicación del tema
tests/                   Verificación HTTP real y verificación de origen
Dockerfile               Servidor Ubuntu y etapa de personalización
compose.yaml             Web, PostgreSQL y comparación opcional
ORIGEN.json              Versión, fuente, revisión y licencia
upstream.sha256.json     Integridad de los 602 archivos originales
```

`modified/` facilita revisar la entrega: Docker aplica los cambios mediante `scripts/aplicar-tema.php` y utiliza `docker/conf.php`, sin depender de esas copias. Los originales se mantienen intactos y se conservan sus avisos y licencia GPL-3.0 o posterior.

El tema cambia `Css.php` y agrega la carga diferida de recursos en `version.php`, compartido por las cabeceras. El formulario de login mantiene `computeHASH()` y los scripts `sha256.js`/`hex.js`. Las páginas de competencia, usuarios, problemas, envíos y resultados permanecen originales.

Se comprobó la **evaluación manual** de un envío mediante la administración. El autojudge, la compilación y ejecución automática de soluciones, los equipos remotos y una competencia multisedes no fueron configurados ni probados. No se afirma que el ejemplo enviado sea una solución aceptada por un evaluador automático. La puntuación mostrada proviene del resultado manual registrado en BOCA.

GitHub Pages sirve el proyecto Angular. Para ejecutar BOCA se necesita este servidor PHP y PostgreSQL; BOCA no funciona dentro de Pages. No se implementó una API entre los dos proyectos.

## Documentación de referencia

- [Repositorio oficial de BOCA](https://github.com/cassiopc/boca).
- Manuales incluidos: `upstream/doc/INSTALL.txt` y `upstream/doc/ADMIN.txt`.
- Requisitos actuales del paquete: `upstream/debian/control`; versión empaquetada: `upstream/debian/changelog`.
- [Informe de integración](../../docs/INTEGRACION_BOCA.md), [manifiesto](../../docs/ARCHIVOS_ENTREGA.md) y [evidencias](../../docs/evidencias-boca/README.md).

La dirección académica `https://www.ime.usp.br/~cassio/boca/` devolvió HTTP 404 al consultarla. Se utilizó el repositorio oficial. El manual histórico menciona PHP 5 y directivas antiguas de Apache; la ejecución se adaptó a PHP 8.3 y Apache 2.4 sin reescribir la aplicación.
