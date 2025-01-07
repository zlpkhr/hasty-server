# Build Your API with `hasty-server`

This guide will walk you through setting up a simple API using `hasty-server`. It's straightforward, quick, and efficient—just the way it should be.

---

## Step 1: Set Up Your Project

First, get your environment ready. Open a terminal, create a new project, and set up a basic Node.js app.

```bash
mkdir my-api
cd my-api
npm init -y
```

Next, install `hasty-server`:

```bash
npm install hasty-server
```

---

## Step 2: Create Your First Route

Now, let’s create your API. Open your editor and create a file called `server.js`. Start by setting up a basic server:

```javascript
const Hasty = require("hasty-server");

const app = new Hasty();
const PORT = 3000;

app.get("/", (req, res) => {
  res.json({ message: "Welcome to hasty-server!" });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
```

Run the server with:

```bash
node server.js
```

Open your browser or use a tool like Postman to hit `http://localhost:3000/`. You should see this:

```json
{ "message": "Welcome to hasty-server!" }
```

---

## Step 3: Add Dynamic Routes

Want to fetch user data by ID? Let’s make a dynamic route:

```javascript
app.get("/user/:id", (req, res) => {
  res.json({ userId: req.params.id });
});
```

Now, restart your server and go to `http://localhost:3000/user/123`. You’ll get:

```json
{ "userId": "123" }
```

Simple, right?

---

## Step 4: Handle POST Requests

Need to handle incoming data? Add a POST route:

```javascript
app.post("/data", (req, res) => {
  res.json({ received: req.body });
});
```

Send a POST request to `http://localhost:3000/data` with JSON like this:

```json
{ "name": "John" }
```

And the server will respond:

```json
{ "received": { "name": "John" } }
```

---

## Step 5: Enable CORS (Optional)

If you’re working with a frontend app, you might need to allow cross-origin requests. Just add this line at the top of your file:

```javascript
app.cors(true);
```

That’s it—CORS is now enabled.

---

## Full Code Example

Here’s how your `server.js` might look now:

```javascript
const Hasty = require("hasty-server");

const app = new Hasty();
app.cors(true);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to hasty-server!" });
});

app.get("/user/:id", (req, res) => {
  res.json({ userId: req.params.id });
});

app.post("/data", (req, res) => {
  res.json({ received: req.body });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
```

---

## What’s Next?

You now have a basic API up and running. From here, you can:

- Add more routes (GET, POST, DELETE, etc.).
- Serve files with `res.sendFile("path/to/file")`.
- Implement middleware for custom request processing.

`hasty-server` is designed to be simple and powerful. Build what you need without unnecessary complexity.
