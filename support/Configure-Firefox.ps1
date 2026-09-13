param([ValidateSet('Install','Remove')][string]$Action='Install', [string]$FirefoxDirectory, [string]$ErrorLog, [switch]$CheckOnly)
$ErrorActionPreference='Stop'
trap {
  if ($ErrorLog) {
    $_.Exception.Message | Set-Content -LiteralPath $ErrorLog -Encoding UTF8
    exit 1
  }
  break
}
if (!$FirefoxDirectory) {
  $candidates=@((Join-Path $env:ProgramFiles 'Mozilla Firefox'),(Join-Path $env:LOCALAPPDATA 'Mozilla Firefox'))
  if ($env:ProgramW6432) {$candidates = @((Join-Path $env:ProgramW6432 'Mozilla Firefox')) + $candidates}
  if (${env:ProgramFiles(x86)}) {$candidates += Join-Path ${env:ProgramFiles(x86)} 'Mozilla Firefox'}
  $FirefoxDirectory=$candidates | Where-Object {Test-Path -LiteralPath (Join-Path $_ 'firefox.exe')} | Select-Object -First 1
}
if (!$FirefoxDirectory -or !(Test-Path -LiteralPath (Join-Path $FirefoxDirectory 'firefox.exe'))) {throw 'Firefox installation not found.'}
$FirefoxDirectory=[IO.Path]::GetFullPath($FirefoxDirectory)
if ($CheckOnly) { Write-Output "Firefox detected: $FirefoxDirectory"; return }
if (Get-Process firefox -ErrorAction SilentlyContinue) {throw 'Close all Firefox windows before changing integration.'}
. (Join-Path $PSScriptRoot 'Shared-AutoConfig.ps1')
$sources=@{}
foreach($name in @('download-router-support.cfg','download-router-sync.sys.mjs','download-router-actions.sys.mjs','download-router-extract.ps1','download-router-extract.vbs')) {$sources[$name]=Join-Path $PSScriptRoot ('firefox/'+$name)}
Invoke-ArtllexAutoConfig -Root $FirefoxDirectory -Product DL -Action $Action -Sources $sources
