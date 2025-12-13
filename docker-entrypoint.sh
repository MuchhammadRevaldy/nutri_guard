#!/bin/sh
set -e

# Cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations (force for production)
php artisan migrate --force

# Start Server
# Using artisan serve is easiest for simple containers without Nginx config, 
# though php-fpm is better for scaling. For Render/Fly Free tier, artisan serve is often sufficient for demos.
php artisan serve --host=0.0.0.0 --port=8080
