#!/bin/bash
set -e 
set -x 

deploy_api() {
    echo "🚀 Iniciando despliegue de la API..."
    cd /var/www/html/RefuerzoEscolarWeb/refuerzo-apiv2/
    git pull origin main
    yarn install --frozen-lockfile
    if [ "$CI" = "true" ]; then
        NODE_OPTIONS="--max-old-space-size=4096" yarn run build
    else
        yarn run build
    fi
    pm2 restart apiv2
    echo "✅ API desplegada correctamente"
}

deploy_web() {
    echo "🚀 Iniciando despliegue de la Web..."
    cd /var/www/html/RefuerzoEscolarWeb/refuerzo-web/
    git pull origin main
    npm ci --force
    npm run build
    pm2 restart refuerzo-web
    echo "✅ Web desplegada correctamente"
}

deploy_api
deploy_web

echo "🎉 Despliegue completo exitoso!"
