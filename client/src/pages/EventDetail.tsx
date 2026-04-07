import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, Users, MapPin, Leaf, ArrowLeft, ChefHat, Clock } from "lucide-react";
import { toast } from "sonner";

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const eventId = parseInt(id || "0");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: event, isLoading } = trpc.event.get.useQuery(
    { id: eventId },
    { enabled: eventId > 0 }
  );

  const bookSeatMutation = trpc.event.bookSeat.useMutation();

  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    numberOfGuests: 1,
    specialRequests: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-lg">Event not found</p>
        <Button variant="outline" onClick={() => setLocation("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
      </div>
    );
  }

  const seatsTaken = event.totalSeats - event.seatsRemaining;
  const seatPercentage = (seatsTaken / event.totalSeats) * 100;
  const isSoldOut = event.seatsRemaining <= 0;
  // Parse date string safely: treat YYYY-MM-DD as local date (not UTC) to avoid off-by-one day
  const parseDateLocal = (dateStr: string | Date) => {
    if (dateStr instanceof Date) return dateStr;
    const [year, month, day] = String(dateStr).split("-").map(Number);
    return new Date(year, month - 1, day);
  };
  const eventDate = parseDateLocal(event.eventDate);
  const dateStr = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSoldOut) return;
    if (formData.numberOfGuests > event.seatsRemaining) {
      toast.error(`Only ${event.seatsRemaining} seat(s) remaining`);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await bookSeatMutation.mutateAsync({
        eventId: event.id,
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone || undefined,
        numberOfGuests: formData.numberOfGuests,
        specialRequests: formData.specialRequests || undefined,
      });

      toast.success("Booking submitted! Check your email for payment details.");
      // Redirect to booking confirmation
      const totalAmount = event.pricePerPerson * formData.numberOfGuests;
      const confirmUrl = `/booking-confirmation?bookingId=${result.id}&guestName=${encodeURIComponent(formData.guestName)}&guestEmail=${encodeURIComponent(formData.guestEmail)}&requestedDate=${encodeURIComponent(event.eventDate)}&mealType=${event.mealType}&numberOfGuests=${formData.numberOfGuests}&hostName=${encodeURIComponent(event.hostName || "")}&amount=${totalAmount}&hostListingId=${event.hostListingId}&eventId=${event.id}`;
      setLocation(confirmUrl);
    } catch (error: any) {
      toast.error(error.message || "Failed to book. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-700 to-emerald-800 text-white">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-green-200 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>

          <div className="max-w-3xl">
            {event.discountLabel && (
              <span className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                {event.discountLabel}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{event.title}</h1>
            {event.theme && (
              <p className="text-green-200 text-lg mb-4 flex items-center gap-2">
                <Leaf className="w-5 h-5" /> {event.theme}
              </p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-green-100">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4" /> {dateStr}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {event.mealType === "lunch" ? "Lunch" : "Dinner"}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" /> {event.totalSeats} seats total
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-5xl mx-auto">
          {/* Left: Event Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About This Event</h2>
              <div
                className="prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            </div>

            {/* Host Info */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-green-600" /> Your Host
              </h2>
              <div className="flex items-center gap-4">
                {event.hostProfileImage ? (
                  <img
                    src={event.hostProfileImage}
                    alt={event.hostName || "Host"}
                    className="w-16 h-16 rounded-full object-cover border-2 border-green-100"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xl font-bold">
                    {(event.hostName || "H")[0]}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{event.hostName}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {event.hostDistrict}
                  </p>
                  <Link
                    href={`/hosts/${event.hostId}`}
                    className="text-sm text-green-600 hover:text-green-700 font-medium mt-1 inline-block"
                  >
                    View full profile &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 sticky top-6">
              {/* Price */}
              <div className="text-center mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-3xl font-bold text-green-700">
                    ¥{event.pricePerPerson}
                  </span>
                  <span className="text-gray-500">/person</span>
                </div>
                {event.originalPrice && event.originalPrice > event.pricePerPerson && (
                  <p className="text-sm text-gray-400 line-through mt-1">
                    ¥{event.originalPrice}/person
                  </p>
                )}
              </div>

              {/* Seat Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{seatsTaken}/{event.totalSeats} seats taken</span>
                  <span className={isSoldOut ? "text-red-500 font-medium" : seatPercentage >= 80 ? "text-orange-500 font-medium" : "text-green-600 font-medium"}>
                    {isSoldOut ? "Sold out" : `${event.seatsRemaining} left`}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      isSoldOut ? "bg-gray-400" : seatPercentage >= 80 ? "bg-orange-500" : "bg-green-500"
                    }`}
                    style={{ width: `${seatPercentage}%` }}
                  />
                </div>
              </div>

              {/* Booking Form */}
              {isSoldOut ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 font-medium">This event is fully booked</p>
                  <p className="text-sm text-gray-400 mt-1">Check back for future events</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Your Name *
                    </label>
                    <Input
                      required
                      value={formData.guestName}
                      onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Email *
                    </label>
                    <Input
                      required
                      type="email"
                      value={formData.guestEmail}
                      onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Phone (optional)
                    </label>
                    <Input
                      value={formData.guestPhone}
                      onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                      placeholder="+86..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Number of Guests *
                    </label>
                    <select
                      className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                      value={formData.numberOfGuests}
                      onChange={(e) =>
                        setFormData({ ...formData, numberOfGuests: parseInt(e.target.value) })
                      }
                    >
                      {Array.from({ length: Math.min(event.seatsRemaining, 4) }, (_, i) => i + 1).map(
                        (n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? "guest" : "guests"} — ¥{event.pricePerPerson * n}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Dietary Requirements / Notes
                    </label>
                    <Textarea
                      value={formData.specialRequests}
                      onChange={(e) =>
                        setFormData({ ...formData, specialRequests: e.target.value })
                      }
                      placeholder="Any allergies, dietary restrictions, or special requests?"
                      rows={3}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Reserving..." : "Reserve Your Seat"}
                  </Button>
                  <p className="text-xs text-gray-400 text-center">
                    You'll receive a payment link via email after booking
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
