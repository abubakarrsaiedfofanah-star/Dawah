param(
    [string]$OutputDirectory = "firebase-public"
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$out = Join-Path $root $OutputDirectory

if (Test-Path $out) {
    Get-ChildItem -LiteralPath $out -Force | Remove-Item -Recurse -Force
} else {
    New-Item -ItemType Directory -Path $out | Out-Null
}

$files = @(
    "index.html",
    "admin.html",
    "admin.js",
    "officer.html",
    "officer.js",
    "install.html",
    "verify-receipt.html",
    "verify-member.html",
    "offline.html",
    "daawah.css",
    "daawah.js",
    "canonical_redirect.js",
    "ai_worker_config.js",
    "ai_assistant_widget.js",
    "ai_assistant_widget.css",
    "firebase_shared.js",
    "manifest.webmanifest",
    "robots.txt",
    "sitemap.xml",
    "service-worker.js",
    "version.json"
)

foreach ($file in $files) {
    Copy-Item -LiteralPath (Join-Path $root $file) -Destination (Join-Path $out $file) -Force
}

Copy-Item -LiteralPath (Join-Path $root "assets") -Destination (Join-Path $out "assets") -Recurse -Force
Copy-Item -LiteralPath (Join-Path $root "vendor") -Destination (Join-Path $out "vendor") -Recurse -Force
if (Test-Path (Join-Path $root "features")) {
    Copy-Item -LiteralPath (Join-Path $root "features") -Destination (Join-Path $out "features") -Recurse -Force
}

Write-Host "Firebase Hosting public folder prepared:"
Write-Host $out
