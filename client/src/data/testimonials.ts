export type TravelerSegment = 'solo' | 'family' | 'couples';

export const TESTIMONIALS = [
  // ── Solo & business travelers ──────────────────────────────────────────────
  {
    id: "momo",
    hostId: 180001,
    guestName: "Momo Vu",
    location: "Seattle, USA",
    travelerType: "Business traveler · Scientist",
    travelerSegment: "solo" as TravelerSegment,
    hostName: "Chuan",
    hostDate: "Apr 22, 2026",
    experienceTitle: "Business traveler dinner with Chuan",
    previewText:
      "This worked very well and created a great experience. Everything was great and there was nothing to improve.",
    fullText:
      "This worked very well and created a great experience. Everything was great and there was nothing to improve.",
    images: [
      {
        url: "/manus-storage/momo-chuan_c77145f4.jpg",
        alt: "Momo Vu dining with Chuan and family in Shanghai",
      },
    ],
    cta: "Read more",
  },
  {
    id: "dustin",
    hostId: 90002,
    guestName: "Dustin",
    location: "Canada",
    travelerType: "Solo traveler · Realtor",
    travelerSegment: "solo" as TravelerSegment,
    hostName: "Grace Tong",
    hostDate: "Apr 3, 2026",
    experienceTitle: "Solo traveler dinner with Grace",
    previewText:
      "Grace was nice. Very good English. Felt like I was visiting old friends from San Francisco. As a solo traveller was refreshing to have some companionship over dinner.",
    fullText:
      "Grace was nice. Very good English. Felt like I was visiting old friends from San Francisco. As a solo traveller was refreshing to have some companionship over dinner.",
    images: [
      {
        url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/dustin-grace_ef883a93.jpg",
        alt: "Dustin with Grace after dinner in Shanghai",
      },
    ],
    cta: "Read more",
  },
  {
    id: "claire",
    hostId: 90002,
    guestName: "Claire (@lost_with_claire)",
    location: "Australia",
    travelerType: "Solo traveler · Teacher & Influencer",
    travelerSegment: "solo" as TravelerSegment,
    hostName: "Grace Tong",
    hostDate: "Apr 4, 2026",
    experienceTitle: "Solo traveler lunch with Grace",
    previewText:
      "Grace was very friendly and welcoming and cooked delicious food that was very different to the Chinese food that I had previously tried in restaurants and from street food vendors.",
    fullText:
      "Grace was very friendly and welcoming and cooked delicious food that was very different to the Chinese food that I had previously tried in restaurants and from street food vendors.\n\nI get to learn more about Shanghai from someone who lives there. I can recommend this experience to anyone who visits China!",
    images: [
      {
        url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/claire-grace_f64a8c0b.jpg",
        alt: "Claire with Grace after their dining experience in Shanghai",
      },
    ],
    cta: "Read more",
  },
  {
    id: "en-kai",
    hostId: 180001,
    guestName: "En Kai",
    location: "Singapore",
    travelerType: "Solo Traveler",
    travelerSegment: "solo" as TravelerSegment,
    hostName: "Chuan",
    hostDate: "Mar 23, 2026",
    experienceTitle: "Solo traveler experience",
    previewText:
      "It was a very interesting experience and everything went well! I enjoyed the conversations and the cozy vibe. It felt like going to a friend's house and just hanging out. It also gave me a glimpse of how locals live their...",
    fullText:
      "It was a very interesting experience and everything went well! I enjoyed the conversations and the cozy vibe. It felt like going to a friend's house and just hanging out. It also gave me a glimpse of how locals live their everyday lives, which is what I enjoy most during all my travels. Good food with good vibes and definitely one of the highlights of my trip.",
    images: [
      {
        url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/lXOwzpqWCsNJoaDj.jpg",
        alt: "En Kai dining with hosts at a cozy home table",
      },
      {
        url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/ZgHAbyjOnYzloQpS.jpg",
        alt: "Chinese Chives with Snail Meat",
      },
      {
        url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/TSvtPPlhROZBUlSY.jpg",
        alt: "Guava with Sour Plum Powder",
      },
      {
        url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/zAbXIItuEEeJWGlS.jpg",
        alt: "Pickled Lettuce Stem",
      },
      {
        url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/qoVfyTKbuSeYHJdA.jpg",
        alt: "Radish Soup with Beef Brisket",
      },
      {
        url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/boCqExLvBPnMTSsz.jpg",
        alt: "Stir-fried Pork Belly",
      },
      {
        url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/hcWnlQfsyegdfqay.jpg",
        alt: "Black Bean Tomato Stir-fried Water Spinach",
      },
    ],
    cta: "Read more",
  },

  // ── Families ───────────────────────────────────────────────────────────────
  {
    id: "danny",
    hostId: 150001,
    guestName: "Danny",
    location: "Australia",
    travelerType: "Family with kid",
    travelerSegment: "family" as TravelerSegment,
    hostName: "Jiading Ayi (Auntie Shen)",
    hostDate: "Mar 22, 2026",
    experienceTitle: "Family dinner experience",
    previewText:
      "Thanks for having us, it was a terrific experience and we are glad we could be the first ones to try it out! The food was delicious and the hosts very welcoming.",
    fullText:
      "Thanks for having us, it was a terrific experience and we are glad we could be the first ones to try it out! The food was delicious and the hosts very welcoming. I think it's a great initiative and will be very popular once word gets out.",
    images: [
      {
        url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/mgLkOvTOKENajEas.webp",
        alt: "Danny and family with Jiading Ayi at the dinner table",
      },
      {
        url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/KBLkfrZkrxkPFTZx.webp",
        alt: "Garden Greens with Diced Tofu",
      },
      {
        url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/AmWMZjtycSBVQkBL.webp",
        alt: "Braised Spring Bamboo Shoots",
      },
      {
        url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/MJtjtqMGYgpuNWma.webp",
        alt: "Red Bean Glutinous Rice Balls Dessert",
      },
      {
        url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/jzsbijNBfRcvenMx.webp",
        alt: "Handmade Fish Ball Soup",
      },
      {
        url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/rIMWIDlRmXfMBTeK.webp",
        alt: "Auntie's Handmade Wontons",
      },
      {
        url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/pbzefHIjHUiDAgnv.webp",
        alt: "White-Cut Local Chicken",
      },
      {
        url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/WLDyEcCqBocsbybR.webp",
        alt: "Traditional Shanghainese Smoked Fish",
      },
      {
        url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/rOwHuVsyknmtTpRb.webp",
        alt: "Sweet and Sour Pork Ribs",
      },
    ],
    cta: "Read more",
  },
  {
    id: "sandrine",
    hostId: 210001,
    guestName: "Sandrine",
    location: "France",
    travelerType: "Family with teen · Air France Flight Attendant",
    travelerSegment: "family" as TravelerSegment,
    hostName: "Echo Ren",
    hostDate: "Apr 11, 2026",
    experienceTitle: "Mother & son wonton-making dinner with Echo",
    previewText:
      "What we didn't like: Leaving Echo and her family after the meal. Echo picked us up at the subway station, her whole family speaks English, and her husband taught my son how to make wontons. We all had a real, friendly meal together.",
    fullText:
      "What we liked:\n\n• The easiness of communication with Echo\n• She picked us up directly by foot at the subway station — we didn't have to worry about finding the place\n• The chatting was fluent and easy in English\n• Her family was perfect; they all speak English\n• The Chinese food was prepared with love (she told us the recipes of everything). She showed us pictures of the vegetables we didn't know\n• We prepared the wontons at the end. Her husband taught my son. It was nice to watch\n• We all had a real, friendly meal together\n• They were all very caring\n• The dog was nice\n\nWhat we didn't like:\n• Leaving Echo and her family after the meal\n\nIt is difficult to give points of improvement. I try to find some but I can't. Just giving a very big thumbs up, a big A+ and all my gratitude for this moment.",
    images: [
      {
        url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/a85279c7ef42090ceb02f3b5d2d2bdf0_2e6d9fbc.jpg",
        alt: "Sandrine's son learning to make wontons with Echo's husband",
      },
    ],
    cta: "Read more",
  },

  // ── Friends & couples ──────────────────────────────────────────────────────
  {
    id: "danil-katerina",
    hostId: 150001,
    guestName: "Danil & Katerina",
    location: "United Kingdom",
    travelerType: "Couple",
    travelerSegment: "couples" as TravelerSegment,
    hostName: "Jiading Ayi (Auntie Shen)",
    hostDate: "Mar 29, 2026",
    experienceTitle: "Couple's lunch with Jiading Ayi",
    previewText:
      "We already miss the amazing food from our Saturday lunch. It's been a highlight of our trip — a unique opportunity to experience life in China in a different way, meet new people, learn something new and of course have some good food.",
    fullText:
      "We already miss the amazing food from our Saturday lunch. In fact I've just discovered a new Shanghainese restaurant a 20 min walk from our home. It seems to have the iconic dishes like Si Xi Kao Fu and \"Grandma's braised pork\" in a black pot that looks like what Aunt Shen treated us to... We must explore this place urgently!\n\nIt's been a highlight of our trip and I've been telling my colleagues about this experience. It's a unique opportunity to experience life in China in a different way, meet new people, learn something new and of course have some good food. Definitely keen to do this again when we're back to China next! Appreciate your hosting the lunch too and telling us more about what led you to launch the project, the dishes served, and Chinese culture.",
    images: [
      {
        url: "/manus-storage/danil-katerina-jiading_cf28e401.jpg",
        alt: "Danil, Katerina and friends dining with Jiading Ayi and family",
      },
    ],
    cta: "Read more",
  },
  {
    id: "ethan-xu",
    hostId: 150001,
    guestName: "Ethan Xu",
    location: "Australia",
    travelerType: "Friends group",
    travelerSegment: "couples" as TravelerSegment,
    hostName: "Jiading Ayi (Auntie Shen)",
    hostDate: "Mar 29, 2026",
    experienceTitle: "Friends group dinner experience",
    previewText:
      "The experience was great, and exactly what we were expecting and looking for. The absolute standout was the food… flavours exactly as I remembered eating as a child in Shanghai.",
    fullText:
      "The experience was great, and exactly what we were expecting and looking for. The absolute standout was the food… flavours exactly as I remembered eating as a child in Shanghai.\n\nThe company and conversation was fantastic as well. It was good to talk about Shanghai as I remembered it, and as it is now. My friend got a lot out of it too; he really enjoyed the home-cooked meal after two weeks of eating street snacks and at restaurants.\n\nWe really appreciate the quick and clear communication, from you as well as Auntie Shen and her daughter. It made the process smooth and painless. Also appreciate getting picked up and dropped off at the metro station.",
    images: [
      {
        url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/ethan-xu-testimonial_05b95f78.jpeg",
        alt: "Ethan Xu and friend dining with Jiading Ayi and her daughter",
      },
    ],
    cta: "Read more",
  },
  {
    id: "josh-frey",
    hostId: 180001,
    guestName: "Josh & friend",
    location: "USA",
    travelerType: "Friends · First time in China",
    travelerSegment: "couples" as TravelerSegment,
    hostName: "Chuan",
    hostDate: "Apr 2026",
    experienceTitle: "Friends' first China experience with Chuan",
    previewText:
      "First time in China and this was one of the highlights of the trip. The food was incredible and the conversation made it feel like we were visiting old friends. Highly recommend to anyone visiting Shanghai.",
    fullText:
      "First time in China and this was one of the highlights of the trip. The food was incredible and the conversation made it feel like we were visiting old friends. Chuan and her family were so warm and welcoming — it was the kind of authentic experience you just can't get at a restaurant. Highly recommend to anyone visiting Shanghai.",
    images: [
      {
        url: "/manus-storage/josh-friend-chuan_65834247.jpg",
        alt: "Josh and friend with Chuan and family after their dinner in Shanghai",
      },
    ],
    cta: "Read more",
  },
  {
    id: "sophie-friend",
    hostId: 150001,
    guestName: "Sophie & friend",
    location: "France",
    travelerType: "Friends",
    travelerSegment: "couples" as TravelerSegment,
    hostName: "Jiading Ayi (Auntie Shen)",
    hostDate: "May 2026",
    experienceTitle: "Friends' lunch with Jiading Ayi",
    previewText:
      "The best restaurant in Shanghai that isn't a restaurant. This is real home cooking — where the wok has been seasoned by use for decades, homegrown ingredients come straight from the garden, and the interactions are genuine.",
    fullText:
      "The best restaurant in Shanghai that isn't a restaurant. This is real home cooking — where the wok has been seasoned by use for decades, homegrown ingredients come straight from the garden, and the interactions are genuine. An experience that lets you connect with local culture on a deeper, more meaningful level.",
    images: [
      {
        url: "/manus-storage/sophie-friend-jiading_d59a30d7.jpg",
        alt: "Sophie and friend with Jiading Ayi and family at their home in Shanghai",
      },
    ],
    cta: "Read more",
  },
];
