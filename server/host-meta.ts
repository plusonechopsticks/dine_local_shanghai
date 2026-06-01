/**
 * Server-side meta tag injection for host detail pages (/hosts/:id)
 * Intercepts requests before Vite/static handler and rewrites <title>, <meta name="description">,
 * <meta property="og:title">, and <meta property="og:description"> so crawlers see host-specific tags.
 */

interface HostMeta {
  title: string;
  description: string;
}

// Keyed by listing ID (number)
const HOST_META: Record<number, HostMeta> = {
  // Norika & Steven (ID 1)
  1: {
    title: "Norika & Steven — Northern-Southern Fusion Home Dining in Songjiang, Shanghai | +1 Chopsticks",
    description: "Dine with Norika & Steven in Songjiang, Shanghai. Northern-southern fusion home cooking — handmade dumplings, honey glazed chicken wings, braised tofu. Up to 4 guests from ¥280/person.",
  },
  // Grace Tong (ID 90002)
  90002: {
    title: "Grace — Private Home Dining for Solo & Business Travelers in Shanghai | +1 Chopsticks",
    description: "Dine privately with Grace in Shanghai — fluent English, 4-course home-cooked meal, max 2 guests. Perfect for solo travelers and business visitors. From ¥388/person.",
  },
  // Jiading Ayi (ID 150001)
  150001: {
    title: "Jiading Ayi — Authentic Shanghainese Home Dining in Jiading | +1 Chopsticks",
    description: "Dine in Jiading Ayi's courtyard home in Jiading, Shanghai. Authentic xiaolongbao and traditional Shanghainese cooking from a former Airbnb Superhost. Up to 6 guests from ¥368/person.",
  },
  // Chuan (ID 180001)
  180001: {
    title: "Chuan — Guangxi-Cantonese-Southeast Asian Fusion Home Dining in Shenzhen | +1 Chopsticks",
    description: "Dine with Chuan in Shenzhen for a unique Guangxi-Cantonese and Southeast Asian fusion home dining experience. Book your seat with +1 Chopsticks.",
  },
  // Echo Ren (ID 210001)
  210001: {
    title: "Echo — Hands-On Dumpling-Making Home Dining in Shanghai | +1 Chopsticks",
    description: "Join Echo in Shanghai for a hands-on home dining experience featuring dumpling-making and authentic Chinese home cooking. Book your seat with +1 Chopsticks.",
  },
  // Sookie (ID 240001)
  240001: {
    title: "Sookie — Cantonese, Chaoshan & Western-Chinese Fusion Home Dining in Shanghai | +1 Chopsticks",
    description: "Dine with Sookie in Shanghai. From Guangdong, she cooks Cantonese, Chaoshan, Shanghainese, and creative Western-Chinese fusion — every menu tailored to your taste. From ¥280/person.",
  },
  // Filbert Kang (ID 330001)
  330001: {
    title: "Filbert — Hunan-Zhejiang Fusion Home Dining in Longhua, Shenzhen | +1 Chopsticks",
    description: "Dine with Filbert, a registered dietician, in Longhua, Shenzhen. Bold Hunan flavors balanced with Zhejiang lightness — spicy, but not too spicy. Up to 4 guests from ¥300/person.",
  },
  // Eating / Yiting (ID 360001)
  360001: {
    title: "Yiting — Shanghai & Sichuan Home Dining in Gubei, Shanghai | +1 Chopsticks",
    description: "Dine with Yiting in Gubei, Shanghai. Shanghai classics like Yan Du Xian soup and yellow croaker meet bold Sichuan dishes — served on her own handmade ceramics. From ¥388/person.",
  },
  // Dragon / Xiaolong (ID 390001)
  390001: {
    title: "Dragon — Mild Sichuan Home Dining in Wuhou, Chengdu | +1 Chopsticks",
    description: "Dine with Dragon in Wuhou, Chengdu. Authentic Sichuan classics — Kung Pao Chicken, Fish-Fragrant Pork Shreds, Twice-Cooked Pork — made mild for everyone. Up to 6 guests from ¥280/person.",
  },
};

/**
 * Inject host-specific meta tags into an HTML string.
 * Replaces <title>, meta description, og:title, og:description, twitter:title, twitter:description.
 */
export function injectHostMeta(html: string, listingId: number): string {
  const meta = HOST_META[listingId];
  if (!meta) return html; // unknown host — return unchanged

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

  // Replace og:url with canonical host URL
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="https://plus1chopsticks.com/hosts/${listingId}" />`
  );

  return html;
}

export { HOST_META };
