$ErrorActionPreference = 'Stop'
$source = Join-Path $PSScriptRoot 'firefox-extension'
$version = (Get-Content (Join-Path $source 'manifest.json') -Raw | ConvertFrom-Json).version
$dist = Join-Path $PSScriptRoot 'dist'
New-Item -ItemType Directory -Path $dist -Force | Out-Null
$zip = Join-Path $dist "Download-Router-$version.zip"
$xpi = Join-Path $dist "Download-Router-$version.xpi"
Compress-Archive -Path (Join-Path $source '*') -DestinationPath $zip -Force
Move-Item -LiteralPath $zip -Destination $xpi -Force
Write-Output $xpi
