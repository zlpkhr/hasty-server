const Hasty = require("../server");
const logger = require("../lib/logger");

// Mock the logger
jest.mock("../lib/logger", () => ({
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
      const client = require("net").connect(PORT.toString(), () => {
        client.write("GET /test HTTP/1.1\r\n\r\n");
      });

      client.on("data", () => {
        client.end();
        try {
          expect(logger.info).toHaveBeenCalledWith(
            "New connection established",
          );
          expect(logger.debug).toHaveBeenCalledWith(
            "Received data from client: ", // Adjust this if necessary
            expect.stringContaining("GET /test HTTP/1.1"),
          );
          expect(logger.info).toHaveBeenCalledWith(
            expect.stringContaining("Parsed HTTP request: GET /test"),
          );
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });

  test("should log when an unmatched route is requested", (done) => {
    const PORT = 8082;

    server.listen(PORT, () => {
      const client = require("net").connect(PORT.toString(), () => {
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
});
