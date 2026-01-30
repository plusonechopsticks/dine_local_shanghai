import { invokeLLM } from "./server/_core/llm.js";
import { db } from "./server/db.js";
import { hostListings } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

async function generateTitleForHost(host) {
  try {
    const activitiesText = host.activities && host.activities.length > 0 
      ? `\n- Activities: ${host.activities.join(", ")}`
      : "";
    
    const prompt = `Create a concise, compelling title for a home dining experience with these details:\n- Cuisine: ${host.cuisineStyle}\n- Menu: ${host.menuDescription.substring(0, 200)}${activitiesText}\n\nThe title should:\n1. Be maximum 3 lines (use line breaks if needed)\n2. Be engaging and descriptive\n3. Highlight the unique experience\n4. Be suitable for a travel/dining platform\n\nRespond with ONLY the title, no additional text.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a creative copywriter for a home dining experience platform. Create compelling, concise titles.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    const title = typeof content === 'string' ? content.trim() : `${host.cuisineStyle} Home Dining Experience`;
    return title;
  } catch (error) {
    console.error(`Error generating title for host ${host.id}:`, error);
    return `${host.cuisineStyle} Home Dining Experience`;
  }
}

async function migrateApprovedHosts() {
  try {
    // Get all approved hosts
    const approvedHosts = await db
      .select()
      .from(hostListings)
      .where(eq(hostListings.status, "approved"));

    console.log(`Found ${approvedHosts.length} approved hosts to update`);

    for (const host of approvedHosts) {
      console.log(`Generating title for host ${host.id}: ${host.hostName}`);
      const title = await generateTitleForHost(host);
      
      // Update the title in the database
      await db
        .update(hostListings)
        .set({ title })
        .where(eq(hostListings.id, host.id));
      
      console.log(`✓ Updated host ${host.id} with title: ${title.substring(0, 50)}...`);
    }

    console.log("✓ Migration complete!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateApprovedHosts();
