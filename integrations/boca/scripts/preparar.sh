#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ -e .env ]]; then echo 'La configuración local ya existe; se conserva.'; exit 0; fi
umask 077
key() { od -An -N32 -tx1 /dev/urandom | tr -d ' \n'; }
printf 'BOCA_DB_PASSWORD=%s\nBOCA_KEY=%s\nBOCA_BASE_PASSWORD=boca\n' "$(key)" "$(key)" > .env
echo 'Configuración local preparada. No agregues .env a la entrega.'
