param([switch]$OpenBrowser, [switch]$Stop)
$ErrorActionPreference = 'Stop'
$projectDir = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$viteFile = Join-Path $projectDir 'node_modules\vite\bin\vite.js'
$workDir = Join-Path $projectDir 'work'
$pidFile = Join-Path $workDir 'local-preview.pid'
$siteUrl = 'http://127.0.0.1:8080'

if ($Stop) {
    if (Test-Path -LiteralPath $pidFile) {
        $previewId = [int](Get-Content -LiteralPath $pidFile -Raw)
        $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $previewId"
        if ($processInfo -and $processInfo.CommandLine.Contains($viteFile) -and $processInfo.CommandLine.Contains('--port 8080')) {
            Stop-Process -Id $previewId
            Remove-Item -LiteralPath $pidFile
            Write-Host '已关闭本项目的本地预览。'
        } else { Write-Host '预览已关闭，或记录的进程已变化。' }
    } else { Write-Host '没有本项目的预览进程记录。' }
    exit 0
}

if (!(Test-Path -LiteralPath $viteFile) -or !(Test-Path -LiteralPath (Join-Path $projectDir 'dist\index.html'))) {
    throw '请在项目目录先运行 npm ci 和 npm run build，再启动。'
}
$running = $false
try {
    $response = Invoke-WebRequest -Uri $siteUrl -UseBasicParsing -TimeoutSec 2
    if ($response.Content -match 'data-app="808-trainer"') { $running = $true }
    else { throw '端口 8080 被另一个网站使用。' }
} catch {
    if (Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue) {
        throw '端口 8080 已被占用，请先检查占用它的程序。'
    }
}
if (!$running) {
    New-Item -ItemType Directory -Path $workDir -Force | Out-Null
    $nodeFile = (Get-Command node -ErrorAction Stop).Source
    $preview = Start-Process -FilePath $nodeFile -WorkingDirectory $projectDir -WindowStyle Hidden -PassThru `
        -ArgumentList @(('"' + $viteFile + '"'), 'preview', '--host', '127.0.0.1', '--port', '8080', '--strictPort') `
        -RedirectStandardOutput (Join-Path $workDir 'preview.log') -RedirectStandardError (Join-Path $workDir 'preview-error.log')
    Set-Content -LiteralPath $pidFile -Value $preview.Id -Encoding ascii
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        Start-Sleep -Milliseconds 200
        try {
            $response = Invoke-WebRequest -Uri $siteUrl -UseBasicParsing -TimeoutSec 1
            if ($response.Content -match 'data-app="808-trainer"') { $running = $true; break }
        } catch { }
    }
    if (!$running) { throw '预览未能启动，请查看 work/preview-error.log。' }
}
Write-Host "已启动：$siteUrl/#/today"
if ($OpenBrowser) { Start-Process "$siteUrl/#/today" }
