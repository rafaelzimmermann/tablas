import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = process.cwd();
const port = Number(process.argv[2] || 3001);
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".md": "text/plain",
};
createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    const file = resolve(
      root,
      `.${path.endsWith("/") ? path + "index.html" : path}`,
    );
    if (
      !file.startsWith(root + sep) ||
      path.split("/").some((part) => part.startsWith("."))
    ) {
      response.writeHead(403).end();
      return;
    }
    const contents = await readFile(file);
    response.writeHead(200, {
      "Content-Type": `${types[extname(file)] || "application/octet-stream"}; charset=utf-8`,
      "Cache-Control": "no-cache",
    });
    response.end(contents);
  } catch {
    response.writeHead(404).end("Not found");
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`Tablas: http://127.0.0.1:${port}`),
);
