mkdir C:\dbbackup
powershell Set-ExecutionPolicy RemoteSigned
powershell %~dp0dbbackup.ps1
powershell Set-ExecutionPolicy Restricted