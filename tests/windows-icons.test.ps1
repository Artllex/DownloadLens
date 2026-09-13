$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$root=Split-Path $PSScriptRoot
foreach($relative in @('support\FirefoxDownloadHost.exe','dist\DownloadLens-Support-Setup-1.2.4.exe')) {
  $icon=[System.Drawing.Icon]::ExtractAssociatedIcon((Join-Path $root $relative))
  if(!$icon) {throw "Missing icon: $relative"}
  $actual=$icon.ToBitmap()
  $expected=New-Object System.Drawing.Bitmap (Join-Path $root ("firefox-extension\icons\icon-"+$actual.Width+'.png'))
  try {
    $different=0
    for($x=0;$x -lt $actual.Width;$x++) {for($y=0;$y -lt $actual.Height;$y++) {
      $a=$actual.GetPixel($x,$y);$b=$expected.GetPixel($x,$y)
      if($a.A -ne $b.A -or ($a.A -gt 0 -and ($a.R -ne $b.R -or $a.G -ne $b.G -or $a.B -ne $b.B))) {$different++}
    }}
    if($different -gt 0) {throw "Icon pixels differ from DownloadLens artwork: $relative ($different)"}
    Write-Output "DownloadLens embedded icon matches PNG: $relative"
  } finally {$actual.Dispose();$expected.Dispose();$icon.Dispose()}
}
