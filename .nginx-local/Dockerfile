# Use the official NGINX image as the base image
FROM nginx:latest

# Copy your custom .nginx-local.conf file from the local directory to the container
COPY nginx.conf /etc/nginx/nginx.conf

# Expose the port NGINX will run on
EXPOSE 8000

# Start NGINX when the container starts
CMD ["nginx", "-g", "daemon off;"]
