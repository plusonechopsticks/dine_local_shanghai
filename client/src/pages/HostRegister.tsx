import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ChopsticksLogo } from "@/components/ChopsticksLogo";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Sparkles, Heart, Users, Upload, ArrowRight, Check, Loader2, User } from "lucide-react";

const SHANGHAI_DISTRICTS = [
  "Huangpu", "Xuhui", "Changning", "Jing'an", "Putuo", "Hongkou",
  "Yangpu", "Minhang", "Baoshan", "Jiading", "Pudong", "Jinshan",
  "Songjiang", "Qingpu", "Fengxian", "Chongming"
];

const ACTIVITY_OPTIONS = [
  { id: "cooking-class", label: "Cooking Class" },
  { id: "park-visit", label: "Park Visit" },
  { id: "shopping", label: "Shopping" },
  { id: "museum", label: "Museum Tour" },
  { id: "temple", label: "Temple Visit" },
  { id: "market", label: "Local Market Tour" },
  { id: "traditional-craft", label: "Traditional Craft" },
];

const REGISTRATION_STEPS = [
  { id: 1, title: "Contact", description: "Name, district, email" },
  { id: 2, title: "Cuisine", description: "Dishes & dietary info" },
  { id: 3, title: "About You", description: "Bio & activities" },
  { id: 4, title: "Availability", description: "Days & meals" },
  { id: 5, title: "Pricing", description: "Price & notes" },
];

interface RegistrationData {
  // Step 1
  name: string;
  district: string;
  email: string;
  // Step 2
  cuisineStyle: string;
  menuDescription: string;
  foodPhotoUrls: string[];
  dietaryNote: string;
  // Step 3
  bio: string;
  profilePhotoUrl: string;
  activities: string[];
  // Step 4
  availability: Record<string, string[]>;
  maxGuests: number;
  // Step 5
  pricePerPerson: number;
  otherNotes: string;
}

