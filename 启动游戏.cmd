@echo off
setlocal
cd /d "%~dp0"

set "NODE_EXE="

if exist "C:\Program Files\nodejs\node.exe" set "NODE_EXE=C:\Program Files\nodejs\node.exe"
if not defined NODE_EXE if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" set "NODE_EXE=%LOCALAPPDATA%\Programs\nodejs\node.exe"
if not defined NODE_EXE if exist "%LOCALAPPDATA%\OpenAI\Codex\runtimes\cua_node\789504f803e82e2b\bin\node.exe" set "NODE_EXE=%LOCALAPPDATA%\OpenAI\Codex\runtimes\cua_node\789504f803e82e2b\bin\node.exe"

if not defined NODE_EXE (
  echo Node.js was not found.
  echo Please install Node.js LTS from https://nodejs.org/
  pause
  exit /b 1
)

set "PORT_BUSY="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":3000 .*LISTENING"') do set "PORT_BUSY=%%P"

echo Starting Ball Duel V1...
echo.
echo Open this URL on this computer:
echo http://localhost:3000
echo.
set "LAN_IP="
for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "$line = ipconfig | Select-String 'IPv4 Address.*(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)' | Select-Object -First 1; if ($line) { ($line.ToString().Split(':')[-1]).Trim() }"`) do set "LAN_IP=%%I"
if defined LAN_IP (
  echo Open this URL on your phone while using the same Wi-Fi:
  echo http://%LAN_IP%:3000
  echo.
)
echo Keep this window open while playing.
echo Close this window to stop the server.
echo.
if defined PORT_BUSY (
  echo Server is already running on port 3000.
  echo If you need to restart it, run STOP_GAME.cmd first.
  pause
  exit /b 0
)
"%NODE_EXE%" server\index.js
pause
