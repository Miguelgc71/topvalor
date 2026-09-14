@echo off
chcp 65001 >nul
echo ============================================
echo    SUBIR TOPVALOR A GITHUB PAGES
echo ============================================
echo.

rem --- 1. Comprobar si git tiene tu cuenta conectada
git config --global user.name >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Primero conecta tu cuenta de GitHub en este PC.
  echo.
  echo En la WEB de GitHub crea un acceso personal (token):
  echo   1. Entra en github.com y logueate
  echo   2. Menu avatar  ^>  Settings  ^>  Developer settings  ^>  Personal access tokens  ^>  Tokens (classic)
  echo   3. Generate new token  ^>  marca "repo"  ^>  Generate  ^>  COPIA el token
  echo.
  echo Despues, en esta ventana de PowerShell escribe:
  echo   git config --global user.name "TU_USUARIO_DE_GITHUB"
  echo   git config --global user.email "tu_correo_del_github"
  echo   echo TOKEN_QUE_COPIASTE > "%%USERPROFILE%%\.githubtoken"
  echo Y vuelve a ejecutar este archivo.
  pause
  exit /b 1
)

rem --- 2. Crear el repo en GitHub (usa gh si existe, sino lo creamos por API)
set /p USER=Tu usuario de GitHub (ej: ana14):
set /p REPO=Nombre del repo (ej: topvalor):

echo.
echo Preparando commit...
git add -A
git commit -m "TopValor app" >nul 2>&1
git branch -M main

echo Añadiendo repositorio remoto...
git remote remove origin 2>nul
git remote add origin "https://github.com/%USER%/%REPO%.git"

echo Subiendo... (pedira usuario y token la primera vez)
git push -u origin main

if errorlevel 1 (
  echo.
  echo ============================================
  echo   SI FALLO: tu token va como password al
  echo   pedirtelo. O ejecuta una vez:
  echo     git config --global credential.helper manager
  echo ============================================
) else (
  echo.
  echo ¡HECHO! Tu app estara en:
  echo   https://%USER%.github.io/%REPO%/
  echo.
  echo Importante: en github.com  ^>  repo  ^>  Settings  ^>  Pages  ^>  Source: main  ^>  Guardar
)
pause