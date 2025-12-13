#!/bin/sh
set -e

# Cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations (force for production)
php artisan migrate --force

# Start Server
# Hugging Face Spaces defaults to port 7860.
php artisan serve --host=0.0.0.0 --port=${PORT:-7860}
