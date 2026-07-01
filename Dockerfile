# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the SvelteKit application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the built application from the builder stage
COPY --from=builder /app/build ./build

# Expose port (SvelteKit adapter-node default is 3000)
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Run the SvelteKit application
CMD ["node", "build/index.js"]
