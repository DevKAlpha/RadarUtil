<?php
// Configuración del contenedor; los valores privados se suministran al iniciar.
function globalconf() {
    $password = getenv('BOCA_DB_PASSWORD');
    $key = getenv('BOCA_KEY');
    if (!$password || !$key) {
        throw new RuntimeException('Falta preparar la configuración local de BOCA.');
    }
    return [
        'dbencoding' => 'UTF8', 'dbclientenc' => 'UTF8', 'doenc' => false,
        'dblocal' => 'false', 'dbhost' => 'db', 'dbport' => '5432',
        'dbname' => 'bocadb', 'dbuser' => 'bocauser', 'dbpass' => $password,
        'dbsuperuser' => 'bocauser', 'dbsuperpass' => $password,
        'basepass' => getenv('BOCA_BASE_PASSWORD') ?: 'boca',
        'key' => $key, 'ip' => 'entrega-local'
    ];
}
