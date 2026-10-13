<?php
// Solo inicializa una base inexistente y serializa los dos contenedores web.
$password = getenv('BOCA_DB_PASSWORD');
if (!$password || !preg_match('/^[a-zA-Z0-9_-]+$/', $password)) {
    throw new RuntimeException('La contraseña local debe contener letras, números, guiones o guiones bajos.');
}
$connection = pg_connect("host=db port=5432 dbname=postgres user=bocauser password=$password");
if (!$connection) throw new RuntimeException('No se pudo conectar a PostgreSQL.');
pg_query($connection, 'SELECT pg_advisory_lock(730124)');
try {
    $result = pg_query($connection, "SELECT 1 FROM pg_database WHERE datname='bocadb'");
    if (pg_num_rows($result) > 0) {
        echo "La base bocadb ya existe; se conservan los datos.\n";
    } else {
        echo "Inicializando una base nueva mediante el instalador original de BOCA.\n";
        $process = proc_open(['php', 'private/createdb.php'], [0 => ['pipe', 'r'], 1 => STDOUT, 2 => STDERR], $pipes, '/var/www/boca/src');
        if (!is_resource($process)) throw new RuntimeException('No se pudo iniciar createdb.php.');
        fwrite($pipes[0], "YES\n");
        fclose($pipes[0]);
        if (proc_close($process) !== 0) throw new RuntimeException('Falló el instalador de BOCA.');
        $verify = pg_connect("host=db port=5432 dbname=bocadb user=bocauser password=$password");
        $tables = $verify ? pg_query($verify, "SELECT to_regclass('public.contesttable') IS NOT NULL AS ready") : false;
        if (!$tables || pg_fetch_result($tables, 0, 'ready') !== 't') {
            throw new RuntimeException('La base no contiene las tablas originales de BOCA.');
        }
    }
} finally {
    pg_query($connection, 'SELECT pg_advisory_unlock(730124)');
    pg_close($connection);
}
