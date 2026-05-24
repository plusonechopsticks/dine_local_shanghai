import { useState, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Star, Upload, X, CheckCircle2, Loader2 } from "lucide-react";

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 focus:outline-none"
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          <Star
            className={`w-10 h-10 transition-colors ${
              star <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Great",
  5: "Exceptional!",
};

export default function ReviewPage() {
  const [, params] = useRoute("/review/:token");
  const [, setLocation] = useLocation();
  const token = params?.token ?? "";

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<{ file: File; preview: string; url?: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tokenQuery = trpc.review.getByToken.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  const submitMutation = trpc.review.submit.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setSubmitted(true);
      } else {
        toast.error(data.error || "Failed to submit review. Please try again.");
      }
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      toast.error("You can upload up to 5 photos.");
      return;
    }
    const newPhotos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url as string;
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }
    if (comment.trim().length < 10) {
      toast.error("Please write at least 10 characters in your review.");
      return;
    }

    setUploading(true);
    let uploadedUrls: string[] = [];
    try {
      if (photos.length > 0) {
        uploadedUrls = await Promise.all(
          photos.map((p) => (p.url ? Promise.resolve(p.url) : uploadPhoto(p.file)))
        );
      }
    } catch {
      toast.error("Photo upload failed. Please try again.");
      setUploading(false);
      return;
    }
    setUploading(false);

    submitMutation.mutate({
      token,
      rating,
      comment: comment.trim(),
      photoUrls: uploadedUrls.length > 0 ? uploadedUrls : undefined,
    });
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (tokenQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <Loader2 className="w-8 h-8 animate-spin text-[#c0392b]" />
      </div>
    );
  }

  // ── Invalid / expired token ────────────────────────────────────────────────
  const tokenData = tokenQuery.data;
  if (!tokenData || !tokenData.valid) {
    const reason = tokenData && "reason" in tokenData ? tokenData.reason : "not_found";
    const messages: Record<string, { title: string; body: string }> = {
      already_used: {
        title: "Review already submitted",
        body: "You've already submitted a review for this experience. Thank you for your feedback!",
      },
      expired: {
        title: "This link has expired",
        body: "Review links are valid for 30 days after your dining experience.",
      },
      not_confirmed: {
        title: "Booking not confirmed",
        body: "Reviews can only be submitted for confirmed bookings.",
      },
      not_found: {
        title: "Invalid link",
        body: "This review link is not valid. Please check the link in your email.",
      },
    };
    const msg = messages[reason as string] ?? messages.not_found;
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle className="text-xl">{msg.title}</CardTitle>
            <CardDescription className="text-base mt-2">{msg.body}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => setLocation("/")}>
              Back to homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Thank you, {tokenData.guestName}!</CardTitle>
            <CardDescription className="text-base mt-2">
              Your review has been submitted. We've sent a copy to your email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-7 h-7 ${s <= rating ? "fill-amber-400 text-amber-400" : "fill-transparent text-gray-200"}`}
                />
              ))}
            </div>
            <p className="text-muted-foreground italic text-sm">"{comment}"</p>
            <Button variant="outline" onClick={() => setLocation("/")}>
              Back to homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Review form ────────────────────────────────────────────────────────────
  const dateStr = tokenData.requestedDate
    ? new Date(tokenData.requestedDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const isBusy = uploading || submitMutation.isPending;

  return (
    <div className="min-h-screen bg-[#faf8f5] py-10 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <a href="/" className="inline-block mb-6">
            <span className="text-2xl font-bold text-[#c0392b]">+1 Chopsticks</span>
          </a>
          <h1 className="text-3xl font-bold text-gray-900">Share Your Experience</h1>
          <p className="text-muted-foreground mt-2">
            {dateStr && `Your ${tokenData.mealType} on ${dateStr}`}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-8">
            {/* Star Rating */}
            <div className="space-y-3">
              <label className="text-base font-semibold block">
                How was your experience? <span className="text-red-500">*</span>
              </label>
              <StarRating value={rating} onChange={setRating} />
              {rating > 0 && (
                <p className="text-sm font-medium text-amber-600">{RATING_LABELS[rating]}</p>
              )}
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <label className="text-base font-semibold block">
                Tell us about your experience <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="What did you enjoy most? How was the food, the conversation, the atmosphere?"
                rows={10}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={2000}
                disabled={isBusy}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {comment.length}/2000
              </p>
            </div>

            {/* Photo Upload */}
            <div className="space-y-3">
              <label className="text-base font-semibold block">
                Add photos{" "}
                <span className="text-muted-foreground font-normal text-sm">(optional, up to 5)</span>
              </label>

              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((p, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img
                        src={p.preview}
                        alt={`Photo ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        disabled={isBusy}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80"
                        aria-label="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {photos.length < 5 && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isBusy}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isBusy}
                    className="w-full border-dashed"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {photos.length === 0 ? "Upload photos" : "Add more photos"}
                  </Button>
                </>
              )}
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={isBusy || rating === 0}
              className="w-full bg-[#c0392b] hover:bg-[#a93226] text-white text-base py-6"
              size="lg"
            >
              {isBusy ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {uploading ? "Uploading photos..." : "Submitting..."}
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Your review will be published on the +1 Chopsticks website.
        </p>
      </div>
    </div>
  );
}
