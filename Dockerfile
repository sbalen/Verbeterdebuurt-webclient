FROM httpd:2.4
COPY . /usr/local/apache2/htdocs/

WORKDIR /usr/local/apache2/htdocs/

RUN apt-get update \
    && apt-get -y install curl wget \
    && curl -sL https://deb.nodesource.com/setup_8.x | bash - \
    && apt-get install -y nodejs \
    && npm install \
    && chmod +x build/entrypoint.sh

ENTRYPOINT ["build/entrypoint.sh"]

CMD ["httpd-foreground"]