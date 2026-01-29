import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ChopsticksLogo } from "@/components/ChopsticksLogo";
import { ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface RegistrationData {
  name?: string;
  email?: string;
  district?: string;
  cuisineStyle?: string;
  menuDescription?: string;
  foodPhotoUrls?: string[];
  bio?: string;
  profilePhotoUrl?: string;
  activities?: string[];
  availability?: Record<string, ("lunch" | "dinner")[]>;
  maxGuests?: number;
  pricePerPerson?: number;
  otherNotes?: string;
  householdFeatures?: string[];
  otherHouseholdInfo?: string;
  dietaryNote?: string;
}

const REGISTRATION_STEPS = [
  { id: 1, title: "Cuisine & Dishes", description: "What do you cook?" },
  { id: 2, title: "Self Intro", description: "Tell us about you" },
  { id: 3, title: "Availability", description: "When can you host?" },
  { id: 4, title: "Pricing & Notes", description: "Set your rates" },
  { id: 5, title: "Household Info", description: "Home details" },
];

const HOUSEHOLD_FEATURES = [
  { id: "has-pets", label: "We have pets" },
  { id: "has-stairs", label: "We have stairs" },
  { id: "kids-present", label: "We have kids" },
  { id: "elderly-present", label: "We have elderly" },
  { id: "large-space", label: "Large space" },
  { id: "garden", label: "We have a garden" },
];

const ACTIVITY_OPTIONS = [
  { id: "cooking-class", label: "Cooking class" },
  { id: "market-visit", label: "Market visit" },
  { id: "park-visit", label: "Park visit" },
  { id: "shopping", label: "Shopping" },
  { id: "cultural-tour", label: "Cultural tour" },
  { id: "other", label: "Other" },
];

const DISTRICTS = [
  "Huangpu", "Xuhui", "Changning", "Jing'an", "Putuo", "Hongkou", "Yangpu",
  "Minhang", "Pudong", "Songjiang", "Jiading", "Baoshan", "Jinshan", "Fengxian", "Chongming"
];

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Failed to get canvas context"));
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to compress image"));
        }, "image/jpeg", 0.8);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadImageToServer(file: File, onProgress: (progress: number) => void): Promise<string> {
  const compressed = await compressImage(file);
  const formData = new FormData();
  formData.append("file", compressed, file.name);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const progress = (e.loaded / e.total) * 100;
        onProgress(progress);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.url);
      } else {
        reject(new Error("Upload failed"));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Upload error")));
    xhr.open("POST", "/api/upload");
    xhr.send(formData);
  });
}

async function handleFileUpload(files: FileList | null, onProgress: (progress: number) => void): Promise<string[]> {
  if (!files) return [];

  const urls: string[] = [];
  const uploadPromises: Promise<string>[] = [];

  for (let i = 0; i < Math.min(files.length, 3); i++) {
    uploadPromises.push(
      uploadImageToServer(files[i], (progress) => {
        onProgress((i * 100 + progress) / Math.min(files.length, 3));
      })
    );
  }

  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    throw error;
  }
}

function fileInputToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const STORAGE_KEY = "hostRegistrationData";
const STORAGE_STEP_KEY = "hostRegistrationStep";
const STORAGE_FULL_STEP_KEY = "hostRegistrationFullStep";

