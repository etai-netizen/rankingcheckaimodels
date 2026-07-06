param(
    [switch]$ForceOpen,
    [switch]$SyncOnly,
    [switch]$Quiet
)

$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

function Write-Info($msg) {
    if (-not $Quiet) { Write-Host $msg }
}

$MarkerPath = Join-Path $Root "meta\last-login-sync.json"
$DataPath = Join-Path $Root "Ranking Dashboard\rankings-data.json"
$HtmlPath = Join-Path $Root "Ranking Dashboard\rankings.html"

$pulled = $false
try {
    $null = git rev-parse --is-inside-work-tree 2>$null
    if ($LASTEXITCODE -eq 0) {
        git fetch origin main 2>$null
        $local = (git rev-parse HEAD 2>$null).Trim()
        $remote = (git rev-parse origin/main 2>$null).Trim()
        if ($local -and $remote -and $local -ne $remote) {
            git pull --ff-only origin main 2>$null
            if ($LASTEXITCODE -eq 0) {
                $pulled = $true
                Write-Info "Pulled latest ranking data from origin/main"
            }
        }
    }
} catch {
    Write-Info "Git sync skipped (offline or no remote)"
}

try {
    node (Join-Path $Root "scripts\sync-brand-assets.mjs") 2>$null
    node (Join-Path $Root "scripts\build-rankings-html.mjs")
    Write-Info "Rebuilt Ranking Dashboard/rankings.html"
} catch {
    Write-Info "Dashboard rebuild failed: $_"
    exit 1
}

$generatedAt = $null
if (Test-Path $DataPath) {
    try {
        $data = Get-Content $DataPath -Raw | ConvertFrom-Json
        $generatedAt = $data.generatedAt
    } catch { }
}

$marker = @{}
if (Test-Path $MarkerPath) {
    try { $marker = Get-Content $MarkerPath -Raw | ConvertFrom-Json } catch { }
}

$shouldOpen = (-not $SyncOnly) -and ($ForceOpen -or $pulled)
if (-not $shouldOpen -and $generatedAt -and $marker.generatedAt -ne $generatedAt) {
    $shouldOpen = $true
}
if (-not $shouldOpen -and $generatedAt) {
    $today = (Get-Date).ToString("yyyy-MM-dd")
    if ($marker.lastOpenDate -ne $today) {
        $shouldOpen = $true
    }
}

if ($shouldOpen -and (Test-Path $HtmlPath)) {
    Start-Process $HtmlPath
    Write-Info "Opened rankings dashboard"
}

@{
    syncedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    generatedAt = $generatedAt
    lastOpenDate = (Get-Date).ToString("yyyy-MM-dd")
    pulledFromOrigin = $pulled
} | ConvertTo-Json | Set-Content -Path $MarkerPath -Encoding UTF8

exit 0
