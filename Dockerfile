# Use nginx alpine for a lightweight web server
FROM nginx:alpine

# Copy the static files to the default nginx html directory
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Nginx starts automatically
