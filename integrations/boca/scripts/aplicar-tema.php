<?php
// Agrega dos puntos de presentación; no reemplaza páginas ni funciones de BOCA.
$root = $argv[1] ?? '';
if (!$root || !is_file($root . '/Css.php') || !is_file($root . '/version.php')) {
    fwrite(STDERR, "No se encontró el árbol original de BOCA.\n");
    exit(1);
}
$cssHook = "\n<?php readfile(__DIR__ . '/custom/radar-boca.css'); ?>\n";
$css = file_get_contents($root . '/Css.php');
if (!str_contains($css, 'custom/radar-boca.css')) file_put_contents($root . '/Css.php', $css . $cssHook);
$version = file_get_contents($root . '/version.php');
$hook = <<<'PHP'
<?php
// Los recursos utilizan la ubicación que BOCA ya mantiene en la sesión.
if (PHP_SAPI !== 'cli') {
    $radarBase = rtrim($_SESSION['loc'] ?? '/boca', '/');
    echo '<meta name="viewport" content="width=device-width, initial-scale=1">';
    echo '<script src="' . htmlspecialchars($radarBase . '/custom/radar-boca.js', ENT_QUOTES, 'UTF-8') . '" defer></script>';
}
?>
PHP;
if (!str_contains($version, 'custom/radar-boca.js')) {
    file_put_contents($root . '/version.php', $version . "\n" . $hook . "\n");
}
echo "Tema aplicado a Css.php y version.php.\n";
