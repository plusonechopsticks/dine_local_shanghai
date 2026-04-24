import { ENV } from "./_core/env";

const GRAPH_API_BASE = "https://graph.facebook.com/v19.0";

export interface BlogPostForFacebook {
  title: string;
  excerpt: string;
  slug: string;
  tags?: string[] | null;
}

function buildPostMessage(post: BlogPostForFacebook): string {
  const hashtags = (post.tags ?? [])
    .map((t) => `#${t.replace(/[^a-zA-Z0-9]/g, "")}`)
    .join(" ");

  const lines = [
    post.title,
    "",
    post.excerpt,
    "",
    hashtags ? `${hashtags} #Shanghai #HomeDining #Plus1Chopsticks` : "#Shanghai #HomeDining #Plus1Chopsticks",
  ];

  return lines.join("\n");
}

export async function postBlogToFacebook(post: BlogPostForFacebook): Promise<{ id: string }> {
  const { facebookPageId, facebookPageAccessToken, websiteUrl } = ENV;

  if (!facebookPageId || !facebookPageAccessToken) {
    throw new Error("Facebook page ID and access token must be set in environment variables (FACEBOOK_PAGE_ID, FACEBOOK_PAGE_ACCESS_TOKEN)");
  }

  const postUrl = `${websiteUrl || "https://plus1chopsticks.com"}/blog/${post.slug}`;
  const message = buildPostMessage(post);

  const body = new URLSearchParams({
    message,
    link: postUrl,
    access_token: facebookPageAccessToken,
  });

  const response = await fetch(`${GRAPH_API_BASE}/${facebookPageId}/feed`, {
    method: "POST",
    body,
  });

  const data = (await response.json()) as { id?: string; error?: { message: string } };

  if (!response.ok || data.error) {
    throw new Error(`Facebook API error: ${data.error?.message ?? response.statusText}`);
  }

  return { id: data.id! };
}
