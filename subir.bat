@echo off
chcp 65001 >nul
echo ============================================
echo    SUBIR TOPVALOR A GITHUB PAGES
echo ============================================
echo.

set USER=Miguelgc71
set REPO=topvalor
set TOKEN=
if exist "%USERPROFILE%\.githubtoken" set /p TOKEN=< "%USERPROFILE%\.githubtoken"

rem --- 1. Pedir usuario/repo (enter = por defecto)
set /p IN_USER=Usuario de GitHub (enter para %USER%): 
if not "%IN_USER%"=="" set USER=%IN_USER%
set /p IN_REPO=Repo (enter para %REPO%): 
if not "%IN_REPO%"=="" set REPO=%IN_REPO%

if "%TOKEN%"=="" (
  echo.
  echo [AVISO] No encuentro el archivo %USERPROFILE%\.githubtoken
  echo Crea el token en GitHub ^> Settings ^> Developer settings ^> Personal access tokens,
  echo marca "repo" y guardalo con:  echo TU_TOKEN ^> "%USERPROFILE%\.githubtoken"
  echo El push te pedira usuario y contraseña ^(usa el token como contraseña^).
)

echo.
echo Preparando commit...
git add -A
git commit -m "TopValor app" >nul 2>&1
git branch -M main

echo Anadiendo repositorio remoto...
git remote remove origin 2>nul
git remote add origin "https://github.com/%USER%/%REPO%.git"

if not "%TOKEN%"=="" (
  echo Subiendo con token automatico...
  git push -u "https://%USER%:%TOKEN%@github.com/%USER%/%REPO%.git" main
) else (
  echo Subiendo... ^(pedira usuario y token la primera vez^)
  git push -u origin main
)

if errorlevel 1 (
  echo.
  echo ============================================
  echo   SI FALLO: el token va como contraseña al
  echo   pedirtelo. O ejecuta una vez:
  echo     git config --global credential.helper manager
  echo ============================================
) else (
  echo.
  echo HECHO. Tu app estara en:
  echo   https://%USER%.github.io/%REPO%/
)
pause