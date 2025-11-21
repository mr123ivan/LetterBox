# Use Node LTS
FROM node:18

# Create app directory inside container
WORKDIR /app

# Copy package files first (faster builds)
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the rest of the backend code
COPY . .

# Expose your Express port
EXPOSE 5001

# Start your server
CMD ["npm", "start"]
