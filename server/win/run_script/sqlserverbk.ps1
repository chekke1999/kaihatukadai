$credential = Get-Credential
Backup-SqlDatabase -ServerInstance "WIN-U1BKBN0NAL8\MSSQLSERVER" -Database piscan -BackupAction Database -Credential $credential