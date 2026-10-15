<#
  AI Center Store - Local Web Server & Synchronization API
  High Performance, Non-blocking, Zero-Dependency Native .NET Server
  - Serves static assets with proper MIME types & CORS headers
  - Provides REST API (/api/db, /api/products, /api/orders, /api/status)
  - Synchronizes store database to data/db.json on disk
  - Resolves YouTube Embed Error 153 by providing a valid HTTP Referer
#>

param(
    [switch]$OpenBrowser = $false
)

$root = $PSScriptRoot
$dbFile = Join-Path $root "data\db.json"

$ports = @(8080, 8081, 8082, 8000, 3000)
$listener = $null
$port = 8080

foreach ($p in $ports) {
    try {
        $l = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $p)
        $l.Start()
        $listener = $l
        $port = $p
        break
    } catch {
        continue
    }
}

if (-not $listener) {
    Write-Host "[LOI] Khong the mo cong web (8080-8082). Vui long kiem tra lai!" -ForegroundColor Red
    exit 1
}

$url = "http://localhost:$port/"
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  AI CENTER STORE - LOCAL WEB SERVER & SYNC API DANG CHAY" -ForegroundColor Green
Write-Host "  Dia chi truy cap: $url" -ForegroundColor Yellow
Write-Host "  Dong bo du lieu:  $url`api/db" -ForegroundColor Cyan
Write-Host "  Trang quan tri:   $url`admin.html" -ForegroundColor Cyan
Write-Host "  Nhan Ctrl + C de dung server." -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Green

# Open browser if requested
if ($OpenBrowser) {
    try {
        Start-Process $url -ErrorAction SilentlyContinue
    } catch {}
}

$mimeTypes = @{
    ".html"  = "text/html; charset=utf-8"
    ".htm"   = "text/html; charset=utf-8"
    ".css"   = "text/css; charset=utf-8"
    ".js"    = "application/javascript; charset=utf-8"
    ".json"  = "application/json; charset=utf-8"
    ".svg"   = "image/svg+xml"
    ".png"   = "image/png"
    ".jpg"   = "image/jpeg"
    ".jpeg"  = "image/jpeg"
    ".ico"   = "image/x-icon"
    ".woff"  = "font/woff"
    ".woff2" = "font/woff2"
    ".ttf"   = "font/ttf"
}

$buffer = New-Object byte[] 8192

