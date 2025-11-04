param(
    [string]$StaticRoot = (Split-Path -Parent $PSScriptRoot)
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Read-FileContent {
    param([string]$Path)
    return Get-Content -LiteralPath $Path -Raw -Encoding UTF8
}

$errors = @()
$appPath = Join-Path $StaticRoot 'app.js'
if (-not (Test-Path $appPath)) {
    Write-Error "Cannot find app.js at $appPath"
    exit 1
}

$appContent = Read-FileContent -Path $appPath
$delegatedFunctions = @(
    'renderBadgeSpotlight',
    'teardownBadgeShowcase',
    'setupBadgeShowcase',
    'renderGlobalNav',
    'attachHeaderEvents',
    'attachGlobalNav',
    'initializeSettingsUI',
    'renderHeader'
)

foreach ($name in $delegatedFunctions) {
    $matchCount = [regex]::Matches($appContent, "function\s+$name\b").Count
    if ($matchCount -ne 1) {
        $errors += "Expected exactly one definition of `$name` in app.js (found $matchCount)."
    }
}

$docPaths = @(
) | ForEach-Object { Join-Path $StaticRoot $_ }

foreach ($doc in $docPaths) {
    if (-not (Test-Path $doc)) {
        $errors += "Documentation file missing: $doc"
        continue
    }
    $raw = Read-FileContent -Path $doc
    if ($raw -match '[^\u0000-\u007F]') {
        $errors += "Non-ASCII characters detected in $doc."
    }
}

if ($errors.Count -gt 0) {
    Write-Host "Sanity check failed:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
    exit 1
}

Write-Host "Sanity check passed. Shell delegates are unique and docs are ASCII clean." -ForegroundColor Green
exit 0
