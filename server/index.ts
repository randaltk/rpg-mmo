import { createServer, IncomingMessage, ServerResponse } from "http";
import { parse } from "url";
import next from "next";
import { setupSocketIO } from "./socketHandlers";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req: IncomingMessage, res: ServerResponse) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  setupSocketIO(httpServer);

  httpServer.listen(port, hostname, () => {
    console.log(`> Server running at http://localhost:${port}`);
    console.log(`> Next.js + Socket.io unified`);
    console.log(`> Mode: ${dev ? "development" : "production"}`);
  });
});
