$ErrorActionPreference = 'Stop'

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$source = Join-Path $repositoryRoot 'vendor-src\azgaar-fantasy-map-generator'
$destination = Join-Path $repositoryRoot 'public\vendor\azgaar'

if (-not (Test-Path (Join-Path $source 'package.json'))) {
  throw "Azgaar source is missing at $source"
}

Push-Location $source
try {
  npm.cmd ci
  npm.cmd exec tsc
  npm.cmd exec vite build -- --base=/vendor/azgaar/
} finally {
  Pop-Location
}

New-Item -ItemType Directory -Force -Path $destination | Out-Null
Copy-Item -Path (Join-Path $source 'dist\*') -Destination $destination -Recurse -Force
Copy-Item -Path (Join-Path $source 'LICENSE') -Destination (Join-Path $destination 'LICENSE') -Force
$manifestPath = Join-Path $destination 'manifest.webmanifest'
$manifest = Get-Content $manifestPath -Raw
$manifest = $manifest.Replace('"scope": "/Fantasy-Map-Generator/"', '"scope": "/vendor/azgaar/"')
$manifest = $manifest.Replace('"start_url": "/Fantasy-Map-Generator/?source=pwa"', '"start_url": "/vendor/azgaar/?source=pwa"')
Set-Content -Path $manifestPath -Value $manifest -NoNewline
Write-Host "Azgaar build copied to $destination"
