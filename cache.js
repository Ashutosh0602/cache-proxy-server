const express = require("express");
const axios = require("axios");

class CacheServer {
  constructor(port, origin, redisClient) {
    this.port = port;
    this.origin = origin;
    this.redisClient = redisClient;
    this.app = express();
    this.ttl = 30;
  }

  async handleRequest(req, res) {
    const sanitizedPath = req.originalUrl.replace(/^\/+/, "");
    const cacheKey = `${this.origin}${sanitizedPath}`;
    console.log(`Received request for ${cacheKey}`);

    try {
      const startTime = Date.now();
      const cachedResponse = await this.redisClient.get(cacheKey);
      if (cachedResponse) {
        const endTime = Date.now();
        console.log(`Cache HIT - Response time: ${endTime - startTime} ms`);
        res.setHeader("X-Cache", "HIT");
        return res.status(200).send(JSON.parse(cachedResponse));
      }

      const fetchStartTime = Date.now();
      const response = await axios.get(cacheKey);
      const responseData = response.data;
      const fetchEndTime = Date.now();
      console.log(
        `Cache MISS - Fetch time: ${fetchEndTime - fetchStartTime} ms`
      );

      await this.redisClient.set(
        cacheKey,
        JSON.stringify(responseData),
        "EX",
        this.ttl
      );
      res.setHeader("X-Cache", "MISS");
      res.status(response.status).send(responseData);
    } catch (error) {
      console.error(`Error fetching data: ${error.message}`);
      res.status(500).send("Internal Server Error");
    }
  }

  async invalidateCache(req, res) {
    const sanitizedPath = req.originalUrl.replace(/^\/+/, "");
    const cacheKey = `${this.origin}/${sanitizedPath}`;
    console.log(`Invalidating cache for ${cacheKey}`);

    try {
      await this.redisClient.del(cacheKey);
      console.log(`Cache invalidated for ${cacheKey}`);
      res.status(200).send({ message: "Cache invalidated successfully" });
    } catch (error) {
      console.error("Error invalidating cache:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  start() {
    this.app.get("*", this.handleRequest.bind(this));
    this.app.post("*", this.invalidateCache.bind(this));
    this.app.put("*", this.invalidateCache.bind(this));
    this.app.delete("*", this.invalidateCache.bind(this));

    this.app.listen(this.port, () => {
      console.log(
        `Cache server started on port ${this.port} and proxying requests to ${this.origin}`
      );
    });
  }
}

module.exports = CacheServer;
