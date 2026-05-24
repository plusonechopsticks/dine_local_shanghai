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
  let images: { url: string; alt: string }[] = [];
  if (r.photoUrls) {
    try {
      const parsed = JSON.parse(r.photoUrls);
      if (Array.isArray(parsed)) {
        images = parsed.map((url: string) => ({
          url,
          alt: `Photo by ${r.guestName} at ${r.hostName}`,
        }));
      }
    } catch {
      // ignore parse errors
    }
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
    cta: "Read more",
  };
}

/** Fetch all published DB reviews and return them as Testimonial[] */
export function useAllDbReviews() {
  const { data, isLoading } = trpc.review.getPublished.useQuery();
  const testimonials = useMemo(() => (data ?? []).map(mapReview), [data]);
  return { testimonials, isLoading };
}

/** Fetch published reviews for a specific host listing */
export function useHostReviews(hostListingId: number) {
  const { data, isLoading } = trpc.review.getByHostListing.useQuery({ hostListingId });
  const testimonials = useMemo(() => (data ?? []).map(mapReview), [data]);
  return { testimonials, isLoading };
}
