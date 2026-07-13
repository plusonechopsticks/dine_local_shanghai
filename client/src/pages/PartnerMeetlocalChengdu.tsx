import { useEffect } from "react";
import { Link } from "wouter";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const UTM = "?utm_source=plus1chopsticks&utm_medium=partner_page&utm_campaign=chengdu_partner";

const META_TITLE = "meetlocal@chengdu — Our Chengdu Partner for Free Walking Tours & Local Experiences | +1 Chopsticks";
const META_DESC = "Visiting Chengdu? We recommend meetlocal@chengdu — free walking tours, local experiences, and home dining run by locals who know the city. A trusted +1 Chopsticks partner.";
const CANONICAL = "https://plus1chopsticks.com/partners/meetlocal-chengdu";

const FAQ_ITEMS = [
  {
    q: "Is meetlocal@chengdu part of +1 Chopsticks?",
    a: "No. They're an independent Chengdu operator we recommend as a trusted partner. Their tours and experiences follow their own booking process.",
  },
  {
    q: "Do +1 Chopsticks guests get anything special?",
    a: "meetlocal@chengdu guests get 10% off +1 Chopsticks bookings with code meetlocal10. Ask meetlocal@chengdu about arrangements for guests coming from our side.",
  },
  {
    q: "Does +1 Chopsticks operate in Chengdu?",
    a: "Yes — our host Dragon offers mild Sichuan home dining in Wuhou District. For walking tours and other Chengdu experiences, we recommend meetlocal@chengdu.",
  },
];

export default function PartnerMeetlocalChengdu() {
  useEffect(() => {
    // Title
    document.title = META_TITLE;

    // Meta description
    let descTag = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!descTag) {
      descTag = document.createElement("meta");
      descTag.setAttribute("name", "description");
      document.head.appendChild(descTag);
    }
    descTag.setAttribute("content", META_DESC);

    // OG title
    let ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute("content", META_TITLE);

    // OG description
    let ogDesc = document.querySelector('meta[property="og:description"]') as HTMLMetaElement | null;
    if (!ogDesc) {
      ogDesc = document.createElement("meta");
      ogDesc.setAttribute("property", "og:description");
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute("content", META_DESC);

    // OG URL
    let ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement | null;
    if (!ogUrl) {
      ogUrl = document.createElement("meta");
      ogUrl.setAttribute("property", "og:url");
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute("content", CANONICAL);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", CANONICAL);

    return () => {
      document.title = "+1 Chopsticks | Authentic Home Dining Experiences in Shanghai";
      document.querySelector('meta[name="description"]')?.setAttribute(
        "content",
        "Dine with local families in Shanghai. Authentic home-cooked meals, real cultural exchange, and unforgettable experiences with +1 Chopsticks."
      );
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Back nav */}
      <div className="max-w-3xl mx-auto px-6 pt-8">
        <Link href="/">
          <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition mb-8">
            <ChevronLeft className="w-4 h-4" />
            Back to home
          </button>
        </Link>
      </div>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 pb-12">
        {/* Eyebrow */}
        <p className="text-sm font-semibold uppercase tracking-widest text-[#C9A84C] mb-3">
          Chengdu Partner · meetlocal@chengdu
        </p>

        {/* H1 */}
        <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
          Exploring Chengdu? Meet the locals we'd send a friend to.
        </h1>

        {/* Intro */}
        <p className="text-lg text-gray-600 leading-relaxed mb-4">
          +1 Chopsticks started in Shanghai with one belief: a meal in someone's home shows you a city more honestly than any restaurant list. In Chengdu, meetlocal@chengdu was built on the same idea — locals sharing their city through free walking tours, food experiences, and home dining.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed mb-10">
          If your China trip includes Sichuan, they're who we recommend.
        </p>

        <hr className="border-gray-200 mb-10" />

        {/* About section */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">About meetlocal@chengdu</h2>
        <p className="text-gray-600 leading-relaxed mb-10">
          meetlocal@chengdu runs free walking tours in Chengdu, alongside local experiences and a Chengdu home dining program. Their tours are led by locals who walk the city the way residents do — teahouses, old lanes, food streets — not a scripted highlight reel. Their motto matches ours in spirit: real people, real homes, real conversation.
        </p>

        {/* What they offer */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">What they offer</h2>
        <ul className="space-y-3 mb-10">
          <li className="flex items-start gap-3 text-gray-600">
            <span className="text-[#C9A84C] font-bold mt-0.5">→</span>
            <span><strong>Free walking tours</strong> — the classic way to get your bearings in Chengdu on day one</span>
          </li>
          <li className="flex items-start gap-3 text-gray-600">
            <span className="text-[#C9A84C] font-bold mt-0.5">→</span>
            <span><strong>Chengdu home dining</strong> — a Sichuan family table, the Chengdu counterpart to what we do in Shanghai</span>
          </li>
          <li className="flex items-start gap-3 text-gray-600">
            <span className="text-[#C9A84C] font-bold mt-0.5">→</span>
            <span><strong>Local experiences & city guide</strong> — teahouses, food guides, and practical Chengdu tips</span>
          </li>
        </ul>

        {/* Two cities */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Two cities, one idea</h2>
        <p className="text-gray-600 leading-relaxed mb-10">
          If your trip covers both cities, make home dining part of the journey in each: one table in Shanghai with +1 Chopsticks, another in Chengdu with meetlocal@chengdu. And if you're dining with our Chengdu host Dragon, their walking tour is the perfect way to spend the afternoon before dinner.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <a
            href={`https://meetlocalchengdu.com/${UTM}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-700 transition"
          >
            Visit meetlocal@chengdu <ExternalLink className="w-4 h-4" />
          </a>
          <a
            href={`https://meetlocalchengdu.com/experience-home-dining${UTM}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-full font-semibold hover:border-gray-500 transition"
          >
            Their Chengdu Home Dining <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <hr className="border-gray-200 mb-10" />

        {/* FAQ */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently asked questions</h2>
        <div className="space-y-6 mb-12">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="border-b border-gray-100 pb-6">
              <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
              <p className="text-gray-600 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>

        {/* Footer CTA back to +1 Chopsticks */}
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <p className="text-gray-600 mb-4">Ready to book a home dining experience in Shanghai?</p>
          <Link href="/hosts">
            <Button className="bg-[#8B1A1A] hover:bg-[#6d1515] text-white rounded-full px-8">
              Browse Shanghai Hosts
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
