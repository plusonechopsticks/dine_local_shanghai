import { useParams, useLocation } from "wouter";
import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { getProxiedImageUrl } from "@/lib/imageUtils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  MapPin,
  Clock,
  Users,
  ChefHat,
  Globe,
  MessageCircle,
  Sparkles,
  BookOpen,
  Compass,
  Heart,
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  Minus,
  Plus,
  PawPrint,
  Baby,
  UtensilsCrossed,
  Timer,
} from "lucide-react";
import { toast } from "sonner";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";

// ─── constants ────────────────────────────────────────────────────────────────

const DAYS_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

// ─── helpers ──────────────────────────────────────────────────────────────────

function buildDisabledDates(availability: Record<string, string[]>): Set<string> {
  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + 90);

  const disabled = new Set<string>();
  for (let d = new Date(today); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const dayOfWeek = d
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const availableKeys = Object.keys(availability).map((k) => k.toLowerCase());
    if (!availableKeys.includes(dayOfWeek)) {
      disabled.add(dateStr);
    }
  }
  return disabled;
}

function getAvailableMealTypes(
  dateStr: string,
  availability: Record<string, string[]>
): ("lunch" | "dinner")[] {
  if (!dateStr) return ["lunch", "dinner"];
  const d = new Date(dateStr + "T00:00:00");
  const dayOfWeek = d
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  const normalised = Object.entries(availability).reduce<
    Record<string, string[]>
  >((acc, [k, v]) => {
    acc[k.toLowerCase()] = v;
    return acc;
  }, {});
  const meals = normalised[dayOfWeek] ?? [];
  return meals.filter((m): m is "lunch" | "dinner" =>
    m === "lunch" || m === "dinner"
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function discountedPrice(price: number, pct: number): number {
  return pct > 0 ? Math.round(price * (1 - pct / 100)) : price;
}

// ─── booking form state ───────────────────────────────────────────────────────

interface BookingForm {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  requestedDate: string;
  mealType: "lunch" | "dinner";
  numberOfGuests: number;
  specialRequests: string;
}

const EMPTY_FORM: BookingForm = {
  guestName: "",
  guestEmail: "",
  guestPhone: "",
  requestedDate: "",
  mealType: "dinner",
  numberOfGuests: 1,
  specialRequests: "",
};

// ─── sub-components ───────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-semibold text-foreground mb-4">{children}</h2>
  );
}

function InfoPill({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <span>{label}</span>
    </div>
  );
}

// ─── booking panel (shared between sidebar + sheet) ───────────────────────────

interface BookingPanelProps {
  host: {
    id: number;
    hostName: string;
    pricePerPerson: number;
    discountPercentage: number;
    maxGuests: number;
    availability: Record<string, string[]>;
  };
  form: BookingForm;
  onChange: (patch: Partial<BookingForm>) => void;
  onSubmit: () => void;
  isPending: boolean;
  showCalendar: boolean;
  setShowCalendar: (v: boolean) => void;
  disabledDates: Set<string>;
}

