; Inno Setup script for Dissolution (Windows installer)
; Compiled in CI via .github/workflows/release.yml after `build.bat`
; produces dist/dissolution/dissolution.exe (PyInstaller onedir build).
;
; MyAppVersion is passed in from CI via /DMyAppVersion=X.Y.Z (read from the
; repo's VERSION file) so the version lives in one place. Falls back to 1.0.0
; for local/manual compiles.

#define MyAppName "Dissolution"
#ifndef MyAppVersion
  #define MyAppVersion "1.0.0"
#endif
#define MyAppPublisher "Sattha5G"
#define MyAppExeName "dissolution.exe"

[Setup]
AppId={{6C1D6E9B-6B4E-4C3D-9C2F-6E5B7A9F4D21}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
OutputDir=..\dist_installer
OutputBaseFilename=Dissolution_{#MyAppVersion}_x64_setup
SetupIconFile=..\public\icon.ico
Compression=lzma
SolidCompression=yes
WizardStyle=modern
ArchitecturesInstallIn64BitMode=x64compatible

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "..\dist\dissolution\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\Uninstall {#MyAppName}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#MyAppName}}"; Flags: nowait postinstall skipifsilent
