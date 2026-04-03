import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

const VIDEO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/home-dining-shanghai_8956151c.mp4";

export default function InfluencerPage() {
  const [location] = useLocation();
  const slug = location.split("/for/")[1]?.split("/")[0] || "";

  const { data: page, isLoading } = trpc.influencer.getBySlug.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug }
  );

  const recordView = trpc.influencer.recordView.useMutation();

  // Record view once on mount
  useEffect(() => {
    if (slug) {
      recordView.mutate({ slug });
    }
  }, [slug]);

  useEffect(() => {
    if (page) {
      document.title = `For ${page.name} — +1 Chopsticks`;
    }
  }, [page]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0d0d0d" }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "rgba(212,175,55,0.6)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (!page) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center text-center px-4"
        style={{ background: "#0d0d0d", color: "#f5f0e8" }}
      >
        <p
          className="text-xs tracking-[0.25em] uppercase mb-4"
          style={{ color: "#b8962e" }}
        >
          +1 Chopsticks
        </p>
        <h1 className="text-2xl font-light mb-4">Page not found</h1>
        <Link href="/">
          <span className="text-sm underline" style={{ color: "rgba(212,175,55,0.8)" }}>
            Back to homepage
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0d0d0d", color: "#f5f0e8" }}
    >
      {/* Minimal header */}
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/">
          <span
            className="text-sm tracking-[0.15em] uppercase font-medium cursor-pointer"
            style={{ color: "rgba(245,240,232,0.5)" }}
          >
            +1 Chopsticks
          </span>
        </Link>
        <Link href="/hosts">
          <span
            className="text-sm tracking-[0.1em] uppercase cursor-pointer transition-colors"
            style={{ color: "rgba(212,175,55,0.8)" }}
          >
            Meet the Hosts →
          </span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-16">

        {/* Personalized headline block */}
        <div className="text-center mb-10 max-w-2xl">
          <p
            className="text-xs tracking-[0.25em] uppercase mb-5"
            style={{ color: "#b8962e" }}
          >
            A personal note from Steven
          </p>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-light leading-tight mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Hi {page.name} — this one's for you
          </h1>
          <p
            className="text-base sm:text-lg leading-relaxed"
            style={{ color: "rgba(245,240,232,0.75)" }}
          >
            {page.personalMessage}
          </p>
        </div>

        {/* Video */}
        <div
          style={{
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 0 0 1px rgba(212,175,55,0.15), 0 32px 80px rgba(0,0,0,0.7)",
            maxHeight: "80vh",
            display: "flex",
          }}
        >
          <video
            src={VIDEO_URL}
            autoPlay
            playsInline
            controls
            preload="auto"
            muted={false}
            style={{
              display: "block",
              maxHeight: "80vh",
              width: "auto",
              maxWidth: "90vw",
            }}
          />
        </div>

        {/* The ask */}
        <div
          className="mt-10 text-center max-w-lg px-6 py-6 rounded-2xl"
          style={{
            background: "rgba(212,175,55,0.07)",
            border: "1px solid rgba(212,175,55,0.2)",
          }}
        >
          <p
            className="text-lg sm:text-xl font-light leading-relaxed mb-5"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            We'd love to host you for a free dinner on your next China visit.
          </p>
          <a
            href="mailto:plusonechopsticks@gmail.com?subject=Free%20Dinner%20for%20Influencer&body=Hi%20Steven%2C%20I%27d%20love%20to%20take%20you%20up%20on%20the%20free%20dinner%20offer!"
            className="inline-block px-8 py-3 rounded-full text-sm tracking-[0.1em] uppercase font-medium transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #c9a227, #b8962e)",
              color: "#1a1208",
            }}
          >
            Claim Your Free Dinner
          </a>
        </div>

        {/* Secondary CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
          <Link href="/hosts">
            <button
              className="px-8 py-3 rounded-full text-sm tracking-[0.1em] uppercase font-medium transition-all"
              style={{
                border: "1px solid rgba(212,175,55,0.4)",
                color: "rgba(245,240,232,0.7)",
                background: "transparent",
              }}
            >
              Browse Host Families
            </button>
          </Link>
          <Link href="/become-a-host">
            <button
              className="px-8 py-3 rounded-full text-sm tracking-[0.1em] uppercase font-medium transition-all"
              style={{
                border: "1px solid rgba(245,240,232,0.15)",
                color: "rgba(245,240,232,0.45)",
                background: "transparent",
              }}
            >
              Become a Host
            </button>
          </Link>
        </div>

        {/* Footer note */}
        <p
          className="mt-10 text-xs text-center max-w-md leading-relaxed"
          style={{ color: "rgba(245,240,232,0.25)" }}
        >
          This is a private invitation shared with a select group of creators.
          The hosts featured are part of our inaugural cohort in China.
        </p>
      </main>
    </div>
  );
}
