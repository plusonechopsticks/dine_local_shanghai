import { drizzle } from "drizzle-orm/mysql2";
import { blogPosts } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const blogPostContent = `<p>China's exports surged <strong>21.8% in Jan–Feb 2026</strong>, reaching <strong>$656.58 billion</strong> — far exceeding the 7.1% forecast.</p>

<p>But when we talk about exports, we default to goods. Containers. Manufacturing.</p>

<p>There's another dimension that gets overlooked: <strong>service exports</strong>. And tourism is one of the biggest.</p>

<h3>Soft Power Through Authentic Experiences</h3>

<p>As China cements its position on the world stage, soft power is becoming just as strategic as economic or military strength. Soft power shapes how the world perceives a country — which directly influences the flow of capital, talent, and innovation.</p>

<p>And <strong>inbound tourism</strong> is one of the most effective channels for building it.</p>

<p>The numbers tell the story:</p>

<ul>
<li><strong>150 million+ inbound tourist arrivals in 2025</strong>, up 17% YoY</li>
<li><strong>$130 billion+ in inbound tourism spending</strong>, up nearly 40%</li>
<li><strong>80 billion RMB ($11B) in mobile payments by foreign visitors</strong> alone</li>
<li><strong>Visa-free entry now extended to 50 countries</strong>, mutual exemptions with 29</li>
</ul>

<p>Minister of Culture and Tourism Sun Yeli attributed this to "a series of policies designed to revitalize the inbound tourism market," with over 30 million visitors using visa-free entry specifically.</p>

<p>But the real insight isn't about the front door — it's about the <strong>"second door"</strong> and what lies beyond traditional tourism.</p>

<h3>From "China Travel" to "China Living": The Home Dining Revolution</h3>

<p>Dai Bin, president of the China Tourism Academy, put it well during the Two Sessions: with visas and payments basically sorted, <strong>"China Travel" has entered a new boom cycle</strong>. The challenge now? <strong>Travel convenience and authentic cultural immersion</strong>.</p>

<p>Getting tourists in is step one. The real task is making sure they can move around smoothly, find accommodation easily, and have <strong>genuinely great experiences</strong> — experiences that feel real, not staged.</p>

<p>This is where <strong>home dining experiences</strong> become critical. While hotels and restaurants serve tourists, <strong>authentic home-cooked meals in local family homes</strong> create something irreplaceable: genuine human connection and cultural exchange.</p>

<p>In Shanghai specifically, home dining experiences have emerged as a major draw for international travelers seeking authentic encounters. Platforms like <strong>+1 Chopsticks</strong> are making it easier for visitors to book intimate meals in local family homes, experiencing <strong>Shanghainese cuisine</strong> prepared by residents who grew up with these dishes — creating genuine cultural connections that go beyond traditional restaurant dining.</p>

<h3>The Broader Picture: "China Living" Across Multiple Dimensions</h3>

<p>This is what makes the current moment different. The appeal is no longer just the Great Wall or the Terracotta Warriors. Today's visitors are drawn to a much wider spectrum:</p>

<ul>
<li><strong>"China Shopping"</strong> — competitive prices, world-class e-commerce</li>
<li><strong>"China Wellness"</strong> — TCM, wellness retreats, medical tourism</li>
<li><strong>"China Living"</strong> — the daily experience of a rapidly modernized society</li>
<li><strong>"China's Home Dining"</strong> — authentic meals in local family homes across Shanghai and beyond (pioneered by platforms like +1 Chopsticks)</li>
<li><strong>"Food Culture Learning"</strong> — understanding regional Chinese cuisine and cooking traditions</li>
</ul>

<h3>China vs the West</h3>

<p>In the West, tourism has long been a strong pillar of economic power. France, Spain, the US, Italy — these countries have spent decades turning their cultural appeal into a major economic engine and a source of global influence.</p>

<p>China is now catching up. Fast.</p>

<p>And this is where it gets interesting for the long game. With inbound tourism spending approaching the scale of a major goods-export sector, China is proving that the next frontier of its global economic influence may not be shipped in containers.</p>

<p>It may arrive on two feet, smartphone in hand, ready to be impressed.</p>`;

const post = {
  id: "blog-1-china-export-boom",
  title: "China's Overlooked Export Boom: Why Home Dining Experiences Are Reshaping Global Tourism",
  slug: "chinas-overlooked-export-boom-home-dining",
  excerpt: "Discover how China's inbound tourism surge is driven by authentic home dining experiences and local food culture. Learn why home-cooked meals in Shanghai and beyond are becoming the next frontier of China's soft power strategy.",
  content: blogPostContent,
  featuredImageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/IMG_9405_7316cca3.PNG",
  authorName: "+1 Chopsticks",
  tags: JSON.stringify(["entrepreneurship", "travel-policy", "food-culture"]),
  published: true,
  publishedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

try {
  const result = await db.insert(blogPosts).values(post);
  console.log("✅ Blog post created successfully!");
  console.log("Post ID:", post.id);
} catch (error) {
  console.error("❌ Error creating blog post:", error.message);
  process.exit(1);
}
