#!/bin/bash

# Export environment variables from GitHub Secrets
export DOCKER_TLS_VERIFY=1
export DOCKER_HOST=${{ secrets.DOCKER_HOST }}
export DOCKER_CERT_PATH=${GITHUB_WORKSPACE}/.docker  # Use GitHub Actions workspace

# Create the directory to store Docker certs
mkdir -p $DOCKER_CERT_PATH

# Decode the base64 encoded certificates and save them to the appropriate files
echo ${{ secrets.CERT_PEM }} | base64 --decode > $DOCKER_CERT_PATH/cert.pem
echo ${{ secrets.KEY_PEM }} | base64 --decode > $DOCKER_CERT_PATH/key.pem
echo ${{ secrets.CA_PEM }} | base64 --decode > $DOCKER_CERT_PATH/ca.pem

# Print message to indicate successful setup
echo "Docker TLS setup complete"
