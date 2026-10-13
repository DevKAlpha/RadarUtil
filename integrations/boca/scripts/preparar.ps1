$ErrorActionPreference = 'Stop'
$integrationRoot = Split-Path $PSScriptRoot -Parent
$environmentPath = Join-Path $integrationRoot '.env'
if (Test-Path -LiteralPath $environmentPath) {
    Write-Host 'La configuración local ya existe; se conserva.'
    exit 0
}
function New-LocalKey {
    $bytes = [byte[]]::new(32)
    [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
    return [Convert]::ToHexString($bytes).ToLowerInvariant()
}
$settings = "BOCA_DB_PASSWORD=$(New-LocalKey)`nBOCA_KEY=$(New-LocalKey)`nBOCA_BASE_PASSWORD=boca`n"
[System.IO.File]::WriteAllText($environmentPath, $settings, [System.Text.UTF8Encoding]::new($false))
Write-Host 'Configuración local preparada. No agregues .env a la entrega.'
