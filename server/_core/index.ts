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
  
  // Stripe webhook endpoint - MUST be before express.json()
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req: any, res: any) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    try {
      // Import Stripe dynamically
      const Stripe = (await import("stripe")).default;
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.Stripe_secretkey;
      
      if (!stripeSecretKey) {
        console.error("[Webhook] Stripe secret key not configured");
        return res.status(200).json({ verified: true, error: "Stripe not configured" });
      }
      
      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: "2026-01-28.clover" as any,
      });
      
      // Verify webhook signature
      let event;
      if (webhookSecret && sig) {
        try {
          event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } catch (err: any) {
          console.error("[Webhook] Signature verification failed:", err.message);
          return res.status(200).json({ verified: false, error: "Invalid signature" });
        }
      } else {
        // No signature verification in development
        event = JSON.parse(req.body.toString());
      }
      
      // Handle test events
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }
      
      // Process webhook events
      console.log(`[Webhook] Received event: ${event.type}`);
      
      switch (event.type) {
        case "checkout.session.completed":
          const session = event.data.object;
          console.log("[Webhook] Checkout session completed:", session.id);
          
          // Update booking payment status
          try {
            const { getDb } = await import("../db");
            const { bookings } = await import("../../drizzle/schema");
            const { eq } = await import("drizzle-orm");
            
            const db = await getDb();
            if (db && session.metadata?.bookingId) {
              await db.update(bookings)
                .set({
                  paymentStatus: "paid",
                  totalAmount: (session.amount_total! / 100).toString(),
                  paymentDate: new Date(),
                  stripeSessionId: session.id,
                })
                .where(eq(bookings.id, parseInt(session.metadata.bookingId)));
              
              console.log(`[Webhook] Updated booking ${session.metadata.bookingId} to paid status`);
              
              // Send confirmation email to guest
              try {
                const { generateBookingConfirmationEmail } = await import("../email-templates");
                const { sendEmail } = await import("../email");
                
                // Fetch the updated booking with host details
                const { hostListings } = await import("../../drizzle/schema");
                const bookingResult = await db
                  .select()
                  .from(bookings)
                  .leftJoin(hostListings, eq(bookings.hostListingId, hostListings.id))
                  .where(eq(bookings.id, parseInt(session.metadata.bookingId)))
                  .limit(1);
                
                const bookingWithHost = bookingResult[0] ? {
                  ...bookingResult[0].bookings,
                  hostListing: bookingResult[0].host_listings,
                } : null;
                
                if (bookingWithHost && bookingWithHost.hostListing) {
                  const emailHtml = generateBookingConfirmationEmail({
                    guestName: bookingWithHost.guestName,
                    bookingId: bookingWithHost.id,
                    hostName: bookingWithHost.hostListing.hostName,
                    requestedDate: bookingWithHost.requestedDate.toISOString(),
                    mealType: bookingWithHost.mealType,
                    numberOfGuests: bookingWithHost.numberOfGuests,
                    totalAmount: bookingWithHost.totalAmount!,
                    paymentDate: bookingWithHost.paymentDate!,
                    stripeSessionId: bookingWithHost.stripeSessionId!,
                  });
                  
                  await sendEmail({
                    to: bookingWithHost.guestEmail,
                    subject: "Your +1 Chopsticks Dining Experience is Confirmed! 🥢",
                    html: emailHtml,
                  });
                  
                  console.log(`[Webhook] Sent confirmation email to ${bookingWithHost.guestEmail}`);
                }
              } catch (emailError: any) {
                console.error("[Webhook] Error sending confirmation email:", emailError);
                // Don't fail the webhook if email fails
              }
            }
          } catch (updateError: any) {
            console.error("[Webhook] Error updating booking:", updateError);
          }
          break;
          
        case "payment_intent.succeeded":
          const paymentIntent = event.data.object;
          console.log("[Webhook] Payment succeeded:", paymentIntent.id);
          break;
          
        case "payment_intent.payment_failed":
          const failedPayment = event.data.object;
          console.log("[Webhook] Payment failed:", failedPayment.id);
          break;
          
        default:
          console.log(`[Webhook] Unhandled event type: ${event.type}`);
      }
      
      // Always return 200 with valid JSON
      return res.json({ verified: true, received: true });
      
    } catch (error: any) {
      console.error("[Webhook] Error processing webhook:", error);
      // Still return 200 to acknowledge receipt
      return res.status(200).json({ verified: true, error: error.message });
    }
  });
  
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
