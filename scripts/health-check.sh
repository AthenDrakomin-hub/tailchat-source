#!/usr/bin/env bash
set -e;
echo "=== TIME/OS ==="; date; uname -a; echo;
echo "=== DISK/MEM ==="; df -h / | tail -n 1; free -h; echo;
echo "=== NGINX TEST ==="; nginx -t; echo;
echo "=== CERT EXPIRE (wm + goodspage) ===";
for c in /etc/letsencrypt/live/wm.goodspage.cn/fullchain.pem /etc/nginx/ssl/goodspage.cn.fullchain.pem; do
  echo "--- $c";
  [ -f "$c" ] && openssl x509 -in "$c" -noout -subject -dates 2>/dev/null || echo "MISSING";
done; echo;
echo "=== PORTS (80/443/11000/7880) ===";
ss -lntp | egrep ":80 |:443 |:11000 |:7880 " || true; echo;
echo "=== DOCKER COMPOSE PS ===";
cd /var/www/tailchat-source && docker compose ps; echo;
echo "=== HEALTHCHECK ===";
curl -I "https://goodspage.cn" | head -n 5 || true;
curl -I "https://wm.goodspage.cn" | head -n 5 || true;
curl -I "http://127.0.0.1:11000" | head -n 5 || true;
curl -I "http://127.0.0.1:7880" | head -n 5 || true;
echo;
echo "=== RECENT ERRORS (nginx) ===";
tail -n 30 /var/log/nginx/error.log || true;
