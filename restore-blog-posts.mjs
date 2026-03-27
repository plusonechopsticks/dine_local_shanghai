import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { blogPosts } from "./drizzle/schema.ts";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not set");
    process.exit(1);
  }

  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection);

  const posts = [
    {
      title: "From Goods to Gastronomy: The rise of China's tourism export boom",
      slug: "chinas-overlooked-export-boom-home-dining",
      excerpt: "While China's export numbers dominate headlines, a quieter boom is reshaping global tourism. Discover how authentic home dining experiences in Shanghai are becoming the next frontier of China's soft power strategy.",
      content: `<p>China's exports surged <strong>21.8% in Jan–Feb 2026</strong>, reaching <strong>$656.58 billion</strong> — far exceeding the 7.1% forecast.</p>

<p>The headlines focused on goods: electronics, machinery, textiles. But there's a quieter export boom that most analysts are missing entirely.</p>

<p>It's not in containers. It arrives on two feet.</p>

<h3>🌏 The Numbers Behind China's Inbound Tourism Surge</h3>

<p>While China's manufacturing exports grabbed headlines, inbound tourism quietly hit record territory:</p>

<ul>
<li><strong>150 million+ inbound tourist arrivals in 2025</strong>, up 17% YoY</li>
<li><strong>$130 billion+ in inbound tourism spending</strong>, up nearly 40%</li>
<li><strong>80 billion RMB ($11B) in mobile payments by foreign visitors</strong> alone</li>
<li><strong>Visa-free entry now extended to 50 countries</strong>, mutual exemptions with 29</li>
</ul>

<p>Minister of Culture and Tourism Sun Yeli attributed this to "a series of policies designed to revitalize the inbound tourism market," with over 30 million visitors using visa-free entry specifically.</p>

<p>But the real insight isn't about the front door — it's about the <strong>"second door"</strong> and what lies beyond traditional tourism.</p>

<h3>🏠 From "China Travel" to "China Living": The Home Dining Revolution</h3>

<p>Dai Bin, president of the China Tourism Academy, put it well during the Two Sessions: with visas and payments basically sorted, <strong>"China Travel" has entered a new boom cycle</strong>. The challenge now? <strong>Travel convenience and authentic cultural immersion</strong>.</p>

<p>Getting tourists in is step one. The real task is making sure they can move around smoothly, find accommodation easily, and have <strong>genuinely great experiences</strong> — experiences that feel real, not staged.</p>

<p>This is where <strong>home dining experiences</strong> become critical. While hotels and restaurants serve tourists, <strong>authentic home-cooked meals in local family homes</strong> create something irreplaceable: genuine human connection and cultural exchange.</p>

<p>In Shanghai specifically, home dining experiences have emerged as a major draw for international travelers seeking authentic encounters. Platforms like <strong>+1 Chopsticks</strong> are making it easier for visitors to book intimate meals in local family homes, experiencing <strong>Shanghainese cuisine</strong> prepared by residents who grew up with these dishes — creating genuine cultural connections that go beyond traditional restaurant dining.</p>

<h3>🌐 The Broader Picture: "China Living" Across Multiple Dimensions</h3>

<p>This is what makes the current moment different. The appeal is no longer just the Great Wall or the Terracotta Warriors. Today's visitors are drawn to a much wider spectrum:</p>

<ul>
<li><strong>"China Shopping"</strong> — competitive prices, world-class e-commerce</li>
<li><strong>"China Wellness"</strong> — TCM, wellness retreats, medical tourism</li>
<li><strong>"China Living"</strong> — the daily experience of a rapidly modernized society</li>
<li><strong>"China's Home Dining"</strong> — authentic meals in local family homes across Shanghai and beyond (pioneered by platforms like +1 Chopsticks)</li>
<li><strong>"Food Culture Learning"</strong> — understanding regional Chinese cuisine and cooking traditions</li>
</ul>

<h3>🇨🇳 China vs the West</h3>

<p>In the West, tourism has long been a strong pillar of economic power. France, Spain, the US, Italy — these countries have spent decades turning their cultural appeal into a major economic engine and a source of global influence.</p>

<p>China is now catching up. Fast.</p>

<p>And this is where it gets interesting for the long game. With inbound tourism spending approaching the scale of a major goods-export sector, China is proving that the next frontier of its global economic influence may not be shipped in containers.</p>

<p>It may arrive on two feet, smartphone in hand, ready to be impressed.</p>`,
      authorName: "+1 Chopsticks",
      featuredImageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/IMG_9405_7316cca3.PNG",
      tags: ["entrepreneurship", "travel-policy", "food-culture"],
      published: true,
      publishedAt: new Date("2026-03-10T20:55:48Z"),
    },
    {
      title: "A Tourist's 2026 'China App Stack': Essential Apps for Traveling in China",
      slug: "china-app-stack-essential-apps-traveling",
      excerpt: "Discover the critical and nice-to-have apps every tourist needs for traveling in China. From WeChat to Baidu Maps, learn which apps will transform your China travel experience and help you navigate like a local.",
      content: `<p>Daniel Sun has spent years traveling in China and helping other visitors navigate the unique digital landscape. In his comprehensive guide, he breaks down exactly which apps you need — and how to use them effectively.</p>

<h3>📱 The Critical Apps (Non-Negotiable)</h3>

<p>These are the apps Daniel considers essential for any trip to China:</p>

<ul>
<li><strong>WeChat</strong> — China's super-app. Messaging, payments, mini-programs, and social media all in one. You'll use this constantly.</li>
<li><strong>Alipay</strong> — The other major payment platform. Many merchants accept one or the other, so having both ensures you're never stuck without a way to pay.</li>
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

<p><em>Originally published on Daniel Sun's Substack. This post features highlights and key recommendations from his full article. Read the complete guide for more detailed tips, personal experiences, and additional app recommendations.</em></p>`,
      authorName: "Daniel Sun",
      featuredImageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/daniel-sun-china-app-stack-X7asApY9dykLi2kRphMCCS.webp",
      tags: ["travel-tips", "travel-policy", "china-travel"],
      published: true,
      publishedAt: new Date("2026-02-06T00:00:00Z"),
    },
    {
      title: "Your Cheat Sheet for a Chinese Home Dinner (No Experience Needed)",
      slug: "home-dining-cheat-sheet-steven-to",
      excerpt: "A lot of our guests tell us the same thing before they arrive: they're excited, but a little nervous. Not about the food. About getting things wrong. We put together three simple cheat sheets to answer exactly these questions.",
      content: `<p>A lot of our guests tell us the same thing before they arrive: they're excited, but a little nervous. Not about the food. About getting things wrong.</p>

<p>Will I offend someone? Am I supposed to bring something? What do I do with the chopsticks?</p>

<p>These are completely reasonable questions, and we hear them constantly. So we put together three simple cheat sheets to answer exactly these questions.</p>

<p>One important note before you dive in: what we do at +1 Chopsticks is a home dining experience, not a formal business dinner. The etiquette here is warmer and more relaxed than what you might read about in a corporate China guide. Think family table, not boardroom banquet. Some of the rules are different, and we'll flag where that matters.</p>

<hr/>

<h3>🍽️ Cheat Sheet 1: Arriving, Eating, and the Culture of the Table</h3>

<p><img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/bVVpccqEtMObNCVS.png" alt="Home Dining Cheat Sheet 1" style="max-width:100%;border-radius:8px;margin:1rem 0;" /></p>

<p>A few things worth highlighting from this one:</p>

<p><strong>No gifts required.</strong> This is different from a formal Chinese dinner, where bringing something is expected. At a home dining experience like ours, your booking is genuinely appreciation enough. Come empty-handed and don't feel awkward about it.</p>

<p><strong>Getting there.</strong> Shanghai addresses can be confusing even for locals. If you're lost, just call. That's what hosts are for.</p>

<p><strong>At the table.</strong> Meals are served family-style, with shared dishes in the middle. Wait for the host to start, and use the public chopsticks (gongkuai) when taking from shared dishes rather than your personal ones.</p>

<p><strong>The "Eat More" culture.</strong> When your host piles food into your bowl, that's affection, not pressure. It's one of the most distinctly Chinese ways of saying they're glad you're there. If you're genuinely full, leaving a small bite on your plate is the signal. A clean plate says you want more.</p>

<p><strong>On drinking.</strong> Baijiu is not standard at our table. If it comes out and you want to try it, great. If you'd rather not, a simple decline is completely fine. No pressure, no awkwardness.</p>

<p><strong>After the meal.</strong> Don't rush off. Lingering at the table and talking is part of the experience. The best conversations usually happen after the dishes are cleared.</p>

<hr/>

<h3>🥢 Cheat Sheet 2: Chopsticks</h3>

<p><img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/evpnEwufHAIzvten.png" alt="Home Dining Cheat Sheet 2" style="max-width:100%;border-radius:8px;margin:1rem 0;" /></p>

<p>Chopstick anxiety is real and completely unnecessary. Nobody at our table will judge you for struggling, and nobody expects perfection. But if you want to feel more comfortable before you arrive, here's the quick version:</p>

<p>The lower stick stays still. The upper stick does all the moving. Pick up small amounts rather than trying to grab large pieces. When you're not eating, rest them on the holder or across your bowl.</p>

<p>Three things to avoid: sticking chopsticks upright in a bowl of rice (it's a funerary symbol and makes people uncomfortable), pointing at someone with them, and spearing food. Beyond that, you'll be fine.</p>

<p>Practice makes perfect, and honestly, half the fun is figuring it out at the table.</p>

<hr/>

<h3>🗣️ Cheat Sheet 3: A Few Words That Go a Long Way</h3>

<p><img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/LkQJhCxWFqettfuf.png" alt="Home Dining Cheat Sheet 3" style="max-width:100%;border-radius:8px;margin:1rem 0;" /></p>

<p>You don't need Mandarin to have a great evening. But a few words used at the right moment will genuinely delight your hosts.</p>

<ul>
<li><strong>很好吃 (hen hao chi)</strong> - It's very delicious. Use this early and often.</li>
<li><strong>我吃饱了 (wo chi bao le)</strong> - I'm full. Useful when the food keeps coming and you need a polite way to pause.</li>
<li><strong>谢谢招待 (xie xie zhao dai)</strong> - Thank you for the hospitality. Save this for the end of the evening. It lands every time.</li>
<li><strong>干杯 (gan bei)</strong> - Cheers. If there's any drinking happening, this is all you need.</li>
</ul>

<hr/>

<p>The honest truth is that most guests arrive a little nervous and leave wondering why they were. A Chinese home dinner is warm, generous, and genuinely fun. The cheat sheets exist not because the rules are complicated, but because knowing them lets you relax and actually enjoy the evening.</p>

<p>If you'd like to experience this for yourself, you can book a dinner with our family at <a href="https://plus1chopsticks.com">plus1chopsticks.com</a>.</p>`,
      authorName: "Steven To",
      featuredImageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/steven-to-blog-thumbnail-LAyeRTwx2AkzxfWYQ9AtWo.webp",
      tags: ["travel-tips", "dining-etiquette", "cultural-guide"],
      published: true,
      publishedAt: new Date("2026-03-13T00:00:00Z"),
    },
    {
      title: "For first-time China travelers: Answers to The Itinerary Questions We Keep Seeing - Regularly Updated",
      slug: "planning-first-china-trip-itinerary-questions",
      excerpt: "We've been helping travelers plan their China trips across Reddit and Facebook groups, and after 40+ conversations, we noticed something: the same questions keep coming up, almost word for word. These are the honest answers.",
      content: `<p>We've been helping travelers plan their China trips across Reddit and Facebook groups, and after 40+ conversations, we noticed something: the same questions keep coming up, almost word for word. So we decided to write them all down in one place. These aren't generic travel tips — they're the actual questions real travelers asked us, and the honest answers we gave them. We'll keep adding to this as new themes emerge!</p>

<hr/>

<h3>🗺️ Q1: "I have 15 days. Am I trying to do too much?"</h3>

<p>Almost always, yes — and we say this with love.</p>

<p>The mistake most first-timers make is treating China like Europe, where you can hop cities every couple of days. China is just a different beast. The distances are bigger, the cities are massive, and honestly each place deserves more time than you think.</p>

<p>Here's a rough guide that actually works:</p>

<ul>
<li><strong>Beijing:</strong> 4 to 5 nights. The Great Wall alone is a full day. Add the Forbidden City, Temple of Heaven and some hutong wandering and you'll fill every night easily.</li>
<li><strong>Shanghai:</strong> 3 to 4 nights. More manageable but rewards slowing down.</li>
<li><strong>Xi'an:</strong> 3 nights. The Terracotta Warriors deserve a full unhurried day — don't short-change it.</li>
<li><strong>Chengdu:</strong> 3 nights. Pandas, Sichuan food, and Leshan Giant Buddha as a day trip.</li>
<li><strong>Chongqing:</strong> 2 to 3 nights. Dramatic city, incredible hotpot, physically tiring because everything is vertical!</li>
<li><strong>Zhangjiajie:</strong> 3 nights. Two feels rushed. The mountains reward taking your time.</li>
</ul>

<p>The travelers who enjoy China most are the ones who do fewer cities better, not more cities faster. Trust us on this one.</p>

<hr/>

<h3>🚄 Q2: "Should I do the Golden Triangle or add a fourth city?"</h3>

<p>The Golden Triangle (Beijing, Shanghai, Xi'an) keeps coming up because it works. Three iconic cities, logical train connections, and something genuinely special in each one. For 10 to 14 days it's hard to beat.</p>

<p>But here's the catch — it depends on your time.</p>

<ul>
<li><strong>Under 10 days:</strong> The Golden Triangle gets squeezed. Beijing in 3 nights means rushing the Great Wall. Consider a regional focus instead: Shanghai plus day trips to Suzhou and Hangzhou, or Xi'an anchoring a history-focused trip.</li>
<li><strong>3 weeks or more:</strong> Do the Golden Triangle and add Chengdu or Zhangjiajie.</li>
</ul>

<p>A few routes we see work well:</p>
<ul>
<li><strong>10 days:</strong> Shanghai (4) + Xi'an (3) + Beijing (3)</li>
<li><strong>15 days:</strong> Add Chengdu (3) and Chongqing (2) between Xi'an and Shanghai</li>
<li><strong>3 weeks:</strong> Add Zhangjiajie (3) routed between Chongqing and Beijing</li>
</ul>

<p>One more thing — high speed trains are almost always better than flying once you factor in airport time. The Beijing to Xi'an overnight sleeper is a classic. Xi'an to Shanghai in 6 hours on a day train is genuinely comfortable. Only consider flying for Zhangjiajie, where the train connections can be slow.</p>

<hr/>

<h3>🏯 Q3: "Xi'an or Guangzhou — which should I pick?"</h3>

<p>Keep Xi'an, especially for a first trip.</p>

<p>The Terracotta Warriors are genuinely one of the most impressive things you will see anywhere in the world. The Muslim Quarter has some of the best street food in China. And Xi'an gives you that ancient China feeling that pairs perfectly with Beijing in a way Guangzhou simply doesn't.</p>

<p>Guangzhou is a great city but it skews modern and everyday. Save it for a second trip when you want to go deeper rather than broader.</p>

<hr/>

<h3>🎆 Q4: "My dates overlap with Golden Week. How bad is it?"</h3>

<p>Bad enough to plan around. Most people don't find this out until it's too late to adjust.</p>

<p>China has a few major holidays where domestic travel spikes significantly:</p>

<ul>
<li><strong>Chinese New Year</strong> (January or February, date changes each year): The biggest migration event in the world. Trains and flights book out weeks in advance, and many restaurants and shops close for days. Unless you specifically want to experience the festivities, best to avoid this window entirely.</li>
<li><strong>Qingming Festival</strong> (early April, date varies): A 3-day holiday that bumps up travel noticeably. Less extreme than the others but worth knowing about, especially for train bookings.</li>
<li><strong>Labour Day Golden Week</strong> (May 1 to 5): A significant travel peak. Popular sites get crowded and trains fill up fast.</li>
<li><strong>National Day Golden Week</strong> (October 1 to 7): The busiest travel period after Chinese New Year. Trains sell out weeks in advance and major tourist sites get genuinely overwhelming.</li>
</ul>

<p>If your dates overlap with any of these, try to spend the holiday days in a large city rather than a scenic mountain area. Chongqing during Golden Week is far more manageable than Zhangjiajie, for example. Book trains the moment they open (usually 15 days in advance) and build some buffer days into your itinerary — a delayed train shouldn't collapse your whole plan!</p>

<hr/>

<h3>☀️ Q5: "We're going in June. Anything we should know about the weather?"</h3>

<p>More than you'd expect — and it's the thing most people research last but really should research first.</p>

<p>June through August is hot and humid across most of eastern China. Shanghai, Beijing, Chongqing — all can hit 35C or more. It's manageable if you're prepared, but exhausting if you're not. Try to front-load your outdoor sightseeing in the mornings.</p>

<p>A few more things worth knowing:</p>

<ul>
<li><strong>Zhangjiajie</strong> in spring and early summer is often misty and rainy. This sounds bad but honestly the mountains in mist are spectacular. Just don't expect those clear blue sky shots — October is better for that.</li>
<li><strong>Yunnan</strong> (Kunming, Dali, Lijiang) is the exception to the summer heat rule. Kunming sits at altitude and rarely gets above 25C even in June — it's called the Spring City for a reason.</li>
<li><strong>October</strong> is the golden month for China travel. Cooler, clearer, and the landscapes look incredible. Just avoid the first week (National Day Golden Week!).</li>
<li><strong>May</strong> is lovely but double-check your dates. The Labour Day Golden Week from May 1 to 5 catches a lot of first-timers off guard.</li>
</ul>

<hr/>

<h3>👶 Q6: "We're traveling with a toddler. Is this actually manageable?"</h3>

<p>More manageable than most people expect, honestly — with a few things to know going in.</p>

<p>Shanghai and Beijing are both fairly stroller-friendly. Wide pavements, mostly good metro access, and the main tourist areas have paved paths. Chongqing is the tricky one because the city is extremely hilly with lots of stairs in the old areas, so expect to fold and carry more often there.</p>

<p>Food is actually one of China's strengths for young kids. Plain steamed rice, congee, steamed egg, noodles, dumplings — all mild, soft, and available everywhere. The one city to watch is Chengdu, where the default is spicy. Just ask for <em>bu yao la</em> (no spice) and you'll be fine.</p>

<p><strong>Timing tip:</strong> late October and November is a great window for family trips. The heat is gone, the crowds are thinner, and the weather in Shanghai and Beijing is genuinely pleasant.</p>

<p><strong>Practical note:</strong> a lightweight foldable stroller beats a heavy pram every time. Bring a carrier as backup for uneven terrain — you'll thank yourself at some of the heritage sites.</p>

<hr/>

<h3>🧘 Q7: "Everyone keeps telling me to relax my itinerary. How do I actually do that?"</h3>

<p>Build at least one full free day into every week and genuinely don't schedule it.</p>

<p>The travelers who come back happiest are almost never the ones who ticked off the most cities. They're the ones who stumbled into Fuxing Park on a Saturday morning and found locals ballroom dancing. Or spent two hours at a hole-in-the-wall shengjianbao spot because the first one was so good they went back. Or just wandered the French Concession with no plan and found a street they still think about.</p>

<p>Think of the itinerary as a framework, not a contract. The best moments in China are usually the unplanned ones.</p>

<hr/>

<h3>🏙️ Q8: "I've done the Bund. What else is there in Shanghai?"</h3>

<p>A lot more than most people give it credit for!</p>

<ul>
<li><strong>Fuxing Park</strong> on a weekend morning. Ballroom dancing, tai chi, card games, zero tourists. This is pure local Shanghai and it costs nothing.</li>
<li><strong>Wukang Road.</strong> Walk it slowly — the architecture rewards lingering and there are great independent cafes tucked into the old buildings.</li>
<li><strong>Shengjianbao</strong> from a street spot, not a restaurant. The hole-in-the-wall version will genuinely ruin the fancy restaurant version for you forever.</li>
<li><strong>Suzhou or Zhujiajiao</strong> as a day trip. Classical gardens and canals, under an hour by bullet train. A completely different pace from the city.</li>
<li><strong>West Bund Art Center</strong> or <strong>Rockbund Art Museum</strong> if contemporary art is your thing. World class and rarely crowded.</li>
</ul>

<p>And if you want to experience what everyday Shanghai life actually feels like — not the tourist layer — we run +1 Chopsticks, a home dining experience with our local English-speaking family. Guests come for a home-cooked Shanghai meal and usually end up staying way longer than planned. It's one of those evenings that tends to become the highlight of the trip.</p>

<hr/>

<p><em>Have a question about your China itinerary? Subscribe to our newsletter or get in touch at plusonechopsticks@gmail.com</em></p>

<p><em>Last updated: March 2026</em></p>`,
      authorName: "Steven To",
      featuredImageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/china-trip-planning-thumbnail-kt9nzp5aRKo7Jw7PusDowi.webp",
      tags: ["travel-tips", "china-travel", "itinerary-planning"],
      published: true,
      publishedAt: new Date("2026-03-21T06:41:27Z"),
    },
  ];

  console.log("🔄 Restoring blog posts...");

  for (const post of posts) {
    try {
      await db.insert(blogPosts).values(post);
      console.log(`✅ Inserted: "${post.title}"`);
    } catch (error) {
      if (error.message?.includes("Duplicate entry")) {
        console.log(`⚠️  Already exists (slug conflict): "${post.slug}" — skipping`);
      } else {
        console.error(`❌ Failed to insert "${post.title}":`, error.message);
      }
    }
  }

  console.log("\n✅ Done! Verifying...");
  const result = await connection.execute("SELECT id, title, publishedAt FROM blog_posts ORDER BY publishedAt DESC");
  console.log("Blog posts in DB:", result[0]);

  await connection.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
