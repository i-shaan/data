# Base image
FROM node:18

# Set working directory
WORKDIR /techwar

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the application code
COPY . .

ENV PORT=8080
ENV MONGO_URI=your-mongodb-uri
ENV JWT_SECRET=your-secret


# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["npm", "start"]