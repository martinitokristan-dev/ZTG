#!/usr/bin/env bash

# Cache configuration and routes
php artisan config:cache
php artisan route:cache

# Run migrations (force since it's in production)
php artisan migrate --force

# Start Apache in the foreground
exec apache2-foreground
