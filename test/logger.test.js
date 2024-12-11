const Hasty = require("../server");
const logger = require("../lib/logger");

// Mock the logger
jest.mock("./logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

describe("Hasty Server Logging", () => {
  let server;

  beforeEach(() => {
    server = new Hasty();
  });

  afterEach(() => {
    if (server.socket.listening) {
      server.close();
    }
    jest.clearAllMocks();
  });

  test("should log when server starts", (done) => {
    const PORT = 8080;

    server.listen(PORT, () => {
      expect(logger.info).toHaveBeenCalledWith(
        `Server is listening on port ${PORT}`,
      );
      done();
    });
  });

  test("should log when a route is added", () => {
    const path = "/test";
    const callback = jest.fn();

    server.get(path, callback);

    expect(logger.info).toHaveBeenCalledWith(`Route added: GET ${path}`);
  });

  test("should log when a request is handled", (done) => {
    const PORT = 8081;
    const mockCallback = jest.fn((req, res) => {
      res.sendStatus(200);
    });

    server.get("/test", mockCallback);

    server.listen(PORT, () => {
      const client = require("net").connect(PORT, () => {
        client.write("GET /test HTTP/1.1\r\n\r\n");
      });

      client.on("data", () => {
        client.end();
        expect(logger.info).toHaveBeenCalledWith("New connection established");
        expect(logger.debug).toHaveBeenCalledWith(
          expect.stringContaining("Received data from client:"),
        );
        expect(logger.info).toHaveBeenCalledWith(
          expect.stringContaining("Parsed HTTP request: GET /test"),
        );
        expect(logger.info).toHaveBeenCalledWith(
          expect.stringContaining("Matched route: GET /test"),
        );
        done();
      });
    });
  });

  test("should log when an unmatched route is requested", (done) => {
    const PORT = 8082;

    server.listen(PORT, () => {
      const client = require("net").connect(PORT, () => {
        client.write("GET /nonexistent HTTP/1.1\r\n\r\n");
      });

      client.on("data", () => {
        client.end();
        expect(logger.warn).toHaveBeenCalledWith(
          "Route not found: GET /nonexistent",
        );
        done();
      });
    });
  });

  test("should log when CORS is enabled", () => {
    server.cors(true);

    expect(logger.info).toHaveBeenCalledWith("CORS enabled: true");
  });

  test("should log when server is closed", (done) => {
    const PORT = 8083;

    server.listen(PORT, () => {
      server.close();
      expect(logger.warn).toHaveBeenCalledWith("Server closed");
      done();
    });
  });
});