function BookingPanel({
  host,
  form,
  onChange,
  onSubmit,
  isPending,
  showCalendar,
  setShowCalendar,
  disabledDates,
}: BookingPanelProps) {
  const effectivePrice = discountedPrice(
    host.pricePerPerson,
    host.discountPercentage
  );
  const total = effectivePrice * form.numberOfGuests;
  const availableMeals = getAvailableMealTypes(form.requestedDate, host.availability);

  // If the currently selected meal type is not available on the new date, reset it
  useEffect(() => {
    if (form.requestedDate && availableMeals.length > 0 && !availableMeals.includes(form.mealType)) {
      onChange({ mealType: availableMeals[0] });
    }
  }, [form.requestedDate]);

  return (
    <div className="space-y-5">
      {/* Price */}
      <div>
        {host.discountPercentage > 0 && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-muted-foreground line-through">
              ¥{host.pricePerPerson}
            </span>
            <Badge variant="destructive" className="text-xs">
              -{host.discountPercentage}%
            </Badge>
          </div>
        )}
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-primary">¥{effectivePrice}</span>
          <span className="text-muted-foreground text-sm">/ person</span>
        </div>
      </div>

      <Separator />

      {/* Date */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Date</Label>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start text-left font-normal"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          {form.requestedDate ? formatDate(form.requestedDate) : "Choose a date"}
        </Button>
        {showCalendar && (
          <div className="mt-2">
            <AvailabilityCalendar
              disabledDates={disabledDates}
              selectedDate={form.requestedDate}
              onDateSelect={(date) => {
                onChange({ requestedDate: date });
                setShowCalendar(false);
              }}
              availability={host.availability}
            />
          </div>
        )}
      </div>

      {/* Meal time */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Meal</Label>
        <Select
          value={form.mealType}
          onValueChange={(v) => onChange({ mealType: v as "lunch" | "dinner" })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="lunch"
              disabled={form.requestedDate ? !availableMeals.includes("lunch") : false}
            >
              Lunch
            </SelectItem>
            <SelectItem
              value="dinner"
              disabled={form.requestedDate ? !availableMeals.includes("dinner") : false}
            >
              Dinner
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Guest count */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Guests</Label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => onChange({ numberOfGuests: Math.max(1, form.numberOfGuests - 1) })}
            disabled={form.numberOfGuests <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="flex-1 text-center font-semibold text-lg tabular-nums">
            {form.numberOfGuests}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() =>
              onChange({ numberOfGuests: Math.min(host.maxGuests, form.numberOfGuests + 1) })
            }
            disabled={form.numberOfGuests >= host.maxGuests}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Up to {host.maxGuests} guests
        </p>
      </div>

      <Separator />

      {/* Guest details */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="v2-guestName" className="text-sm font-medium">
            Your name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="v2-guestName"
            placeholder="Full name"
            value={form.guestName}
            onChange={(e) => onChange({ guestName: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="v2-guestEmail" className="text-sm font-medium">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="v2-guestEmail"
            type="email"
            placeholder="you@example.com"
            value={form.guestEmail}
            onChange={(e) => onChange({ guestEmail: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="v2-dietary" className="text-sm font-medium">
            Dietary restrictions
          </Label>
          <Textarea
            id="v2-dietary"
            placeholder="Allergies, vegetarian, halal…"
            className="resize-none h-20"
            value={form.specialRequests}
            onChange={(e) => onChange({ specialRequests: e.target.value })}
          />
        </div>
      </div>

      <Separator />

      {/* Running total */}
      {form.requestedDate && (
        <div className="flex items-center justify-between text-sm font-medium">
          <span>
            ¥{effectivePrice} × {form.numberOfGuests}{" "}
            {form.numberOfGuests === 1 ? "guest" : "guests"}
          </span>
          <span className="text-lg font-bold text-primary">¥{total}</span>
        </div>
      )}

      <Button
        className="w-full py-6 text-base font-semibold"
        onClick={onSubmit}
        disabled={isPending}
      >
        {isPending ? "Reserving…" : "Reserve"}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Free cancellation up to 7 days before
      </p>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function HostDetailV2() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const hostId = params?.id ? parseInt(params.id, 10) : null;

  // ── data ──
  const {
    data: host,
    isLoading,
    isError,
  } = trpc.host.get.useQuery({ id: hostId ?? 0 }, { enabled: !!hostId });

  const incrementView = trpc.host.incrementView.useMutation();

  useEffect(() => {
    if (hostId && host) {
      incrementView.mutate({ id: hostId });
    }
  }, [hostId, host?.id]);

  // ── gallery ──
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images =
    host
      ? [
          host.profilePhotoUrl,
          ...((host.foodPhotoUrls as string[]) ?? []),
        ].filter(Boolean).map((u) => getProxiedImageUrl(u as string))
      : [];

  const prevImage = () =>
    setCurrentImageIndex((i) => (i - 1 + images.length) % images.length);
  const nextImage = () =>
    setCurrentImageIndex((i) => (i + 1) % images.length);

  // ── availability ──
  const normaliseAvailability = useCallback(
    (raw: Record<string, string[]>): Record<string, string[]> =>
      Object.entries(raw).reduce<Record<string, string[]>>((acc, [k, v]) => {
        acc[k.toLowerCase()] = v;
        return acc;
      }, {}),
    []
  );

  const availability: Record<string, string[]> = host?.availability
    ? normaliseAvailability(
        typeof host.availability === "string"
          ? JSON.parse(host.availability)
          : (host.availability as Record<string, string[]>)
      )
    : {};

  const disabledDates = buildDisabledDates(availability);
  const availableDays = DAYS_ORDER.filter((d) => (availability[d]?.length ?? 0) > 0);

  // ── booking state ──
  const [form, setForm] = useState<BookingForm>(EMPTY_FORM);
  const onChange = (patch: Partial<BookingForm>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const [showCalendar, setShowCalendar] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null);

  const createCheckoutSession = trpc.payment.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Payment session failed");
    },
  });

  const createBooking = trpc.booking.create.useMutation({
    onSuccess: (data) => {
      if (!host) return;
      setCreatedBookingId(data.id);
      const effectivePrice = discountedPrice(
        host.pricePerPerson,
        host.discountPercentage
      );
      const total = effectivePrice * form.numberOfGuests;

      const qs = new URLSearchParams({
        bookingId: data.id.toString(),
        guestName: form.guestName,
        guestEmail: form.guestEmail,
        requestedDate: form.requestedDate,
        mealType: form.mealType,
        numberOfGuests: form.numberOfGuests.toString(),
        hostName: host.hostName,
        amount: total.toString(),
        dietaryRestrictions: form.specialRequests,
        hostListingId: host.id.toString(),
      });

      window.location.href = `/booking-confirmation?${qs.toString()}`;
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to submit booking");
    },
  });

  const handleSubmit = () => {
    if (!form.guestName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!form.guestEmail.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!form.requestedDate) {
      toast.error("Please select a date");
      return;
    }

    createBooking.mutate({
      hostListingId: hostId ?? 0,
      guestName: form.guestName,
      guestEmail: form.guestEmail,
      guestPhone: form.guestPhone || undefined,
      requestedDate: form.requestedDate,
      mealType: form.mealType,
      numberOfGuests: form.numberOfGuests,
      specialRequests: form.specialRequests || undefined,
    });
  };

  const bookingPanelProps: Omit<BookingPanelProps, "host"> = {
    form,
    onChange,
    onSubmit: handleSubmit,
    isPending: createBooking.isPending,
    showCalendar,
    setShowCalendar,
    disabledDates,
  };

  // ── loading / error states ──
  if (!hostId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Invalid host ID
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }
  if (isError || !host) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Host not found
      </div>
    );
  }

  const effectivePrice = discountedPrice(host.pricePerPerson, host.discountPercentage);
  const foodPhotos = (host.foodPhotoUrls as string[]) ?? [];
  const languages = (host.languages as string[]) ?? [];
  const householdFeatures = (host.householdFeatures as string[]) ?? [];

  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative h-[100svh] min-h-[560px] max-h-[900px] bg-black overflow-hidden">
        {/* background: video takes priority over photos */}
        {host.introVideoUrl ? (
          <video
            src={host.introVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
        ) : images.length > 0 ? (
          <>
            <img
              src={images[currentImageIndex]}
              alt={host.hostName}
              className="absolute inset-0 w-full h-full object-cover opacity-80 transition-opacity duration-500"
            />
            {/* carousel controls */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors z-10"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors z-10"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                {/* dot indicators */}
                <div className="absolute bottom-28 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === currentImageIndex ? "w-6 bg-white" : "w-1.5 bg-white/50"
                      }`}
                      aria-label={`Photo ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
        )}

        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

        {/* back button */}
        <button
          onClick={() => setLocation("/hosts")}
          className="absolute top-4 left-4 z-10 flex items-center gap-1.5 text-white/90 hover:text-white text-sm font-medium bg-black/30 hover:bg-black/50 px-3 py-2 rounded-full transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          All hosts
        </button>

        {/* hero content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-10">
          <div className="max-w-4xl">
            {/* discount badge */}
            {host.discountPercentage > 0 && (
              <Badge className="bg-red-500 text-white border-0 mb-3 text-xs font-semibold">
                Limited Time — {host.discountPercentage}% off
              </Badge>
            )}

            {/* cuisine chips */}
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className="bg-amber-600/90 text-white border-0 font-medium">
                {host.cuisineStyle}
              </Badge>
              {host.district && (
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm font-medium">
                  <MapPin className="h-3 w-3 mr-1" />
                  {host.district}, Shanghai
                </Badge>
              )}
            </div>

            {/* title / host name */}
            {host.title ? (
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-1">
                {host.title}
              </h1>
            ) : (
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-1">
                {host.cuisineStyle} with {host.hostName}
              </h1>
            )}
            <p className="text-white/80 text-base mb-4">
              Hosted by{" "}
              <span className="font-semibold text-white">{host.hostName}</span>
            </p>

            {/* quick stats row */}
            <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
              <span className="text-2xl font-bold text-white">
                ¥{effectivePrice}
                <span className="text-base font-normal text-white/70 ml-1">/ person</span>
              </span>
              <span className="text-white/40">·</span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Up to {host.maxGuests} guests
              </span>
              {host.mealDurationMinutes && (
                <>
                  <span className="text-white/40">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {host.mealDurationMinutes >= 60
                      ? `${Math.round(host.mealDurationMinutes / 60)} hr`
                      : `${host.mealDurationMinutes} min`}
                  </span>
                </>
              )}
              {languages.length > 0 && (
                <>
                  <span className="text-white/40">·</span>
                  <span className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    {languages.slice(0, 2).join(", ")}
                    {languages.length > 2 && ` +${languages.length - 2}`}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── BODY ──────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-10 lg:grid lg:grid-cols-3 lg:gap-10">

        {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-12">

          {/* WHAT TO EXPECT ------------------------------------------------ */}
          <section>
            <SectionHeading>What to expect</SectionHeading>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1 p-4 rounded-xl bg-muted/50 border border-border/50">
                <Timer className="h-5 w-5 text-primary mb-1" />
                <p className="text-sm font-semibold">
                  {host.mealDurationMinutes >= 60
                    ? `${Math.round(host.mealDurationMinutes / 60)} hour${Math.round(host.mealDurationMinutes / 60) !== 1 ? "s" : ""}`
                    : `${host.mealDurationMinutes} min`}
                </p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>

              <div className="flex flex-col gap-1 p-4 rounded-xl bg-muted/50 border border-border/50">
                <Users className="h-5 w-5 text-primary mb-1" />
                <p className="text-sm font-semibold">Up to {host.maxGuests}</p>
                <p className="text-xs text-muted-foreground">Guests</p>
              </div>

              <div className="flex flex-col gap-1 p-4 rounded-xl bg-muted/50 border border-border/50">
                <ChefHat className="h-5 w-5 text-primary mb-1" />
                <p className="text-sm font-semibold">{host.cuisineStyle}</p>
                <p className="text-xs text-muted-foreground">Cuisine</p>
              </div>

              {host.kidsFriendly && (
                <div className="flex flex-col gap-1 p-4 rounded-xl bg-muted/50 border border-border/50">
                  <Baby className="h-5 w-5 text-primary mb-1" />
                  <p className="text-sm font-semibold">Kids welcome</p>
                  <p className="text-xs text-muted-foreground">Family friendly</p>
                </div>
              )}

              {host.hasPets && (
                <div className="flex flex-col gap-1 p-4 rounded-xl bg-muted/50 border border-border/50">
                  <PawPrint className="h-5 w-5 text-primary mb-1" />
                  <p className="text-sm font-semibold">
                    {host.petDetails ?? "Pets in home"}
                  </p>
                  <p className="text-xs text-muted-foreground">Pet friendly</p>
                </div>
              )}

              {host.dietaryNote && (
                <div className="col-span-2 sm:col-span-3 flex flex-col gap-1 p-4 rounded-xl bg-muted/50 border border-border/50">
                  <UtensilsCrossed className="h-5 w-5 text-primary mb-1" />
                  <p className="text-sm font-semibold">Dietary accommodations</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {host.dietaryNote}
                  </p>
                </div>
              )}
            </div>

            {/* household features */}
            {householdFeatures.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {householdFeatures.map((f) => (
                  <Badge key={f} variant="secondary" className="text-xs">
                    {f.replace(/-/g, " ")}
                  </Badge>
                ))}
              </div>
            )}

            {/* availability comments */}
            {host.availabilityComments && (
              <p className="mt-4 text-sm text-muted-foreground bg-amber-50 border border-amber-200 rounded-lg p-3 leading-relaxed">
                <span className="font-semibold text-amber-800">Note: </span>
                {host.availabilityComments}
              </p>
            )}
          </section>

          <Separator />

          {/* MENU ---------------------------------------------------------- */}
          <section>
            <SectionHeading>Menu</SectionHeading>

            {/* food photo strip */}
            {foodPhotos.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-3 mb-6 snap-x snap-mandatory">
                {foodPhotos.map((url, i) => (
                  <img
                    key={i}
                    src={getProxiedImageUrl(url)}
                    alt={`Food photo ${i + 1}`}
                    className="h-44 w-44 shrink-0 object-cover rounded-xl snap-start"
                  />
                ))}
              </div>
            )}

            <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap text-sm">
              {host.menuDescription}
            </p>

            {host.otherNotes && (
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed border-l-2 border-border pl-3">
                {host.otherNotes}
              </p>
            )}
          </section>

          <Separator />

          {/* HOST ---------------------------------------------------------- */}
          <section>
            <SectionHeading>Your host</SectionHeading>

            {/* portrait + basics */}
            <div className="flex items-start gap-4 mb-6">
              <div className="h-20 w-20 shrink-0 rounded-full overflow-hidden bg-muted border border-border/50">
                {host.profilePhotoUrl ? (
                  <img
                    src={getProxiedImageUrl(host.profilePhotoUrl)}
                    alt={host.hostName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                    {host.hostName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{host.hostName}</h3>
                <div className="flex flex-col gap-1 mt-1">
                  <InfoPill icon={MapPin} label={`${host.district}, Shanghai`} />
                  {languages.length > 0 && (
                    <InfoPill
                      icon={MessageCircle}
                      label={languages.join(", ")}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* bio */}
            <p className="text-sm text-foreground/80 leading-relaxed mb-6 whitespace-pre-wrap">
              {host.bio}
            </p>

            {/* Q&A cards */}
            <div className="space-y-4">
              {host.overseasExperience && (
                <div className="rounded-xl border border-border/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold">Overseas experience</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {host.overseasExperience}
                  </p>
                </div>
              )}

              {host.whyHost && (
                <div className="rounded-xl border border-border/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold">Why I host</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {host.whyHost}
                  </p>
                </div>
              )}

              {host.culturalPassions && (
                <div className="rounded-xl border border-border/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold">Cultural passions</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {host.culturalPassions}
                  </p>
                </div>
              )}

              {host.funFacts && (
                <div className="rounded-xl border border-border/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold">Fun facts</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {host.funFacts}
                  </p>
                </div>
              )}

              {host.otherPassions && (
                <div className="rounded-xl border border-border/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Compass className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold">
                      Beyond food — what I'm passionate about
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {host.otherPassions}
                  </p>
                </div>
              )}
            </div>
          </section>

          <Separator />

          {/* AVAILABILITY -------------------------------------------------- */}
          <section>
            <SectionHeading>Availability</SectionHeading>
            {availableDays.length > 0 ? (
              <div className="space-y-2">
                {availableDays.map((day) => {
                  const meals = [...(availability[day] ?? [])].sort((a, b) => {
                    if (a === "lunch" && b === "dinner") return -1;
                    if (a === "dinner" && b === "lunch") return 1;
                    return 0;
                  });
                  return (
                    <div
                      key={day}
                      className="flex items-center justify-between py-2.5 px-4 rounded-lg bg-muted/40 border border-border/40"
                    >
                      <span className="capitalize font-medium text-sm">
                        {day}
                      </span>
                      <div className="flex gap-2">
                        {meals.map((m) => (
                          <Badge
                            key={m}
                            variant="secondary"
                            className="capitalize text-xs"
                          >
                            {m}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Contact the host for availability.
              </p>
            )}
          </section>

          {/* bottom padding on mobile so the sticky bar doesn't overlap */}
          <div className="h-24 lg:hidden" />
        </div>

        {/* ── RIGHT COLUMN — desktop booking sidebar ───────────────────────── */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-8 rounded-2xl border border-border/60 shadow-lg bg-card p-6">
            <BookingPanel
              host={{
                id: host.id,
                hostName: host.hostName,
                pricePerPerson: host.pricePerPerson,
                discountPercentage: host.discountPercentage,
                maxGuests: host.maxGuests,
                availability,
              }}
              {...bookingPanelProps}
            />
          </div>
        </div>
      </div>

      {/* ── MOBILE STICKY BOTTOM BAR ─────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-t border-border/60 px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-lg font-bold text-primary leading-none">
            ¥{effectivePrice}
          </p>
          <p className="text-xs text-muted-foreground">per person</p>
        </div>
        <Button
          className="flex-1 max-w-xs font-semibold"
          onClick={() => setMobileSheetOpen(true)}
        >
          Reserve
        </Button>
      </div>

      {/* ── MOBILE BOOKING SHEET ─────────────────────────────────────────── */}
      <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
        <SheetContent side="bottom" className="h-[92svh] overflow-y-auto rounded-t-2xl">
          <SheetHeader className="mb-4">
            <SheetTitle>Reserve your spot</SheetTitle>
          </SheetHeader>
          <BookingPanel
            host={{
              id: host.id,
              hostName: host.hostName,
              pricePerPerson: host.pricePerPerson,
              discountPercentage: host.discountPercentage,
              maxGuests: host.maxGuests,
              availability,
            }}
            form={form}
            onChange={onChange}
            onSubmit={() => {
              handleSubmit();
              setMobileSheetOpen(false);
            }}
            isPending={createBooking.isPending}
            showCalendar={showCalendar}
            setShowCalendar={setShowCalendar}
            disabledDates={disabledDates}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
