import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import viteConfig from "../../vite.config";
import { injectHostMeta } from "../host-meta";
import { injectBlogMeta } from "../blog-meta";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      let page = await vite.transformIndexHtml(url, template);

      // Inject host-specific meta tags for /hosts/:id routes
      const hostMatch = url.match(/^\/hosts\/(\d+)/);
      if (hostMatch) {
        page = injectHostMeta(page, parseInt(hostMatch[1], 10));
      }

      // Inject blog-post-specific meta tags for /blog/:slug routes
      const blogMatch = url.match(/^\/blog\/([^/?#]+)/);
      if (blogMatch) {
        page = injectBlogMeta(page, blogMatch[1]);
      }

      res.status(200).set({
        "Content-Type": "text/html",
        "Link": [
          '</.well-known/api-catalog>; rel="api-catalog"',
          '</api/trpc>; rel="service-desc"',
          '<https://plus1chopsticks.com>; rel="canonical"',
        ].join(", "),
      }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(__dirname, "../..", "dist", "public")
      : path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  // Block staging/manus.space domains from being indexed
  app.use((req: any, res: any, next: any) => {
    const host = req.headers.host || '';
    if (host.includes('manus.space')) {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    }
    next();
  });

  app.use(express.static(distPath));

  // Inject blog-post-specific meta tags for /blog/:slug routes (production)
  app.use("/blog/:slug", (req, res) => {
    const slug = (req as any).params.slug as string;
    const indexPath = path.resolve(distPath, "index.html");
    let html = fs.readFileSync(indexPath, "utf-8");
    html = injectBlogMeta(html, slug);
    res.setHeader("Content-Type", "text/html");
    res.setHeader(
      "Link",
      [
        '</.well-known/api-catalog>; rel="api-catalog"',
        '</api/trpc>; rel="service-desc"',
        `<https://plus1chopsticks.com/blog/${slug}>; rel="canonical"`,
      ].join(", ")
    );
    if ((req as any).headers.host?.includes('manus.space')) {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    }
    res.send(html);
  });

  // Inject host-specific meta tags for /hosts/:id routes (production)
  app.use("/hosts/:id", (req, res) => {
    const listingId = parseInt((req as any).params.id, 10);
    const indexPath = path.resolve(distPath, "index.html");
    let html = fs.readFileSync(indexPath, "utf-8");
    if (!isNaN(listingId)) {
      html = injectHostMeta(html, listingId);
    }
    res.setHeader("Content-Type", "text/html");
    res.setHeader(
      "Link",
      [
        '</.well-known/api-catalog>; rel="api-catalog"',
        '</api/trpc>; rel="service-desc"',
        `<https://plus1chopsticks.com/hosts/${listingId}>; rel="canonical"`,
      ].join(", ")
    );
    if ((req as any).headers.host?.includes('manus.space')) {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    }
    res.send(html);
  });

  // fall through to index.html if the file doesn't exist
  app.use("*", (req: any, res: any) => {
    res.setHeader(
      "Link",
      [
        '</.well-known/api-catalog>; rel="api-catalog"',
        '</api/trpc>; rel="service-desc"',
        '<https://plus1chopsticks.com>; rel="canonical"',
      ].join(", ")
    );
    if (req.headers.host?.includes('manus.space')) {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
