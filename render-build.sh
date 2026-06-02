#!/usr/bin/env bash
# Exit on error
set -o errexit

# Installation des dépendances
composer install --no-dev --optimize-autoloader

# Nettoyage et cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Migration de la base de données
php artisan migrate --force