export default function HostRegister() {
  // Initialize state from localStorage
  const [step, setStep] = useState<"initial" | "full" | "success">(() => {
    if (typeof window === "undefined") return "initial";
    const saved = localStorage.getItem(STORAGE_STEP_KEY);
    return (saved as "initial" | "full" | "success") || "initial";
  });

  const [currentFullStep, setCurrentFullStep] = useState(() => {
    if (typeof window === "undefined") return 1;
    const saved = localStorage.getItem(STORAGE_FULL_STEP_KEY);
    return saved ? parseInt(saved) : 1;
  });

  const [data, setData] = useState<Partial<RegistrationData>>(() => {
    if (typeof window === "undefined") {
      return {
        foodPhotoUrls: [],
        activities: [],
        householdFeatures: [],
        availability: {} as Record<string, ("lunch" | "dinner")[]>,
        maxGuests: 4,
        pricePerPerson: 150,
      };
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved data:", e);
      }
    }
    return {
      foodPhotoUrls: [],
      activities: [],
      householdFeatures: [],
      availability: {} as Record<string, ("lunch" | "dinner")[]>,
      maxGuests: 4,
      pricePerPerson: 150,
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // Auto-save form data to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Auto-save step to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_STEP_KEY, step);
  }, [step]);

  // Auto-save full step to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_FULL_STEP_KEY, currentFullStep.toString());
  }, [currentFullStep]);

  const uploadImageMutation = trpc.upload.image.useMutation({
    onError: (error: any) => {
      toast.error(error.message || "Failed to upload image");
      setIsUploading(false);
    },
  });

  const submitMutation = trpc.host.submit.useMutation({
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit profile");
    },
  });

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name?.trim() || !data.email?.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setStep("full");
  };

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    try {
      const urls = await handleFileUpload(files, (progress: number) => setUploadProgress({ profile: progress }));
      if (urls.length > 0) {
        setData({ ...data, profilePhotoUrl: urls[0] });
        toast.success("Profile photo uploaded!");
      }
    } catch (error) {
      toast.error("Failed to upload profile photo");
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const handleFoodPhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    try {
      const urls = await handleFileUpload(files, (progress: number) => setUploadProgress({ food: progress }));
      if (urls.length > 0) {
        setData({ ...data, foodPhotoUrls: [...(data.foodPhotoUrls || []), ...urls] });
        toast.success(`${urls.length} photo(s) uploaded!`);
      }
    } catch (error) {
      toast.error("Failed to upload food photos");
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const handleNextStep = () => {
    // Validate current step
    if (currentFullStep === 1) {
      if (!data.cuisineStyle?.trim() || !data.menuDescription?.trim() || !data.foodPhotoUrls?.length) {
        toast.error("Please complete all required fields");
        return;
      }
    }
    if (currentFullStep === 2) {
      if (!data.bio?.trim() || !data.profilePhotoUrl?.trim()) {
        toast.error("Please complete all required fields");
        return;
      }
    }
    if (currentFullStep === 3) {
      if (!data.availability || Object.keys(data.availability).length === 0) {
        toast.error("Please select at least one day and meal time");
        return;
      }
    }
    if (currentFullStep < 5) {
      setCurrentFullStep(currentFullStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentFullStep > 1) {
      setCurrentFullStep(currentFullStep - 1);
    }
  };

  const handleSubmitProfile = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Validate all required fields
    if (!data.name?.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!data.district) {
      toast.error("Please select your district");
      return;
    }
    if (!data.email?.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!data.cuisineStyle?.trim()) {
      toast.error("Please describe your cuisine style");
      return;
    }
    if (!data.menuDescription?.trim()) {
      toast.error("Please describe your menu");
      return;
    }
    if (!data.foodPhotoUrls || data.foodPhotoUrls.length < 3) {
      toast.error("Please upload at least 3 food photos");
      return;
    }
    if (!data.bio?.trim()) {
      toast.error("Please write about yourself");
      return;
    }
    if (!data.profilePhotoUrl?.trim()) {
      toast.error("Profile photo is required");
      return;
    }
    if (!data.availability || Object.keys(data.availability).length === 0) {
      toast.error("Please select at least one day and meal time");
      return;
    }
    if (!data.pricePerPerson || data.pricePerPerson < 1) {
      toast.error("Please enter a valid price");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitMutation.mutateAsync({
        name: data.name.trim(),
        district: data.district,
        email: data.email.trim(),
        cuisineStyle: data.cuisineStyle.trim(),
        menuDescription: data.menuDescription.trim(),
        foodPhotoUrls: data.foodPhotoUrls,
        dietaryNote: data.dietaryNote || undefined,
        bio: data.bio.trim(),
        profilePhotoUrl: data.profilePhotoUrl,
        activities: data.activities || [],
        availability: (data.availability || {}) as Record<string, ("lunch" | "dinner")[]>,
        maxGuests: data.maxGuests || 4,
        pricePerPerson: data.pricePerPerson,
        otherNotes: data.otherNotes || undefined,
        householdFeatures: data.householdFeatures || [],
        otherHouseholdInfo: data.otherHouseholdInfo || undefined,
      });

      if (result.success) {
        // Clear localStorage after successful submission
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(STORAGE_STEP_KEY);
          localStorage.removeItem(STORAGE_FULL_STEP_KEY);
        }
        // Show success page instead of resetting
        setStep("success");
      } else {
        toast.error("Failed to submit profile. Please try again.");
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error?.message || "Failed to submit profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  if (step === "initial") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <ChopsticksLogo className="w-12 h-12 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Become a Host</h1>
            <p className="text-gray-600">Share your home and culinary traditions with travelers</p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardContent className="pt-8">
              <form onSubmit={handleInitialSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-base font-semibold text-gray-700">Your Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Grace Tong"
                    value={data.name || ""}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    className="mt-2 h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-base font-semibold text-gray-700">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={data.email || ""}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    className="mt-2 h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="district" className="text-base font-semibold text-gray-700">District *</Label>
                  <select
                    id="district"
                    value={data.district || ""}
                    onChange={(e) => setData({ ...data, district: e.target.value })}
                    className="w-full mt-2 h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select your district</option>
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 text-lg text-white font-semibold hover:opacity-90"
                  style={{ backgroundColor: "var(--warm-burgundy)" }}
                >
                  Next <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to the Family!</h1>
            <p className="text-xl text-gray-600 mb-8">Your host profile has been submitted successfully.</p>
          </div>

          <Card className="border-0 shadow-lg mb-8">
            <CardContent className="pt-8 pb-8">
              <div className="space-y-6 text-left">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                  <p className="text-blue-800 text-sm mb-3">Our team is reviewing your application to ensure the best experience for both you and our guests.</p>
                  <p className="text-blue-800 text-sm font-semibold">⏱️ Approval Timeline: 3-5 business days</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-sm font-bold text-white" style={{ backgroundColor: "var(--warm-burgundy)" }}>
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Profile Review</h4>
                      <p className="text-gray-600 text-sm">We'll carefully review your profile, photos, and availability to ensure quality standards.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-sm font-bold text-white" style={{ backgroundColor: "var(--warm-burgundy)" }}>
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Approval Notification</h4>
                      <p className="text-gray-600 text-sm">Once approved, you'll receive an email confirmation and can start accepting bookings.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-sm font-bold text-white" style={{ backgroundColor: "var(--warm-burgundy)" }}>
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Start Hosting</h4>
                      <p className="text-gray-600 text-sm">Welcome your first guests and share your culinary traditions with travelers from around the world!</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
            <p className="text-amber-900 text-sm">
              <strong>💡 Tip:</strong> Check your email regularly for our approval notification. If you have any questions in the meantime, feel free to reach out to us.
            </p>
          </div>

          <Button
            onClick={() => {
              setStep("initial");
              setCurrentFullStep(1);
              setData({
                name: "",
                email: "",
                district: "",
                foodPhotoUrls: [],
                activities: [],
                householdFeatures: [],
                availability: {} as Record<string, ("lunch" | "dinner")[]>,
                maxGuests: 4,
                pricePerPerson: 150,
              });
            }}
            className="h-14 text-lg font-semibold px-8 text-white hover:opacity-90"
            style={{ backgroundColor: "var(--warm-burgundy)" }}
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4">
      <main className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <div className="flex justify-between items-center mb-6">
            {REGISTRATION_STEPS.map((s) => (
              <div key={s.id} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm mb-2 ${
                    currentFullStep >= s.id
                      ? "text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                  style={{
                    backgroundColor: currentFullStep >= s.id ? "var(--warm-burgundy)" : undefined,
                  }}
                >
                  {s.id}
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-900">{s.title}</div>
                  <div className="text-xs text-gray-500">{s.description}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="h-1 bg-gray-200 rounded-full">
            <div
              className="h-1 rounded-full transition-all"
              style={{
                width: `${(currentFullStep / 5) * 100}%`,
                backgroundColor: "var(--warm-burgundy)",
              }}
            />
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="pt-8">
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); }}>
              {currentFullStep === 1 && (
                <>
                  <div>
                    <Label className="text-lg font-medium">Cuisine Style *</Label>
                    <Input
                      type="text"
                      placeholder="e.g., Shanghai home cooking"
                      value={data.cuisineStyle || ""}
                      onChange={(e) => setData({ ...data, cuisineStyle: e.target.value })}
                      className="mt-2 h-12"
                    />
                  </div>

                  <div>
                    <Label className="text-lg font-medium">Menu Description *</Label>
                    <textarea
                      placeholder="Describe the dishes you typically prepare..."
                      value={data.menuDescription || ""}
                      onChange={(e) => setData({ ...data, menuDescription: e.target.value })}
                      className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label className="text-lg font-medium">Food Photos (minimum 3) *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mt-2">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFoodPhotosUpload}
                        disabled={isUploading}
                        className="hidden"
                        id="food-photos"
                      />
                      <label htmlFor="food-photos" className="cursor-pointer block">
                        <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <p className="text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500">PNG, JPG up to 10MB each</p>
                      </label>
                    </div>
                    {data.foodPhotoUrls && data.foodPhotoUrls.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Uploaded: {data.foodPhotoUrls.length} photo(s)</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-lg font-medium">Maximum Guests *</Label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={data.maxGuests || 4}
                      onChange={(e) => setData({ ...data, maxGuests: parseInt(e.target.value) })}
                      className="mt-2 h-12"
                    />
                  </div>
                </>
              )}

              {currentFullStep === 2 && (
                <>
                  <div>
                    <Label className="text-lg font-medium">Profile Photo (Selfie) *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePhotoUpload}
                        disabled={isUploading}
                        className="hidden"
                        id="profile-photo"
                      />
                      <label htmlFor="profile-photo" className="cursor-pointer block">
                        <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <p className="text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                      </label>
                    </div>
                    {data.profilePhotoUrl && (
                      <p className="mt-2 text-sm text-green-600">✓ Photo uploaded</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-lg font-medium">About You (Bio) *</Label>
                    <textarea
                      placeholder="Tell us about yourself, your family, and what makes your home special..."
                      value={data.bio || ""}
                      onChange={(e) => setData({ ...data, bio: e.target.value })}
                      className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label className="text-lg font-medium">Activities You Can Offer</Label>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {ACTIVITY_OPTIONS.map((activity) => (
                        <label key={activity.id} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={(data.activities || []).includes(activity.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setData({
                                  ...data,
                                  activities: [...(data.activities || []), activity.id],
                                });
                              } else {
                                setData({
                                  ...data,
                                  activities: (data.activities || []).filter(a => a !== activity.id),
                                });
                              }
                            }}
                          />
                          <span className="text-sm">{activity.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {currentFullStep === 3 && (
                <>
                  <div>
                    <Label className="text-lg font-medium">When Can You Host? *</Label>
                    <p className="text-sm text-gray-600 mt-2 mb-4">Select the days and meal times you're available</p>
                    <div className="space-y-3">
                      {DAYS_OF_WEEK.map((day) => (
                        <div key={day} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                          <label className="flex items-center gap-2 flex-1 cursor-pointer">
                            <Checkbox
                              checked={!!data.availability?.[day]}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setData({
                                    ...data,
                                    availability: {
                                      ...data.availability,
                                      [day]: ["lunch", "dinner"],
                                    },
                                  });
                                } else {
                                  const newAvail = { ...data.availability };
                                  delete newAvail[day];
                                  setData({ ...data, availability: newAvail });
                                }
                              }}
                            />
                            <span className="capitalize font-semibold text-gray-700">{day}</span>
                          </label>
                          {data.availability?.[day] && (
                            <div className="flex gap-2">
                              {["lunch", "dinner"].map((meal) => (
                                <label key={meal} className="flex items-center gap-1 cursor-pointer">
                                  <Checkbox
                                    checked={data.availability?.[day]?.includes(meal as "lunch" | "dinner") || false}
                                    onCheckedChange={(checked) => {
                                      const current = data.availability?.[day] || [];
                                      if (checked) {
                                        setData({
                                          ...data,
                                          availability: {
                                            ...data.availability,
                                            [day]: [...current, meal as "lunch" | "dinner"],
                                          },
                                        });
                                      } else {
                                        setData({
                                          ...data,
                                          availability: {
                                            ...data.availability,
                                            [day]: current.filter(m => m !== meal),
                                          },
                                        });
                                      }
                                    }}
                                  />
                                  <span className="text-xs capitalize">{meal}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {currentFullStep === 4 && (
                <>
                  <div>
                    <Label className="text-lg font-medium">Price Per Person (¥) *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={data.pricePerPerson ?? ""}
                      onChange={(e) => setData({ ...data, pricePerPerson: e.target.value ? parseInt(e.target.value) : undefined })}
                      placeholder="150"
                      className="mt-2 h-12"
                    />
                  </div>

                  <div>
                    <Label className="text-lg font-medium">Additional Notes</Label>
                    <textarea
                      placeholder="Any other information guests should know..."
                      value={data.otherNotes || ""}
                      onChange={(e) => setData({ ...data, otherNotes: e.target.value })}
                      className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label className="text-lg font-medium">Dietary Restrictions & Allergies</Label>
                    <textarea
                      placeholder="e.g., Can accommodate vegetarian, vegan, gluten-free..."
                      value={data.dietaryNote || ""}
                      onChange={(e) => setData({ ...data, dietaryNote: e.target.value })}
                      className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {currentFullStep === 5 && (
                <>
                  <div>
                    <Label className="text-lg font-medium">Household Features</Label>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {HOUSEHOLD_FEATURES.map((feature) => (
                        <label key={feature.id} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={(data.householdFeatures || []).includes(feature.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setData({
                                  ...data,
                                  householdFeatures: [...(data.householdFeatures || []), feature.id],
                                });
                              } else {
                                setData({
                                  ...data,
                                  householdFeatures: (data.householdFeatures || []).filter(f => f !== feature.id),
                                });
                              }
                            }}
                          />
                          <span className="text-sm">{feature.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-lg font-medium">Other Household Information</Label>
                    <textarea
                      placeholder="Any additional information about your household..."
                      value={data.otherHouseholdInfo || ""}
                      onChange={(e) => setData({ ...data, otherHouseholdInfo: e.target.value })}
                      className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-6">
                {currentFullStep > 1 && (
                  <Button
                    type="button"
                    onClick={handlePreviousStep}
                    variant="outline"
                    className="flex-1 h-14 text-lg font-semibold"
                  >
                    Previous
                  </Button>
                )}
                {currentFullStep < 5 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 h-14 text-lg text-white hover:opacity-90 font-semibold"
                    style={{ backgroundColor: "var(--warm-burgundy)" }}
                  >
                    Next <ArrowRight className="w-5 h-5" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    onClick={handleSubmitProfile}
                    className="flex-1 h-14 text-lg text-white hover:opacity-90 font-semibold"
                    style={{ backgroundColor: "var(--warm-burgundy)" }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Profile"}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
