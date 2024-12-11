/**
 * Finds the first occurrence of a target character in a string.
 * @param {string} req - The input string to search.
 * @param {string} target - The character to find.
 * @returns {number} The index of the target character, or -1 if not found.
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
 * Parses the body of an HTTP request starting from a given position.
 * @param {string} req - The HTTP request string.
 * @param {number} pos - The starting position of the body.
 * @returns {Promise<string>} A promise that resolves to the cleaned-up body string.
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
      } else {
        body += req[i];
      }
    }
    resolve(cleanUpBody(body));
  });
}

/**
 * Cleans up a JSON-like body string by removing extra whitespace.
 * @param {string} body - The body string to clean up.
 * @returns {string} The cleaned-up body string.
 */
function cleanUpBody(body) {
  return body
    .trim()
    .split(/\s+/)
    .join(" ")
    .replace(/\s*:\s*/g, ":")
    .replace(/\s*,\s*/g, ",");
}

/**
 * Parses a JSON-like string into a JavaScript object.
 * @param {string} body - The JSON-like string to parse.
 * @returns {Object} A JavaScript object representing the parsed JSON.
 */
function JSONbodyParser(body) {
  const req = body.split("");
  const httpJSON = {};
  if (req.length < 1) return httpJSON;

  while (req.length > 0) {
    if (req[0] === "{") {
      req.shift();
    } else if (req[0] === "}") {
      req.shift();
    } else {
      storePair(req, httpJSON);
    }
  }

  return httpJSON;
}

/**
 * Stores a key-value pair from a JSON-like string into an object.
 * @param {string[]} req - The JSON-like string array being parsed.
 * @param {Object} httpJSON - The object to store the parsed key-value pair.
 * @returns {string[]} The remaining JSON-like string array.
 */
function storePair(req, httpJSON) {
  let key = "";
  let value = "";

  while (req.length > 0 && req[0] !== ":") {
    if (req[0] !== '"' && req[0] !== " ") {
      key += req[0];
    }
    req.shift();
  }

  if (req.length < 1) return;
  req.shift();

  if (req[0] === "{") {
    req.shift();
    const nestedObject = {};
    while (req[0] !== "}") {
      storePair(req, nestedObject);
    }
    req.shift();
    httpJSON[key.trim()] = nestedObject;
  } else {
    value = parseValue(req);
    httpJSON[key.trim()] = value;
  }

  return req;
}

/**
 * Parses a primitive value from a JSON-like string array.
 * @param {string[]} req - The JSON-like string array being parsed.
 * @returns {string|number} The parsed value, either a string or a number.
 */
function parseValue(req) {
  let value = "";
  let isString = false;

  if (req[0] === '"') {
    isString = true;
    req.shift();
  }

  while (req[0] !== "," && req[0] !== "}" && req[0] !== "]") {
    if (isString && req[0] === '"') {
      req.shift();
      break;
    } else {
      value += req[0];
    }
    req.shift();
  }

  if (req[0] === ",") req.shift();

  if (!isString && !isNaN(Number(value))) {
    return Number(value);
  }

  return value.trim();
}

/**
 * Parses query parameters from a URL string into a JavaScript object.
 * @param {string} request - The URL string containing query parameters.
 * @returns {Object} A JavaScript object representing the parsed query parameters.
 */
function queryParser(request) {
  const httpQueryJSON = {};
  const queryStart = request.indexOf("?");

  if (queryStart === -1) {
    return httpQueryJSON;
  }

  const queryString = request.slice(queryStart + 1).split("&");

  for (const pair of queryString) {
    const [key, value] = pair.split("=");
    if (key) {
      httpQueryJSON[key] = value || "";
    }
  }

  return httpQueryJSON;
}

/**
 * Looks up the MIME type for a given file extension.
 * @param {string} extension - The file extension to look up.
 * @returns {string} The MIME type for the given extension, or "application/octet-stream" if not found.
 */
function lookupMimeType(extension) {
  const mimeType = Object.keys(mimeDb).find((type) =>
    mimeDb[type].extensions.includes(extension),
  );
  return mimeType || "application/octet-stream";
}

const mimeDb = require("./mimeDb"); // Adjust the path as needed

module.exports = {
  findFirstBrac,
  HTTPbody,
  JSONbodyParser,
  queryParser,
  lookupMimeType,
};
