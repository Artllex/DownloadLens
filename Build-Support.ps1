param([string]$Compiler)
$ErrorActionPreference='Stop'
& "$env:WINDIR\Microsoft.NET\Framework64\v4.0.30319\csc.exe" /nologo /target:winexe "/win32icon:$PSScriptRoot\assets\DownloadLens.ico" "/out:$PSScriptRoot\support\FirefoxDownloadHost.exe" /reference:System.Web.Extensions.dll /reference:System.Xml.Linq.dll /reference:System.Windows.Forms.dll "$PSScriptRoot\support\FirefoxDownloadHost.cs"
if($LASTEXITCODE -ne 0) {throw 'Host build failed'}
if(!$Compiler) {$Compiler=(Get-Command ISCC.exe -ErrorAction Stop).Source}
& $Compiler "$PSScriptRoot\support\setup.iss"
if($LASTEXITCODE -ne 0) {throw 'Installer build failed'}
