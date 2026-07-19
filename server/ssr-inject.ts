/**
 * Server-side body injection for AI crawler visibility.
 *
 * Injects visible semantic HTML into the <!--SSR_BODY--> placeholder inside #root.
 * React mounts on #root and replaces this content on hydration.
 *
 * Also drives meta tags from the DB, with hardcoded overrides for curated copy.
 */

import { getDb } from "./db";
import { hostListings, blogPosts, reviews } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { HOST_META } from "./host-meta";
import { BLOG_META } from "./blog-meta";

// ─── Helpers ────────────────────────────────────────────────────────────────

function esc(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function injectMeta(html: string, title: string, description: string, url: string): string {
  const t = esc(title);
  const d = esc(description);
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`);
  html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/, `<meta name="description" content="${d}" />`);
  html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${t}" />`);
  html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${d}" />`);
  html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${url}" />`);
  html = html.replace(/<meta\s+property="twitter:title"\s+content="[^"]*"\s*\/?>/, `<meta property="twitter:title" content="${t}" />`);
  html = html.replace(/<meta\s+property="twitter:description"\s+content="[^"]*"\s*\/?>/, `<meta property="twitter:description" content="${d}" />`);
  return html;
}

function injectBody(html: string, body: string): string {
  return html.replace("<!--SSR_BODY-->", body);
}

// ─── Host pages ─────────────────────────────────────────────────────────────

export async function injectHostContent(html: string, listingId: number): Promise<string> {
  try {
    const db = await getDb();
    if (!db) return html;

    // Fetch host listing
    const rows = await db
      .select()
      .from(hostListings)
      .where(eq(hostListings.id, listingId))
      .limit(1);

    if (!rows.length) return html;
    const host = rows[0];

    // Fetch approved reviews for this host
    const hostReviews = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.hostListingId, listingId), eq(reviews.isPublished, true)))
      .limit(6);

    // ── Meta: use hardcoded override if available, otherwise build from DB ──
    const override = HOST_META[listingId];
    const metaTitle = override?.title ??
      `${esc(host.hostName)} — ${esc(host.cuisineStyle)} Home Dining in ${esc(host.district)} | +1 Chopsticks`;
    const metaDesc = override?.description ??
      `Dine with ${esc(host.hostName)} in ${esc(host.district)}. ${esc(host.bio?.substring(0, 140))}. From ¥${host.pricePerPerson}/person.`;
    const metaUrl = `https://plus1chopsticks.com/hosts/${listingId}`;

    html = injectMeta(html, metaTitle, metaDesc, metaUrl);

    // ── Body: visible semantic HTML ──
    const avgRating = hostReviews.length
      ? (hostReviews.reduce((s, r) => s + r.rating, 0) / hostReviews.length).toFixed(1)
      : null;

    const reviewsHtml = hostReviews.length
      ? `<section>
          <h2>Guest Reviews${avgRating ? ` — ${avgRating} / 5` : ""}</h2>
          ${hostReviews.map(r => `<article>
            <p><strong>${esc(r.guestName)}</strong>${r.travellerCategory ? ` · ${esc(r.travellerCategory.replace("_", " "))}` : ""}</p>
            <p>${esc(r.comment ?? "")}</p>
          </article>`).join("\n")}
        </section>`
      : "";

    const bodyHtml = `
<main style="font-family:sans-serif;max-width:800px;margin:0 auto;padding:24px 16px" aria-label="Host profile">
  <h1>${esc(host.hostName)}</h1>
  <p><strong>Cuisine:</strong> ${esc(host.cuisineStyle)}</p>
  <p><strong>Location:</strong> ${esc(host.district)}</p>
  <p><strong>Price:</strong> ¥${host.pricePerPerson} per person</p>
  ${host.minGuests || host.maxGuests ? `<p><strong>Group size:</strong> ${host.minGuests ?? 1}–${host.maxGuests ?? 6} guests</p>` : ""}
  <section>
    <h2>About ${esc(host.hostName)}</h2>
    <p>${esc(host.bio)}</p>
  </section>
  <section>
    <h2>Menu</h2>
    <p>${esc(host.menuDescription)}</p>
  </section>
  ${host.title ? `<p><em>${esc(host.title)}</em></p>` : ""}
  ${reviewsHtml}
  <p><a href="https://plus1chopsticks.com/hosts/${listingId}">Book a seat with ${esc(host.hostName)}</a></p>
</main>`;

    html = injectBody(html, bodyHtml);
  } catch (err) {
    console.error("[SSR] Host injection error:", err);
    // Fall back to hardcoded meta only
    const override = HOST_META[listingId];
    if (override) {
      html = injectMeta(html, override.title, override.description, `https://plus1chopsticks.com/hosts/${listingId}`);
    }
  }

  return html;
}

// ─── Blog pages ─────────────────────────────────────────────────────────────

export async function injectBlogContent(html: string, slug: string): Promise<string> {
  try {
    const db = await getDb();
    if (!db) return html;

    const rows = await db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)))
      .limit(1);

    if (!rows.length) {
      // Fall back to hardcoded meta
      const override = BLOG_META[slug];
      if (override) {
        html = injectMeta(html, override.title, override.description, `https://plus1chopsticks.com/blog/${slug}`);
      }
      return html;
    }

    const post = rows[0];

    // ── Meta: use hardcoded override if available, otherwise use DB fields ──
    const override = BLOG_META[slug];
    const metaTitle = override?.title ?? esc(post.metaTitle ?? post.title);
    const metaDesc = override?.description ?? esc(post.metaDescription ?? post.excerpt ?? post.title);
    const metaUrl = `https://plus1chopsticks.com/blog/${slug}`;

    html = injectMeta(html, metaTitle, metaDesc, metaUrl);

    // ── Body: strip HTML tags from content for plain-text readable body ──
    // Keep the content as-is (it's HTML from the DB) but wrap in semantic article
    const bodyHtml = `
<article style="font-family:sans-serif;max-width:800px;margin:0 auto;padding:24px 16px" aria-label="Blog post">
  <h1>${esc(post.title)}</h1>
  ${post.excerpt ? `<p><em>${esc(post.excerpt)}</em></p>` : ""}
  <div>${post.content}</div>
  <p><a href="https://plus1chopsticks.com/blog/${slug}">Read the full article on +1 Chopsticks</a></p>
</article>`;

    html = injectBody(html, bodyHtml);
  } catch (err) {
    console.error("[SSR] Blog injection error:", err);
    const override = BLOG_META[slug];
    if (override) {
      html = injectMeta(html, override.title, override.description, `https://plus1chopsticks.com/blog/${slug}`);
    }
  }

  return html;
}
