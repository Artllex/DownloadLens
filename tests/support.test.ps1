$ErrorActionPreference='Stop'
$root=Join-Path $PSScriptRoot ('support-test-'+[Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $root | Out-Null
$assembly=[Reflection.Assembly]::LoadFile((Join-Path (Split-Path $PSScriptRoot) 'support\FirefoxDownloadHost.exe'))
$method=$assembly.GetType('FirefoxDownloadHost').GetMethod('Move',[Reflection.BindingFlags]'NonPublic,Static')
$destination=Join-Path $root 'destination'
$source=Join-Path $root 'report.txt'
$message=New-Object 'System.Collections.Generic.Dictionary[string,object]'
$message['source']=$source; $message['mode']='folder'; $message['folder']=$destination
[IO.File]::WriteAllText($source,'first')
$argsArray=[object[]]::new(1)
$argsArray[0]=$message.PSObject.BaseObject
$path=$method.Invoke($null,$argsArray)
if([IO.File]::ReadAllText($path) -ne 'first' -or [IO.File]::Exists($source)) {throw 'Routing failed'}
[IO.File]::WriteAllText($source,'second')
$second=$method.Invoke($null,$argsArray)
if($second -eq $path -or [IO.File]::ReadAllText($path) -ne 'first') {throw 'Collision overwrote existing file'}
Write-Output 'Minimal support: routing without Firefox integration and non-overwrite collision PASS'
