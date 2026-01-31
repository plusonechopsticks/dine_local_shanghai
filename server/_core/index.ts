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

  // File upload endpoint - supports both multipart and JSON base64
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
  app.post("/api/upload", upload.single("file"), async (req: any, res: any) => {
    try {
      let buffer: Buffer;
      let filename: string;
      let mimetype: string = "image/jpeg";

      // Handle multipart form data
      if (req.file) {
        buffer = req.file.buffer;
        filename = req.file.originalname;
        mimetype = req.file.mimetype;
      }
      // Handle JSON base64 data
      else if (req.body.image && req.body.filename) {
        const base64Data = req.body.image.split(",")[1] || req.body.image;
        buffer = Buffer.from(base64Data, "base64");
        filename = req.body.filename;
        // Try to detect mimetype from filename
        const ext = filename.split(".").pop()?.toLowerCase();
        const mimetypeMap: Record<string, string> = {
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          png: "image/png",
          gif: "image/gif",
          webp: "image/webp",
        };
        mimetype = mimetypeMap[ext || ""] || "image/jpeg";
      } else {
        return res.status(400).json({ error: "No file provided" });
      }

      console.log(`[Upload] Received file: ${filename}, size: ${buffer.length} bytes`);

      // Upload to Cloudinary
      console.log(`[Upload] Uploading to Cloudinary...`);
      const { uploadToCloudinary } = await import("../cloudinary");
      const url = await uploadToCloudinary(buffer, "host-images");

      console.log(`[Upload] Upload successful: ${url}`);
      return res.json({ url });
    } catch (error: any) {
      console.error("[Upload] Upload failed:", error);
      return res.status(500).json({ error: error?.message || "Upload failed" });
    }
  });

  // Image proxy endpoint removed - Cloudinary URLs are publicly accessible

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
