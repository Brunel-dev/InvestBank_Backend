# 1. Utiliser l'image officielle PHP avec Apache
FROM php:8.2-apache

# 2. Installer les dépendances système et PostgreSQL
RUN apt-get update && apt-get install -y \
    libpq-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_pgsql

# 3. Activer le module de réécriture d'Apache (nécessaire pour Laravel)
RUN a2enmod rewrite

# 4. Changer la racine d'Apache vers le dossier "public" de Laravel
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# 5. Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 6. Copier tout le code du projet dans le conteneur
WORKDIR /var/www/html
COPY . .

# 7. Installer les dépendances Laravel
RUN composer install --no-dev --optimize-autoloader

# 8. Assurer les droits d'écriture pour Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# 9. Configurer Apache pour écouter sur le port dynamique de Render
RUN sed -i "s/Listen 80/Listen \${PORT:-80}/g" /etc/apache2/ports.conf
RUN sed -i "s/<VirtualHost \*:80>/<VirtualHost \*:\${PORT:-80}>/g" /etc/apache2/sites-available/000-default.conf

# 10. Démarrage : Caches, migrations et lancement du serveur
CMD php artisan config:cache && php artisan view:cache && php artisan migrate --force && apache2-foreground
