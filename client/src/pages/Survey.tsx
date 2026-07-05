import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChopsticksLogo } from "@/components/ChopsticksLogo";
import { GuestSurvey } from "@/components/GuestSurvey";
import { trpc } from "@/lib/trpc";

export default function SurveyPage() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const bookingId = parseInt(searchParams.get("bookingId") ?? "0", 10);
  const email = searchParams.get("email") ?? undefined;

  const { data: hasResponded, isLoading } = trpc.survey.hasResponded.useQuery(
    { bookingId },
    { enabled: !!bookingId }
  );

  if (!bookingId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Invalid survey link.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background sticky top-0 z-40">
        <div className="container flex items-center justify-center h-16">
          <button onClick={() => setLocation("/")} className="hover:opacity-70 transition-opacity">
            <ChopsticksLogo className="h-8" />
          </button>
        </div>
      </div>

      <main className="container py-12">
        <div className="max-w-lg mx-auto">
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="py-12 text-center text-muted-foreground">Loading…</div>
              ) : hasResponded?.responded ? (
                <div className="py-12 text-center space-y-4">
                  <p className="text-2xl">🙏</p>
                  <h2 className="text-xl font-bold">Thanks, we already have your answers!</h2>
                  <p className="text-muted-foreground text-sm">
                    You've already completed the survey for this booking.
                  </p>
                  <Button variant="outline" onClick={() => setLocation("/")}>
                    Back to home
                  </Button>
                </div>
              ) : (
                <GuestSurvey
                  bookingId={bookingId}
                  guestEmail={email}
                  source="email"
                  onComplete={() => setLocation("/")}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
