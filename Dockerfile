# Use Ubuntu as base image
FROM ubuntu:22.04

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Install Node.js 18 and Java (Optimized for speed)
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs openjdk-17-jdk && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Verify installations
RUN node --version && \
    java -version && \
    javac -version

# Set JAVA_HOME
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH="${JAVA_HOME}/bin:${PATH}"

# Set working directory
WORKDIR /app

# Copy package files (Optimized npm install)
COPY package*.json ./
RUN npm ci --only=production  # Faster than npm install

# Copy all files
COPY . .

# Create a temp directory in memory (RAM) for fast compilation
RUN mkdir -p /app/temp

# Set permissions
RUN chmod -R 755 /app/temp

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]
