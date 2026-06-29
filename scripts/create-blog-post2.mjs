import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const dotenv = require('dotenv');
dotenv.config();
import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const heroUrl = 'https://res.cloudinary.com/drxfcfayd/image/upload/v1782742199/blog/post2-ethan-jiading-ayi.jpg';
const ethanUrl = 'https://res.cloudinary.com/drxfcfayd/image/upload/v1782742199/blog/post2-ethan-jiading-ayi.jpg';
const ekaterUrl = 'https://res.cloudinary.com/drxfcfayd/image/upload/v1782742210/blog/post2-ekaterina-katina-jiading-ayi.jpg';
const danilUrl = 'https://res.cloudinary.com/drxfcfayd/image/upload/v1782742234/blog/post2-danil-katerina-full-table.jpg';

const content = `![Where friends and couples come to share a real Shanghai family meal.](${heroUrl})

*Where friends and couples come to share a real Shanghai family meal.*

Ethan grew up in Shanghai. Then his family moved to Australia, and the city became a place he remembered more than visited. So when he came back — this time as a traveler, with a friend in tow — he wasn't looking for the famous restaurants or the rooftop views. He was looking for something harder to find on a map: the taste of his childhood.

He found it at [Jiading Ayi's](https://plus1chopsticks.com/hosts/150001) table. Auntie Shen is a true daughter of Jiading Old Town, and she cooks the way Shanghai grandmothers have always cooked — from scratch, with vegetables from her own backyard, recipes perfected over decades in a well-seasoned wok. For Ethan, the first bite wasn't a meal so much as a memory. As he told us afterward, the flavors were exactly as he remembered eating them as a child in Shanghai.

![An Australian-born Shanghainese returns home to the flavors of his childhood.](${ethanUrl})

*An Australian-born Shanghainese returns home to the flavors of his childhood.*

His friend, who'd spent two weeks working through Shanghai's street food and restaurants, got something different out of it — the quiet relief of a home-cooked meal after a fortnight of eating out. That's the thing about bringing a friend to a table like this. You're not just sharing a dinner; you're sharing a part of yourself that a restaurant could never plate. Ethan summed it up simply:

> "The experience was great, and exactly what we were expecting and looking for. The absolute standout was the food… flavours exactly as I remembered eating as a child in Shanghai. The company and conversation was fantastic as well. It was good to talk about Shanghai as I remembered it, and as it is now."
>
> — Ethan, Australia

What he appreciated just as much was how easy it all was — quick, clear communication from Auntie Shen and her daughter, and a pickup and drop-off at the metro station. For friends visiting an unfamiliar city, that smoothness is part of what makes a home dinner feel less daunting than it sounds.

---

If Ethan's story is about coming home, Ekaterina and Katina's is about saying goodbye.

The two met in Shanghai three years ago, brought together by chance and the strange intimacy of being foreigners in the same enormous city — Ekaterina from Russia, Katina from Panama, both working at an international school. Now Ekaterina was leaving for Germany to reunite with family, and the two friends wanted to mark the end of an era. Not with a bar, not with a fancy restaurant, but with something they'd somehow never done in three years of living there: a trip out to Jiading, and a meal in a local family's home.

![A farewell lunch in Jiading, three years in the making.](${ekaterUrl})

*A farewell lunch in Jiading, three years in the making.*

Neither had been to Jiading before, and on the way out they kept remarking on how different it felt from the city center — quieter, older, more local. Auntie Shen and her sister built the menu around the season; it was Grain Buds, when loquats hit their peak, and they'd sourced them from two different places just to compare. Then came the dumplings, and the afternoon turned into something neither of them expected — made livelier still by a few young content creators who'd joined the table.

It turns out Russia has its pelmeni and Panama has its empanadas — so when everyone picked up a rolling pin, the table became a small, joyful summit of dumpling traditions. Under the patient guidance of two northeastern Chinese women, each guest folded their own version of the perfect dumpling. Someone dubbed the lopsided, lovingly made results "the United Nations dumplings." The name stuck. As Katina put it:

> "Aunt Shen and her sister were beautiful hosts. I will remember their smile, easy to talk with and really embraced us. The food was cooked with love but the dumpling making was hilarious. We affectionately called them 'the United Nations dumplings.' I'm enriched by this beautiful experience!"
>
> — Katina

That's the quiet magic of a shared kitchen. You arrive as guests and leave having made something together — which, for two friends marking a goodbye, turned out to be exactly the send-off they needed.

---

The last table is the busiest one. A British couple, Danil and Katerina, came to Jiading Ayi's home and found themselves sharing the meal with a few other travelers — the kind of mixed table that could have been awkward and instead became the highlight of their trip.

![Strangers at the start of lunch, friends by the end of it.](${danilUrl})

*Strangers at the start of lunch, friends by the end of it.*

What won Danil and Katerina over first was the food — specifically the si xi kao fu, the braised gluten with mushrooms and bamboo shoots that's a cornerstone of Shanghainese home cooking. They'd never had anything like it, and the impression ran deep: back home in the UK, Danil went looking for a Shanghainese restaurant that might come close. (He found one a twenty-minute walk from his house, though he suspects it won't quite measure up to Auntie Shen's black pot.) Around the table, the conversation ranged easily across languages and life stories, the way it does when good food lowers everyone's guard.

For a couple traveling together, an evening like this becomes a shared memory with a place and a person attached — not just another restaurant on the itinerary, but a genuinely off-the-beaten-path Shanghai experience they'll come back to. Danil wrote to us afterward:

> "It's been a highlight of our trip and I've been telling my colleagues about this experience. It's a unique opportunity to experience life in China in a different way, meet new people, learn something new and of course have some good food. Definitely keen to do this again when we're back to China next!"
>
> — Danil & Katerina, United Kingdom

That line — *keen to do this again* — is the one we hear most from couples and friends. A restaurant is a place you eat once and move on from. A family's table is a place you find yourself wanting to return to.

---

There's a reason more couples and friends are choosing home dining over restaurants when they come to Shanghai, and it isn't only the food — though the food, cooked from scratch in a real family kitchen, is genuinely unlike anything on a restaurant menu. It's that the experience gives you something to share beyond the meal itself. A childhood memory, rediscovered. A goodbye, made into a celebration. A trip's best afternoon, born at a stranger's table.

Real connection is the new luxury — and it multiplies when there's someone beside you to share it with. For friends and couples, that's the whole point: the best stories from a trip aren't the ones you take in alone. They're the ones you make together.

---

If you're traveling to Shanghai as a couple or with friends, you can book a table at a local family's home at [plus1chopsticks.com](https://plus1chopsticks.com). Meet [Jiading Ayi](https://plus1chopsticks.com/hosts/150001), whose Jiading Old Town kitchen has welcomed friends and couples from all over the world — and bring someone worth sharing the table with.`;

const id = 180001;
const now = new Date();

await conn.execute(
  `INSERT INTO blog_posts (id, title, slug, excerpt, content, featuredImageUrl, authorName, tags, metaDescription, published, publishedAt, createdAt, updatedAt)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    id,
    'Why Couples and Friends Are Choosing Home Dining Over Restaurants in Shanghai',
    'couples-friends-home-dining-shanghai',
    'Couples and friends share why they chose a Shanghai family table over a restaurant — authentic home-cooked Chinese food, English-speaking local hosts, and memories worth sharing.',
    content,
    heroUrl,
    'Steven, Founder & CEO @ +1 Chopsticks',
    JSON.stringify(['Couples', 'Friends', 'Home Dining', 'Authentic Chinese Food', 'Shanghai', 'Guest Stories', 'Jiading']),
    'Couples and friends share why they chose a Shanghai family table over a restaurant — authentic home-cooked Chinese food, English-speaking local hosts, and memories worth sharing.',
    1,
    now,
    now,
    now,
  ]
);

console.log(`✓ Blog post 2 created with id: ${id}`);
await conn.end();
