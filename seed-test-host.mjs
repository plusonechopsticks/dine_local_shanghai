import { drizzle } from "drizzle-orm/mysql2";
import { hostListings } from "./drizzle/schema.ts";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

const testHost = {
  hostName: "Li Wei",
  profilePhotoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
  languages: ["Mandarin", "English", "Shanghainese"],
  bio: "I'm a Shanghai native who loves sharing authentic local cuisine with travelers from around the world. My family has been cooking traditional Shanghainese dishes for generations, and I'm excited to welcome you to our home!",
  email: "liwei@example.com",
  wechatOrPhone: "liwei_shanghai",
  district: "Xuhui",
  availability: {
    friday: ["dinner"],
    saturday: ["lunch", "dinner"],
    sunday: ["lunch", "dinner"]
  },
  maxGuests: 4,
  cuisineStyle: "Shanghainese (本帮菜)",
  menuDescription: "Traditional Shanghainese home cooking featuring xiaolongbao (soup dumplings), hongshaorou (red-braised pork), and seasonal vegetables. All ingredients are fresh from local markets, prepared with family recipes passed down through generations.",
  foodPhotoUrls: [
    "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop"
  ],
  dietaryAccommodations: ["Vegetarian", "Halal"],
  mealDurationMinutes: 120,
  pricePerPerson: 150,
  kidsFriendly: true,
  hasPets: false,
  petDetails: null,
  status: "approved"
};

try {
  await db.insert(hostListings).values(testHost);
  console.log("✅ Test host created successfully!");
  process.exit(0);
} catch (error) {
  console.error("❌ Error creating test host:", error);
  process.exit(1);
}
