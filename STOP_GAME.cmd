@echo off
setlocal

set "FOUND="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":3000 .*LISTENING"') do (
  set "FOUND=1"
  echo Stopping process %%P on port 3000...
  taskkill /PID %%P /F >nul 2>nul
)

if not defined FOUND (
  echo No game server is running on port 3000.
) else (
  echo Done.
)

pause
