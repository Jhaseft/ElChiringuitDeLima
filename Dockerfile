# ---------------------------------------
# 1️⃣ Base PHP 8.3 CLI
# ---------------------------------------
FROM php:8.3-cli

# ---------------------------------------
# 2️⃣ Instalar dependencias del sistema y extensiones PHP necesarias
# ---------------------------------------
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libonig-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libxml2-dev \
    libpq-dev \
    zip \
    curl \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql pgsql zip mbstring xml gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# ---------------------------------------
# 3️⃣ Instalar Node.js 20 LTS + npm
# ---------------------------------------
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest

# ---------------------------------------
# 4️⃣ Instalar Composer globalmente
# ---------------------------------------
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# ---------------------------------------
# 5️⃣ Definir directorio de trabajo
# ---------------------------------------
WORKDIR /var/www/html

# ---------------------------------------
# 6️⃣ Copiar solo composer.json y composer.lock para cache
# ---------------------------------------
COPY composer.json composer.lock ./

# ---------------------------------------
# 7️⃣ Instalar dependencias PHP
# ---------------------------------------
RUN php -d memory_limit=-1 /usr/bin/composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# ---------------------------------------
# 8️⃣ Copiar el resto del proyecto
# ---------------------------------------
COPY . .

# ---------------------------------------
# 9️⃣ Instalar dependencias JS y construir frontend
# ---------------------------------------
RUN npm ci \
    && npm run build

# ---------------------------------------
# 🔹 Ajustar permisos para storage y cache de Laravel
# ---------------------------------------
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# ---------------------------------------
# 🔹 Exponer puerto dinámico (Railway usa variable PORT)
# ---------------------------------------
EXPOSE 8080

# ---------------------------------------
# 🔹 Comando para iniciar servidor PHP embebido
# ---------------------------------------
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-8080} -t public"]
