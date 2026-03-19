import { drizzle } from "drizzle-orm/mysql2";
import { blogPosts } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const blogPostContent = `<p>Traveling to China as a tourist can feel overwhelming at first — the language barrier, unfamiliar payment systems, and navigating local services. But here's the secret: <strong>the right apps can transform your entire experience</strong>.</p>

<p>Daniel Sun, a seasoned China traveler and writer, has put together the definitive guide to the essential apps every tourist needs for traveling in China in 2026. His article breaks down critical apps you absolutely need, plus nice-to-have apps that can enhance your journey.</p>

<h3>🔴 Critical Apps You Can't Travel Without</h3>

<p>Daniel identifies several must-have apps that are essential for basic survival and navigation in China:</p>

<ul>
<li><strong>WeChat</strong> — Far more than a messaging app. WeChat is the backbone of daily life in China. You'll need it for payments, communication, and accessing countless services.</li>
<li><strong>Alipay</strong> — China's other major payment platform. Many merchants accept one or the other, so having both ensures you're never stuck without a way to pay.</li>
<li><strong>Baidu Maps</strong> — Google Maps doesn't work well in mainland China. Baidu Maps is your navigation lifeline with accurate directions, public transit info, and local business listings.</li>
<li><strong>Didi Chuxing</strong> — China's ride-hailing app. It's how you get around cities safely and affordably, with options ranging from economy rides to premium services.</li>
<li><strong>Google Translate</strong> — Essential for breaking the language barrier. The camera translation feature is particularly useful for reading signs and menus.</li>
</ul>

<h3>✨ Nice-to-Have Apps That Enhance Your Experience</h3>

<p>Beyond the essentials, Daniel recommends several apps that can significantly improve your travel experience:</p>

<ul>
<li><strong>Meituan</strong> — The go-to app for finding restaurants, food delivery, and local services. Think of it as China's Yelp meets DoorDash.</li>
<li><strong>Xiaohongshu (Little Red Book)</strong> — A social platform that's become the go-to for discovering trendy restaurants, cafes, and travel experiences. Great for finding authentic local spots.</li>
<li><strong>Ctrip</strong> — China's major travel booking platform for flights, hotels, and tours. Often has better prices than international booking sites.</li>
<li><strong>Douyin (TikTok)</strong> — Yes, really! The Chinese version of TikTok is full of local recommendations, travel tips, and cultural insights from real Chinese users.</li>
</ul>

<h3>💡 Pro Tips for Using These Apps</h3>

<p>Daniel shares valuable insights on how to maximize these tools:</p>

<ul>
<li><strong>Set up WeChat Pay and Alipay before you arrive</strong> — Link your international bank account or credit card if possible. Some services are easier to activate before arriving in China.</li>
<li><strong>Download offline maps</strong> — Use Baidu Maps to download offline maps of the cities you'll visit. This ensures navigation even without internet.</li>
<li><strong>Use translation apps proactively</strong> — Don't wait until you're confused. Translate menus, signs, and conversations as you go to avoid misunderstandings.</li>
<li><strong>Explore local recommendations on Xiaohongshu</strong> — This app reveals where locals actually eat and spend time, not just tourist traps.</li>
</ul>

<h3>🌍 Why This Matters for Your China Journey</h3>

<p>The difference between a frustrating China trip and an amazing one often comes down to preparation and having the right tools. With these apps properly set up before you arrive, you'll:</p>

<ul>
<li>Navigate cities confidently without getting lost</li>
<li>Pay for everything seamlessly without cash</li>
<li>Communicate across language barriers</li>
<li>Discover authentic local experiences beyond tourist attractions</li>
<li>Move around safely and affordably</li>
</ul>

<p><strong>Read Daniel Sun's full article for even more detailed recommendations, personal travel stories, and additional tips:</strong></p>

<p><a href="https://substack.com/home/post/p-186916242" target="_blank" rel="noopener noreferrer"><strong>→ "A tourist's 2026 'China App Stack': Field notes on critical & nice to have apps"</strong></a></p>

<p>Daniel's insights come from years of traveling in China and helping other visitors navigate the unique digital landscape. His comprehensive guide covers not just which apps to download, but how to use them effectively to unlock the best of what China has to offer.</p>

<p><em>Originally published on Daniel Sun's Substack. This post features highlights and key recommendations from his full article. Read the complete guide for more detailed tips, personal experiences, and additional app recommendations.</em></p>`;

const post = {
  id: "blog-daniel-sun-china-app-stack",
  title: "A Tourist's 2026 'China App Stack': Essential Apps for Traveling in China",
  slug: "china-app-stack-essential-apps-traveling",
  excerpt: "Discover the critical and nice-to-have apps every tourist needs for traveling in China. From WeChat to Baidu Maps, learn which apps will transform your China travel experience and help you navigate like a local.",
  content: blogPostContent,
  featuredImageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/daniel-sun-china-app-stack-X7asApY9dykLi2kRphMCCS.webp",
  authorName: "Daniel Sun",
  tags: JSON.stringify(["travel-tips", "travel-policy", "china-travel"]),
  published: true,
  publishedAt: new Date("2026-02-06"),
  createdAt: new Date(),
  updatedAt: new Date(),
};

try {
  const result = await db.insert(blogPosts).values(post);
  console.log("✅ Blog post created successfully!");
  console.log("Post ID:", post.id);
  console.log("Title:", post.title);
  console.log("Author:", post.authorName);
} catch (error) {
  console.error("❌ Error creating blog post:", error.message);
  process.exit(1);
}
