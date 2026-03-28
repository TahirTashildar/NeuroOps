FROM node:20-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build

# Remove dev dependencies after build (optional)
# RUN npm ci --only=production

# Expose ports
EXPOSE 3001 9091

# Start application
CMD ["npm", "start"]
