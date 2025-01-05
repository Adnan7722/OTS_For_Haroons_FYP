# Use Node.js base image
FROM node:16 AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project
COPY . .

# Print Node and npm versions to debug
RUN node -v
RUN npm -v

# Build the React app
RUN npm run build
