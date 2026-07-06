param(
    [switch]$OpenDashboard
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

python (Join-Path $Root "scripts\run-ranking-check-now.py")
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if ($OpenDashboard) {
    & (Join-Path $Root "scripts\Open-RankingsDashboard.ps1")
}
