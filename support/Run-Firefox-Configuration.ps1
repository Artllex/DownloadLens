param([ValidateSet('Install','Remove')][string]$Action='Install')
$ErrorActionPreference='Stop'
$logDirectory=Join-Path $env:LOCALAPPDATA 'DownloadRouterSupportLogs'
New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
$detailLog=Join-Path $logDirectory ('integration-'+(Get-Date -Format 'yyyyMMdd-HHmmss-fff')+'.txt')
try {
  $arguments='-NoProfile -ExecutionPolicy Bypass -File "'+(Join-Path $PSScriptRoot 'Configure-Firefox.ps1')+'" -Action '+$Action+' -ErrorLog "'+$detailLog+'"'
  $process=Start-Process powershell.exe -ArgumentList $arguments -Verb RunAs -WindowStyle Hidden -PassThru -Wait
  if($process.ExitCode -ne 0){
    $detail=if(Test-Path -LiteralPath $detailLog){Get-Content -LiteralPath $detailLog -Raw}else{'Elevated process returned exit code '+$process.ExitCode}
    throw $detail
  }
  exit 0
} catch {
  $_.Exception.Message | Set-Content -LiteralPath $detailLog -Encoding UTF8
  $_.Exception.Message | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'integration-error.txt')
  exit 1
}
