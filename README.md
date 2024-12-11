# Hasty Server

**Hasty Server** is a blazing fast, lightweight HTTP server for Node.js, designed for developers who need performance and simplicity.

---

## Features

- High-performance HTTP server
- Simple and intuitive API
- TypeScript and JavaScript support
- Built-in logging with [Pino](https://github.com/pinojs/pino)
- Easily extensible and configurable

---

## Installation

Ensure you have the following prerequisites installed:

- **Node.js**: >= 20.0.0 (download from [nodejs.org](https://nodejs.org))
- **npm**: Comes with Node.js

Clone the repository and install dependencies:

```bash
git clone https://github.com/zlpkhr/hasty-server.git
cd hasty-server
npm install
```

---

## Usage

Here's how to get started with Hasty Server:

```javascript
const HastyServer = require("./server");
const server = new HastyServer();

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
```

---

## Scripts

The project provides the following npm scripts:

- **Lint**: `npm run lint`  
  Runs TypeScript type checking and linting.
- **Format**: `npm run format`  
  Formats the codebase with Prettier.
- **Test**: `npm run -w test test`  
  Runs the Jest test suite.

---

## Documentation

The documentation is built with [JSDoc](https://jsdoc.app).

### Commands:

- **Start Dev Server**: `npm run -w doc start`
- **Build Documentation**: `npm run -w doc build`
- **Serve Documentation**: `npm run -w doc serve`

Visit the live documentation site: [Hasty Server Docs](https://hasty-server.vercel.app)

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes and ensure all tests pass.
4. Submit a pull request.

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE.txt) file for details.

---

## Author

Originally developed by **Akshat Kotpalliwar**, forked and maintained by **Azamat Zulpykhar**.

Feel free to reach out or contribute to the project on [GitHub](https://github.com/zlpkhr/hasty-server).

---

## Project Status

The project is under active development. Suggestions, bug reports, and pull requests are highly appreciated! 🎉
