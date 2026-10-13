FROM ubuntu:24.04@sha256:534baea6a22c03a63003dbc8dbe78fe34bc0d7e595d9a9dc9834884ff530eb55 AS original
ENV DEBIAN_FRONTEND=noninteractive TZ=America/Bogota
RUN apt-get update && apt-get install -y --no-install-recommends \
    apache2 libapache2-mod-php8.3 php8.3-cli php8.3-pgsql php8.3-gd \
    php8.3-xml php8.3-zip postgresql-client curl ca-certificates openssl \
    zip unzip sharutils libany-uri-escape-perl python3-matplotlib tzdata \
    && rm -rf /var/lib/apt/lists/*
COPY upstream /var/www/boca
COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf
COPY docker/php.ini /etc/php/8.3/apache2/conf.d/99-boca.ini
COPY docker/conf.php /var/www/boca/src/private/conf.php
COPY docker/entrypoint.sh /usr/local/bin/boca-entrypoint
COPY docker/initialize.php /opt/boca/initialize.php
RUN sed -i 's/\r$//' /usr/local/bin/boca-entrypoint \
    && chmod 755 /usr/local/bin/boca-entrypoint \
    && chown -R www-data:www-data /var/www/boca \
    && chmod 750 /var/www/boca/src/private \
    && chmod 640 /var/www/boca/src/private/conf.php \
    && printf 'ServerName localhost\n' > /etc/apache2/conf-available/server-name.conf \
    && a2enconf server-name && apache2ctl configtest
WORKDIR /var/www/boca/src
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=12 \
    CMD curl --fail --silent http://127.0.0.1/boca/ > /dev/null || exit 1
EXPOSE 80
ENTRYPOINT ["/usr/local/bin/boca-entrypoint"]

FROM original AS personalizado
COPY custom /var/www/boca/src/custom
COPY scripts/aplicar-tema.php /tmp/aplicar-tema.php
RUN php /tmp/aplicar-tema.php /var/www/boca/src \
    && chown -R www-data:www-data /var/www/boca/src/custom
