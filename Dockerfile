# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app source code
COPY . .

# Build the application
RUN npm run build

# Expose the port your app runs on
EXPOSE 8080

# Start the app
CMD ["npm", "start"]
