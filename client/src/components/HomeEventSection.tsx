import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, MapPin, Leaf, ArrowRight } from "lucide-react";

export function HomeEventSection() {
  const [, setLocation] = useLocation();
  const { data: events = [], isLoading } = trpc.event.list.useQuery({ featuredOnly: true });

  if (isLoading || events.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-green-50/80 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Leaf className="w-4 h-4" />
            <span>Seasonal Events</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Curated Dining Experiences
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Limited-seat group meals celebrating China's seasonal traditions. 
            Join a small table of fellow food lovers for a one-of-a-kind evening.
          </p>
        </div>

        {/* Event Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {events.map((event) => {
            const seatsTaken = event.totalSeats - event.seatsRemaining;
            const seatPercentage = (seatsTaken / event.totalSeats) * 100;
            const isSoldOut = event.seatsRemaining <= 0;
            const eventDate = new Date(event.eventDate);
            const dateStr = eventDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            });

            return (
              <div
                key={event.id}
                className="group relative bg-white rounded-2xl border border-green-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() => setLocation(`/events/${event.id}`)}
              >
                {/* Discount Badge */}
                {event.discountLabel && (
                  <div className="absolute top-4 right-4 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {event.discountLabel}
                  </div>
                )}

                {/* Event Image or Gradient Header */}
                {event.featuredImageUrl ? (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={event.featuredImageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="h-32 bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center">
                    <div className="text-center text-white">
                      <p className="text-3xl mb-1">🌿</p>
                      <p className="text-sm font-medium opacity-90">{event.theme || "Seasonal Event"}</p>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                    {event.title}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarDays className="w-4 h-4 text-green-600" />
                      <span>{dateStr} &middot; {event.mealType === "lunch" ? "Lunch" : "Dinner"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span>
                        {event.hostName} &middot; {event.hostDistrict}
                      </span>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold text-green-700">
                      ¥{event.pricePerPerson}
                    </span>
                    <span className="text-sm text-gray-500">/person</span>
                    {event.originalPrice && event.originalPrice > event.pricePerPerson && (
                      <span className="text-sm text-gray-400 line-through">
                        ¥{event.originalPrice}
                      </span>
                    )}
                  </div>

                  {/* Seat Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>
                        <Users className="w-3 h-3 inline mr-1" />
                        {seatsTaken}/{event.totalSeats} seats taken
                      </span>
                      <span>
                        {isSoldOut
                          ? "Sold out"
                          : `${event.seatsRemaining} left`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isSoldOut
                            ? "bg-gray-400"
                            : seatPercentage >= 80
                            ? "bg-orange-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${seatPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  <Button
                    className={`w-full ${
                      isSoldOut
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                    disabled={isSoldOut}
                  >
                    {isSoldOut ? "Sold Out" : "Reserve Your Seat"}
                    {!isSoldOut && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
