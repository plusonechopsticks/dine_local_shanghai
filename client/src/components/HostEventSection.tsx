import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, Leaf, ArrowRight } from "lucide-react";

interface HostEventSectionProps {
  hostListingId: number;
}

export function HostEventSection({ hostListingId }: HostEventSectionProps) {
  const [, setLocation] = useLocation();
  const { data: events = [], isLoading } = trpc.event.list.useQuery(
    { hostListingId },
    { enabled: hostListingId > 0 }
  );

  if (isLoading || events.length === 0) return null;

  // Parse date string safely: treat YYYY-MM-DD as local date to avoid off-by-one day
  const parseDateLocal = (dateStr: string | Date) => {
    if (dateStr instanceof Date) return dateStr;
    const [year, month, day] = String(dateStr).split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  return (
    <section className="mt-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
          style={{ background: "rgba(212,175,55,0.12)", color: "#d4af37", border: "1px solid rgba(212,175,55,0.25)" }}
        >
          <Leaf className="w-3.5 h-3.5" />
          <span>Seasonal Events</span>
        </div>
        <div className="flex-1 h-px" style={{ background: "rgba(212,175,55,0.15)" }} />
      </div>

      <h3 className="text-xl font-bold text-white mb-2">Upcoming Dining Events</h3>
      <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
        Fixed-date group meals celebrating China's seasonal traditions. Limited seats.
      </p>

      {/* Event Cards */}
      <div className="space-y-4">
        {events.map((event) => {
          const seatsTaken = event.totalSeats - event.seatsRemaining;
          const seatPercentage = (seatsTaken / event.totalSeats) * 100;
          const isSoldOut = event.seatsRemaining <= 0;
          const eventDate = parseDateLocal(event.eventDate);
          const dateStr = eventDate.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <div
              key={event.id}
              className="rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.01]"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(212,175,55,0.2)",
              }}
              onClick={() => setLocation(`/events/${event.id}`)}
            >
              {/* Event image if available */}
              {event.featuredImageUrl && (
                <div className="h-36 overflow-hidden">
                  <img
                    src={event.featuredImageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-4">
                {/* Discount badge */}
                {event.discountLabel && (
                  <span
                    className="inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-2"
                    style={{ background: "#dc2626", color: "#fff" }}
                  >
                    {event.discountLabel}
                  </span>
                )}

                <h4 className="font-semibold text-white mb-2 text-sm leading-snug">
                  {event.title}
                </h4>

                {/* Date & meal type */}
                <div className="flex items-center gap-2 text-xs mb-2" style={{ color: "rgba(255,255,255,0.55)" }}>
                  <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#d4af37" }} />
                  <span>
                    {dateStr} &middot; {event.mealType === "lunch" ? "Lunch" : "Dinner"}
                  </span>
                </div>

                {/* Pricing */}
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-lg font-bold" style={{ color: "#d4af37" }}>
                    ¥{event.pricePerPerson}
                  </span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>/person</span>
                  {event.originalPrice && event.originalPrice > event.pricePerPerson && (
                    <span className="text-xs line-through" style={{ color: "rgba(255,255,255,0.3)" }}>
                      ¥{event.originalPrice}
                    </span>
                  )}
                </div>

                {/* Seat progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                    <span>
                      <Users className="w-3 h-3 inline mr-1" />
                      {seatsTaken}/{event.totalSeats} seats taken
                    </span>
                    <span style={{ color: isSoldOut ? "rgba(255,255,255,0.3)" : "#d4af37" }}>
                      {isSoldOut ? "Sold out" : `${event.seatsRemaining} left`}
                    </span>
                  </div>
                  <div className="w-full rounded-full h-1.5" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${seatPercentage}%`,
                        background: isSoldOut
                          ? "rgba(255,255,255,0.2)"
                          : seatPercentage >= 80
                          ? "#f97316"
                          : "#d4af37",
                      }}
                    />
                  </div>
                </div>

                {/* CTA */}
                <Button
                  size="sm"
                  className="w-full text-sm font-semibold"
                  disabled={isSoldOut}
                  style={
                    isSoldOut
                      ? { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)", cursor: "not-allowed" }
                      : { background: "linear-gradient(135deg, #d4af37 0%, #b8962e 100%)", color: "#1a1a1a" }
                  }
                >
                  {isSoldOut ? "Sold Out" : "Reserve Your Seat"}
                  {!isSoldOut && <ArrowRight className="w-3.5 h-3.5 ml-1.5" />}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
