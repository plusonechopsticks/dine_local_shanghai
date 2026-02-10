import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MapPin, Clock, Users, AlertCircle, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

export default function BookingConfirmation() {
  const [location, setLocation] = useLocation();
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  useEffect(() => {
    // Get booking details from URL query params
    const params = new URLSearchParams(window.location.search);
    const id = params.get("bookingId");
    const guestName = params.get("guestName");
    const guestEmail = params.get("guestEmail");
    const requestedDate = params.get("requestedDate");
    const mealType = params.get("mealType");
    const numberOfGuests = params.get("numberOfGuests");
    const hostName = params.get("hostName");
    const amount = params.get("amount");
    const dietaryRestrictions = params.get("dietaryRestrictions") || "";
    const hostListingId = params.get("hostListingId") ? parseInt(params.get("hostListingId")!) : null;

    if (id) {
      setBookingId(parseInt(id));
      setBookingDetails({
        guestName,
        guestEmail,
        requestedDate,
        mealType,
        numberOfGuests,
        hostName,
        amount: parseFloat(amount || "0"),
        dietaryRestrictions,
        hostListingId: hostListingId,
      });
    } else {
      setLocation("/");
    }
  }, [setLocation]);

  const createCheckoutSessionMutation = trpc.payment.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.success("Redirecting to payment...");
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create payment session");
    },
  });

  const handlePayment = () => {
    if (!bookingId || !bookingDetails) return;

    createCheckoutSessionMutation.mutate({
      bookingId,
      amount: bookingDetails.amount,
      hostName: bookingDetails.hostName,
      guestEmail: bookingDetails.guestEmail,
    });
  };

  if (!bookingId || !bookingDetails) {
    return (
      <div className="container py-20">
        <p className="text-center text-muted-foreground">Loading booking details...</p>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-2xl">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-16 w-16 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Booking Request Submitted!</h1>
        <p className="text-muted-foreground">
          Your request has been received. Complete payment to secure your spot.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <UtensilsCrossed className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Host</p>
              <p className="text-sm text-muted-foreground">{bookingDetails.hostName}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Date & Meal</p>
              <p className="text-sm text-muted-foreground">
                {new Date(bookingDetails.requestedDate).toLocaleDateString()} • {bookingDetails.mealType}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Number of Guests</p>
              <p className="text-sm text-muted-foreground">{bookingDetails.numberOfGuests} {parseInt(bookingDetails.numberOfGuests) === 1 ? 'guest' : 'guests'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Dietary Restrictions</p>
              <p className="text-sm text-muted-foreground">
                {bookingDetails.dietaryRestrictions || "No dietary restrictions"}
              </p>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Amount</span>
              <span>¥{bookingDetails.amount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <p className="text-center text-lg font-medium mb-2">
            Proceed to pay and secure your home dining table today
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Free cancellation 7 days in advance
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => {
            if (bookingDetails.hostListingId) {
              setLocation(`/hosts/${bookingDetails.hostListingId}`);
            } else {
              toast.error("Unable to return to booking form");
            }
          }}
          className="flex-1"
        >
          Back to Booking Form
        </Button>
        <Button
          onClick={handlePayment}
          disabled={createCheckoutSessionMutation.isPending}
          className="flex-1 bg-primary hover:bg-primary/90"
          size="lg"
        >
          {createCheckoutSessionMutation.isPending ? "Redirecting..." : "Proceed to Payment"}
        </Button>
      </div>
    </div>
  );
}
