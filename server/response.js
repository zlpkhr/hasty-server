const fs = require("fs");
const { lookupMimeType } = require("../lib/utils");
const path = require("path");

/**
 * Represents an HTTP response to be sent to the client.
 */
class Response {
  /**
   * Creates a new Response instance.
   * @param {import("net").Socket} socket - The socket connection to the client.
   * @param {boolean} enableCors - Whether to enable CORS headers for the response.
   */
  constructor(socket, enableCors) {
    this.socket = socket;
    this.enableCors = enableCors || false;
    this.headers = {};
    this.statusCode = 200;
    this.statusTextMap = {
      200: "OK",
      201: "Created",
      202: "Accepted",
      204: "No Content",
      301: "Moved Permanently",
      302: "Found",
      303: "See Other",
      304: "Not Modified",
      400: "Bad Request",
      401: "Unauthorized",
      403: "Forbidden",
      404: "Not Found",
      405: "Method Not Allowed",
      406: "Not Acceptable",
      409: "Conflict",
      417: "Expectation Failed",
      500: "Internal Server Error",
      501: "Not Implemented",
      503: "Service Unavailable",
    };
  }

  /**
   * Sets the HTTP status code for the response.
   * @param {number} code - The HTTP status code.
   * @returns {Response} The current Response instance for chaining.
   * @throws {Error} If an invalid status code is provided.
   */
  status(code) {
    if (!this.statusTextMap[code]) {
      throw new Error(`Invalid status code: ${code}`);
    }
    this.statusCode = code;
    return this;
  }

  /**
   * Sets a header for the response.
   * @param {string} key - The header name.
   * @param {string} value - The header value.
   * @returns {Response} The current Response instance for chaining.
   */
  setHeader(key, value) {
    this.headers[key] = value;
    return this;
  }

  /**
   * Sets CORS headers for the response if enabled.
   */
  setCorsHeaders() {
    if (this.enableCors) {
      this.setHeader("Access-Control-Allow-Origin", "*");
      this.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
      );
      this.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization",
      );
    }
  }

  /**
   * Formats headers into a string suitable for an HTTP response.
   * @returns {string} The formatted headers.
   */
  formatHeaders() {
    return Object.keys(this.headers)
      .map((key) => `${key}: ${this.headers[key]}`)
      .join("\r\n");
  }

  /**
   * Sends data as the response body.
   * @param {string|Object} data - The data to send.
   */
  send(data) {
    if (this.enableCors) {
      this.setCorsHeaders();
    }

    if (typeof data === "string") {
      if (data.startsWith("<") && data.endsWith(">")) {
        this.setHeader("Content-Type", "text/html");
      } else {
        this.setHeader("Content-Type", "text/plain");
      }
    } else {
      return this.json(data);
    }

    this.setHeader("Content-Length", Buffer.byteLength(data).toString());

    const headers = `HTTP/1.1 ${this.statusCode} ${this.statusTextMap[this.statusCode]}\r\n${this.formatHeaders()}\r\n\r\n`;
    this.socket.write(headers + data);
    this.socket.end();
  }

  /**
   * Sends only the HTTP status code without a body.
   * @param {number} statusCode - The HTTP status code to send.
   */
  sendStatus(statusCode) {
    this.status(statusCode);
    const headers = `HTTP/1.1 ${this.statusCode} ${this.statusTextMap[this.statusCode]}\r\n${this.formatHeaders()}\r\n\r\n`;
    this.socket.write(headers);
    this.socket.end();
  }

  /**
   * Sends data as a JSON response.
   * @param {Object} data - The JSON object to send.
   */
  json(data) {
    if (this.enableCors) {
      this.setCorsHeaders();
    }
    const body = JSON.stringify(data);
    this.setHeader("Content-Type", "application/json");
    this.setHeader("Content-Length", Buffer.byteLength(body).toString());

    const headers = `HTTP/1.1 ${this.statusCode} ${this.statusTextMap[this.statusCode]}\r\n${this.formatHeaders()}\r\n\r\n`;
    this.socket.write(headers + body);
    this.socket.end();
  }

  /**
   * Sends a file as the response.
   * @param {string} file - The file path to send.
   */
  sendFile(file) {
    if (this.enableCors) {
      this.setCorsHeaders();
    }
    const mimeType = lookupMimeType(path.extname(file).slice(1));
    this.setHeader("Content-Type", mimeType);

    fs.stat(file, (err, stats) => {
      if (err) {
        this.sendStatus(404);
        return;
      }

      this.setHeader("Content-Length", stats.size.toString());

      const headers = `HTTP/1.1 ${this.statusCode} ${this.statusTextMap[this.statusCode]}\r\n${this.formatHeaders()}\r\n\r\n`;
      this.socket.write(headers);

      const stream = fs.createReadStream(file);
      stream.pipe(this.socket);

      stream.on("error", () => {
        this.sendStatus(500);
      });

      stream.on("end", () => {
        this.socket.end();
      });
    });
  }

  /**
   * Sends a file as an attachment for download.
   * @param {string} file - The file path to send.
   * @param {string} filename - The filename to use for the download.
   */
  download(file, filename) {
    if (this.enableCors) {
      this.setCorsHeaders();
    }
    const mimeType = lookupMimeType(path.extname(file).slice(1));
    this.setHeader("Content-Type", mimeType);
    this.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    fs.stat(file, (err, stats) => {
      if (err) {
        this.sendStatus(404);
        return;
      }

      this.setHeader("Content-Length", stats.size.toString());

      const headers = `HTTP/1.1 ${this.statusCode} ${this.statusTextMap[this.statusCode]}\r\n${this.formatHeaders()}\r\n\r\n`;
      this.socket.write(headers);

      const stream = fs.createReadStream(file);
      stream.pipe(this.socket);

      stream.on("error", () => {
        this.sendStatus(500);
      });

      stream.on("end", () => {
        this.socket.end();
      });
    });
  }
}

module.exports = Response;
