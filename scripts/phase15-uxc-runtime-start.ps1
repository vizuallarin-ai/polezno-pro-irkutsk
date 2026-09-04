# UX.C isolated runtime — disposable Postgres (VPS) + local exact build/server.
# No production DB writes, no PM2 restart, no deploy. Artifacts under .deploy-artifacts/phase15-uxc-runtime/
$ErrorActionPreference = 'Stop'
$Repo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$SshExe = "$env:WINDIR\System32\OpenSSH\ssh.exe"
$ScpExe = "$env:WINDIR\System32\OpenSSH\scp.exe"
$SshKey = "$env:USERPROFILE\.ssh\irkportal_ed25519"
$BaselineDbHash = 'aa0524ed11168e8312059284fd036dac'
$BaselineRoleHash = '3ed2674f6fec329463acb5c4fc438ac4'
$ExpectedProdHead = '3631094e14616c6f816bbd6308701e201ed69309'
$ExpectedBuildId = 'zOvFS1L8wUwIeQ5wVB9ij'

$TargetSha = (& git -c "safe.directory=$Repo" -C $Repo rev-parse HEAD).Trim()

$Suffix = -join ((48..57 + 97..102 | Get-Random -Count 8 | ForEach-Object { [char]$_ }))
$RunId = (Get-Date).ToUniversalTime().ToString("yyyyMMdd'T'HHmmss'Z'") + '_' + $Suffix
$Role = "phase15_builder_$Suffix"
$PreDb = "irkportal_phase15_pre_$Suffix"
$PostDb = "irkportal_phase15_post_$Suffix"
$Password = -join ((48..57 + 65..90 + 97..122 | Get-Random -Count 40 | ForEach-Object { [char]$_ }))
$LocalPort = Get-Random -Minimum 55432 -Maximum 55999
$PayloadSecret = -join ((48..57 + 97..102 | Get-Random -Count 64 | ForEach-Object { [char]$_ }))
$SmokePort = 31248
$ArtDir = Join-Path $Repo ".deploy-artifacts/phase15-uxc-runtime/$TargetSha"
New-Item -ItemType Directory -Force -Path $ArtDir | Out-Null
$PidFile = Join-Path $ArtDir 'server.pid'
$StateFile = Join-Path $ArtDir 'server-state.json'

Write-Host "UXC_RUN_ID=$RunId TARGET_SHA=$TargetSha PORT=$SmokePort"

$before = (& $SshExe -o BatchMode=yes -o IdentitiesOnly=yes -i $SshKey root@90.156.170.182 "cd /var/www/polezno && echo HEAD=`$(git rev-parse HEAD) && echo BUILD_ID=`$(cat .next/BUILD_ID)") | Out-String
Set-Content (Join-Path $ArtDir 'prod-before.txt') $before
if ($before -notmatch [regex]::Escape("HEAD=$ExpectedProdHead")) { throw 'prod HEAD drifted' }
if ($before -notmatch [regex]::Escape("BUILD_ID=$ExpectedBuildId")) { throw 'prod BUILD_ID drifted' }

& $ScpExe @('-o','BatchMode=yes','-o','IdentitiesOnly=yes','-i',$SshKey) (Join-Path $Repo 'scripts/phase15-disposable-setup.sh') 'root@90.156.170.182:/tmp/setup.sh'
$setupOut = (($Password + "`n") | & $SshExe -o BatchMode=yes -o IdentitiesOnly=yes -i $SshKey root@90.156.170.182 "sed -i 's/\r$//' /tmp/setup.sh && PHASE15_ROLE='$Role' PHASE15_PRE_DB='$PreDb' bash /tmp/setup.sh; rm -f /tmp/setup.sh") | Out-String
if ($setupOut -notmatch 'SETUP=PASS') { throw 'setup failed' }

& $ScpExe @('-o','BatchMode=yes','-o','IdentitiesOnly=yes','-i',$SshKey) (Join-Path $Repo 'scripts/phase15-disposable-drop-pre.sh') 'root@90.156.170.182:/tmp/drop.sh'
& $SshExe -o BatchMode=yes -o IdentitiesOnly=yes -i $SshKey root@90.156.170.182 "sed -i 's/\r$//' /tmp/drop.sh && PHASE15_ROLE='$Role' PHASE15_PRE_DB='$PreDb' bash /tmp/drop.sh; rm -f /tmp/drop.sh" | Out-Null

& $ScpExe @('-o','BatchMode=yes','-o','IdentitiesOnly=yes','-i',$SshKey) (Join-Path $Repo 'scripts/phase15-disposable-post-db.sh') 'root@90.156.170.182:/tmp/post.sh'
($Password + "`n") | & $SshExe -o BatchMode=yes -o IdentitiesOnly=yes -i $SshKey root@90.156.170.182 "sed -i 's/\r$//' /tmp/post.sh && PHASE15_ROLE='$Role' PHASE15_POST_DB='$PostDb' bash /tmp/post.sh; rm -f /tmp/post.sh" | Out-Null

