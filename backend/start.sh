#!/usr/bin/env bash

# Cache configuration, routes, and events for production performance
php artisan config:cache
php artisan route:cache
php artisan event:cache
php artisan optimize

# Run migrations (force since it's in production)
php artisan migrate --force

# Start Apache in the foreground
exec apache2-foreground
