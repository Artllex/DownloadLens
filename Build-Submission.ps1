$ErrorActionPreference='Stop'
& (Join-Path $PSScriptRoot 'Build.ps1')
$version=(Get-Content (Join-Path $PSScriptRoot 'firefox-extension\manifest.json') -Raw | ConvertFrom-Json).version
$stage=Join-Path $PSScriptRoot ('dist\submission-source-'+[Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $stage | Out-Null
foreach($folder in @('firefox-extension','support')) {
  $source=Join-Path $PSScriptRoot $folder
  foreach($file in Get-ChildItem -LiteralPath $source -File -Recurse) {
    if($file.Extension -in @('.exe','.log') -or $file.Name -eq 'folders.xml') {continue}
    $relative=$file.FullName.Substring($PSScriptRoot.Length).TrimStart('\','/')
    $destination=Join-Path $stage $relative
    New-Item -ItemType Directory -Path (Split-Path $destination) -Force | Out-Null
    Copy-Item -LiteralPath $file.FullName -Destination $destination
  }
}
foreach($name in @('LICENSE','README.md','PRIVACY.md','AMO_REVIEWER_NOTES.md','Build.ps1','Build-Support.ps1')) {
  Copy-Item -LiteralPath (Join-Path $PSScriptRoot $name) -Destination $stage
}
$archive=Join-Path $PSScriptRoot "dist\DownloadLens-$version-review-source.zip"
Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $archive -Force
Write-Output $archive
