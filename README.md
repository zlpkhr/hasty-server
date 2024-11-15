## Prerequisites

Before getting started, ensure you have the following installed:

- Node.js (>= 20.0.0)
- npm (comes with Node.js)

## Project Structure

```
hasty-server/
├── lib/                # Core library files
├── server/            # Server implementation
├── test/              # Test suite
└── doc/               # Documentation website
```

## Building the Project

1. Clone the repository:
   ```bash
   git clone https://github.com/zlpkhr/hasty-server.git
   cd hasty-server
   ```

2. Install dependencies for all workspaces:
   ```bash
   npm install
   ```

3. Run TypeScript type checking:
   ```bash
   npm run lint
   ```

4. Format the code (optional):
   ```bash
   npm run format
   ```

## Testing

The project uses Jest for testing. To run the test suite:

```bash
npm run -w test test
```

This will run all tests and show the coverage report.

## Documentation Website

The documentation is built using Docusaurus. To work with the documentation:

1. Start the development server:
   ```bash
   npm run -w doc start
   ```

2. Build the documentation for production:
   ```bash
   npm run -w doc build
   ```

3. Serve the built documentation:
   ```bash
   npm run -w doc serve
   ```

4. Clear the build directory:
   ```bash
   npm run -w doc clear
   ```

5. Generate translations:
   ```bash
   npm run -w doc write-translations
   ```

## Development Workflow

1. Make your changes in the relevant files
2. Run TypeScript type checking: `npm run lint`
3. Format code: `npm run format`
4. Run tests: `npm run -w test test`
5. Build documentation (if needed): `npm run -w doc build`
