@echo off
title AgendOS - modo desarrollo
cd /d "%~dp0"

echo.
echo   AgendOS - modo desarrollo
echo   [1] Abrir como aplicacion (ventana de escritorio)
echo   [2] Abrir en el navegador web
echo   Cierra esta ventana para detener la aplicacion.
echo.

set /p opcion=Selecciona una opcion (1 o 2): 
echo.

if "%opcion%"=="2" goto web

echo   Iniciando aplicacion de escritorio...
call npm run dev:app
goto fin

:web
echo   Iniciando servidor web...
start "" http://localhost:3000
call npm run dev

:fin
pause