function Send-Response($stream, [int]$statusCode, [string]$statusText, [string]$contentType, [byte[]]$contentBytes) {
    $corsHeaders = "HTTP/1.1 $statusCode $statusText`r`nContent-Type: $contentType`r`nContent-Length: $($contentBytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nAccess-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`r`nAccess-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With`r`nCache-Control: no-cache`r`nConnection: close`r`n`r`n"
    $hBytes = [System.Text.Encoding]::ASCII.GetBytes($corsHeaders)
    $stream.Write($hBytes, 0, $hBytes.Length)
    if ($contentBytes.Length -gt 0) {
        $stream.Write($contentBytes, 0, $contentBytes.Length)
    }
    $stream.Flush()
}

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        $client.ReceiveTimeout = 4000
        $client.SendTimeout = 4000

        try {
            $stream = $client.GetStream()
            $bytesRead = $stream.Read($buffer, 0, $buffer.Length)
            if ($bytesRead -gt 0) {
                $reqStr = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $bytesRead)
                $firstLine = $reqStr.Split("`n")[0].Trim()
                $parts = $firstLine -split "\s+"

                if ($parts.Length -ge 2) {
                    $method = $parts[0].ToUpper()
                    $rawPath = $parts[1]
                    $reqPath = $rawPath.Split("?")[0]

                    # 1. Handle CORS Preflight
                    if ($method -eq "OPTIONS") {
                        Send-Response $stream 204 "No Content" "text/plain" (New-Object byte[] 0)
                        continue
                    }

                    # Extract Body for POST/PUT requests
                    $body = ""
                    $headerEnd = $reqStr.IndexOf("`r`n`r`n")
                    if ($headerEnd -ge 0) {
                        $body = $reqStr.Substring($headerEnd + 4)
                    }
                    $contentLength = 0
                    if ($reqStr -match "(?i)Content-Length:\s*(\d+)") {
                        $contentLength = [int]$matches[1]
                    }
                    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)
                    while ($bodyBytes.Length -lt $contentLength -and $client.Connected) {
                        $extraRead = $stream.Read($buffer, 0, [Math]::Min($buffer.Length, $contentLength - $bodyBytes.Length))
                        if ($extraRead -le 0) { break }
                        $body += [System.Text.Encoding]::UTF8.GetString($buffer, 0, $extraRead)
                        $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)
                    }

                    # 2. Handle REST API routes (/api/*)
                    if ($reqPath -eq "/api/status") {
                        $statusJson = @{
                            status = "online"
                            port = $port
                            time = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
                            hasDbFile = (Test-Path $dbFile)
                        } | ConvertTo-Json
                        $respBytes = [System.Text.Encoding]::UTF8.GetBytes($statusJson)
                        Send-Response $stream 200 "OK" "application/json; charset=utf-8" $respBytes
                        continue
                    }

                    if ($reqPath -eq "/api/db") {
                        if ($method -eq "GET") {
                            if (-not (Test-Path $dbFile)) {
                                $null = New-Item -ItemType Directory -Path (Split-Path $dbFile -Parent) -Force -ErrorAction SilentlyContinue
                                "{}" | Out-File -FilePath $dbFile -Encoding utf8
                            }
                            $respBytes = [System.IO.File]::ReadAllBytes($dbFile)
                            Send-Response $stream 200 "OK" "application/json; charset=utf-8" $respBytes
                            continue
                        } elseif ($method -eq "POST" -or $method -eq "PUT") {
                            if ($body.Trim().Length -gt 0) {
                                $null = New-Item -ItemType Directory -Path (Split-Path $dbFile -Parent) -Force -ErrorAction SilentlyContinue
                                [System.IO.File]::WriteAllText($dbFile, $body, [System.Text.Encoding]::UTF8)
                                $respJson = '{"status":"ok","message":"Database synchronized successfully"}'
                            } else {
                                $respJson = '{"status":"error","message":"Empty payload"}'
                            }
                            $respBytes = [System.Text.Encoding]::UTF8.GetBytes($respJson)
                            Send-Response $stream 200 "OK" "application/json; charset=utf-8" $respBytes
                            continue
                        }
                    }

                    if ($reqPath -eq "/api/products") {
                        if ($method -eq "GET") {
                            $dbData = if (Test-Path $dbFile) { Get-Content $dbFile -Raw -Encoding UTF8 | ConvertFrom-Json } else { @{ products = @() } }
                            $prodJson = ($dbData.products | ConvertTo-Json -Depth 10)
                            $respBytes = [System.Text.Encoding]::UTF8.GetBytes($prodJson)
                            Send-Response $stream 200 "OK" "application/json; charset=utf-8" $respBytes
                            continue
                        } elseif ($method -eq "POST") {
                            $dbData = if (Test-Path $dbFile) { Get-Content $dbFile -Raw -Encoding UTF8 | ConvertFrom-Json } else { @{} }
                            $newProds = $body | ConvertFrom-Json
                            $dbData.products = $newProds
                            $updatedJson = ($dbData | ConvertTo-Json -Depth 10)
                            [System.IO.File]::WriteAllText($dbFile, $updatedJson, [System.Text.Encoding]::UTF8)
                            $respJson = '{"status":"ok","message":"Products updated"}'
                            $respBytes = [System.Text.Encoding]::UTF8.GetBytes($respJson)
                            Send-Response $stream 200 "OK" "application/json; charset=utf-8" $respBytes
                            continue
                        }
                    }

                    if ($reqPath -eq "/api/orders") {
                        if ($method -eq "GET") {
                            $dbData = if (Test-Path $dbFile) { Get-Content $dbFile -Raw -Encoding UTF8 | ConvertFrom-Json } else { @{ orders = @() } }
                            $ordersJson = ($dbData.orders | ConvertTo-Json -Depth 10)
                            $respBytes = [System.Text.Encoding]::UTF8.GetBytes($ordersJson)
                            Send-Response $stream 200 "OK" "application/json; charset=utf-8" $respBytes
                            continue
                        } elseif ($method -eq "POST") {
                            $dbData = if (Test-Path $dbFile) { Get-Content $dbFile -Raw -Encoding UTF8 | ConvertFrom-Json } else { @{ orders = @(); products = @(); users = @() } }
                            $newOrder = $body | ConvertFrom-Json
                            
                            $ordersList = [System.Collections.ArrayList]@($dbData.orders)
                            $ordersList.Insert(0, $newOrder)
                            $dbData.orders = $ordersList
                            
                            # Increment sold count for matching product
                            $targetPid = if ($newOrder.productId) { $newOrder.productId } else { $newOrder.id }
                            if ($targetPid) {
                                foreach ($prod in $dbData.products) {
                                    if ($prod.id -eq $targetPid -or $prod.id -eq $newOrder.id) {
                                        $prod.sold = ([int]$prod.sold) + 1
                                    }
                                }
                            }
                            
                            # Update user spending and orders
                            if ($newOrder.customerEmail -and $dbData.users) {
                                $userFound = $false
                                foreach ($u in $dbData.users) {
                                    if ($u.email -eq $newOrder.customerEmail) {
                                        $u.totalOrders = ([int]$u.totalOrders) + 1
                                        $u.totalSpent = ([int]$u.totalSpent) + ([int]$newOrder.amount)
                                        $u.lastTransaction = $newOrder.date
                                        $userFound = $true
                                        break
                                    }
                                }
                                if (-not $userFound) {
                                    $newUser = [PSCustomObject]@{
                                        email = $newOrder.customerEmail
                                        phone = ""
                                        role = "customer"
                                        status = "active"
                                        createdAt = $newOrder.date
                                        totalOrders = 1
                                        totalSpent = [int]$newOrder.amount
                                    }
                                    $usersList = [System.Collections.ArrayList]@($dbData.users)
                                    $usersList.Add($newUser)
                                    $dbData.users = $usersList
                                }
                            }
                            
                            $updatedJson = ($dbData | ConvertTo-Json -Depth 10)
                            [System.IO.File]::WriteAllText($dbFile, $updatedJson, [System.Text.Encoding]::UTF8)
                            
                            $respJson = '{"status":"ok","message":"Order created successfully"}'
                            $respBytes = [System.Text.Encoding]::UTF8.GetBytes($respJson)
                            Send-Response $stream 200 "OK" "application/json; charset=utf-8" $respBytes
                            continue
                        }
                    }

                    if ($reqPath -eq "/api/sepay-webhook") {
                        if ($method -eq "POST") {
                            $spData = $body | ConvertFrom-Json
                            $content = if ($spData.content) { $spData.content } else { $spData.description }
                            $transferAmount = if ($spData.transferAmount) { [int]$spData.transferAmount } else { [int]$spData.amount }
                            $gateway = if ($spData.gateway) { $spData.gateway } else { "MBBank" }
                            $refCode = if ($spData.referenceCode) { $spData.referenceCode } else { "SIM" + (Get-Date).Ticks }

                            $orderCode = $null
                            if ($content -match "(?i)(?:SEVQR|AIC)\s*([A-Za-z0-9_-]+)") {
                                $orderCode = $matches[1].ToUpper()
                            } elseif ($content -match "(?i)\b(DH[0-9]{4}[A-Za-z0-9]{0,3})\b") {
                                $orderCode = $matches[1].ToUpper()
                            }

                            if ($orderCode) {
                                $dbData = if (Test-Path $dbFile) { Get-Content $dbFile -Raw -Encoding UTF8 | ConvertFrom-Json } else { @{ orders = @(); products = @(); users = @() } }
                                $foundOrder = $null
                                foreach ($o in $dbData.orders) {
                                    if ($o.code -eq $orderCode) {
                                        $foundOrder = $o
                                        break
                                    }
                                }

                                if ($foundOrder) {
                                    $reqAmount = if ($foundOrder.amount) { [int]$foundOrder.amount } else { 0 }
                                    if ($transferAmount -gt 0 -and $reqAmount -gt 0 -and $transferAmount -lt $reqAmount) {
                                        $foundOrder.statusText = "Chuyển thiếu ($transferAmount/$reqAmount đ)"
                                    } else {
                                        $foundOrder.status = "paid"
                                        if ($transferAmount -gt $reqAmount -and $reqAmount -gt 0) {
                                            $extra = $transferAmount - $reqAmount
                                            $foundOrder.statusText = "Đã thanh toán (Chuyển thừa $extra đ)"
                                        } else {
                                            $foundOrder.statusText = "Đã thanh toán"
                                        }
                                        $foundOrder | Add-Member -NotePropertyName "paid_at" -NotePropertyValue ((Get-Date).ToString("yyyy-MM-dd HH:mm:ss")) -Force
                                        $foundOrder | Add-Member -NotePropertyName "payment_gateway" -NotePropertyValue $gateway -Force
                                        $foundOrder | Add-Member -NotePropertyName "transaction_id" -NotePropertyValue $refCode -Force

                                    # Update product sold
                                    $targetProdId = if ($foundOrder.productId) { $foundOrder.productId } else { $foundOrder.id }
                                    foreach ($prod in $dbData.products) {
                                        if ($prod.id -eq $targetProdId) {
                                            $prod.sold = ([int]$prod.sold) + 1
                                            $prod.remainingSlots = [Math]::Max(0, ([int]$prod.remainingSlots) - 1)
                                            if (-not $foundOrder.accessUrl -or $foundOrder.accessUrl -like "#*") {
                                                if ($prod.download_url) {
                                                    $foundOrder | Add-Member -NotePropertyName "accessUrl" -NotePropertyValue $prod.download_url -Force
                                                }
                                            }
                                            if ($prod.secret_content) {
                                                $foundOrder | Add-Member -NotePropertyName "unlockedContent" -NotePropertyValue $prod.secret_content -Force
                                            }
                                        }
                                    }

                                    # Update user spent
                                    if ($foundOrder.customerEmail -and $dbData.users) {
                                        foreach ($u in $dbData.users) {
                                            if ($u.email -eq $foundOrder.customerEmail) {
                                                $u.totalSpent = ([int]$u.totalSpent) + [int]$foundOrder.amount
                                                break
                                            }
                                        }
                                    }

                                    $updatedJson = ($dbData | ConvertTo-Json -Depth 10)
                                    [System.IO.File]::WriteAllText($dbFile, $updatedJson, [System.Text.Encoding]::UTF8)

                                    $respJson = @{
                                        success = $true
                                        message = "Order paid and unlocked successfully (Local Dev)"
                                        orderCode = $orderCode
                                        amount = $foundOrder.amount
                                    } | ConvertTo-Json
                                    $respBytes = [System.Text.Encoding]::UTF8.GetBytes($respJson)
                                    Send-Response $stream 200 "OK" "application/json; charset=utf-8" $respBytes
                                    continue
                                } else {
                                    $respJson = '{"success":false,"message":"Order not found in db.json"}'
                                    $respBytes = [System.Text.Encoding]::UTF8.GetBytes($respJson)
                                    Send-Response $stream 200 "OK" "application/json; charset=utf-8" $respBytes
                                    continue
                                }
                            } else {
                                $respJson = '{"success":false,"message":"No order code in transfer content"}'
                                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($respJson)
                                Send-Response $stream 200 "OK" "application/json; charset=utf-8" $respBytes
                                continue
                            }
                        }
                    }

                    if ($reqPath -eq "/api/check-order") {
                        $codeParam = $null
                        if ($rawPath -match "[?&]code=([^&]+)") {
                            $codeParam = [System.Uri]::UnescapeDataString($matches[1])
                        }

                        if ($codeParam) {
                            $dbData = if (Test-Path $dbFile) { Get-Content $dbFile -Raw -Encoding UTF8 | ConvertFrom-Json } else { @{ orders = @() } }
                            $foundOrder = $null
                            foreach ($o in $dbData.orders) {
                                if ($o.code -eq $codeParam) {
                                    $foundOrder = $o
                                    break
                                }
                            }

                            if ($foundOrder) {
                                $respJson = ($foundOrder | ConvertTo-Json -Depth 5)
                                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($respJson)
                                Send-Response $stream 200 "OK" "application/json; charset=utf-8" $respBytes
                                continue
                            } else {
                                $respJson = '{"error":"Order not found"}'
                                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($respJson)
                                Send-Response $stream 404 "Not Found" "application/json; charset=utf-8" $respBytes
                                continue
                            }
                        } else {
                            $respJson = '{"error":"Missing code param"}'
                            $respBytes = [System.Text.Encoding]::UTF8.GetBytes($respJson)
                            Send-Response $stream 400 "Bad Request" "application/json; charset=utf-8" $respBytes
                            continue
                        }
                    }

                    # 3. Handle Static Files
                    if ($reqPath -eq "/" -or $reqPath -eq "") { $reqPath = "/index.html" }
                    $safeRelPath = $reqPath.TrimStart("/").Replace("/", "\")
                    $filePath = Join-Path $root $safeRelPath

                    if (Test-Path $filePath -PathType Leaf) {
                        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                        $ct = $mimeTypes[$ext]
                        if (-not $ct) { $ct = "application/octet-stream" }
                        $bytes = [System.IO.File]::ReadAllBytes($filePath)
                        Send-Response $stream 200 "OK" $ct $bytes
                    } else {
                        $msg = [System.Text.Encoding]::UTF8.GetBytes("<h1>404 Not Found: $reqPath</h1>")
                        Send-Response $stream 404 "Not Found" "text/html; charset=utf-8" $msg
                    }
                }
            }
        } catch {
            # Catch transient network/client reset exceptions
        } finally {
            try { $client.Close() } catch {}
        }
    }
} finally {
    try { $listener.Stop() } catch {}
}
