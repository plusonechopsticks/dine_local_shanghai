import { getDb } from "./server/db.ts";
import { blogPosts } from "./drizzle/schema.ts";

const db = await getDb();

if (!db) {
  console.error("❌ Database connection failed");
  process.exit(1);
}

const blogPostContent = `# Your Cheat Sheet for a Chinese Home Dinner (No Experience Needed)

A lot of our guests tell us the same thing before they arrive: they're excited, but a little nervous. Not about the food. About getting things wrong.

Will they need to bring a gift? Will they be expected to drink baijiu? What do they do if they can't use chopsticks?

These are completely reasonable things to wonder, especially if you've never been to a Chinese home dinner before. So we put together three simple cheat sheets to answer exactly these questions.

One important note before you dive in: what we do at +1 Chopsticks is a home dining experience, not a formal business dinner. The etiquette here is warmer and more relaxed than what you might read about in a corporate China guide. Think family table, not boardroom banquet. Some of the rules are different, and we'll flag where that matters.

---

## 🍽️ Cheat Sheet 1: Arriving, Eating, and the Culture of the Table

![Home Dining Cheat Sheet 1](https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/bVVpccqEtMObNCVS.png)

A few things worth highlighting from this one:

**No gifts required.** This is different from a formal Chinese dinner, where bringing something is expected. At a home dining experience like ours, your booking is genuinely appreciation enough. Come empty-handed and don't feel awkward about it.

**Getting there.** Shanghai addresses can be confusing even for locals. If you're lost, just call. That's what hosts are for.

**At the table.** Meals are served family-style, with shared dishes in the middle. Wait for the host to start, and use the public chopsticks (gongkuai) when taking from shared dishes rather than your personal ones.

**The "Eat More" culture.** When your host piles food into your bowl, that's affection, not pressure. It's one of the most distinctly Chinese ways of saying they're glad you're there. If you're genuinely full, leaving a small bite on your plate is the signal. A clean plate says you want more.

**On drinking.** Baijiu is not standard at our table. If it comes out and you want to try it, great. If you'd rather not, a simple decline is completely fine. No pressure, no awkwardness.

**After the meal.** Don't rush off. Lingering at the table and talking is part of the experience. The best conversations usually happen after the dishes are cleared.

---

## 🥢 Cheat Sheet 2: Chopsticks

![Home Dining Cheat Sheet 2](https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/evpnEwufHAIzvten.png)

Chopstick anxiety is real and completely unnecessary. Nobody at our table will judge you for struggling, and nobody expects perfection. But if you want to feel more comfortable before you arrive, here's the quick version:

The lower stick stays still. The upper stick does all the moving. Pick up small amounts rather than trying to grab large pieces. When you're not eating, rest them on the holder or across your bowl.

Three things to avoid: sticking chopsticks upright in a bowl of rice (it's a funerary symbol and makes people uncomfortable), pointing at someone with them, and spearing food. Beyond that, you'll be fine.

Practice makes perfect, and honestly, half the fun is figuring it out at the table.

---

## 🗣️ Cheat Sheet 3: A Few Words That Go a Long Way

![Home Dining Cheat Sheet 3](https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/LkQJhCxWFqettfuf.png)

You don't need Mandarin to have a great evening. But a few words used at the right moment will genuinely delight your hosts.

- **很好吃 (hen hao chi)** - It's very delicious. Use this early and often.
- **我吃饱了 (wo chi bao le)** - I'm full. Useful when the food keeps coming and you need a polite way to pause.
- **谢谢招待 (xie xie zhao dai)** - Thank you for the hospitality. Save this for the end of the evening. It lands every time.
- **干杯 (gan bei)** - Cheers. If there's any drinking happening, this is all you need.

---

The honest truth is that most guests arrive a little nervous and leave wondering why they were. A Chinese home dinner is warm, generous, and genuinely fun. The cheat sheets exist not because the rules are complicated, but because knowing them lets you relax and actually enjoy the evening.

If you'd like to experience this for yourself, you can book a dinner with our family at [plus1chopsticks.com](https://plus1chopsticks.com).`;

const post = await db.insert(blogPosts).values({
  id: "blog-steven-to-home-dining-cheat-sheet",
  title: "Your Cheat Sheet for a Chinese Home Dinner (No Experience Needed)",
  slug: "home-dining-cheat-sheet-steven-to",
  authorName: "Steven To",
  content: blogPostContent,
  excerpt: "A lot of our guests tell us the same thing before they arrive: they're excited, but a little nervous. Not about the food. About getting things wrong. We put together three simple cheat sheets to answer exactly these questions.",
  tags: ["travel-tips", "dining-etiquette", "cultural-guide"],
  published: true,
  publishedAt: new Date(),
});

console.log("✅ Blog post created successfully!");
console.log("Post ID:", "blog-steven-to-home-dining-cheat-sheet");
console.log("Title:", "Your Cheat Sheet for a Chinese Home Dinner (No Experience Needed)");
console.log("Author:", "Steven To");
console.log("Slug:", "home-dining-cheat-sheet-steven-to");
console.log("Tags:", ["travel-tips", "dining-etiquette", "cultural-guide"]);
process.exit(0);
