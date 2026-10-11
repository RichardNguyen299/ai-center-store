$ErrorActionPreference = "Continue"

$port = 8085
$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $port)
$listener.Start()
Write-Host "Started test server on port $port"

# Start client request in background job
$clientJob = Start-Job -ScriptBlock {
    Start-Sleep -Milliseconds 300
    try {
        $r = Invoke-RestMethod -Uri "http://127.0.0.1:8085/api/status" -TimeoutSec 3
        return ($r | ConvertTo-Json -Compress)
    } catch {
        return "ERROR: " + $_.Exception.Message
    }
}

# Accept client on server
$client = $listener.AcceptTcpClient()
$stream = $client.GetStream()
$buf = New-Object byte[] 4096
$read = $stream.Read($buf, 0, $buf.Length)
$reqStr = [System.Text.Encoding]::UTF8.GetString($buf, 0, $read)
Write-Host "Server received: $($reqStr.Split("`n")[0])"

# Send response
$resp = '{"status":"ok","port":8085}'
$respBytes = [System.Text.Encoding]::UTF8.GetBytes($resp)
$headers = "HTTP/1.1 200 OK`r`nContent-Type: application/json; charset=utf-8`r`nContent-Length: $($respBytes.Length)`r`nConnection: close`r`n`r`n"
$hBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
$stream.Write($hBytes, 0, $hBytes.Length)
$stream.Write($respBytes, 0, $respBytes.Length)
$stream.Flush()
$client.Close()
$listener.Stop()

Start-Sleep -Milliseconds 500
$clientRes = Receive-Job $clientJob
Write-Host "Client received: $clientRes"
Remove-Job $clientJob -Force
