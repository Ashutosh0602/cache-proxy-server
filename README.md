# Caching Proxy Server with Redis

This project is a caching proxy server that sits between clients and an origin server, improving response times by caching responses in Redis. It reduces redundant requests to the origin server and supports cache invalidation.

## Features

- Caches responses from the origin server using Redis
- Improves performance with cache expiration (TTL: 3000 seconds)
- Supports cache invalidation via `POST`, `PUT`, and `DELETE` requests
- Command-line interface using `yargs`

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (>=14)
- [Redis](https://redis.io/) installed and running locally on port `6379`

### Installation

Clone the repository and install dependencies:

```sh
git clone https://github.com/Ashutosh0602/cache-proxy-server.git
cd cache-proxy-server
npm install
```

## Usage

### Start the Proxy Server

```sh
node index.js start --port 8080 --origin http://dummyjson.com
```

- Replace `http://dummyjson.com` with your origin server URL
- Default port is `8080` (can be changed using `--port` or `-p`)

### Clear the Cache

```sh
node index.js clear
```

## API Endpoints

### Fetch Cached Data (`GET /<path>`)

Fetches cached data for the requested path.  
Example:

```sh
curl http://localhost:8080/api/data
```

- Returns cached response if available, otherwise fetches from origin.

### Invalidate Cache (`POST | PUT | DELETE /<path>`)

Clears the cache for a specific path.  
Example:

```sh
curl -X POST http://localhost:8080/api/data
```
