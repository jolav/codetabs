# Use a customized Go image that allows installing packages
FROM golang:1.14-buster

# 1. Install the system dependencies mentioned in your README
RUN apt-get update && apt-get install -y \
    curl \
    git \
    p7zip-full \
    zip \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# 2. Set working directory
WORKDIR /app

# 3. Copy go mod and sum files
COPY go.mod go.sum ./

# 4. Download dependencies
RUN go mod download

# 5. Copy the source code
COPY . .

# 6. Build the application
# We use -o main to name the binary
RUN go build -o main .

# 7. Expose the port (Zeabur will map this internally)
EXPOSE 8080

# 8. Command to run the executable
CMD ["./main"]
