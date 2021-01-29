openssl genrsa -out jwt-key 8192
openssl rsa -in jwt-key -outform PEM -pubout -out jwt-key.pub
