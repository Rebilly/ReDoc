#!/bin/sh

set -e

sed -i -e "s|%PAGE_TITLE%|$PAGE_TITLE|g" /usr/share/nginx/html/index.html
sed -i -e "s|%PAGE_FAVICON%|$PAGE_FAVICON|g" /usr/share/nginx/html/index.html
sed -i -e "s|%BASE_PATH%|$BASE_PATH|g" /usr/share/nginx/html/index.html
sed -i -e "s|%SPEC_URL%|$SPEC_URL|g" /usr/share/nginx/html/index.html
sed -i -e "s|%REDOC_OPTIONS%|${REDOC_OPTIONS}|g" /usr/share/nginx/html/index.html
sed -i -e "s|\(listen\s*\) [0-9]*|\1 ${PORT}|g" /etc/nginx/nginx.conf

exec nginx -g 'daemon off;'
