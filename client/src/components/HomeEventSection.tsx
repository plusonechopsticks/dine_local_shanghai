import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { MapPin, CalendarDays } from "lucide-react";

// Parse YYYY-MM-DD as local date (not UTC) to avoid off-by-one day
function parseDateLocal(dateStr: string | Date): Date {
  if (dateStr instanceof Date) return dateStr;
  const [year, month, day] = String(dateStr).split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Illustrated green header SVG — rain drops + 谷雨 characters
function GrainRainIllustration({ theme }: { theme?: string | null }) {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: 180, background: "linear-gradient(160deg, #1a3a1a 0%, #1e4a1e 40%, #163316 100%)" }}
    >
      {/* Large faded Chinese characters */}
      <div
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
        style={{ fontSize: 96, fontWeight: 900, color: "rgba(255,255,255,0.07)", letterSpacing: "0.05em", lineHeight: 1 }}
      >
        {theme || "谷雨"}
      </div>

      {/* Rain drops — SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 400 180"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Stylized rain streaks */}
        {[30, 70, 110, 150, 190, 230, 270, 310, 350].map((x, i) => (
          <line
            key={i}
            x1={x}
            y1={-10 + (i % 3) * 20}
            x2={x - 8}
            y2={60 + (i % 3) * 20}
            stroke="rgba(120,200,120,0.18)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ))}
        {[50, 90, 130, 170, 210, 250, 290, 330, 370].map((x, i) => (
          <line
            key={`b${i}`}
            x1={x}
            y1={40 + (i % 3) * 15}
            x2={x - 8}
            y2={110 + (i % 3) * 15}
            stroke="rgba(120,200,120,0.12)"
            strokeWidth="1"
            strokeLinecap="round"
          />
        ))}

        {/* Leaf / raindrop shapes */}
        <ellipse cx="80" cy="120" rx="28" ry="14" fill="rgba(60,140,60,0.35)" transform="rotate(-20 80 120)" />
        <ellipse cx="200" cy="90" rx="36" ry="16" fill="rgba(60,140,60,0.28)" transform="rotate(10 200 90)" />
        <ellipse cx="320" cy="130" rx="24" ry="12" fill="rgba(60,140,60,0.32)" transform="rotate(-15 320 130)" />
        <ellipse cx="140" cy="60" rx="20" ry="10" fill="rgba(60,140,60,0.22)" transform="rotate(5 140 60)" />
        <ellipse cx="280" cy="55" rx="18" ry="9" fill="rgba(60,140,60,0.20)" transform="rotate(-8 280 55)" />

        {/* Grass/sprout silhouettes at bottom */}
        <path d="M0 160 Q20 120 40 160" stroke="rgba(80,160,80,0.4)" strokeWidth="2" fill="none" />
        <path d="M30 170 Q50 130 70 170" stroke="rgba(80,160,80,0.35)" strokeWidth="2" fill="none" />
        <path d="M340 165 Q360 125 380 165" stroke="rgba(80,160,80,0.4)" strokeWidth="2" fill="none" />
        <path d="M360 175 Q380 140 400 175" stroke="rgba(80,160,80,0.3)" strokeWidth="2" fill="none" />
      </svg>
    </div>
  );
}

export function HomeEventSection() {
  const [, setLocation] = useLocation();
  const { data: events = [], isLoading } = trpc.event.list.useQuery({ featuredOnly: true });

  if (isLoading || events.length === 0) return null;

  return (
    /* Color-block section — deep forest green background */
    <section style={{ background: "#0f2010" }} className="py-16 md:py-20">
      <div className="container mx-auto px-4">

        {/* Section Header */}
        <div className="mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Seasonal Events
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)" }} className="text-base max-w-xl">
            Limited-seat group meals celebrating China's solar terms. Join a small table of fellow food lovers for a one-of-a-kind experience.
          </p>
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
          {events.map((event) => {
            const seatsTaken = event.totalSeats - event.seatsRemaining;
            const seatPercentage = (seatsTaken / event.totalSeats) * 100;
            const isSoldOut = event.seatsRemaining <= 0;
            const isAlmostFull = !isSoldOut && event.seatsRemaining <= 2;
            const eventDate = parseDateLocal(event.eventDate as string);

            // Date badge: day number + month abbreviation
            const dayNum = eventDate.getDate();
            const monthAbbr = eventDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase();

            // Full date + meal type line
            const fullDateStr = eventDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            });

            return (
              <div
                key={event.id}
                className="rounded-2xl overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.015] hover:shadow-2xl"
                style={{ background: "#1a2a1a", border: "1px solid rgba(80,160,80,0.2)" }}
                onClick={() => setLocation(`/events/${event.id}`)}
              >
                {/* ── Illustrated Header ── */}
                <div className="relative">
                  {event.featuredImageUrl ? (
                    <div className="h-44 overflow-hidden">
                      <img
                        src={event.featuredImageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <GrainRainIllustration theme={event.theme} />
                  )}

                  {/* Location pill — top left */}
                  <div
                    className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)" }}
                  >
                    <MapPin className="w-3 h-3" style={{ color: "#86efac" }} />
                    <span>Shanghai · {event.hostDistrict || "Jiading"}</span>
                  </div>

                  {/* Date badge — top right */}
                  <div
                    className="absolute top-3 right-3 flex flex-col items-center justify-center rounded-xl text-center"
                    style={{ background: "#fff", width: 52, height: 52, boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
                  >
                    <span className="text-xl font-black leading-none" style={{ color: "#111" }}>{dayNum}</span>
                    <span className="text-xs font-bold tracking-widest" style={{ color: "#1a7a1a" }}>{monthAbbr}</span>
                  </div>
                </div>

                {/* ── Card Body ── */}
                <div className="px-5 pt-4 pb-5">
                  {/* Title row + discount badge */}
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <p className="text-xs font-medium mb-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                        Solar term · {event.theme ? event.theme.split("|")[0].trim() : "Seasonal Dining"}
                      </p>
                      {/* Seasonal term name — large */}
                      <h3 className="text-base font-semibold text-white leading-snug">
                        {/* Extract the Chinese + English name part before the colon */}
                        {event.title.split(":")[0].trim()}
                      </h3>
                    </div>
                    {event.discountLabel && (
                      <span
                        className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: "#dc2626", color: "#fff" }}
                      >
                        {event.discountLabel}
                      </span>
                    )}
                  </div>

                  {/* Full title (subtitle after colon) */}
                  <h4 className="text-lg font-bold text-white mb-3 leading-snug">
                    {event.title}
                  </h4>

                  {/* Date & host */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                      <CalendarDays className="w-4 h-4 shrink-0" style={{ color: "rgba(255,255,255,0.4)" }} />
                      <span>{fullDateStr} · {event.mealType === "lunch" ? "Lunch" : "Dinner"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                      <MapPin className="w-4 h-4 shrink-0" style={{ color: "rgba(255,255,255,0.4)" }} />
                      <span>{event.hostName} · {event.hostDistrict}</span>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-black" style={{ color: "#4ade80" }}>
                      ¥{event.pricePerPerson}
                    </span>
                    {event.originalPrice && event.originalPrice > event.pricePerPerson && (
                      <span className="text-sm line-through" style={{ color: "rgba(255,255,255,0.35)" }}>
                        ¥{event.originalPrice}
                      </span>
                    )}
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>per person</span>
                  </div>

                  {/* Seat progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                      <span>{seatsTaken}/{event.totalSeats} seats taken</span>
                      <span style={{ color: isSoldOut ? "rgba(255,255,255,0.3)" : isAlmostFull ? "#f97316" : "rgba(255,255,255,0.45)" }}>
                        {isSoldOut ? "Sold out" : `${event.seatsRemaining} left`}
                      </span>
                    </div>
                    <div className="w-full rounded-full h-1.5" style={{ background: "rgba(255,255,255,0.1)" }}>
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${seatPercentage}%`,
                          background: isSoldOut
                            ? "rgba(255,255,255,0.2)"
                            : isAlmostFull
                            ? "#f97316"
                            : "#4ade80",
                        }}
                      />
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    disabled={isSoldOut}
                    className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                    style={
                      isSoldOut
                        ? { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)", cursor: "not-allowed" }
                        : { background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }
                    }
                    onMouseEnter={(e) => {
                      if (!isSoldOut) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.14)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSoldOut) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
                    }}
                  >
                    {isSoldOut ? "Sold Out" : "Reserve your seat →"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
