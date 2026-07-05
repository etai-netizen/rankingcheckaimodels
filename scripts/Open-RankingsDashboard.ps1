param(
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Html = Join-Path $Root "Ranking Dashboard\rankings.html"

if (-not (Test-Path $Html)) {
    Write-Host "Building dashboard first..."
    node (Join-Path $Root "scripts\build-rankings-html.mjs")
}

if (-not $NoBrowser) {
    Start-Process $Html
}
Write-Output "Opened $Html"
