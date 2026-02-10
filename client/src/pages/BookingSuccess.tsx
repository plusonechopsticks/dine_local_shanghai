import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { CheckCircle, Home, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function BookingSuccess() {
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    // Get query parameters from URL
    const params = new URLSearchParams(window.location.search);
    const session = params.get("session_id");
    const booking = params.get("booking_id");
    
    setSessionId(session);
    setBookingId(booking);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-6 text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Payment Successful!
            </h1>
            <p className="text-muted-foreground">
              Your booking has been confirmed and payment processed successfully.
            </p>
          </div>

          {/* Booking Details */}
          {bookingId && (
            <div className="bg-secondary p-4 rounded-lg text-left space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>Booking ID: #{bookingId}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                A confirmation email has been sent to your email address with all the details.
              </p>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg text-left space-y-2">
            <h3 className="font-semibold text-sm">What's Next?</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Check your email for booking confirmation</li>
              <li>The host will contact you to finalize details</li>
              <li>Prepare for an amazing dining experience!</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
            <Link href="/">
              <Button className="w-full bg-primary hover:bg-primary/90">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link href="/hosts">
              <Button variant="outline" className="w-full">
                Browse More Hosts
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
