param(
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$WorkflowsDir = Join-Path $Root "automations\workflows"

Write-Host "Authority Ranking Monitor — Cursor Automations import helper"
Write-Host "Account: et@edgephone.ai"
Write-Host ""
Write-Host "Steps:"
Write-Host "  1. node scripts/generate-prefills.mjs"
Write-Host "  2. Open https://cursor.com/automations"
Write-Host "  3. For each JSON below: New automation -> cron + model + paste prompt -> git repo rankingcheckaimodels/main"
Write-Host "  4. Copy automation UUIDs into automations/cursor-agents.json"
Write-Host "  5. python scripts/sync_cursor_automation_prompts.py"
Write-Host ""

Get-ChildItem $WorkflowsDir -Filter "*.json" | Sort-Object Name | ForEach-Object {
    $wf = Get-Content $_.FullName -Raw | ConvertFrom-Json
    $cron = $wf.workflow.triggers[0].cron.cron
    $model = $wf.workflow.model
    Write-Host "  $($_.Name)"
    Write-Host "    Name: $($wf.name)"
    Write-Host "    Cron: $cron"
    Write-Host "    Model: $model"
    Write-Host ""
}

if (-not $DryRun) {
    Start-Process "https://cursor.com/automations"
}
