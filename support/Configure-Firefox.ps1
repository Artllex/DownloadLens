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
$prefDir=Join-Path $FirefoxDirectory 'defaults\pref'
$statePath=Join-Path $FirefoxDirectory 'download-router-support-state.json'
$files=@(
  @{name='download-router-actions.sys.mjs';path=(Join-Path $FirefoxDirectory 'download-router-actions.sys.mjs')},
  @{name='download-router-extract.ps1';path=(Join-Path $FirefoxDirectory 'download-router-extract.ps1')},
  @{name='download-router-extract.vbs';path=(Join-Path $FirefoxDirectory 'download-router-extract.vbs')},
  @{name='download-router-support.cfg';path=(Join-Path $FirefoxDirectory 'download-router-support.cfg')},
  @{name='download-router-sync.sys.mjs';path=(Join-Path $FirefoxDirectory 'download-router-sync.sys.mjs')},
  @{name='download-router-support.js';path=(Join-Path $prefDir 'download-router-support.js')}
)
if ($Action -eq 'Remove') {
  if (!(Test-Path -LiteralPath $statePath)) {return}
  $state=Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
  if ($state.owner -ne 'DownloadRouterSupport') {throw 'Unknown integration ownership.'}
  foreach($file in $files) {
    if(Test-Path -LiteralPath $file.path) {
      $expected=$state.hashes.($file.name)
      if (!$expected -or (Get-FileHash -LiteralPath $file.path).Hash -ne $expected) {throw "Integration file changed; kept for safety: $($file.path)"}
    }
  }
  foreach($file in $files) {if(Test-Path -LiteralPath $file.path) {Remove-Item -LiteralPath $file.path}}
  Remove-Item -LiteralPath $statePath
  return
}
# A disabled *.js.disabled loader is intentionally ignored. Never reactivate it.
$conflicts=Get-ChildItem -LiteralPath $prefDir -Filter '*.js' -File -ErrorAction SilentlyContinue | Where-Object {
  $_.Name -ne 'download-router-support.js' -and (Select-String -LiteralPath $_.FullName -Pattern 'general\.config\.filename' -Quiet)
}
if ($conflicts) {throw ('Another AutoConfig is active. No files changed: '+($conflicts.FullName -join ', '))}
foreach($file in $files) {
  if ((Test-Path -LiteralPath $file.path) -and !(Get-Content -LiteralPath $file.path -TotalCount 1).Contains('Download Router Support')) {throw "Refusing to replace an unrelated file: $($file.path)"}
}
New-Item -ItemType Directory -Path $prefDir -Force | Out-Null
$backup=Join-Path $FirefoxDirectory ('download-router-backup-'+(Get-Date -Format 'yyyyMMdd-HHmmss-fff'))
$written=@(); $saved=@()
try {
  foreach($file in $files) {
    if (Test-Path -LiteralPath $file.path) {
      New-Item -ItemType Directory -Path $backup -Force | Out-Null
      Copy-Item -LiteralPath $file.path -Destination (Join-Path $backup $file.name)
      $saved += $file
    }
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot ('firefox\'+$file.name)) -Destination $file.path -Force
    $written += $file
  }
  $hashes=@{}; foreach($file in $files){$hashes[$file.name]=(Get-FileHash -LiteralPath $file.path).Hash}
  @{owner='DownloadRouterSupport';hashes=$hashes} | ConvertTo-Json | Set-Content -LiteralPath $statePath -Encoding UTF8
} catch {
  foreach($file in $written) {
    if($saved.name -contains $file.name) {Copy-Item -LiteralPath (Join-Path $backup $file.name) -Destination $file.path -Force}
    else {Remove-Item -LiteralPath $file.path -ErrorAction SilentlyContinue}
  }
  throw
}
