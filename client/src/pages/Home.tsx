import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HomeHeader } from "@/components/HomeHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// Image URLs from S3
const IMAGES = {
  section2: "https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/Addinganextrapairofchopsticks_63173a16.png",
  aboutMain: "https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/IMG_9702_a9faab46.jpeg",
  aboutGallery1: "https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/IMG_0940_14842580.jpeg",
  aboutGallery2: "https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/IMG_6358_c2704988.jpeg",
  aboutGallery3: "https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/9959a377-4e47-41db-9dab-b5d30f0135aa(6)_f1453687.jpeg",
};

const FEATURED_HOST_NAMES = ["Jiading Ayi", "Chuan", "Norika", "Steven"];

export default function Home() {
  const [, setLocation] = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeHostCard, setActiveHostCard] = useState(0);
  const [hoveredGalleryImage, setHoveredGalleryImage] = useState<number | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);

  // Newsletter submission mutation
  const submitInterestMutation = trpc.interest.submit.useMutation();

  // Fetch all approved hosts
  const { data: allHosts = [] } = trpc.host.listApproved.useQuery();

  // Filter featured hosts
  const featuredHosts = allHosts.filter((host) =>
    FEATURED_HOST_NAMES.some((name) => host.hostName?.includes(name))
  ).slice(0, 3); // Limit to 3 hosts

  const heroSlides = [
    {
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/311292277a75050e5280deb62d18ad37_1741789a.png",
      alt: "Host and guest toasting with authentic home-cooked meal",
    },
    {
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/cdd3f0ddce48007e5e6fb050f470cbf3_cd7ab9b4.jpeg",
      alt: "Guests enjoying a home-cooked meal together",
    },
    {
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/IMG_9266_47731ff3.jpeg",
      alt: "Friends sharing dumplings and authentic home cooking",
    },
    {
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/IMG_0940(1)_1cd227a6.jpeg",
      alt: "Guests toasting and celebrating at a local home dinner",
    },
  ];

  const galleryImages = [
    {
      image: IMAGES.aboutGallery1,
      caption: "Home dining at Peer's place in Copenhagen",
    },
    {
      image: IMAGES.aboutGallery2,
      caption: "Home dining at Ahmed's place in Fez",
    },
    {
      image: IMAGES.aboutGallery3,
      caption: "Steven teaching a new friend how to play '15-20', a famous Chinese drinking game",
    },
  ];

  const faqItems = [
    {
      category: "Booking & Logistics",
      items: [
        {
          question: "How do I book?",
          answer: "Browse our hosts, select one that appeals to you, and submit a booking request. The host will review your request and confirm availability.",
        },
        {
          question: "How long does the experience last?",
          answer: "Most experiences last around 2-3 hours, including the meal and conversation with your host.",
        },
        {
          question: "What does it cost for a guest?",
          answer: "Prices vary by host, typically ranging from 200-500 RMB per person. You'll see the exact price when viewing each host's profile.",
        },
        {
          question: "What if my schedule changes at the last minute?",
          answer: "You can cancel your booking up to 7 days before the scheduled meal for a full refund. This gives hosts enough time to prepare!",
        },
      ],
    },
    {
      category: "Concerns & Safety",
      items: [
        {
          question: "Do I have to speak Chinese?",
          answer: "No! Many of our hosts speak English and other languages. You can filter hosts by language when browsing.",
        },
        {
          question: "Is the food safe and high quality?",
          answer: "All our hosts are verified for food safety, hygiene, and quality. We take your health and experience seriously.",
        },
        {
          question: "Who are the hosts? Can they cater my dietary needs?",
          answer: "Our hosts are local families, couples, and professionals passionate about cooking. Most can accommodate dietary restrictions—just mention them when booking.",
        },
      ],
    },
    {
      category: "For Hosts & Partners",
      items: [
        {
          question: "I'd love to host. What should I do?",
          answer: "Click 'Become a Host' to start the application process. We'll guide you through verification and setup.",
        },
        {
          question: "I'm a Travel Agent. Can we work together?",
          answer: "Yes! We offer special rates for travel agencies and tour operators. Email us at plusonechopsticks@gmail.com to discuss partnership opportunities.",
        },
      ],
    },
  ];

  // Auto-rotate hero carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate host card images
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHostCard((prev) => (prev + 1) % 2);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const truncateSummary = (text: string | null, maxLength: number = 150) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header & Navigation */}
      <HomeHeader />

      {/* Section 1: Hero Carousel */}
      <section id="hero" className="relative h-[500px] overflow-hidden bg-gray-900">
        {/* Carousel */}
        <div className="relative h-full">
          {heroSlides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                idx === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {/* Dark gradient scrim overlay */}
          <div className="absolute inset-0 hero-scrim" />
        </div>

        {/* Overlay Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight md:leading-relaxed tracking-tight">
            The best restaurant in Shanghai isn't a restaurant.
          </h1>
          <h2 className="text-2xl md:text-3xl font-medium mb-10 leading-relaxed">
            Experience authentic, home-cooked meals hosted by locals.
          </h2>
          <Button
            className="btn-cta text-white px-10 py-4 text-lg font-semibold rounded-lg hover:shadow-lg bg-red-600 hover:bg-red-700"
            onClick={() => setLocation("/hosts")}
          >
            Explore Local Hosts
          </Button>
        </div>

        {/* Carousel Controls - Hidden, using auto-play instead */}

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition ${
                idx === currentSlide ? "bg-white w-8" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Section 2: Brand Identity & Story */}
      <section id="brand-story" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Left: Text */}
            <div className="space-y-8">
              {/* First Headline and Paragraph */}
              <div className="border-l-4 border-red-600 pl-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Ni Hao! We are +1 chopsticks
                </h2>
                <p className="text-base text-gray-700 leading-relaxed mb-3">
                  In Chinese culture, when we invite friends over for dinner, we say "加一双筷子"—it's simply adding a pair of chopsticks.
                </p>
                <p className="text-base text-gray-700 leading-relaxed">
                  That's our mission: providing curated, affordable home dining for travelers who want more than a tourist menu.
                </p>
              </div>

              {/* Second Headline and Paragraph */}
              <div className="border-l-4 border-red-600 pl-6">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Wait, home dining in China? I never heard of that
                </h3>
                <p className="text-base text-gray-700 leading-relaxed mb-3">
                  Yup. Because it didn't exist until we made it happen.
                </p>
                <p className="text-base text-gray-600 leading-relaxed">
                  Dine at locals' homes. Share homemade dishes, stories, and neighborhoods you won't find on any tour.
                </p>
              </div>

              {/* Third Headline and Paragraph */}
              <div className="border-l-4 border-red-600 pl-6">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Sounds fun! Who are the hosts? Can they cater my dietary needs?
                </h3>
                <p className="text-base text-gray-700 leading-relaxed mb-3">
                  Our diverse community of hosts includes families, couples, and young professionals who share passion of cooking and meeting new people. Whether you're a solo traveler, a couple, or a family, we'll match you with the perfect host.
                </p>
                <p className="text-base text-gray-700 leading-relaxed mb-3">
                  No matter whose table you join, one thing is guaranteed: we will carefully accommodate all your dietary needs and restrictions to ensure a perfect meal.
                </p>
                <p className="text-base text-gray-700 leading-relaxed">
                  All hosts are verified by the platform on the readiness to host, including language capability, food style and hygiene, and home environment.
                </p>
              </div>

              {/* Find your Table Button */}
              <div className="pt-4">
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 font-semibold text-lg"
                  onClick={() => {
                    setLocation("/hosts");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Find your Table
                </Button>
              </div>
            </div>

            {/* Right: Feature Cards */}
            <div className="space-y-6">
              {/* Card 1 */}
              <div className="bg-blue-50 rounded-lg p-6 flex gap-4">
                <div className="text-4xl flex-shrink-0">🍲</div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Home-cooked menus</h4>
                  <p className="text-gray-600 text-sm">Regional dishes, seasonal ingredients, family recipes.</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-orange-50 rounded-lg p-6 flex gap-4">
                <div className="text-4xl flex-shrink-0">🏠</div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Hosted by local families</h4>
                  <p className="text-gray-600 text-sm">Meet your hosts, see their neighborhoods, eat like a local.</p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-purple-50 rounded-lg p-6 flex gap-4">
                <div className="text-4xl flex-shrink-0">💬</div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Small groups, real conversations</h4>
                  <p className="text-gray-600 text-sm">1–6 guests per table. Come as a traveler, leave as a friend.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Featured Hosts Gallery */}
      <section id="featured-hosts" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Meet your new friends in Shanghai - Authentic Home Dining Experiences
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredHosts.map((host) => (
              <div
                key={host.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group"
              >
                {/* Image */}
                <div className="relative h-64 bg-gray-200 overflow-hidden cursor-pointer" onClick={() => setLocation(`/hosts/${host.id}`)}>
                  <img
                    src={host.profilePhotoUrl || ""}
                    alt={host.hostName}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-md">
                    ✓ Verified
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-200 line-clamp-2">
                    {host.hostName}
                  </h3>
                  <p className="text-gray-600 mb-4">{host.cuisineStyle || "🍽️ Local Cuisine"}</p>
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                    {truncateSummary(host.bio, 120)}
                  </p>
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white transition-all duration-200 hover:shadow-lg"
                    onClick={() => setLocation(`/hosts/${host.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50 px-8 py-3 text-lg"
              onClick={() => {
                setLocation("/hosts");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Browse All Hosts
            </Button>
          </div>
        </div>
      </section>

      {/* Section 4: How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 id="how-it-works" className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                emoji: "👀",
                title: "Browse",
                description: "Explore our curated selection of local hosts and their unique dining experiences.",
              },
              {
                step: 2,
                emoji: "📅",
                title: "Book",
                description: "Select your preferred date and time. The host will confirm your booking.",
              },
              {
                step: 3,
                emoji: "🧑‍🍳",
                title: "Prepare",
                description: "Confirm any dietary needs and get ready for an authentic culinary experience.",
              },
              {
                step: 4,
                emoji: "🍽️",
                title: "Eat",
                description: "Enjoy delicious home-cooked food and meaningful conversations with your host.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {item.step}
                  </div>
                </div>
                <div className="text-4xl mb-3">{item.emoji}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-700">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: About Us - Founder's Story */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 id="about-us" className="text-4xl font-bold text-center text-gray-900 mb-16">About Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Left: Images */}
            <div className="space-y-4">
              {/* Large main image */}
              <div className="relative overflow-hidden rounded-lg shadow-lg group cursor-pointer">
                <img
                  src={IMAGES.aboutMain}
                  alt="Steven completing 7th continent"
                  className="w-full h-96 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                  <p className="text-white text-center px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-italic">
                    Steven completing the 7th continent with the lovely penguin
                  </p>
                </div>
              </div>

              {/* 3-column grid on desktop */}
              <div className="hidden md:grid grid-cols-3 gap-4">
                {galleryImages.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative overflow-hidden rounded-lg shadow-md group cursor-pointer h-48"
                    onMouseEnter={() => setHoveredGalleryImage(idx)}
                    onMouseLeave={() => setHoveredGalleryImage(null)}
                  >
                    <img
                      src={item.image}
                      alt={item.caption}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                      <p className="text-white text-center px-3 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-italic">
                        {item.caption}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Horizontal scrolling carousel on mobile */}
              <div className="md:hidden flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
                {galleryImages.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative overflow-hidden rounded-lg shadow-lg flex-shrink-0 w-48 h-56 snap-center group"
                  >
                    <img
                      src={item.image}
                      alt={item.caption}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                      <p className="text-white text-center px-3 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-italic">
                        {item.caption}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Text */}
            <div className="space-y-8">
              {/* First Block */}
              <div className="border-l-4 border-red-600 pl-6">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Hi, I'm Steven</h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  I'm the founder and CEO of +1 Chopsticks. Born and raised in Hong Kong, I have studied in the US, married my beautiful wife from Tianjin, and lived and worked in China for more than 15 years. As an expert in cultural travel experiences and authentic dining, I'm passionate about creating genuine connections between travelers and local communities through home-cooked meals.
                </p>
              </div>

              {/* Second Block */}
              <div className="border-l-4 border-red-600 pl-6">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">My Travels & Passion</h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  I'm an avid traveler who's been to <strong>60+ countries and all seven continents</strong>. I enjoyed making new friends everywhere, and have shared numerous stories at my friends' homes from Copenhagen, Denmark to Fes, Morocco; from Nairobi, Kenya to San Paolo in Brazil. These became my favourite travel memories! This global experience directly informs how we design authentic home dining experiences.
                </p>
              </div>

              {/* Third Block */}
              <div className="border-l-4 border-red-600 pl-6">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Bridging Cultures</h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  I'm the author of the "China vs the West" series as I'm deeply passionate about bridging the gap, debunking the myths, and showing the authentic China to everyone. In the era of AI, I believe real connection is the new luxury. Meeting a new friend at home is going to foster better connections than at a restaurant!
                </p>
              </div>

              {/* Fourth Block */}
              <div className="border-l-4 border-red-600 pl-6">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Professional Background</h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  I'm a proud <strong>MBA graduate from Kellogg School of Management, Northwestern University</strong>. I'm a seasoned management consultant and a serial entrepreneur in the hospitality and education sectors. My professional expertise in business strategy, hospitality operations, and community building ensures that +1 Chopsticks operates with the highest standards of quality and safety. My track record of success in multiple ventures demonstrates my ability to create meaningful, sustainable businesses that prioritize both guest and host experiences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: FAQ Accordions */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-gradient-to-b from-gray-50 to-white rounded-lg shadow-lg p-8">
            <h2 id="faq" className="text-3xl font-bold text-center text-gray-900 mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-center text-gray-600 mb-8">
              Everything you need to know about dining with us
            </p>

            <div className="space-y-6">
              {faqItems.map((category, categoryIdx) => (
                <div key={categoryIdx}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {category.category}
                  </h3>
                  <Accordion type="single" collapsible className="space-y-2">
                    {category.items.map((item, itemIdx) => (
                      <AccordionItem
                        key={`${categoryIdx}-${itemIdx}`}
                        value={`${categoryIdx}-${itemIdx}`}
                      >
                        <AccordionTrigger className="text-gray-900 hover:text-red-600 transition">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200 text-center">
              <p className="text-gray-700 mb-3">Still have questions?</p>
              <a
                href="mailto:plusonechopsticks@gmail.com"
                className="text-red-600 hover:text-red-700 font-semibold transition"
              >
                Contact us at plusonechopsticks@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Become a Host */}
      <section id="become-host" className="py-16 bg-gradient-to-r from-red-600 to-red-700">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="text-white">
              <h2 className="text-4xl font-bold mb-6">
                Love cooking and meeting new people?
              </h2>
              <p className="text-xl mb-8 leading-relaxed">
                Join our community of hosts and share your culinary passion with travelers from around the world. It's easy, rewarding, and fun.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 group">
                  <span className="text-3xl">💰</span>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Earn income doing what you love</h3>
                    <p className="text-red-100">Set your own prices and keep 80% of earnings</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 group">
                  <span className="text-3xl">🌍</span>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Meet travelers from around the world</h3>
                    <p className="text-red-100">Build meaningful connections and share your culture</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 group">
                  <span className="text-3xl">🏠</span>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Flexible hosting schedule</h3>
                    <p className="text-red-100">Host when it works for you, no minimum commitments</p>
                  </div>
                </div>
              </div>

              <Button
                className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
                onClick={() => setLocation("/host-register")}
              >
                Become a Host
              </Button>
            </div>

            {/* Right: Image */}
            <div className="relative order-1 md:order-2">
              <div className="rounded-lg overflow-hidden shadow-2xl group cursor-pointer">
                <img
                  src="https://res.cloudinary.com/drxfcfayd/image/upload/v1771181302/plus1chopsticks/hosts/sookie/sookie_profile.jpg"
                  alt="Sookie hosting"
                  className="w-full h-96 object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: Newsletter */}
      <section className="py-16 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Coming to China this year?
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              Get updates on new hosts. No spam, just delicious updates.
            </p>

            <div className="flex gap-3">
              <input
                type="email"
                placeholder="your@email.com"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-red-600"
              />
              <Button
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 font-semibold disabled:opacity-50"
                disabled={isSubmittingNewsletter || !newsletterEmail}
                onClick={async () => {
                  if (!newsletterEmail) {
                    toast.error("Please enter your email");
                    return;
                  }
                  setIsSubmittingNewsletter(true);
                  try {
                    await submitInterestMutation.mutateAsync({
                      name: "Newsletter Subscriber",
                      email: newsletterEmail,
                      interestType: "traveler",
                      message: "Subscribed to newsletter",
                    });
                    toast.success("Thanks for subscribing!");
                    setNewsletterEmail("");
                  } catch (error) {
                    toast.error("Failed to subscribe. Please try again.");
                  } finally {
                    setIsSubmittingNewsletter(false);
                  }
                }}
              >
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Column 1: Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🥢</span>
                <span className="text-lg font-bold text-white">+1 Chopsticks</span>
              </div>
              <p className="text-sm">
                Connecting travelers with authentic home dining experiences in Shanghai and beyond.
              </p>
            </div>

            {/* Column 2: For Travelers */}
            <div>
              <h4 className="text-white font-semibold mb-4">For Travelers</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => setLocation("/hosts")}
                    className="hover:text-white transition"
                  >
                    Browse Hosts
                  </button>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-white transition">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: For Hosts */}
            <div>
              <h4 className="text-white font-semibold mb-4">For Hosts</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => setLocation("/host-register")}
                    className="hover:text-white transition"
                  >
                    Become a Host
                  </button>
                </li>

              </ul>
            </div>

            {/* Column 4: Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="mailto:plusonechopsticks@gmail.com" className="hover:text-white transition">
                    plusonechopsticks@gmail.com
                  </a>
                </li>

              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 +1 Chopsticks. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
