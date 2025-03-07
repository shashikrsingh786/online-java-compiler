# Use lightweight base image
FROM node:18-slim  

# Install Java & Dependencies
RUN apt-get update && apt-get install -y openjdk-17-jdk && apt-get clean

# Set working directory
WORKDIR /app

# Copy package.json first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy rest of the files
COPY . .

# Set JAVA_HOME
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH="${JAVA_HOME}/bin:${PATH}"

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
