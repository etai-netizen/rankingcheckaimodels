param(
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Launcher = Join-Path $Root "Ranking Dashboard\Open Dashboard.cmd"

if (-not $NoBrowser -and (Test-Path $Launcher)) {
    & $Launcher
} else {
    & (Join-Path $Root "scripts\Sync-RankingsOnLogin.ps1") -SyncOnly -Quiet
}
Write-Output "Dashboard ready at Ranking Dashboard\rankings.html"
