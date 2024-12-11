const request = require("../test/test.js");
const net = require("net");

/**
 * Finds the first occurrence of a specific character in a string.
 * @param {string} req - The string to search.
 * @param {string} target - The character to find.
 * @returns {number} The position of the target character, or -1 if not found.
 */
function findFirstBrac(req, target) {
  for (let i = 0; i < req.length; i++) {
    if (req[i] === target) {
      return i;
    }
  }
  return -1;
}

/**
 * Parses an HTTP request string into a structured object.
 * @async
 * @param {string} request - The raw HTTP request string.
 * @returns {Promise<Object>} A parsed HTTP request object containing method, path, version, and optionally a body.
 */
async function httpParser(request) {
  const req = {};
  const requestString = request.split("\n");
  const pos = findFirstBrac(requestString, "{");
  const requestWoBody = requestString.slice(0, pos);

  req.method = requestWoBody[0].split(" ")[0];
  req.path = requestString[0].split(" ")[1];
  req.version = requestString[0].split(" ")[2];

  if (req.method === "GET") {
    return req;
  }

  await HTTPbody(requestString, pos).then((data) => {
    req.body = JSONbodyParser(data);
  });

  return req;
}

/**
 * Parses a JSON-like body string into a JavaScript object.
 * @param {string} body - The body string to parse.
 * @returns {Object} Parsed JSON object.
 */
function JSONbodyParser(body) {
  const req = body.split("");
  const httpJSON = {};
  let flag = 0;

  while (req.length !== 0) {
    if (req[0] === "{") {
      flag++;
      req.shift();
    } else if (req[0] === "}") {
      flag--;
      req.shift();
    } else {
      storePair(req, httpJSON);
    }
  }

  return httpJSON;
}

/**
 * Parses the body of an HTTP request starting from a given position.
 * @param {string[]} req - The request string array.
 * @param {number} pos - The starting position of the body.
 * @returns {Promise<string>} The parsed body as a string.
 */
function HTTPbody(req, pos) {
  let flag = 0;
  let body = "";

  return new Promise((resolve) => {
    for (let i = pos; i < req.length; i++) {
      if (req[i] === "{") {
        flag++;
        body += req[i];
      } else if (req[i] === "}") {
        flag--;
        body += req[i];
      }
      body += req[i];
    }

    resolve(body.replace(/\s+/g, "").replace(/"/g, ""));
  });
}

/**
 * Stores key-value pairs from a request string into a JSON object.
 * @param {string[]} req - The request string array.
 * @param {Object} httpJSON - The JSON object to store the key-value pairs.
 * @returns {string[]} The remaining request string array after parsing.
 */
function storePair(req, httpJSON) {
  let key = "";
  while (req[0] !== ":") {
    key += req.shift();
  }
  req.shift();

  let value = "";
  while (req[0] !== "," && req[0] !== null) {
    value += req.shift();
  }
  req.shift();

  httpJSON[key] = value;
  return req;
}

/**
 * Parses a query string from a URL.
 * @param {string} request - The full URL containing the query string.
 * @returns {Object} Parsed query parameters as key-value pairs.
 */
function queryParser(request) {
  const pos = findFirstBrac(request, "?");
  const query = request.slice(pos + 1);
  return storeQuery(query);
}

/**
 * Parses a query string into a JSON object.
 * @param {string} query - The query string to parse.
 * @returns {Object} Parsed query parameters as a JSON object.
 */
function storeQuery(query) {
  const req = query.split("");
  const httpQueryJSON = {};

  while (req.length !== 0) {
    queryStorePair(req, httpQueryJSON);
  }

  return httpQueryJSON;
}

/**
 * Parses and stores a single key-value pair from a query string.
 * @param {string[]} req - The query string array.
 * @param {Object} httpQueryJSON - The JSON object to store the key-value pair.
 * @returns {Object} The updated JSON object with the new key-value pair.
 */
function queryStorePair(req, httpQueryJSON) {
  let key = "";
  while (req[0] !== "=") {
    key += req.shift();
  }
  req.shift();

  let value = "";
  while (req[0] !== "&" && req[0] !== undefined) {
    value += req.shift();
  }
  if (req[0] === "&") req.shift();

  httpQueryJSON[key] = value;
  return httpQueryJSON;
}
