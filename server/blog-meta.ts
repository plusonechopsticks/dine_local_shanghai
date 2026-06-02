/**
 * Server-side meta tag injection for blog post pages (/blog/:slug)
 * Intercepts requests before Vite/static handler and rewrites <title>, <meta name="description">,
 * og:title, og:description, twitter:title, twitter:description so crawlers see post-specific tags.
 */

interface BlogMeta {
  title: string;
  description: string;
}

// Keyed by slug (string)
const BLOG_META: Record<string, BlogMeta> = {
  "eating-in-china-with-food-sensitivities": {
    title: "Eating in China with Food Allergies & Sensitivities: What Travelers Need to Know",
    description: "MSG, gluten, halal, vegetarian — practical guide for travelers with food sensitivities visiting China, with diet cards in Chinese.",
  },
  "china-app-stack-essential-apps-traveling": {
    title: "Essential Apps for Traveling in China in 2026: The Complete Stack",
    description: "WeChat, Didi, VPN, maps — the exact apps you need before arriving in China, from someone who travels there regularly.",
  },
  "planning-first-china-trip-itinerary-questions": {
    title: "First-Time China Trip Itinerary: Questions We Keep Getting Asked (2026)",
    description: "Planning your first trip to China? We answer the most common itinerary questions — how many cities, Golden Triangle, trains vs flights, and more.",
  },
  "home-dining-cheat-sheet-steven-to": {
    title: "The Home Dining Cheat Sheet: How to Eat Like a Local in China",
    description: "Everything you need to know before sitting down at a Chinese family's table — etiquette, dishes, conversation, and what to expect.",
  },
  "chinas-overlooked-export-boom-home-dining": {
    title: "China's Home Dining Scene: The Experience Tourists Are Missing",
    description: "Beyond restaurants, a quiet revolution in home dining is opening up authentic Chinese food culture to travelers. Here's what it looks like.",
  },
};

/**
 * Inject blog-post-specific meta tags into an HTML string.
 * Replaces <title>, meta description, og:title, og:description, twitter:title, twitter:description, og:url.
 */
export function injectBlogMeta(html: string, slug: string): string {
  const meta = BLOG_META[slug];
  if (!meta) return html; // unknown slug — return unchanged

  const { title, description } = meta;

  // Escape for HTML attribute context
  const safeTitle = title.replace(/"/g, "&quot;");
  const safeDesc = description.replace(/"/g, "&quot;");

  // Replace <title>...</title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`);

  // Replace meta name="description"
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${safeDesc}" />`
  );

  // Replace og:title
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${safeTitle}" />`
  );

  // Replace og:description
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${safeDesc}" />`
  );

  // Replace twitter:title
  html = html.replace(
    /<meta\s+property="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="twitter:title" content="${safeTitle}" />`
  );

  // Replace twitter:description
  html = html.replace(
    /<meta\s+property="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="twitter:description" content="${safeDesc}" />`
  );

  // Replace og:url with canonical blog post URL
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="https://plus1chopsticks.com/blog/${slug}" />`
  );

  return html;
}

export { BLOG_META };
