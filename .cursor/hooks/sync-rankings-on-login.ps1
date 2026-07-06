# Cursor sessionStart hook — pull overnight Cloud Agent commits, rebuild HTML, open dashboard.
$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
& (Join-Path $Root "scripts\Sync-RankingsOnLogin.ps1") -Quiet
exit 0
