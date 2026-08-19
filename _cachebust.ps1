$ts = [int](Get-Date -UFormat '%s')
$files = Get-ChildItem -Path "." -Filter "*.html" -Depth 0
foreach ($f in $files) {
  $content = Get-Content $f.FullName -Raw
  $content = $content -replace 'css/main\.css\?v=\d*"', "css/main.css?v=$ts`""
  $content = $content -replace 'css/main\.css"', "css/main.css?v=$ts`""
  $content = $content -replace 'css/animations\.css\?v=\d*"', "css/animations.css?v=$ts`""
  $content = $content -replace 'css/animations\.css"', "css/animations.css?v=$ts`""
  $content = $content -replace 'css/reset\.css\?v=\d*"', "css/reset.css?v=$ts`""
  $content = $content -replace 'css/reset\.css"', "css/reset.css?v=$ts`""
  $content = $content -replace 'js/main\.js\?v=\d*"', "js/main.js?v=$ts`""
  $content = $content -replace 'js/main\.js"', "js/main.js?v=$ts`""
  Set-Content -Path $f.FullName -Value $content -NoNewline
}
Write-Host "Cache bust applied with v=$ts"
