FROM php:8.3-cli-alpine

# 1. Instalar bibliotecas de sistema necessárias
RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    oniguruma-dev

# 2. Instalar extensões do PHP
RUN docker-php-ext-install pdo pdo_pgsql mbstring zip bcmath

# 3. Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# 4. Copiar arquivos de dependências e instalar sem dev
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# 5. Copiar o restante da aplicação
COPY . .

# 6. Gerar autoload otimizado de produção
RUN composer dump-autoload --optimize --no-dev

# 7. Script de inicialização respeitando $PORT e 0.0.0.0
CMD ["sh", "-c", "php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]