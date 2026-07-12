# revo fit - local web server (Windows PowerShell only, no installs needed)
# Usage: double-click serve.bat, then open http://localhost:8000/
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 8000
$mime = @{
  ".html"="text/html; charset=utf-8"; ".js"="text/javascript; charset=utf-8"; ".css"="text/css; charset=utf-8";
  ".json"="application/json"; ".webmanifest"="application/manifest+json";
  ".png"="image/png"; ".jpg"="image/jpeg"; ".jpeg"="image/jpeg"; ".svg"="image/svg+xml"; ".ico"="image/x-icon";
  ".mp3"="audio/mpeg"; ".sql"="text/plain; charset=utf-8"; ".md"="text/plain; charset=utf-8"
}
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try { $listener.Start() } catch {
  Write-Host "Port $port is busy. Close the other app and retry." -ForegroundColor Red
  Read-Host "Press Enter to exit"; exit 1
}
Write-Host ""
Write-Host "  revo fit local server running" -ForegroundColor Green
Write-Host "  Self test : http://localhost:$port/selftest.html"
Write-Host "  App       : http://localhost:$port/"
Write-Host "  Stop      : close this window (or Ctrl+C)"
Write-Host ""
Start-Process "http://localhost:$port/selftest.html"
while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $path = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
    if ($path -eq "/") { $path = "/index.html" }
    $file = Join-Path $root ($path -replace "/", "\")
    $full = [System.IO.Path]::GetFullPath($file)
    if ($full.StartsWith($root) -and (Test-Path $full -PathType Leaf)) {
      $ext = [System.IO.Path]::GetExtension($full).ToLower()
      $ct = $mime[$ext]; if (-not $ct) { $ct = "application/octet-stream" }
      $bytes = [System.IO.File]::ReadAllBytes($full)
      $ctx.Response.ContentType = $ct
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
      $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
      $ctx.Response.OutputStream.Write($msg, 0, $msg.Length)
    }
    $ctx.Response.Close()
  } catch { }
}
