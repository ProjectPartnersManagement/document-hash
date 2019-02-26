# Copy-paste this to your terminal.

# Create root authority key
openssl genrsa -des3 -out rootCA.key -passout pass:projectpartners 2048

# Create the root authority certificate (valid for 2048 days)
# The password is "projectpartners"
openssl req -x509 -new -nodes -key rootCA.key -sha256 -days 2048 -out rootCA.pem -passin pass:projectpartners

#########################
# MANUAL STEPS
#########################
# Add the rootCA.pem as a trusted authority to your system. Please google "add trusted certificate authority windows/linux/mac"
# Instructions for Windows can be found here (do not download anything, just follow the pictures):
# https://support.securly.com/hc/en-us/articles/206081828-How-to-manually-install-the-Securly-SSL-certificate-in-Chrome

# Create domain certificate key
openssl req -new -sha256 -nodes -out server.csr -newkey rsa:2048 -keyout server.key -config <( cat server.csr.cnf )

# Create domain certificate (valid for 1024 days)
openssl x509 -req -in server.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial -out server.crt -days 1024 -sha256 -extfile v3.ext -passin pass:projectpartners
