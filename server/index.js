const { httpParser } = require("../lib/httpParser.js"); // Import the httpParser function from the httpParser.js file
const net = require("net"); // Import the net module from Node.JS
const Response = require("./response.js"); // Import the response object
const logger = require("../lib/logger.js"); // Import the logger

/**
 * Creates a new socket server with a specified handler.
 * @param {Function} callback - The callback function to handle connections.
 * @param {Object} context - The context to be passed to the callback.
 * @returns {net.Server} A new socket server instance.
 */
function getSocket(callback, context) {
  return net.createServer((Socket) => callback(Socket, context));
}

/**
 * Handles incoming connections on a socket.
 * @param {net.Socket} socket - The client socket.
 * @param {Object} context - The server context.
 */
function handler(socket, context) {
  logger.info("New connection established");

  socket.on("data", (data) => {
    logger.debug("Received data from client: ", data.toString());

    const res = new Response(socket, context.enableCors);
    const buff = data.toString();

    httpParser(buff)
      .then((data) => {
        logger.info(`Parsed HTTP request: ${data.method} ${data.path}`);
        pathController(data, context, res);
      })
      .catch((error) => {
        logger.error("Error parsing HTTP request:", error);
        res.sendStatus(400);
      });
  });

  socket.on("error", (error) => {
    logger.error("Socket error:", error);
  });

  socket.on("end", () => {
    logger.info("Connection closed");
  });
}

/**
 * Directs HTTP requests to the appropriate route handler.
 * @param {Object} data - Parsed HTTP request data.
 * @param {Object} context - The server context containing routes.
 * @param {Response} res - The response object to send replies.
 */
function pathController(data, context, res) {
  const path = data.path;
  const method = data.method;

  logger.debug(`Handling request: ${method} ${path}`);

  const route = context.routes.find((route) => {
    return matchRouteWithParams(route.path, path) && route.method === method;
  });

  if (route) {
    const params = extractParams(route.path, path);
    logger.info(
      `Matched route: ${method} ${route.path} with params: ${JSON.stringify(params)}`,
    );

    data.params = params;
    route.callback(data, res);
  } else {
    logger.warn(`Route not found: ${method} ${path}`);
    res.sendStatus(404);
  }
}

/**
 * Checks if a route matches the requested path, including parameters.
 * @param {string} routePath - The route path template.
 * @param {string} actualPath - The actual request path.
 * @returns {boolean} True if the route matches, false otherwise.
 */
function matchRouteWithParams(routePath, actualPath) {
  const routeParts = routePath.split("/");
  const pathParts = actualPath.split("/");

  if (routeParts.length !== pathParts.length) return false;

  return routeParts.every((part, index) => {
    return part.startsWith(":") || part === pathParts[index];
  });
}

/**
 * Extracts parameters from a matched route and request path.
 * @param {string} routePath - The route path template.
 * @param {string} actualPath - The actual request path.
 * @returns {Object} A key-value map of route parameters.
 */
function extractParams(routePath, actualPath) {
  const routeParts = routePath.split("/");
  const pathParts = actualPath.split("/");
  const params = {};

  routeParts.forEach((part, index) => {
    if (part.startsWith(":")) {
      const paramName = part.slice(1);
      params[paramName] = pathParts[index];
    }
  });

  return params;
}

/**
 * Represents a basic HTTP server.
 */
class Server {
  /**
   * Creates a new Server instance.
   */
  constructor() {
    this.socket = getSocket(handler, this);
    this.routes = [];
  }

  /**
   * Starts the server and begins listening on a specified port.
   * @param {number} PORT - The port number to listen on.
   * @param {Function} [callback] - A callback function to run after the server starts.
   */
  listen(PORT, callback) {
    this.socket.listen(PORT, () => {
      logger.info(`Server is listening on port ${PORT}`);
      if (callback) callback();
    });
  }

  /**
   * Closes the server.
   */
  close() {
    this.socket.close(() => {
      logger.warn("Server closed");
    });
  }
}

/**
 * Represents an extended HTTP server with routing and CORS support.
 * @extends Server
 */
class Hasty extends Server {
  /**
   * Creates a new Hasty server instance.
   */
  constructor() {
    super();
    this.enableCors = false;
  }

  /**
   * Sets a new route for a specific HTTP method.
   * @param {string} method - The HTTP method (GET, POST, etc.).
   * @param {Object} object - The route definition with `path` and `callback`.
   */
  setRoute(method, object) {
    const route = {
      callback: object.callback,
      path: object.path,
      method: method,
    };
    this.routes.push(route);
    logger.info(`Route added: ${method} ${object.path}`);
  }

  /**
   * Enables or disables CORS headers.
   * @param {boolean} enable - Whether to enable CORS.
   */
  cors(enable) {
    this.enableCors = enable;
    logger.info(`CORS enabled: ${enable}`);
  }

  /**
   * Adds a GET route.
   * @param {string} path - The route path.
   * @param {Function} callback - The route handler function.
   */
  get(path, callback) {
    this.setRoute("GET", { callback, path });
  }

  /**
   * Adds a POST route.
   * @param {string} path - The route path.
   * @param {Function} callback - The route handler function.
   */
  post(path, callback) {
    this.setRoute("POST", { callback, path });
  }

  /**
   * Adds a PUT route.
   * @param {string} path - The route path.
   * @param {Function} callback - The route handler function.
   */
  put(path, callback) {
    this.setRoute("PUT", { callback, path });
  }

  /**
   * Adds a DELETE route.
   * @param {string} path - The route path.
   * @param {Function} callback - The route handler function.
   */
  delete(path, callback) {
    this.setRoute("DELETE", { callback, path });
  }

  /**
   * Adds a PATCH route.
   * @param {string} path - The route path.
   * @param {Function} callback - The route handler function.
   */
  patch(path, callback) {
    this.setRoute("PATCH", { callback, path });
  }

  /**
   * Adds a HEAD route.
   * @param {string} path - The route path.
   * @param {Function} callback - The route handler function.
   */
  head(path, callback) {
    this.setRoute("HEAD", { callback, path });
  }

  /**
   * Adds an OPTIONS route.
   * @param {string} path - The route path.
   * @param {Function} callback - The route handler function.
   */
  options(path, callback) {
    this.setRoute("OPTIONS", { callback, path });
  }
}

module.exports = Hasty;
