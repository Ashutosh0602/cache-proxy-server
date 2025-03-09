const yargs = require("yargs");
const redis = require("ioredis");
const CacheServer = require("./cache");

const redisClient = new redis({
  host: "127.0.0.1",
  port: 6379,
});

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
  process.exit(1);
});

yargs
  .command(
    "start",
    "Starting the caching proxy server",
    {
      port: {
        alias: "p",
        description: "Port number for the proxy server",
        type: "number",
        default: 8080,
      },
      origin: {
        alias: "o",
        description: "Origin server to proxy requests to",
        type: "string",
        demandOption: true,
      },
    },
    (argv) => {
      const { port, origin } = argv;
      console.log(
        `Starting the caching proxy server on port ${argv.port} and proxying requests to ${argv.origin}`
      );
      redisClient.once("connect", () => {
        const cacheServer = new CacheServer(port, origin, redisClient);
        cacheServer.start();
      });
    }
  )
  .command("clear", "Clearing the cache", {}, async () => {
    console.log("Clearing the cache");
    await redisClient.flushall();
    console.log("Cleared the cache");
  })
  .help().argv;
