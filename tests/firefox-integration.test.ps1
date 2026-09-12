$ErrorActionPreference='Stop'
$root=Join-Path $PSScriptRoot ('support-test-'+[Guid]::NewGuid().ToString('N'))
$prefs=Join-Path $root 'defaults\pref'
New-Item -ItemType Directory -Path $prefs -Force | Out-Null
[IO.File]::WriteAllText((Join-Path $root 'firefox.exe'),'fixture')
$disabled=Join-Path $prefs 'zipquickextract-autoconfig.js.disabled'
[IO.File]::WriteAllText($disabled,'disabled fixture')
function Get-Process {param($Name,$ErrorAction) return @()}
$script=Join-Path (Split-Path $PSScriptRoot) 'support\Configure-Firefox.ps1'
& $script -FirefoxDirectory $root
if(!(Test-Path (Join-Path $prefs 'download-router-support.js'))) {throw 'Bootstrap missing'}
if([IO.File]::ReadAllText($disabled) -ne 'disabled fixture') {throw 'Disabled integration changed'}
& $script -FirefoxDirectory $root
if(!(Get-ChildItem $root -Directory -Filter 'download-router-backup-*')) {throw 'Update backup missing'}
& $script -FirefoxDirectory $root -Action Remove
if(Test-Path (Join-Path $prefs 'download-router-support.js')) {throw 'Bootstrap left behind'}
$conflict=Join-Path $prefs 'other.js'
[IO.File]::WriteAllText($conflict,'pref("general.config.filename","other.cfg");')
$rejected=$false
try {& $script -FirefoxDirectory $root} catch {$rejected=$true}
if(!$rejected -or (Test-Path (Join-Path $root 'download-router-support.cfg'))) {throw 'Conflict not safely rejected'}
Write-Output 'Integration install/update/remove, backup, disabled preservation and conflict rejection: PASS'
