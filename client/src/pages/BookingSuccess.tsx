import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { ChopsticksLogo } from "@/components/ChopsticksLogo";

export default function BookingSuccess() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Update page title
    document.title = "Payment Successful - +1 Chopsticks";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-40">
        <div className="container flex items-center justify-center h-16">
          <button
            onClick={() => setLocation("/")}
            className="hover:opacity-70 transition-opacity"
          >
            <ChopsticksLogo className="h-8" />
          </button>
        </div>
      </div>

      <main className="container py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="pt-6 text-center space-y-6">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">Payment Successful!</h1>
                <p className="text-muted-foreground">
                  Your booking has been confirmed and payment processed successfully.
                </p>
              </div>

              {sessionId && (
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  <p className="font-medium mb-1">Transaction ID:</p>
                  <p className="font-mono text-xs break-all">{sessionId}</p>
                </div>
              )}

              <div className="space-y-3 pt-4">
                <p className="text-sm text-muted-foreground">
                  You will receive a confirmation email shortly with all the details of your booking.
                  The host will contact you soon to finalize the arrangements.
                </p>
                
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={() => setLocation("/hosts")}
                    className="w-full"
                  >
                    Browse More Hosts
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setLocation("/")}
                    className="w-full"
                  >
                    Return to Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
