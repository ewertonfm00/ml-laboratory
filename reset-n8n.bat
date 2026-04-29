@echo off
if "%DATABASE_URL%"=="" (
  echo ERRO: variavel DATABASE_URL nao esta setada.
  echo Configure-a no ambiente antes de rodar este script:
  echo   set DATABASE_URL=postgresql://USER:PASS@HOST:PORT/DB
  exit /b 1
)
psql "%DATABASE_URL%" -c "UPDATE \"user\" SET password = '$2b$10$LSvPp6vEpWVpayJaHNAnBeYF073uhMUKkLPbdjxREXS0/RpTIaaHC' WHERE role = 'owner';"
pause
