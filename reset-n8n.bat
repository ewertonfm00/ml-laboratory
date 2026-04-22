@echo off
psql postgresql://postgres:LdMDvxoqOaYxlEgRnfqSpykBNpvZvNQa@mainline.proxy.rlwy.net:13932/railway -c "UPDATE \"user\" SET password = '$2b$10$LSvPp6vEpWVpayJaHNAnBeYF073uhMUKkLPbdjxREXS0/RpTIaaHC' WHERE role = 'owner';"
pause
