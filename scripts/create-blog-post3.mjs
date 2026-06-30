import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const wontonUrl = 'https://res.cloudinary.com/drxfcfayd/image/upload/q_auto,f_auto,w_1600/blog/post3-sandrine-wonton.jpg';
const dannyUrl = 'https://res.cloudinary.com/drxfcfayd/image/upload/q_auto,f_auto,w_1600/blog/post3-danny-jiading-ayi.jpg';
const pykeUrl = 'https://res.cloudinary.com/drxfcfayd/image/upload/q_auto,f_auto,w_1600/blog/post3-pyke-norika-steven.jpg';

const content = `![Hands-on in a Shanghai kitchen — where kids become part of the meal.](${wontonUrl})
*Hands-on in a Shanghai kitchen — where kids become part of the meal.*

The first thing to know is that kids travel differently than adults do. They don't care about the skyline or the must-see temple. They care about whether someone is kind to them, whether there's something fun to do with their hands, and whether the food is something they actually want to eat. Which is exactly why a meal in a local family's home turns out to be one of the best things you can do with children in Shanghai — and one of the most underrated family activities the city offers.

Take Danny's family, who were, as it happens, the very first guests +1 Chopsticks ever hosted. Danny is Australian of Chinese descent; his wife is Australian of Indian background; and their not-quite-two-year-old daughter speaks Shanghainese and Hindi, but not yet English. They'd flown in on a roots-tracing trip, and on just their second day in the country — jet-lagged, with a toddler, navigating by public transit — they made their way out to [Jiading Ayi](https://plus1chopsticks.com/hosts/150001)'s home for lunch.

![An Australian family traces its roots back to a Shanghai home table.](${dannyUrl})
*An Australian family traces its roots back to a Shanghai home table.*

What happened next is the kind of thing you can't plan. Danny walked through the door and began speaking Shanghainese — stunning Auntie Shen, a Shanghai native who hadn't expected it. And the little girl, who usually takes a good half hour to warm up to strangers, hit it off with Auntie Shen almost instantly. The two of them chatted away in Shanghainese and wandered the house looking at the fridge magnets while the grown-ups marveled. Auntie Shen had laid out a full spread — spring bamboo shoot stew, Shanghai smoked fish, shepherd's purse with dried tofu, tender fava beans, sweet and sour pork ribs, white-cut chicken, her secret-recipe wontons, handmade fish balls, vegetable rice, and tangyuan for the child. As Danny told us afterward:

> "Thanks for having us, it was a terrific experience and we are glad we could be the first ones to try it out! The food was delicious and the hosts very welcoming. I think it's a great initiative and will be very popular once word gets out."
>
> — Danny, Australia

He was right about that. But what stayed with us was the toddler — proof that connection at a family table doesn't even require a shared language.

---

If a two-year-old can find her place at the table, so can a teenager — which is a harder trick, as any parent of one will tell you.

Sandrine, an Air France flight attendant, came to Shanghai with her 17-year-old son. She'd searched specifically for something real, not a packaged tour, and we connected her with [Echo](https://plus1chopsticks.com/hosts/90002), one of our Shanghai hosts. It was Echo's very first time hosting, and she was nervous enough that she forgot to photograph the full table — but she remembered the thing that mattered. She'd made three kinds of dumplings, and when she saw how much the boy loved them, the evening turned into a hands-on dumpling lesson.

![A French teenager learns to wrap wontons in a Shanghai kitchen.](${wontonUrl})
*A French teenager learns to wrap wontons in a Shanghai kitchen.*

Echo's husband taught Sandrine's son to wrap wontons, and by the end of the night the teenager was folding them himself. For a parent, watching your kid get pulled into someone else's family kitchen — fully absorbed, learning something with his hands instead of staring at a screen — is the kind of travel moment you don't forget. The ease of it all was what Sandrine kept coming back to: Echo met them on foot right at the subway station so they never had to worry about finding the place, and the whole family spoke English, so conversation flowed. Her review said it better than we can:

> "The easiness of communication with Echo. She picked us up directly by foot at the subway station — we didn't have to worry about finding the place. The chatting was fluent and easy in English. Her family was perfect; they all speak English. The Chinese food was prepared with love. We prepared the wontons at the end. Her husband taught my son. It was nice to watch. We all had a real, friendly meal together… The only thing we didn't like was leaving."
>
> — Sandrine, France

That last line — *the only thing we didn't like was leaving* — is one we hear from families more than any other.

---

The third family came from about as far away as it's possible to come. Andrew, Jayne, and Brooke Pyke are from a small town in remote Western Australia — the kind of place where there's no shoe shop, where new sneakers mean ordering online and waiting weeks, and where the town quietly ships out a huge share of the nation's mining ore. They had never been to China before, and they came to share a meal at [Norika and Steven](https://plus1chopsticks.com/hosts/1)'s table.

![A family from remote Western Australia at their first meal in China.](${pykeUrl})
*A family from remote Western Australia at their first meal in China.*

Norika had been cooking since morning — zhajiangmian with thick, savory bean paste, honey-glazed chicken wings, kao fu braised in soy and spices, stir-fried Shanghai greens, and hand-folded Tianjin-style pork dumplings. The Pykes had a touch of stomach trouble that day and couldn't eat as much as they'd have liked, but they stayed for hours anyway, because by then the meal had become something else entirely — a long, wandering conversation about China's tech boom, Australian property, retirement, the kind of talk you can only have face to face. By the time they left, Andrew had invited the family to come dive the Great Barrier Reef with them in Cairns. His thank-you note captured the whole spirit of it:

> "G'day mate. What a wonderful afternoon. We had a great time together and I could have sat and talked about all sorts of things for ages! The food was delicious and your company was amazing… if you're ever in Cairns we would love to have you over for dinner, or a trip out on our boat to the reef to fish and dive. We look forward to any opportunity to see you guys in the future."
>
> — Andrew, Jayne & Brooke, Australia

A family flew across the world, shared one lunch, and left having made friends on another continent. That's not a side effect of the experience. For families, it's the whole point.

---

Parents come to home dining worried about the practical things — will the food be too unfamiliar, will the kids be bored, will it be awkward. What they find instead is the rare kind of travel experience that works on everyone at the table at once. A toddler who makes a friend without a word of shared language. A teenager who forgets his phone exists because he's elbow-deep in dumpling dough. Parents who came for a meal and left with an open invitation to the other side of the world.

The food is genuinely special — real Chinese home cooking, cooked from scratch, the kind you simply cannot order in a restaurant. But the reason families remember it isn't the menu. It's that for one afternoon, in a stranger's home in a foreign country, everyone felt like they belonged there. Real connection is the new luxury — and there may be no better gift to give your kids on the road than a seat at a table like this.

---

If you're traveling to Shanghai with your family, you can book a table at a local family's home at [plus1chopsticks.com](https://plus1chopsticks.com). Meet [Jiading Ayi](https://plus1chopsticks.com/hosts/150001), [Echo](https://plus1chopsticks.com/hosts/90002), and [Norika & Steven](https://plus1chopsticks.com/hosts/1) — and bring the whole family to the table.`;

const now = new Date();

await conn.execute(
  `INSERT INTO blog_posts (id, title, slug, excerpt, content, featuredImageUrl, authorName, tags, published, publishedAt, createdAt, updatedAt)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    210001,
    'Taking Your Family to a Chinese Family\'s Home — What Really Happens',
    'family-home-dining-shanghai',
    'A toddler, a teenager, and a family from the other side of the world — and the rare travel experience that works on everyone at the table at once.',
    content,
    wontonUrl,
    'Steven, Founder & CEO @ +1 Chopsticks',
    JSON.stringify(['Family Travel', 'Home Dining', 'Authentic Chinese Food', 'Shanghai', 'Guest Stories', 'Kids', 'Jiading']),
    1,
    now,
    now,
    now,
  ]
);

console.log('Blog post 3 created successfully!');
await conn.end();
