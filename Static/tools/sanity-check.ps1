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
$warnings = @()
$appPath = Join-Path $StaticRoot 'app.js'
if (-not (Test-Path $appPath)) {
    Write-Error "Cannot find app.js at $appPath"
    exit 1
}

$appContent = Read-FileContent -Path $appPath
$baselinePath = Join-Path $StaticRoot 'baselines/app-phase-b0.js'
$baselineThreshold = 0.1

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

if (-not (Test-Path $baselinePath)) {
    $errors += "Baseline snapshot missing: $baselinePath. Recreate it before proceeding."
} else {
    $baselineLines = (Get-Content -LiteralPath $baselinePath).Count
    if ($baselineLines -gt 0) {
        $gitAvailable = Get-Command git -ErrorAction SilentlyContinue
        $changeLines = 0
        $diffOutput = @()
        if ($gitAvailable) {
            $diffOutput = & git -c core.safecrlf=false diff --numstat --no-index -- "$baselinePath" "$appPath" 2>$null
            $diffExit = $LASTEXITCODE
            if ($diffExit -le 1 -and $diffOutput) {
                foreach ($line in $diffOutput) {
                    if ($line -match '^\s*(?<add>\d+|-)\s+(?<del>\d+|-)\s+') {
                        $addValue = $matches.add
                        $delValue = $matches.del
                        if ($addValue -eq '-' -or $delValue -eq '-') {
                            $changeLines = $baselineLines
                            break
                        }
                        $changeLines += [int]$addValue + [int]$delValue
                    }
                }
            } elseif ($diffExit -gt 1) {
                $errors += "git diff failed while comparing baseline to app.js (exit $diffExit)."
            }
        }

        if (-not $gitAvailable -or $changeLines -eq 0 -and -not $diffOutput) {
            $currentLines = (Get-Content -LiteralPath $appPath).Count
            $changeLines = [math]::Abs($currentLines - $baselineLines)
        }

        if ($baselineLines -gt 0 -and $changeLines -gt 0) {
            $changeRatio = $changeLines / [double]$baselineLines
            if ($changeRatio -gt $baselineThreshold) {
                $percent = [math]::Round($changeRatio * 100, 1)
                $warnings += "app.js diverged from phase-B0 baseline by $percent%, exceeding the 10% guardrail."
            }
        }
    }
}

if ($errors.Count -gt 0) {
    Write-Host "Sanity check failed:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
    exit 1
}

if ($warnings.Count -gt 0) {
    Write-Host "Sanity check passed with warnings:" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host " - $_" -ForegroundColor Yellow }
} else {
    Write-Host "Sanity check passed. Shell delegates are unique and docs are ASCII clean." -ForegroundColor Green
}
exit 0
