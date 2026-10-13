#!/usr/bin/env bash
set -euo pipefail
export PGPASSWORD="${BOCA_DB_PASSWORD:?Falta BOCA_DB_PASSWORD}"
until pg_isready -h db -U bocauser -d postgres > /dev/null 2>&1; do sleep 1; done
php /opt/boca/initialize.php
chown -R www-data:www-data /var/www/boca/src/private
chmod 750 /var/www/boca/src/private
exec apache2ctl -D FOREGROUND
