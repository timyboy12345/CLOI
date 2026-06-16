# Backend Dockerfile
FROM node:22-slim

WORKDIR /app

# Install build dependencies for better-sqlite3 (native addon)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

# Build the project (if needed, though we run ts-node-dev for simplicity in this base)
# In production, you'd run 'npm run build' and use the dist/ folder
RUN npm install -g ts-node-dev

EXPOSE 3001

CMD ["npm", "run", "dev"]
