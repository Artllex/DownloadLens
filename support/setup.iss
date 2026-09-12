[Setup]
AppId=Artllex.DownloadRouter.Support
AppName=Download Router Support
AppVersion=1.2.0
AppPublisher=Arkadiusz Pajda (Artllex)
AppPublisherURL=https://github.com/Artllex/download-router
DefaultDirName={localappdata}\Programs\DownloadRouterSupport
DisableDirPage=yes
DisableProgramGroupPage=yes
DisableWelcomePage=no
PrivilegesRequired=lowest
MinVersion=10.0
WizardStyle=modern
LanguageDetectionMethod=none
OutputDir=..\dist
OutputBaseFilename=Download-Router-Support-Setup-1.2.0
Compression=lzma2
SolidCompression=yes
CloseApplications=no
RestartApplications=no
LicenseFile=..\LICENSE
[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "polish"; MessagesFile: "compiler:Languages\Polish.isl"
[Files]
Source: "FirefoxDownloadHost.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "README.txt"; DestDir: "{app}"; Flags: ignoreversion
Source: "Configure-Firefox.ps1"; DestDir: "{app}"; Flags: ignoreversion
Source: "Run-Firefox-Configuration.ps1"; DestDir: "{app}"; Flags: ignoreversion
Source: "firefox\*"; DestDir: "{app}\firefox"; Flags: ignoreversion
[Code]
const HostKey = 'Software\Mozilla\NativeMessagingHosts\com.artllex.download_router';
function Escape(S: String; Json: Boolean): String;
begin
  if Json then begin
    StringChangeEx(S, '\', '\\', True);
    StringChangeEx(S, '"', '\"', True);
  end else begin
    StringChangeEx(S, '&', '&amp;', True);
    StringChangeEx(S, '<', '&lt;', True);
    StringChangeEx(S, '>', '&gt;', True);
  end;
  Result := S;
end;
procedure RegisterHost(Root: Integer; Suffix: String);
var Previous, Backup: String;
begin
  Backup := ExpandConstant('{app}\previous-' + Suffix + '.txt');
  if not FileExists(Backup) then begin
    Previous := '';
    RegQueryStringValue(Root, HostKey, '', Previous);
    if not SaveStringToFile(Backup, Previous, False) then RaiseException('Cannot back up host registration.');
  end;
  if not RegWriteStringValue(Root, HostKey, '', ExpandConstant('{app}\firefox-native-host.json')) then RaiseException('Cannot register host.');
end;
procedure RestoreHost(Root: Integer; Suffix: String);
var Current: String; Previous: AnsiString;
begin
  if RegQueryStringValue(Root, HostKey, '', Current) and
    (CompareText(Current, ExpandConstant('{app}\firefox-native-host.json')) = 0) then begin
    if LoadStringFromFile(ExpandConstant('{app}\previous-' + Suffix + '.txt'), Previous) then begin
      if (Previous <> '') and FileExists(String(Previous)) then
        RegWriteStringValue(Root, HostKey, '', String(Previous))
      else RegDeleteValue(Root, HostKey, '');
    end;
  end;
end;
procedure InitializeWizard;
begin
  if ActiveLanguage = 'polish' then
    WizardForm.WelcomeLabel2.Caption := 'Download Router: synchronizacja pobran, rozpakowywanie ZIP i usuwanie plikow w panelu oraz Bibliotece. Zamknij Firefox. Integracja AutoConfig wymaga UAC. Rozszerzenie XPI instaluje sie osobno.'
  else
    WizardForm.WelcomeLabel2.Caption := 'Download Router: path synchronization, ZIP extraction and file deletion in the panel and Library. Close Firefox. AutoConfig integration requires UAC approval. Install the extension XPI separately.';
end;
procedure CurStepChanged(CurStep: TSetupStep);
var Settings, Legacy, Temp, Manifest: String; ResultCode: Integer; Detail: AnsiString;
begin
  if CurStep = ssPostInstall then begin
    if not Exec(ExpandConstant('{sys}\WindowsPowerShell\v1.0\powershell.exe'), '-NoProfile -ExecutionPolicy Bypass -File "' + ExpandConstant('{app}\Run-Firefox-Configuration.ps1') + '"', ExpandConstant('{app}'), SW_HIDE, ewWaitUntilTerminated, ResultCode) then RaiseException('Cannot start Firefox integration.');
    if ResultCode <> 0 then begin
      Detail := '';
      LoadStringFromFile(ExpandConstant('{app}\integration-error.txt'), Detail);
      RaiseException('Firefox integration failed: ' + String(Detail));
    end;
    Settings := ExpandConstant('{app}\folders.xml');
    Legacy := ExpandConstant('{localappdata}\Programs\ChatGPTFolderLauncher\folders.xml');
    if not FileExists(Settings) then begin
      if FileExists(Legacy) then begin
        if not FileCopy(Legacy, Settings, False) then RaiseException('Cannot import folder settings.');
      end else begin
        Temp := ExpandConstant('{localappdata}\DownloadRouter\temp');
        if not ForceDirectories(Temp) then RaiseException('Cannot create TEMP directory.');
        if not SaveStringToFile(Settings, '<Folders><Temp>' + Escape(Temp, False) + '</Temp></Folders>', False) then RaiseException('Cannot save settings.');
      end;
    end;
    Manifest := '{"name":"com.artllex.download_router","description":"Download Router Support","path":"' +
      Escape(ExpandConstant('{app}\FirefoxDownloadHost.exe'), True) +
      '","type":"stdio","allowed_extensions":["download-router@artllex"]}';
    if not SaveStringToFile(ExpandConstant('{app}\firefox-native-host.json'), Manifest, False) then RaiseException('Cannot save manifest.');
    RegisterHost(HKCU32, '32');
    if IsWin64 then RegisterHost(HKCU64, '64');
  end;
end;
procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var ResultCode: Integer;
begin
  if CurUninstallStep = usUninstall then begin
    if not Exec(ExpandConstant('{sys}\WindowsPowerShell\v1.0\powershell.exe'), '-NoProfile -ExecutionPolicy Bypass -File "' + ExpandConstant('{app}\Run-Firefox-Configuration.ps1') + '" -Action Remove', ExpandConstant('{app}'), SW_HIDE, ewWaitUntilTerminated, ResultCode) then RaiseException('Cannot remove Firefox integration.');
    if ResultCode <> 0 then RaiseException('Firefox integration kept for safety. Close Firefox and retry.');
    RestoreHost(HKCU32, '32');
    if IsWin64 then RestoreHost(HKCU64, '64');
  end;
end;