$Tunnel = Start-Process $SshExe -ArgumentList @('-o','BatchMode=yes','-o','IdentitiesOnly=yes','-o','ExitOnForwardFailure=yes','-o','ServerAliveInterval=30','-i',$SshKey,'-N','-L',"127.0.0.1:${LocalPort}:127.0.0.1:5432",'root@90.156.170.182') -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 5

$u = [uri]::EscapeDataString($Role)
$p = [uri]::EscapeDataString($Password)
$env:PHASE15_DISPOSABLE_DATABASE_URL = "postgresql://${u}:${p}@127.0.0.1:${LocalPort}/${PostDb}"
$env:PHASE15_PAYLOAD_SECRET = $PayloadSecret
Remove-Item Env:GIT_COMMIT_SHA,Env:BUILD_TIMESTAMP,Env:NEXT_PUBLIC_BUILD_TIMESTAMP,Env:VERCEL_GIT_COMMIT_SHA,Env:VERCEL_BUILD_COMPLETED_AT,Env:NEXT_PUBLIC_GIT_COMMIT_SHA -ErrorAction SilentlyContinue

$identityPath = Join-Path $Repo '.next/release-identity.json'
Write-Host "Forcing exact isolated rebuild for $TargetSha"

Set-Location $Repo
$prev = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
npm run build:release:isolated 2>&1 | Tee-Object (Join-Path $ArtDir 'build.log') | Out-Null
$ErrorActionPreference = $prev
if ($LASTEXITCODE -ne 0) { throw "build failed $LASTEXITCODE" }

$id = Get-Content $identityPath -Raw | ConvertFrom-Json
if ($id.commitSha -ne $TargetSha) { throw 'artifact SHA mismatch' }

$env:PORT = "$SmokePort"
$env:DATABASE_URL = $env:PHASE15_DISPOSABLE_DATABASE_URL
$env:PAYLOAD_SECRET = $PayloadSecret
$env:NODE_ENV = 'production'
$env:ALLOW_DEMO_FALLBACK = 'false'
$env:NEXT_PUBLIC_SERVER_URL = "http://127.0.0.1:$SmokePort"
Remove-Item Env:GIT_COMMIT_SHA,Env:BUILD_TIMESTAMP,Env:NEXT_PUBLIC_BUILD_TIMESTAMP -ErrorAction SilentlyContinue

Get-NetTCPConnection -LocalPort $SmokePort -ErrorAction SilentlyContinue | ForEach-Object {
  Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 1

$outLog = Join-Path $ArtDir 'next-out.log'
$errLog = Join-Path $ArtDir 'next-err.log'
$Next = Start-Process -FilePath 'cmd.exe' -ArgumentList @('/c','npm run start') -WorkingDirectory $Repo -PassThru -WindowStyle Hidden -RedirectStandardOutput $outLog -RedirectStandardError $errLog
$Next.Id | Set-Content $PidFile

$ready = $false
for ($i = 0; $i -lt 90; $i++) {
  if ($Next.HasExited) { throw "server exited early; see $errLog" }
  try {
    $h = Invoke-RestMethod "http://127.0.0.1:$SmokePort/api/health" -TimeoutSec 5
    if ($h.commitSha -eq $TargetSha -and $h.identityComplete -eq $true) {
      $home = (Invoke-WebRequest "http://127.0.0.1:$SmokePort/" -TimeoutSec 20).Content
      if ($home -notmatch 'Смотреть маршруты') {
        throw 'served HTML missing discovery CTA; refusing stale/mismatched server'
      }
      if ($home -match 'inline-flex h-9 items-center[^>]+href="/business"') {
        throw 'served HTML still has legacy h-9 /business header CTA'
      }
      $ready = $true
      break
    }
  } catch {
    if ($_.Exception.Message -match 'legacy header CTA|discovery CTA') { throw $_ }
    Start-Sleep -Seconds 2
  }
}
if (-not $ready) { throw 'health not ready' }

$health = Invoke-RestMethod "http://127.0.0.1:$SmokePort/api/health" -TimeoutSec 30
$health | ConvertTo-Json -Depth 6 | Set-Content (Join-Path $ArtDir 'health.json')

@{
  runId = $RunId
  targetSha = $TargetSha
  port = $SmokePort
  serverPid = $Next.Id
  tunnelPid = $Tunnel.Id
  role = $Role
  preDb = $PreDb
  postDb = $PostDb
  localPort = $LocalPort
  baseUrl = "http://127.0.0.1:$SmokePort"
  baselineDbHash = $BaselineDbHash
  baselineRoleHash = $BaselineRoleHash
} | ConvertTo-Json | Set-Content $StateFile

Write-Host "UXC_SERVER_READY baseUrl=http://127.0.0.1:$SmokePort sha=$($health.commitSha)"
Write-Host "STATE_FILE=$StateFile"
# Cleanup via scripts/phase15-uxc-runtime-stop.ps1
