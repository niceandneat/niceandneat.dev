#!/bin/bash
set -e
domains=(niceandneat.dev api.niceandneat.dev)
certificates_path="./certbot"
email="niceaneat@gmail.com"

if [ ! -e "$certificates_path/dhparam.pem" ]; then
  echo "# Generate Diffie-Hellman keys..."
  docker-compose run --rm --entrypoint "\
    openssl dhparam \
      -out '/etc/keys/dhparam.pem' 2048" certbot
else
  echo "# Found Diffie-Hellman keys on \"$certificates_path\"! Using the existing one..."
fi
echo

if [ ! -d "$certificates_path/letsencrypt/csr" ]; then
  echo "# Start to Get certificates with certbot..."

  echo "## Comment out SSL related directives in the nginx configuration"
  sed -i -r 's/(listen .*443)/\1;#/g; s/(ssl_(certificate|certificate_key|trusted_certificate) )/#;#\1/g' nginx/sites-enabled/niceandneat.dev.conf

  echo "## Start nginx server without https settings"
  docker-compose up -d nginx

  #Join $domains to -d args
  domain_args=""
  for domain in "${domains[@]}"; do
    domain_args="$domain_args -d $domain"
  done

  echo "## Obtain SSL certificates from Let's Encrypt using Certbot"
  docker-compose run --rm --entrypoint "\
    certbot certonly --webroot \
      $domain_args \
      --email $email \
      -w /var/www/_letsencrypt \
      -n \
      --agree-tos \
      --force-renewal" certbot

  echo "## Stop and remove nginx (without https) container"
  docker-compose down nginx

  echo "## Uncomment SSL related directives in the configuration"
  sed -i -r 's/#?;#//g' /etc/nginx/sites-enabled/niceandneat.dev.conf
else
  echo "# Found certificates on \"$certificates_path\"! Using the existing one..."
fi
echo

echo "# Finished settings! Run 'docker-compose up -d"
echo
