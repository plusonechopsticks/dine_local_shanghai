import fetch from 'node-fetch';

const testNewsletter = async () => {
  const response = await fetch('http://localhost:3000/api/trpc/newsletter.send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      founderNote: `Good morning. As I sit here in my Shanghai apartment, I'm reminded of a dinner I had in a small village in Peru five years ago. A local family invited me in, and over plates of homemade ceviche, we shared stories that transcended language barriers. That night changed how I see travel forever.

That's exactly what we're building with +1 Chopsticks. Not just meals, but moments of genuine human connection. When you sit at a local family's table in Shanghai, you're not a tourist—you're a guest, a friend, maybe even family for an evening.

This month, we're thrilled to feature Sookie, a music industry professional who sees deep connections between music, food, and art. Her fusion cuisine experiments are nothing short of magical.`,
      
      funFact: `Did you know that in traditional Chinese dining etiquette, the host will always serve guests first and take the last bite? This practice, called "让菜" (rang cai), reflects the deep-rooted value of hospitality in Chinese culture.

Another fascinating tradition: when someone pours tea for you, it's customary to tap your fingers on the table as a silent "thank you." This gesture originated from an emperor who disguised himself as a commoner—his servants couldn't kowtow without revealing his identity, so they used finger-tapping instead!`,
      
      featuredHostId: 240001, // Sookie's ID
      testEmail: 'shugenbaba@gmail.com'
    })
  });

  const data = await response.json();
  console.log('Newsletter sent:', data);
};

testNewsletter().catch(console.error);
