const { httpParser } = require("../lib/httpParser.js"); // Import the httpParser function from the httpParser.js file
const net = require("net"); // Import the net module from Node.JS
const Response = require("./response.js"); // Import the response object
const logger = require("../lib/logger.js"); // Import the logger

function getSocket(callback, context) {
  return net.createServer((Socket) => callback(Socket, context));
}

function handler(socket, context) {
  logger.info("New connection established");

  socket.on("data", (data) => {
    logger.debug("Received data from client: ", data.toString());

    const res = new Response(socket, context.enableCors); // Set up a new Response object with the socket and cors state
    const buff = data.toString(); // Convert buffer data to string

    httpParser(buff)
      .then((data) => {
        logger.info(`Parsed HTTP request: ${data.method} ${data.path}`);
        pathController(data, context, res);
      })
      .catch((error) => {
        logger.error("Error parsing HTTP request:", error);
        res.sendStatus(400); // Send a Bad Request status
      });
  });

  socket.on("error", (error) => {
    logger.error("Socket error:", error);
  });

  socket.on("end", () => {
    logger.info("Connection closed");
  });
}

function pathController(data, context, res) {
  const path = data.path;
  const method = data.method;

  logger.debug(`Handling request: ${method} ${path}`);

  // Find the matching route, accounting for parameters
  const route = context.routes.find((route) => {
    return matchRouteWithParams(route.path, path) && route.method === method;
  });

  if (route) {
    const params = extractParams(route.path, path);
    logger.info(
      `Matched route: ${method} ${route.path} with params: ${JSON.stringify(params)}`,
    );

    data.params = params; // Attach extracted params to data
    route.callback(data, res); // Pass the updated data with params
  } else {
    logger.warn(`Route not found: ${method} ${path}`);
    res.sendStatus(404); // Route not found
  }
}

// Helper function to check if the route matches, including parameters
function matchRouteWithParams(routePath, actualPath) {
  const routeParts = routePath.split("/");
  const pathParts = actualPath.split("/");

  if (routeParts.length !== pathParts.length) return false;

  return routeParts.every((part, index) => {
    return part.startsWith(":") || part === pathParts[index];
  });
}

// Helper function to extract params from the matched route
function extractParams(routePath, actualPath) {
  const routeParts = routePath.split("/");
  const pathParts = actualPath.split("/");
  const params = {};

  routeParts.forEach((part, index) => {
    if (part.startsWith(":")) {
      const paramName = part.slice(1); // Remove the colon (:) from parameter name
      params[paramName] = pathParts[index]; // Assign actual path value
    }
  });

  return params;
}

class Server {
  socket;
  constructor() {
    this.socket = getSocket(handler, this);
    this.routes = [];
  }

  listen(PORT, callback) {
    this.socket.listen(PORT, () => {
      logger.info(`Server is listening on port ${PORT}`);
      if (callback) callback();
    });
  }

  close() {
    this.socket.close(() => {
      logger.warn("Server closed");
    });
  }
}

class Hasty extends Server {
  constructor() {
    super();
    this.enableCors = false; // default to false
  }

  setRoute(method, object) {
    const route = {};
    route.callback = object.callback;
    route.path = object.path;
    route.method = method;
    this.routes.push(route);
    logger.info(`Route added: ${method} ${object.path}`);
  }

  cors(enable) {
    this.enableCors = enable;
    logger.info(`CORS enabled: ${enable}`);
  }

  get(path, callback) {
    this.setRoute("GET", { callback, path });
  }

  post(path, callback) {
    this.setRoute("POST", { callback, path });
  }

  put(path, callback) {
    this.setRoute("PUT", { callback, path });
  }

  delete(path, callback) {
    this.setRoute("DELETE", { callback, path });
  }

  patch(path, callback) {
    this.setRoute("PATCH", { callback, path });
  }

  head(path, callback) {
    this.setRoute("HEAD", { callback, path });
  }

  options(path, callback) {
    this.setRoute("OPTIONS", { callback, path });
  }
}

module.exports = Hasty;
