$ErrorActionPreference='Stop'
$assembly=[Reflection.Assembly]::LoadFile((Join-Path (Split-Path $PSScriptRoot) 'support\FirefoxDownloadHost.exe'))
$type=$assembly.GetType('FirefoxDownloadHost')
$flags=[Reflection.BindingFlags]'NonPublic,Static'
$downloads=$type.GetMethod('DownloadsFolder',$flags).Invoke($null,@())
if(!(Test-Path -LiteralPath $downloads -PathType Container)) {throw 'Downloads folder does not exist'}
$shell=New-Object -ComObject Shell.Application
$expected=$shell.NameSpace('shell:Downloads').Self.Path
if($downloads -ne $expected) {throw 'Known folder differs from Windows Shell Downloads'}
$settings=Join-Path (Split-Path $PSScriptRoot) 'support\folders.xml'
if(Test-Path -LiteralPath $settings) {throw 'Run this test from a clean build without installed settings'}
$fallback=$type.GetMethod('ConfiguredTemp',$flags).Invoke($null,@())
if($fallback -ne $downloads) {throw 'Fresh configuration does not default to Downloads'}
Write-Output "Windows Downloads and fresh configuration fallback PASS: $downloads"
