$root = Split-Path -Parent $PSScriptRoot
$source = Join-Path $root 'orma-extension'
$zipPath = Join-Path $root 'orma-extension-package.zip'

if (Test-Path $zipPath) {
  Remove-Item $zipPath -Force
}

Compress-Archive -Path (Join-Path $source '*') -DestinationPath $zipPath -Force
Write-Host "Created $zipPath"
