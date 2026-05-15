#!/bin/sh
set -e

# Cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations (force for production)
php artisan migrate --force

# Start Server
# Enable multiple workers for the PHP built-in server to handle concurrent HF health checks
export PHP_CLI_SERVER_WORKERS=4
php artisan serve --host=0.0.0.0 --port=${PORT:-7860}
