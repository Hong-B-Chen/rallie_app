const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 8098);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".md": "text/markdown; charset=utf-8",
};

http
  .createServer((request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
    const filePath = path.join(root, decodeURIComponent(requestedPath));

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

      response.writeHead(200, {
        "Content-Type": types[path.extname(filePath)] || "application/octet-stream",
      });
      response.end(data);
    });
  })
  .listen(port, "127.0.0.1", () => {
    console.log(`Rallie home page available at http://127.0.0.1:${port}`);
  });
