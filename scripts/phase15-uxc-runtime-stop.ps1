# Stop UX.C runtime + cleanup disposable DB/role. No production app mutation.
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
$ArtDir = Join-Path $Repo ".deploy-artifacts/phase15-uxc-runtime/$TargetSha"
$StateFile = Join-Path $ArtDir 'server-state.json'
if (-not (Test-Path $StateFile)) { throw "missing state $StateFile" }
$st = Get-Content $StateFile -Raw | ConvertFrom-Json

if ($st.serverPid) { Stop-Process -Id ([int]$st.serverPid) -Force -ErrorAction SilentlyContinue }
if ($st.tunnelPid) { Stop-Process -Id ([int]$st.tunnelPid) -Force -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 2

Remove-Item Env:PHASE15_DISPOSABLE_DATABASE_URL,Env:PHASE15_PAYLOAD_SECRET,Env:DATABASE_URL,Env:PAYLOAD_SECRET,Env:PORT -ErrorAction SilentlyContinue

& $ScpExe @('-o','BatchMode=yes','-o','IdentitiesOnly=yes','-i',$SshKey) (Join-Path $Repo 'scripts/phase15-disposable-cleanup.sh') 'root@90.156.170.182:/tmp/cleanup.sh'
$cleanup = (& $SshExe -o BatchMode=yes -o IdentitiesOnly=yes -i $SshKey root@90.156.170.182 "sed -i 's/\r$//' /tmp/cleanup.sh && PHASE15_ROLE='$($st.role)' PHASE15_PRE_DB='$($st.preDb)' PHASE15_POST_DB='$($st.postDb)' bash /tmp/cleanup.sh; rm -f /tmp/cleanup.sh") | Out-String
Set-Content (Join-Path $ArtDir 'cleanup.txt') $cleanup

$invScript = @'
#!/usr/bin/env bash
set -euo pipefail
dbs=$(sudo -u postgres psql -tAc "SELECT count(*) FROM pg_database WHERE datname ~ '^irkportal_phase15_' OR datname ~ '^phase15_'")
roles=$(sudo -u postgres psql -tAc "SELECT count(*) FROM pg_roles WHERE rolname ~ '^phase15_'")
db_hash=$(sudo -u postgres psql -tAc "SELECT md5(string_agg(datname, chr(44) ORDER BY datname)) FROM pg_database WHERE datistemplate = false;")
role_hash=$(sudo -u postgres psql -tAc "SELECT md5(string_agg(rolname, chr(44) ORDER BY rolname)) FROM pg_roles;")
printf 'phase15_dbs=%s\nphase15_roles=%s\ndb_hash=%s\nrole_hash=%s\n' "$dbs" "$roles" "$db_hash" "$role_hash"
cd /var/www/polezno
printf 'HEAD=%s\nBUILD_ID=%s\n' "$(git rev-parse HEAD)" "$(cat .next/BUILD_ID)"
pm2 describe polezno | head -n 20
'@
$invRemote = '/tmp/phase15_uxc_inv.sh'
Set-Content -Path (Join-Path $ArtDir 'inv-remote.sh') -Value $invScript -NoNewline
& $ScpExe @('-o','BatchMode=yes','-o','IdentitiesOnly=yes','-i',$SshKey) (Join-Path $ArtDir 'inv-remote.sh') "root@90.156.170.182:$invRemote"
$after = (& $SshExe -o BatchMode=yes -o IdentitiesOnly=yes -i $SshKey root@90.156.170.182 "sed -i 's/\r$//' $invRemote && bash $invRemote; rm -f $invRemote") | Out-String
Set-Content (Join-Path $ArtDir 'inventory-after.txt') $after
Set-Content (Join-Path $ArtDir 'prod-after.txt') $after

$dbs = if ($after -match 'phase15_dbs=(\d+)') { $Matches[1] } else { 'missing' }
$roles = if ($after -match 'phase15_roles=(\d+)') { $Matches[1] } else { 'missing' }
$dbHash = if ($after -match 'db_hash=([a-f0-9]+)') { $Matches[1] } else { 'missing' }
$roleHash = if ($after -match 'role_hash=([a-f0-9]+)') { $Matches[1] } else { 'missing' }

Write-Host "CLEANUP_DONE dbs=$dbs roles=$roles dbHash=$dbHash roleHash=$roleHash"
if ($dbs -ne '0' -or $roles -ne '0') { throw 'residue remains' }
if ($dbHash -ne $BaselineDbHash -or $roleHash -ne $BaselineRoleHash) { throw 'inventory hash mismatch' }
if ($after -notmatch [regex]::Escape("HEAD=$ExpectedProdHead")) { throw 'prod HEAD changed' }
if ($after -notmatch [regex]::Escape("BUILD_ID=$ExpectedBuildId")) { throw 'prod BUILD_ID changed' }
Write-Host "UXC_CLEANUP_PASS"
