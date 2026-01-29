import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { ENV } from "./env";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import multer from "multer";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer(): Promise<any> {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback (only when configured)
  if (ENV.oAuthServerUrl && ENV.oAuthServerUrl.length > 0) {
    registerOAuthRoutes(app);
  } else {
    console.log("[OAuth] OAUTH_SERVER_URL not set — skipping OAuth routes (dev mode)");
  }

  // File upload endpoint
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
  app.post("/api/upload", upload.single("file"), async (req: any, res: any) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      console.log(`[Upload] Received file: ${req.file.originalname}, size: ${req.file.size} bytes`);

      // Generate unique file key
      const ext = req.file.originalname.split(".").pop() || "jpg";
      const uniqueKey = `host-images/${nanoid()}.${ext}`;

      // Upload to S3
      console.log(`[Upload] Uploading to storage: ${uniqueKey}`);
      const { url } = await storagePut(uniqueKey, req.file.buffer, req.file.mimetype);

      console.log(`[Upload] Upload successful: ${url}`);
      return res.json({ url });
    } catch (error: any) {
      console.error("[Upload] Upload failed:", error);
      return res.status(500).json({ error: error?.message || "Upload failed" });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM received, closing server");
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  return server;
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
