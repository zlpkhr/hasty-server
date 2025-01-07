const pino = require("pino");

// @ts-ignore
const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

module.exports = logger;
