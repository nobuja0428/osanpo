import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const port = Number(process.env.PORT || 4173);
const outputDirectory = join(process.cwd(), "out");
const basePath = "/osanpo";
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
};

createServer((request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  if (!url.pathname.startsWith(basePath)) {
    response.writeHead(302, { Location: `${basePath}/` });
    response.end();
    return;
  }

  const relative = decodeURIComponent(url.pathname.slice(basePath.length)).replace(/^\/+/, "");
  const safePath = normalize(relative).replace(/^(\.\.[\\/])+/, "");
  let filePath = join(outputDirectory, safePath);

  if (!safePath || (existsSync(filePath) && statSync(filePath).isDirectory())) {
    filePath = join(filePath, "index.html");
  }

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    filePath = join(outputDirectory, "404.html");
    response.statusCode = 404;
  }

  response.setHeader("Content-Type", contentTypes[extname(filePath)] || "application/octet-stream");
  createReadStream(filePath).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`Preview: http://127.0.0.1:${port}${basePath}/`);
});
