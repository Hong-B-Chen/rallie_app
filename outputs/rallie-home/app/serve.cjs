const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 8092);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jsx": "text/babel; charset=utf-8",
  ".png": "image/png",
};

http
  .createServer((request, response) => {
    const requestedPath = request.url === "/" ? "index.html" : decodeURIComponent(request.url.slice(1));
    const filePath = path.resolve(root, requestedPath);

    if (!filePath.startsWith(root)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }

      response.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "text/plain" });
      response.end(data);
    });
  })
  .listen(port, "127.0.0.1", () => {
    console.log(`Rallie webapp running at http://127.0.0.1:${port}/`);
  });
