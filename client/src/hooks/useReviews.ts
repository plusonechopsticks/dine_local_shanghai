import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import type { Testimonial } from "@/components/ReviewsSection";
import type { TravelerSegment } from "@/data/testimonials";

/** Map travellerCategory from DB to TravelerSegment used by ReviewsSection */
function toSegment(cat: string | null): TravelerSegment {
  if (cat === "solo") return "solo";
  if (cat === "families") return "family";
  return "couples"; // friends_couples → couples
}

/** Map a DB review row to the Testimonial shape expected by ReviewsSection */
function mapReview(r: {
  id: number;
  bookingId: number;
  hostListingId: number;
  hostName: string;
  guestName: string;
  numberOfGuests: number;
  rating: number;
  comment: string;
  photoUrls: string | null;
  travellerCategory: string | null;
  isPublished: boolean;
  createdAt: Date | string;
}): Testimonial {
  const DEFAULT_REVIEW_IMAGE = "https://res.cloudinary.com/drxfcfayd/image/upload/v1781537197/reviews/defaults/plus1chopsticks-default-review.jpg";

  let images: { url: string; alt: string }[] = [];
  let hasRealPhoto = false;
  if (r.photoUrls) {
    try {
      const parsed = JSON.parse(r.photoUrls);
      if (Array.isArray(parsed) && parsed.length > 0) {
        images = parsed.map((url: string) => ({
          url,
          alt: `Photo by ${r.guestName} at ${r.hostName}`,
        }));
        // Only count as a real photo if it's NOT the default logo
        hasRealPhoto = parsed.some((url: string) => url !== DEFAULT_REVIEW_IMAGE);
      }
    } catch {
      // ignore parse errors
    }
  }
  // Fall back to the +1 Chopsticks logo for reviews without photos
  if (images.length === 0) {
    images = [{ url: DEFAULT_REVIEW_IMAGE, alt: "+1 Chopsticks" }];
  }

  const segment = toSegment(r.travellerCategory);
  const travelerTypeMap: Record<TravelerSegment, string> = {
    solo: "Solo Traveler",
    family: "Family",
    couples: "Friends & Couples",
  };

  const dateStr = r.createdAt
    ? new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";

  return {
    id: `db-${r.id}`,
    hostId: r.hostListingId,
    guestName: r.guestName,
    location: "",
    travelerType: travelerTypeMap[segment],
    travelerSegment: segment,
    hostName: r.hostName,
    hostDate: dateStr,
    experienceTitle: `${r.guestName}'s experience with ${r.hostName}`,
    previewText: r.comment.length > 160 ? r.comment.slice(0, 157) + "..." : r.comment,
    fullText: r.comment,
    images,
    hasRealPhoto,
    cta: "Read more",
  };
}

/** Sort reviews so those with real guest photos come first */
function sortReviews(reviews: (Testimonial & { hasRealPhoto?: boolean })[]) {
  return [...reviews].sort((a, b) => {
    const aReal = (a as any).hasRealPhoto ? 1 : 0;
    const bReal = (b as any).hasRealPhoto ? 1 : 0;
    return bReal - aReal; // real photos first
  });
}

/** Fetch all published DB reviews and return them as Testimonial[] */
export function useAllDbReviews() {
  const { data, isLoading } = trpc.review.getPublished.useQuery();
  const testimonials = useMemo(() => sortReviews((data ?? []).map(mapReview)), [data]);
  return { testimonials, isLoading };
}

/** Fetch published reviews for a specific host listing */
export function useHostReviews(hostListingId: number) {
  const { data, isLoading } = trpc.review.getByHostListing.useQuery({ hostListingId });
  const testimonials = useMemo(() => sortReviews((data ?? []).map(mapReview)), [data]);
  return { testimonials, isLoading };
}
