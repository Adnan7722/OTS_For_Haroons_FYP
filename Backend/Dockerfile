# Use the Node.js official image
FROM node:16

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Command to start the app
CMD ["node", "server.js"]
