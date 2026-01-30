import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ChopsticksLogo } from "@/components/ChopsticksLogo";
import { MenuFormatter } from "@/components/MenuFormatter";
import { ArrowRight, Check, Upload, X, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

interface RegistrationData {
  name: string;
  email: string;
  district: string;
  cuisineStyle: string;
  menuDescription: string;
  foodPhotoUrls: string[];
  bio: string;
  profilePhotoUrl: string;
  activities: string[];
  availability: Record<string, ("lunch" | "dinner")[]>;
  maxGuests: number;
  pricePerPerson: number;
  otherNotes: string;
  householdFeatures: string[];
  otherHouseholdInfo: string;
  dietaryNote: string;
}

const INITIAL_DATA: RegistrationData = {
  name: "",
  email: "",
  district: "",
  cuisineStyle: "",
  menuDescription: "",
  foodPhotoUrls: [],
  bio: "",
  profilePhotoUrl: "",
  activities: [],
  availability: {},
  maxGuests: 4,
  pricePerPerson: 150,
  otherNotes: "",
  householdFeatures: [],
  otherHouseholdInfo: "",
  dietaryNote: "",
};

const STEPS = [
  { id: 1, title: "Cuisine & Dishes", description: "What do you cook?" },
  { id: 2, title: "Self Intro", description: "Tell us about you" },
  { id: 3, title: "Availability", description: "When can you host?" },
  { id: 4, title: "Pricing & Notes", description: "Set your rates" },
  { id: 5, title: "Household Info", description: "Home details" },
];

const DISTRICTS = [
  "Huangpu", "Xuhui", "Changning", "Jing'an", "Putuo", "Hongkou", "Yangpu",
  "Minhang", "Pudong", "Songjiang", "Jiading", "Baoshan", "Jinshan", "Fengxian", "Chongming"
];

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const HOUSEHOLD_FEATURES = [
  { id: "has-pets", label: "We have pets" },
  { id: "has-stairs", label: "We have stairs" },
  { id: "kids-present", label: "We have kids" },
  { id: "elderly-present", label: "We have elderly" },
  { id: "large-space", label: "Large space" },
  { id: "garden", label: "We have a garden" },
];

const ACTIVITIES = [
  { id: "cooking-class", label: "Cooking class" },
  { id: "market-visit", label: "Market visit" },
  { id: "park-visit", label: "Park visit" },
  { id: "cultural-tour", label: "Cultural tour" },
];

const STORAGE_KEY = "hostRegistrationData_v2";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function compressAndUploadImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        } else if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context failed"));
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(async (blob) => {
          if (!blob) return reject(new Error("Compression failed"));
          
          const formData = new FormData();
          formData.append("file", blob, file.name);
          
          try {
            const response = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });
            if (!response.ok) throw new Error("Upload failed");
            const data = await response.json();
            resolve(data.url);
          } catch (err) {
            reject(err);
          }
        }, "image/jpeg", 0.8);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HostRegister() {
  // State
  const [phase, setPhase] = useState<"initial" | "form" | "success">("initial");
  const [step, setStep] = useState(1);
  const [data, setData] = useState<RegistrationData>(() => {
    if (typeof window === "undefined") return INITIAL_DATA;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...INITIAL_DATA, ...JSON.parse(saved) } : INITIAL_DATA;
    } catch {
      return INITIAL_DATA;
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showMenuFormatter, setShowMenuFormatter] = useState(false);
  const [generatedTitle, setGeneratedTitle] = useState<string | null>(null);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

  // Auto-save to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

  // tRPC mutations
  const submitMutation = trpc.host.submit.useMutation();
  const summarizeTitleMutation = trpc.host.summarizeTitle.useMutation();

  // Generate AI title
  const handleGenerateTitle = async () => {
    if (!data.cuisineStyle || !data.menuDescription) {
      toast.error("Please fill in cuisine style and menu description first");
      return;
    }
    
    setIsGeneratingTitle(true);
    try {
      const result = await summarizeTitleMutation.mutateAsync({
        cuisineStyle: data.cuisineStyle,
        menuDescription: data.menuDescription,
        activities: data.activities,
      });
      setGeneratedTitle(result.title);
      toast.success("Title generated!");
    } catch (error) {
      toast.error("Failed to generate title");
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  // Update a single field
  const updateField = <K extends keyof RegistrationData>(key: K, value: RegistrationData[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  // Handle image upload
  const handleImageUpload = async (files: FileList | null, field: "profilePhotoUrl" | "foodPhotoUrls") => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < Math.min(files.length, field === "foodPhotoUrls" ? 6 : 1); i++) {
        const url = await compressAndUploadImage(files[i]);
        urls.push(url);
      }
      
      if (field === "profilePhotoUrl") {
        updateField("profilePhotoUrl", urls[0]);
      } else {
        updateField("foodPhotoUrls", [...data.foodPhotoUrls, ...urls]);
      }
      toast.success("Image uploaded!");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate required fields
    if (!data.name || !data.email || !data.district) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!data.cuisineStyle || !data.menuDescription) {
      toast.error("Please complete cuisine information");
      return;
    }
    if (data.foodPhotoUrls.length < 3) {
      toast.error("Please upload at least 3 food photos");
      return;
    }
    if (!data.bio || !data.profilePhotoUrl) {
      toast.error("Please complete your profile");
      return;
    }
    if (Object.keys(data.availability).length === 0) {
      toast.error("Please select your availability");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await submitMutation.mutateAsync({
        name: data.name,
        email: data.email,
        district: data.district,
        cuisineStyle: data.cuisineStyle,
        menuDescription: data.menuDescription,
        foodPhotoUrls: data.foodPhotoUrls,
        dietaryNote: data.dietaryNote || undefined,
        bio: data.bio,
        profilePhotoUrl: data.profilePhotoUrl,
        activities: data.activities,
        availability: data.availability,
        maxGuests: data.maxGuests,
        pricePerPerson: data.pricePerPerson,
        otherNotes: data.otherNotes || undefined,
        otherHouseholdInfo: data.otherHouseholdInfo || undefined,
      });

      if (result.success) {
        // Clear saved data
        localStorage.removeItem(STORAGE_KEY);
        // Show success page
        setPhase("success");
      } else {
        toast.error("Submission failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error?.message || "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle availability
  const toggleAvailability = (day: string, meal: "lunch" | "dinner") => {
    const current = data.availability[day] || [];
    const updated = current.includes(meal)
      ? current.filter(m => m !== meal)
      : [...current, meal];
    
    const newAvailability = { ...data.availability };
    if (updated.length === 0) {
      delete newAvailability[day];
    } else {
      newAvailability[day] = updated as ("lunch" | "dinner")[];
    }
    updateField("availability", newAvailability);
  };

  // Toggle array item
  const toggleArrayItem = (field: "activities" | "householdFeatures", item: string) => {
    const current = data[field];
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    updateField(field, updated);
  };

  // ============================================================================
  // RENDER: SUCCESS PAGE
  // ============================================================================
  
  if (phase === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to the Family!</h1>
            <p className="text-xl text-gray-600 mb-8">Your host profile has been submitted successfully.</p>
          </div>

          <Card className="border-0 shadow-lg mb-8">
            <CardContent className="pt-8 pb-8">
              <div className="space-y-6 text-left">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                  <p className="text-blue-800 text-sm mb-3">
                    Our team is reviewing your application to ensure the best experience for both you and our guests.
                  </p>
                  <p className="text-blue-800 text-sm font-semibold">⏱️ Approval Timeline: 3-5 business days</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-sm font-bold text-white bg-[#8B2635]">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Profile Review</h4>
                      <p className="text-gray-600 text-sm">We'll carefully review your profile, photos, and availability.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-sm font-bold text-white bg-[#8B2635]">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Approval Notification</h4>
                      <p className="text-gray-600 text-sm">Once approved, you'll receive an email confirmation.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-sm font-bold text-white bg-[#8B2635]">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Start Hosting</h4>
                      <p className="text-gray-600 text-sm">Welcome your first guests and share your culinary traditions!</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Link href="/">
            <Button className="h-14 text-lg font-semibold px-8 text-white hover:opacity-90 bg-[#8B2635]">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: INITIAL ENTRY PAGE
  // ============================================================================
  
  if (phase === "initial") {
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
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold text-gray-700">Your Name *</Label>
                  <Input
                    type="text"
                    placeholder="Grace Tong"
                    value={data.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="mt-2 h-12"
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold text-gray-700">Email *</Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={data.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="mt-2 h-12"
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold text-gray-700">District *</Label>
                  <select
                    value={data.district}
                    onChange={(e) => updateField("district", e.target.value)}
                    className="w-full mt-2 h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select your district</option>
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <Button
                  type="button"
                  onClick={() => {
                    if (!data.name || !data.email || !data.district) {
                      toast.error("Please fill in all fields");
                      return;
                    }
                    setPhase("form");
                  }}
                  className="w-full h-14 text-lg text-white font-semibold hover:opacity-90 bg-[#8B2635]"
                >
                  Next <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: MULTI-STEP FORM
  // ============================================================================
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4">
      <main className="max-w-2xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <div className="flex justify-between items-center mb-6">
            {STEPS.map((s) => (
              <div key={s.id} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm mb-2 ${
                    step >= s.id ? "text-white bg-[#8B2635]" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {s.id}
                </div>
                <div className="text-center hidden sm:block">
                  <div className="text-sm font-semibold text-gray-900">{s.title}</div>
                  <div className="text-xs text-gray-500">{s.description}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="h-1 bg-gray-200 rounded-full">
            <div
              className="h-1 rounded-full transition-all bg-[#8B2635]"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="pt-8">
            {/* Step 1: Cuisine & Dishes */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-medium">Cuisine Style *</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Shanghai home cooking"
                    value={data.cuisineStyle}
                    onChange={(e) => updateField("cuisineStyle", e.target.value)}
                    className="mt-2 h-12"
                  />
                </div>

                <div>
                  <Label className="text-lg font-medium">Menu Description *</Label>
                  <div className="mt-2 space-y-3">
                    {!showMenuFormatter ? (
                      <div className="space-y-2">
                        <textarea
                          placeholder="Describe the dishes you typically prepare..."
                          value={data.menuDescription}
                          onChange={(e) => updateField("menuDescription", e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          rows={4}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowMenuFormatter(true)}
                          className="w-full"
                        >
                          Use Structured Menu Builder
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <MenuFormatter
                          value={[]}
                          onChange={(sections) => {
                            const formatted = sections
                              .map((s) => {
                                const items = s.items
                                  .map((item) => `• ${item.name}${item.description ? ` - ${item.description}` : ""}`)
                                  .join("\n");
                                return `${s.title}\n${items}`;
                              })
                              .join("\n\n");
                            updateField("menuDescription", formatted);
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowMenuFormatter(false)}
                          className="w-full"
                        >
                          Back to Text Editor
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-medium">AI Title Generator (Optional)</Label>
                  <p className="text-sm text-gray-500 mt-1 mb-3">Generate a compelling title for your listing based on your cuisine and menu</p>
                  <Button
                    type="button"
                    onClick={handleGenerateTitle}
                    disabled={isGeneratingTitle || !data.cuisineStyle || !data.menuDescription}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isGeneratingTitle ? "Generating..." : "Generate Title"}
                  </Button>
                  {generatedTitle && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">Generated Title:</p>
                      <p className="text-base text-blue-800 mt-1 whitespace-pre-wrap">{generatedTitle}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          updateField("menuDescription", generatedTitle);
                          setGeneratedTitle(null);
                          toast.success("Title added to menu description!");
                        }}
                        className="mt-2 text-blue-600 hover:text-blue-700"
                      >
                        Use This Title
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-lg font-medium">Food Photos (minimum 3) *</Label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {data.foodPhotoUrls.map((url, i) => (
                      <div key={i} className="relative aspect-square">
                        <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => updateField("foodPhotoUrls", data.foodPhotoUrls.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {data.foodPhotoUrls.length < 6 && (
                      <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-xs text-gray-500 mt-1">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleImageUpload(e.target.files, "foodPhotoUrls")}
                          disabled={isUploading}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-medium">Maximum Guests</Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={data.maxGuests}
                    onChange={(e) => updateField("maxGuests", parseInt(e.target.value) || 4)}
                    className="mt-2 h-12 w-24"
                  />
                </div>

                <div>
                  <Label className="text-lg font-medium">Dietary Accommodations</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Can accommodate vegetarian, halal..."
                    value={data.dietaryNote}
                    onChange={(e) => updateField("dietaryNote", e.target.value)}
                    className="mt-2 h-12"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Self Intro */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-medium">About You *</Label>
                  <textarea
                    placeholder="Tell guests about yourself, your cooking journey, and what makes your home special..."
                    value={data.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={5}
                  />
                </div>

                <div>
                  <Label className="text-lg font-medium">Profile Photo *</Label>
                  <div className="mt-2">
                    {data.profilePhotoUrl ? (
                      <div className="relative w-32 h-32">
                        <img src={data.profilePhotoUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => updateField("profilePhotoUrl", "")}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-xs text-gray-500 mt-1">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e.target.files, "profilePhotoUrl")}
                          disabled={isUploading}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-medium">Activities You Can Offer</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {ACTIVITIES.map((activity) => (
                      <label key={activity.id} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <Checkbox
                          checked={data.activities.includes(activity.id)}
                          onCheckedChange={() => toggleArrayItem("activities", activity.id)}
                        />
                        <span className="text-sm">{activity.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Availability */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-medium">When can you host? *</Label>
                  <p className="text-sm text-gray-500 mb-4">Select the days and meals you're available</p>
                  <div className="space-y-2">
                    {DAYS.map((day) => (
                      <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
                        <span className="w-24 font-medium capitalize">{day}</span>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={(data.availability[day] || []).includes("lunch")}
                            onCheckedChange={() => toggleAvailability(day, "lunch")}
                          />
                          <span className="text-sm">Lunch</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={(data.availability[day] || []).includes("dinner")}
                            onCheckedChange={() => toggleAvailability(day, "dinner")}
                          />
                          <span className="text-sm">Dinner</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Pricing & Notes */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-medium">Price per Person (¥) *</Label>
                  <Input
                    type="number"
                    min={50}
                    max={1000}
                    value={data.pricePerPerson}
                    onChange={(e) => updateField("pricePerPerson", parseInt(e.target.value) || 150)}
                    className="mt-2 h-12 w-32"
                  />
                  <p className="text-sm text-gray-500 mt-1">Recommended: ¥120-200 per person</p>
                </div>

                <div>
                  <Label className="text-lg font-medium">Additional Notes</Label>
                  <textarea
                    placeholder="Any other information guests should know..."
                    value={data.otherNotes}
                    onChange={(e) => updateField("otherNotes", e.target.value)}
                    className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Step 5: Household Info */}
            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-medium">Household Features</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {HOUSEHOLD_FEATURES.map((feature) => (
                      <label key={feature.id} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <Checkbox
                          checked={data.householdFeatures.includes(feature.id)}
                          onCheckedChange={() => toggleArrayItem("householdFeatures", feature.id)}
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
                    value={data.otherHouseholdInfo}
                    onChange={(e) => updateField("otherHouseholdInfo", e.target.value)}
                    className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-6">
              {step > 1 && (
                <Button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  variant="outline"
                  className="flex-1 h-14 text-lg font-semibold"
                >
                  Previous
                </Button>
              )}
              {step < 5 ? (
                <Button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="flex-1 h-14 text-lg text-white hover:opacity-90 font-semibold bg-[#8B2635]"
                >
                  Next <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 h-14 text-lg text-white hover:opacity-90 font-semibold bg-[#8B2635]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Profile"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
