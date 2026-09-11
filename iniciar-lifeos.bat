@echo off
title Life OS - modo desarrollo
cd /d "%~dp0"

echo.
echo   Life OS - modo desarrollo
echo   Iniciando... (Next.js dev server)
echo   Cierra esta ventana para detener la aplicacion.
echo.

echo   Comprobando puerto 3000...
for /f "tokens=5" %%P in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo   Liberando puerto 3000: terminando proceso %%P
    taskkill /F /PID %%P >nul 2>&1
)
timeout /t 1 /nobreak >nul

call npm run dev

pause