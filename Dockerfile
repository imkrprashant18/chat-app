# ---- Base Image ----
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json/yarn.lock
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy rest of the project
COPY . .

# Build the app
RUN npm run build


# ---- Production Image ----
FROM nginx:alpine

# Remove default Nginx HTML page
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html


# Copy custom nginx config if needed (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]