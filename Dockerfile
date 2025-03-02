FROM node:18

# Install OpenJDK and set environment variables
RUN apt-get update && \
    apt-get install -y openjdk-17-jdk && \
    apt-get clean

# Set JAVA_HOME and PATH explicitly
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH="${JAVA_HOME}/bin:${PATH}"

# Verify Java installation
RUN javac -version && java -version

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Start the app
CMD ["node", "server.js"] 