export default function HostRegister() {
  const [step, setStep] = useState<"interest" | "full">("interest");
  const [currentFullStep, setCurrentFullStep] = useState(1);
  const [data, setData] = useState<Partial<RegistrationData>>({
    foodPhotoUrls: [],
    activities: [],
    availability: {},
    maxGuests: 2,
    pricePerPerson: 100,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const submitInterestMutation = trpc.hostInterest.submit.useMutation({
    onSuccess: () => {
      toast.success("Thank you! Ready to complete your full profile?");
      setStep("full");
      setCurrentFullStep(1);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit. Please try again.");
      setIsSubmitting(false);
    },
  });

  const uploadImageMutation = trpc.upload.image.useMutation({
    onError: (error: any) => {
      toast.error(error.message || "Failed to upload image");
      setIsUploading(false);
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isProfilePhoto: boolean = false) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large (max 10MB)`);
          continue;
        }

        // Convert to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
        });

        const base64 = await base64Promise;
        const url = await uploadImageMutation.mutateAsync({
          base64Data: base64,
          fileName: file.name,
          contentType: file.type,
        });
        uploadedUrls.push(url.url);
      }

      if (uploadedUrls.length > 0) {
        if (isProfilePhoto) {
          setData({ ...data, profilePhotoUrl: uploadedUrls[0] });
          toast.success("Photo uploaded!");
        } else {
          setData({ 
            ...data, 
            foodPhotoUrls: [...(data.foodPhotoUrls || []), ...uploadedUrls]
          });
          toast.success(`${uploadedUrls.length} photo(s) uploaded!`);
        }
      }
    } catch (error) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleInterestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    setIsSubmitting(true);
    await submitInterestMutation.mutateAsync({
      name: data.name.trim(),
      district: data.district,
      contact: data.email.trim(),
    });
  };

  const handleFullStepNext = () => {
    // Basic validation per step
    if (currentFullStep === 1) {
      if (!data.name?.trim() || !data.district || !data.email?.trim()) {
        toast.error("Please fill all fields");
        return;
      }
    } else if (currentFullStep === 2) {
      if (!data.cuisineStyle?.trim() || !data.menuDescription?.trim() || (data.foodPhotoUrls?.length || 0) < 3) {
        toast.error("Please add cuisine, description, and at least 3 photos");
        return;
      }
    } else if (currentFullStep === 3) {
      if (!data.bio?.trim()) {
        toast.error("Please write a bio");
        return;
      }
    } else if (currentFullStep === 4) {
      if (Object.keys(data.availability || {}).length === 0) {
        toast.error("Please select at least one day/meal combo");
        return;
      }
    }
    
    if (currentFullStep < REGISTRATION_STEPS.length) {
      setCurrentFullStep(currentFullStep + 1);
    }
  };

  const handleFullStepPrev = () => {
    if (currentFullStep > 1) {
      setCurrentFullStep(currentFullStep - 1);
    }
  };

  const progressPercentage = (currentFullStep / REGISTRATION_STEPS.length) * 100;

  // Step 1: Quick Interest
  if (step === "interest") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/">
              <a className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <ChopsticksLogo className="w-8 h-8 text-primary" />
                <span className="font-serif text-xl font-bold text-foreground">
                  +1 Chopsticks
                </span>
              </a>
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 md:py-12 max-w-2xl">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4 md:mb-6">
              <Sparkles className="w-4 h-4" />
              We are looking for inaugural batch hosts!
            </div>
            
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-2 md:mb-4">
              Become a Host
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8">
              Share your culture, meet amazing travelers, and earn income by hosting authentic home dinners
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
              <Card className="border-primary/20">
                <CardContent className="pt-6 text-center">
                  <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Share Culture</h3>
                  <p className="text-sm text-muted-foreground">Introduce travelers to authentic home cooking</p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="pt-6 text-center">
                  <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Meet Friends</h3>
                  <p className="text-sm text-muted-foreground">Connect with people from around the world</p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="pt-6 text-center">
                  <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Earn Income</h3>
                  <p className="text-sm text-muted-foreground">Get paid for sharing your hospitality</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="border-primary/20 shadow-lg">
            <CardContent className="pt-8 pb-8">
              <form onSubmit={handleInterestSubmit} className="space-y-6 md:space-y-8">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base md:text-lg font-medium text-foreground">
                    What's your name? *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={data.name || ""}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    placeholder="Your name"
                    className="h-12 text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district" className="text-base md:text-lg font-medium text-foreground">
                    Which district in Shanghai? *
                  </Label>
                  <Select value={data.district || ""} onValueChange={(value) => setData({ ...data, district: value })} required>
                    <SelectTrigger id="district" className="h-12 text-base">
                      <SelectValue placeholder="Select your district" />
                    </SelectTrigger>
                    <SelectContent>
                      {SHANGHAI_DISTRICTS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base md:text-lg font-medium text-foreground">
                    Your email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email || ""}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    placeholder="your@email.com"
                    className="h-12 text-base"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    We'll use this to contact you about your application
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 text-base font-bold text-white rounded-lg shadow-md transition-all disabled:opacity-50 mt-6 hover:opacity-90"
                  style={{ backgroundColor: "var(--warm-burgundy)" }}
                >
                  {isSubmitting ? "Submitting..." : "Continue to Full Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              By submitting, you agree to be contacted about the +1 Chopsticks pilot program.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Step 2: Full Registration (5 steps)
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ChopsticksLogo className="w-8 h-8 text-primary" />
              <span className="font-serif text-xl font-bold text-foreground">
                +1 Chopsticks
              </span>
            </a>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Progress */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
                Complete Your Profile
              </h1>
              <p className="text-muted-foreground">
                Step {currentFullStep} of {REGISTRATION_STEPS.length}: {REGISTRATION_STEPS[currentFullStep - 1]?.title}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {Math.round(progressPercentage)}%
              </div>
              <p className="text-sm text-muted-foreground">Complete</p>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="grid grid-cols-5 gap-2 mt-8">
            {REGISTRATION_STEPS.map((s) => (
              <div
                key={s.id}
                className={`text-center p-2 rounded-lg transition-all min-w-0 ${
                  s.id === currentFullStep
                    ? "bg-primary/10 border-2 border-primary"
                    : s.id < currentFullStep
                    ? "bg-primary/5 border-2 border-primary/30"
                    : "bg-gray-100 border-2 border-gray-300"
                }`}
              >
                <div className="font-bold text-xs mb-0.5">{s.id}</div>
                <div className="text-xs text-gray-700 truncate">{s.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <Card className="border-primary/20 shadow-lg">
          <CardContent className="pt-8 pb-8">
            {/* Step 1: Contact */}
            {currentFullStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">Your Contact Details</h2>
                
                <div className="space-y-3">
                  <Label className="text-lg font-medium">Name *</Label>
                  <Input
                    value={data.name || ""}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    placeholder="Your full name"
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-lg font-medium">District *</Label>
                  <Select value={data.district || ""} onValueChange={(value) => setData({ ...data, district: value })}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select your district" />
                    </SelectTrigger>
                    <SelectContent>
                      {SHANGHAI_DISTRICTS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-lg font-medium">Email *</Label>
                  <Input
                    type="email"
                    value={data.email || ""}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    placeholder="your@email.com"
                    className="h-12 text-base"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Cuisine & Food */}
            {currentFullStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">Your Cuisine & Dishes</h2>
                
                <div className="space-y-3">
                  <Label className="text-lg font-medium">Cuisine Style *</Label>
                  <Input
                    value={data.cuisineStyle || ""}
                    onChange={(e) => setData({ ...data, cuisineStyle: e.target.value })}
                    placeholder="e.g., Shanghainese, Sichuan, Cantonese"
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-lg font-medium">What will you cook? *</Label>
                  <textarea
                    value={data.menuDescription || ""}
                    onChange={(e) => setData({ ...data, menuDescription: e.target.value })}
                    placeholder="Describe your typical menu, special dishes, seasonal specialties..."
                    className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-lg font-medium">Food Photos (minimum 3) *</Label>
                  <label className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center cursor-pointer hover:bg-primary/5 transition-colors block">
                    <Upload className="w-8 h-8 text-primary/40 mx-auto mb-3" />
                    <p className="text-muted-foreground">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB each</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, false)}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                  {isUploading && (
                    <div className="flex items-center justify-center gap-2 py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Uploading...</span>
                    </div>
                  )}
                  {data.foodPhotoUrls && data.foodPhotoUrls.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-foreground">{data.foodPhotoUrls.length} photo(s) uploaded</p>
                      <div className="grid grid-cols-3 gap-2">
                        {data.foodPhotoUrls.map((url, idx) => (
                          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-secondary">
                            <img src={url} alt={`Food ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setData({
                                ...data,
                                foodPhotoUrls: data.foodPhotoUrls!.filter((_, i) => i !== idx)
                              })}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-lg font-medium">Dietary Info</Label>
                  <textarea
                    value={data.dietaryNote || ""}
                    onChange={(e) => setData({ ...data, dietaryNote: e.target.value })}
                    placeholder="e.g., 'Can accommodate vegetarian, vegan, gluten-free. Not suitable for people with shellfish allergy.'"
                    className="w-full h-24 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Step 3: About You & Activities */}
            {currentFullStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">About You</h2>
                
                <div className="space-y-3">
                  <Label className="text-lg font-medium">Your Selfie *</Label>
                  <label className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center cursor-pointer hover:bg-primary/5 transition-colors block">
                    <User className="w-8 h-8 text-primary/40 mx-auto mb-3" />
                    <p className="text-muted-foreground">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, true)}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                  {isUploading && (
                    <div className="flex items-center justify-center gap-2 py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Uploading...</span>
                    </div>
                  )}
                  {data.profilePhotoUrl && (
                    <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden bg-secondary">
                      <img src={data.profilePhotoUrl} alt="Your profile" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setData({ ...data, profilePhotoUrl: "" })}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-lg font-medium">Tell us about yourself *</Label>
                  <textarea
                    value={data.bio || ""}
                    onChange={(e) => setData({ ...data, bio: e.target.value })}
                    placeholder="Share your story, why you want to host, your cooking background, what you love about Shanghai..."
                    className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-lg font-medium">What else can you do with guests?</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {ACTIVITY_OPTIONS.map((activity) => (
                      <label key={activity.id} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={(data.activities || []).includes(activity.id)}
                          onChange={(e) => {
                            const newActivities = e.target.checked
                              ? [...(data.activities || []), activity.id]
                              : (data.activities || []).filter(a => a !== activity.id);
                            setData({ ...data, activities: newActivities });
                          }}
                          className="w-5 h-5 rounded border-gray-300"
                        />
                        <span className="text-sm font-medium">{activity.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Availability */}
            {currentFullStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">Your Availability</h2>
                
                <div className="space-y-3">
                  <Label className="text-lg font-medium">Max Guests</Label>
                  <Input
                    type="number"
                    value={data.maxGuests || 2}
                    onChange={(e) => setData({ ...data, maxGuests: parseInt(e.target.value) || 2 })}
                    className="h-12 text-base"
                    min="1"
                    max="20"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-lg font-medium">When are you available? *</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                      <div key={day} className="border border-gray-200 rounded-lg p-4">
                        <div className="font-semibold text-sm mb-3 capitalize">{day}</div>
                        <div className="flex gap-2">
                          {["lunch", "dinner"].map((meal) => (
                            <label key={`${day}-${meal}`} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(data.availability?.[day] || []).includes(meal)}
                                onChange={(e) => {
                                  const availability = { ...data.availability };
                                  if (e.target.checked) {
                                    availability[day] = [...(availability[day] || []), meal];
                                  } else {
                                    availability[day] = (availability[day] || []).filter(m => m !== meal);
                                  }
                                  setData({ ...data, availability });
                                }}
                                className="w-4 h-4 rounded border-gray-300"
                              />
                              <span className="text-xs capitalize">{meal}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Pricing & Notes */}
            {currentFullStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">Pricing & Notes</h2>
                
                <div className="space-y-3">
                  <Label className="text-lg font-medium">Price per Person (RMB) *</Label>
                  <Input
                    type="number"
                    value={data.pricePerPerson || 100}
                    onChange={(e) => setData({ ...data, pricePerPerson: parseInt(e.target.value) || 100 })}
                    className="h-12 text-base"
                    min="1"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-lg font-medium">Additional Notes (optional)</Label>
                  <textarea
                    value={data.otherNotes || ""}
                    onChange={(e) => setData({ ...data, otherNotes: e.target.value })}
                    placeholder="Anything else guests should know? House rules, parking info, transportation tips, etc."
                    className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-6">
                  <p className="text-sm text-foreground">
                    ✓ Once your profile is approved, you'll be able to login and manage your bookings, dates, and availability.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-4 mt-8 pt-8 border-t border-gray-200">
              <Button
                onClick={handleFullStepPrev}
                disabled={currentFullStep === 1}
                className="flex-1 h-14 text-lg bg-gray-200 hover:bg-gray-300 text-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </Button>
              {currentFullStep < REGISTRATION_STEPS.length ? (
                <Button
                  onClick={handleFullStepNext}
                  className="flex-1 h-14 text-lg text-white font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                  style={{ backgroundColor: "var(--warm-burgundy)" }}
                >
                  Next <ArrowRight className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  className="flex-1 h-14 text-white hover:opacity-90"
                  style={{ backgroundColor: "var(--warm-burgundy)" }}
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
