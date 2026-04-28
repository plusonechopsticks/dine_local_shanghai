import { drizzle } from "drizzle-orm/mysql2";
import { hostListings } from "./drizzle/schema.ts";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

const molly = {
  hostName: "Molly",
  profilePhotoUrl: "https://res.cloudinary.com/drxfcfayd/image/upload/v1777395417/hosts/molly/profile.png",
  languages: ["Mandarin", "English"],
  bio: "Hey there! I'm Yiting — you can call me Eating 😄 I'm passionate about everything food-related, and I love welcoming new friends to my home for a real Shanghai meal. I specialise in both Shanghai cuisine (sweet, delicate, soft southern flavours) and Sichuan cuisine (bold, spicy, and deeply aromatic). Before I moved into my own place, I went to Jingdezhen to learn ceramic-making and hand-crafted a full set of tableware for my home — so every dish you eat here comes on something I made myself. These past two years I've also started growing my own food: I rent a vegetable plot in the suburbs of Shanghai, and if you visit at the right time of year, you might taste fresh organic vegetables straight from my garden, served on my own ceramics. I love cooking and exploring gourmet food, and I often invite friends over for home gatherings. I'm always happy to chat about the menu and customise a special dinner just for you!",
  whyHost: "The reason I want to be a host is simple: I love cooking and exploring gourmet food, and I often invite friends over for home gatherings. I also enjoy making new friends and listening to interesting stories from all over the place.",
  overseasExperience: "I'm a big travel lover — I've visited over 20 countries and I'm totally obsessed with natural landscapes: the ocean, lakes, wildflowers, and forests. I enjoy camping in quiet, peaceful nature spots.",
  otherPassions: "Ceramics & crafts (hand-threw a full set of tableware in Jingdezhen), urban farming (rents a vegetable plot in suburban Shanghai), travel (20+ countries), camping and nature.",
  culturalPassions: "Seasonal eating — celebrating bamboo shoots in spring, crayfish and green soybeans in summer, Shanghai hairy crab and taro in autumn. Every season brings a new menu.",
  funFacts: "Made all her own tableware by hand in Jingdezhen. Grows her own organic vegetables on a rented plot outside Shanghai. Speaks English and Mandarin fluently.",
  email: "molly@plus1chopsticks.com",
  wechatOrPhone: "molly_plus1",
  district: "Gubei, Changning",
  availability: {
    saturday: ["lunch", "dinner"],
    sunday: ["lunch", "dinner"],
  },
  maxGuests: 6,
  cuisineStyle: "Shanghai & Sichuan",
  title: "Handmade Ceramics, Home-Grown Vegetables & Two Cuisines in One Table",
  menuDescription: `Molly's table bridges two great Chinese culinary traditions. From Shanghai: creamy potato salad, Yan Du Xian soup (salted pork & fresh pork with bamboo shoots), sweet & sour pork riblets, and home-style braised yellow croaker with rice cakes. From Sichuan: Maoxuewang spicy pot, silky Mapo Tofu, spicy diced chicken with chili peppers, and twice-cooked pork with garlic scapes. Seasonal specials rotate with what's growing on her suburban plot — spring bamboo and wild herbs, summer swamp eel and crayfish, autumn hairy crab and taro. Chat with Molly before your visit to co-design a menu around what's in season. Every dish is served on tableware she hand-threw herself in Jingdezhen.`,
  foodPhotoUrls: [
    "https://res.cloudinary.com/drxfcfayd/image/upload/v1777395418/hosts/molly/food-01.jpg",
    "https://res.cloudinary.com/drxfcfayd/image/upload/v1777395420/hosts/molly/food-02.jpg",
    "https://res.cloudinary.com/drxfcfayd/image/upload/v1777395422/hosts/molly/food-03.jpg",
    "https://res.cloudinary.com/drxfcfayd/image/upload/v1777395424/hosts/molly/food-04.jpg",
    "https://res.cloudinary.com/drxfcfayd/image/upload/v1777395426/hosts/molly/food-05.jpg",
    "https://res.cloudinary.com/drxfcfayd/image/upload/v1777395427/hosts/molly/food-06.jpg",
    "https://res.cloudinary.com/drxfcfayd/image/upload/v1777395429/hosts/molly/food-07.jpg",
    "https://res.cloudinary.com/drxfcfayd/image/upload/v1777395431/hosts/molly/food-08.jpg",
    "https://res.cloudinary.com/drxfcfayd/image/upload/v1777395433/hosts/molly/food-09.jpg",
    "https://res.cloudinary.com/drxfcfayd/image/upload/v1777395435/hosts/molly/food-10.jpg",
    "https://res.cloudinary.com/drxfcfayd/image/upload/v1777395436/hosts/molly/food-11.jpg",
    "https://res.cloudinary.com/drxfcfayd/image/upload/v1777395438/hosts/molly/food-12.jpg",
    "https://res.cloudinary.com/drxfcfayd/image/upload/v1777395439/hosts/molly/food-13.jpg",
    "https://res.cloudinary.com/drxfcfayd/image/upload/v1777395441/hosts/molly/food-14.jpg",
    "https://res.cloudinary.com/drxfcfayd/image/upload/v1777395443/hosts/molly/food-15.jpg",
    "https://res.cloudinary.com/drxfcfayd/image/upload/v1777395445/hosts/molly/food-16.jpg",
    "https://res.cloudinary.com/drxfcfayd/image/upload/v1777395446/hosts/molly/food-17.jpg",
    "https://res.cloudinary.com/drxfcfayd/image/upload/v1777395448/hosts/molly/food-18.jpg",
  ],
  introVideoUrl: "https://res.cloudinary.com/drxfcfayd/video/upload/v1777395451/hosts/molly/intro-video.mp4",
  dietaryNote: "Can accommodate vegetarian guests with advance notice (Sichuan vegetarian dishes available). Please inform Molly of any allergies — she is happy to adjust the menu.",
  activities: ["cooking-class", "plot-visit", "market-visit"],
  pricePerPerson: 388,
  mealDurationMinutes: 150,
  kidsFriendly: true,
  hasPets: false,
  petDetails: null,
  householdFeatures: [],
  status: "approved",
  displayOrder: 0,
};

try {
  const result = await db.insert(hostListings).values(molly);
  console.log("✅ Molly's host record created successfully!", result);
  process.exit(0);
} catch (error) {
  console.error("❌ Error creating Molly's host record:", error);
  process.exit(1);
}
