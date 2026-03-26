import { useEffect } from "react";
import { Link } from "wouter";

const VIDEO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663228681359/mkW6ExSEHJcqGWsa6M4fqn/home-dining-shanghai_8956151c.mp4";

export default function HomeDiningVideo() {
  useEffect(() => {
    document.title = "What Home Dining Looks Like in China | +1 Chopsticks";
  }, []);

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
        {/* Title block */}
        <div className="text-center mb-10 max-w-2xl">
          <p
            className="text-xs tracking-[0.25em] uppercase mb-4"
            style={{ color: "#b8962e" }}
          >
            A glimpse inside
          </p>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-light leading-tight mb-5"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            What Home Dining Looks Like in China
          </h1>
          <p
            className="text-base leading-relaxed"
            style={{ color: "rgba(245,240,232,0.55)" }}
          >
            Step through the door of a local Shanghai family home — where the
            kitchen fills with aroma, the table is set for strangers who leave
            as friends, and every dish carries a story.
          </p>
        </div>

        {/* Video — natural portrait dimensions, max height constrained */}
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
            style={{
              display: "block",
              maxHeight: "80vh",
              width: "auto",
              maxWidth: "90vw",
            }}
          />
        </div>

        {/* Footer note */}
        <p
          className="mt-8 text-xs text-center max-w-md leading-relaxed"
          style={{ color: "rgba(245,240,232,0.3)" }}
        >
          This is a private preview shared with a select group. The hosts
          featured are part of our inaugural cohort in Shanghai.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center">
          <Link href="/hosts">
            <button
              className="px-8 py-3 rounded-full text-sm tracking-[0.1em] uppercase font-medium transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #c9a227, #b8962e)",
                color: "#1a1208",
              }}
            >
              Browse Host Families
            </button>
          </Link>
          <Link href="/become-a-host">
            <button
              className="px-8 py-3 rounded-full text-sm tracking-[0.1em] uppercase font-medium transition-all"
              style={{
                border: "1px solid rgba(212,175,55,0.4)",
                color: "rgba(245,240,232,0.7)",
                background: "transparent",
              }}
            >
              Become a Host
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
