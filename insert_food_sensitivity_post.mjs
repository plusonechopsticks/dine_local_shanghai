import mysql from 'mysql2/promise';

const MSG_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/pasted_file_ELwkVN_NoMSG-Plus1Chopsticks_86a435b6.png';
const GLUTEN_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/pasted_file_bpzgH7_NoGluten-Plus1Chopsticks_ecc97ce1.png';
const HALAL_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/pasted_file_M2mP0k_Halalonly-Plus1Chopsticks_f59114bb.png';
const VEG_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/pasted_file_tEyqKY_Vegetarian-Plus1Chopsticks_eda6a2ec.png';
const VEGAN_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/pasted_file_yyZAVS_Vegan-Plus1Chopsticks_7634bd04.png';
const NUT_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/pasted_file_Zo54KI_Nutallergies-Plus1Chopsticks_52f48187.png';

const content = `
<p>We've been helping travelers plan their China trips for a while now, and food sensitivity questions come up more than almost anything else. A recent post about MSG in Chinese cooking sparked nearly 600 comments — clearly this is something a lot of people are thinking about before they go.</p>

<p>So we decided to write it all down in one place. Whether you're worried about MSG, avoiding gluten, eating halal, or going vegetarian, here's what you actually need to know.</p>

<hr />

<h2>💬 MSG: The Big One</h2>

<p>Let's start here because it generates the most anxiety.</p>

<p>MSG (味精, wèijīng) is used widely in Chinese cooking. Very widely. If you're looking for MSG-free food in China, you're going to have a hard time — it's as common an ingredient as salt or soy sauce, and it's what gives a lot of Chinese food that deep umami flavour that makes it so satisfying.</p>

<p>The good news: the science is pretty clear that MSG is not harmful for the vast majority of people. Fuchsia Dunlop, the most respected English-language writer on Chinese food, addresses this directly in her books — the idea that MSG causes illness (sometimes called "Chinese Restaurant Syndrome") has been largely debunked. Most people who think they're sensitive to MSG are actually reacting to something else entirely, like overeating, salt, or alcohol.</p>

<p>That said, if you have a genuine diagnosed sensitivity, show this card on your phone screen:</p>

<div style="text-align:center; margin: 2rem 0;">
  <img src="${MSG_IMG}" alt="MSG sensitivity card in Chinese - 对不起不要用味精我对味精敏感 - Sorry please don't use MSG I am sensitive to it" style="max-width:100%; border-radius:12px;" />
</div>

<p>Chinese people are genuinely kind and will usually do their best to accommodate you. Keep your allergy medication close just in case, and accept that in some places it simply won't be avoidable.</p>

<hr />

<h2>🌾 Gluten</h2>

<p>This one is genuinely tricky in China, because soy sauce — used in almost everything — contains wheat.</p>

<p>The Chinese term for gluten-free is 无麸质 (wú fū zhì), but a more practical phrase is shown on the card below. Show it on your phone screen:</p>

<div style="text-align:center; margin: 2rem 0;">
  <img src="${GLUTEN_IMG}" alt="Gluten free card in Chinese - 我不能吃小麦或含麦麸的食物 - I cannot eat wheat or foods containing gluten" style="max-width:100%; border-radius:12px;" />
</div>

<p>Some naturally safer options: plain steamed rice, rice noodles (check they're not mixed with wheat), steamed fish, steamed egg, fresh vegetables stir-fried with minimal sauce. Hotpot can work well with a plain broth base — just avoid the dipping sauces which usually contain soy sauce.</p>

<p>4 and 5 star international hotels (Marriott, Hilton, Hyatt) are generally well-equipped to handle gluten requirements. Email them in advance in both English and Chinese. Bringing some gluten-free snacks from home as backup is always a smart call.</p>

<hr />

<h2>🕌 Halal</h2>

<p>This is more manageable than most people expect, especially in certain cities.</p>

<p>Xi'an has one of the largest Muslim populations in China and the Muslim Quarter (回民街, Huímín Jiē) is a genuine halal food paradise — some of the best street food in China and almost all of it halal. Beijing, Shanghai, Chengdu, and Urumqi all have halal restaurants, usually marked with the Arabic script or the green 清真 (qīngzhēn) sign.</p>

<p>Look for the 清真 (qīngzhēn) symbol — it indicates halal certification and is your most reliable guide. Larger supermarkets also have halal sections marked this way.</p>

<div style="text-align:center; margin: 2rem 0;">
  <img src="${HALAL_IMG}" alt="Halal only card in Chinese - 我只吃清真食品不吃猪肉或猪油 - I only eat halal food no pork or lard please" style="max-width:100%; border-radius:12px;" />
</div>

<p>Avoid: most standard Chinese restaurants where pork and lard are used extensively in cooking. Always ask if in doubt.</p>

<hr />

<h2>🥗 Vegetarian and Vegan</h2>

<p>China has a long Buddhist vegetarian tradition which works in your favour. Buddhist vegetarian restaurants (素食, sùshí) are found in most major cities and serve entirely plant-based menus — often surprisingly creative and delicious.</p>

<p>The challenge is that many dishes that look vegetarian contain pork stock, shrimp paste, or oyster sauce in the cooking. Being specific about whether you eat eggs and dairy matters here, because vegetarian and vegan are genuinely different conversations in a Chinese kitchen.</p>

<p><strong>If you are vegetarian (eggs and dairy are fine), show this card:</strong></p>

<div style="text-align:center; margin: 2rem 0;">
  <img src="${VEG_IMG}" alt="Vegetarian card in Chinese - 我吃素不吃肉鱼或虾但可以吃蛋和奶制品 - I am vegetarian no meat fish or shrimp eggs and dairy are fine" style="max-width:100%; border-radius:12px;" />
</div>

<p><strong>If you are vegan (no animal products at all), show this card:</strong></p>

<div style="text-align:center; margin: 2rem 0;">
  <img src="${VEGAN_IMG}" alt="Vegan card in Chinese - 我是纯素食者不吃任何动物产品包括蛋奶和蜂蜜 - I am vegan no animal products at all including eggs dairy and honey" style="max-width:100%; border-radius:12px;" />
</div>

<p>Apps like VegRadar (available as a WeChat mini programme) map vegetarian and vegan friendly restaurants near you across China and are genuinely useful.</p>

<hr />

<h2>🥜 Nut Allergies</h2>

<p>Peanuts are extremely common in Chinese cooking — in sauces, stir-fries, cold dishes, and as garnishes. Tree nuts are less common but still present.</p>

<p>If you have a serious nut allergy, China requires extra vigilance. Show this card:</p>

<div style="text-align:center; margin: 2rem 0;">
  <img src="${NUT_IMG}" alt="Nut allergy card in Chinese - 我对花生和坚果严重过敏这是危及生命的 - I have a serious allergy to peanuts and nuts this is life-threatening" style="max-width:100%; border-radius:12px;" />
</div>

<p>Always carry your EpiPen and antihistamines. Stick to simpler steamed dishes where ingredients are more visible.</p>

<hr />

<h2>✅ A Few General Tips</h2>

<p>Show phrases on your phone screen rather than trying to say them — this works better and is less stressful for everyone.</p>

<p>Simpler dishes are safer dishes. The more sauces and seasonings involved, the harder it is to know what's in something.</p>

<p>International hotel restaurants are your safest bet for complex dietary needs. Worth spending a bit more for peace of mind.</p>

<p>And finally — don't let food anxieties stop you from eating adventurously in China. The food culture here is extraordinary and with a bit of preparation, most sensitivities are very manageable.</p>

<hr />

<p><em>Inspired by real questions from our community — including a recent post about MSG that sparked nearly 600 comments, and the many halal, gluten-free, and vegetarian questions we see from travelers planning their first China trips.</em></p>

<p><em>Have a food sensitivity question we haven't covered? Get in touch at <a href="mailto:plusonechopsticks@gmail.com">plusonechopsticks@gmail.com</a></em></p>

<p><em>At +1 Chopsticks, we're happy to accommodate dietary requirements for our home dining experiences in Shanghai and Shenzhen — just let us know in advance when you book at <a href="https://plus1chopsticks.com">plus1chopsticks.com</a></em></p>
`;

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const [result] = await conn.execute(
  `INSERT INTO blog_posts (title, slug, excerpt, content, authorName, featuredImageUrl, tags, metaDescription, metaKeywords, published, publishedAt)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
  [
    "Eating in China with Food Sensitivities: What You Actually Need to Know",
    "eating-in-china-with-food-sensitivities",
    "Whether you are worried about MSG, avoiding gluten, eating halal, or going vegetarian - here is what you actually need to know about eating in China with food sensitivities.",
    content.trim(),
    "The +1 Chopsticks Team",
    HALAL_IMG, // use the halal card as the cover image — visually striking
    JSON.stringify(["Travel Tips", "China Travel", "Food & Diet"]),
    "A practical guide to eating in China with food sensitivities — covering MSG, gluten, halal, vegetarian, vegan, and nut allergies, with Chinese phrase cards to show on your phone.",
    "eating in China halal gluten free vegetarian vegan MSG nut allergy food sensitivity China travel",
    1
  ]
);

console.log('Inserted blog post, id:', result.insertId);
await conn.end();
