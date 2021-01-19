@ECHO OFF 
CD %~dp0
SQLCMD -S localhost -U admin -P Banana2020 -d  -i Query.sql -s, -W -h -1 -o Qutput.csv