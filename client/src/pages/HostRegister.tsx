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
import { Checkbox } from "@/components/ui/checkbox";
import { ChopsticksLogo } from "@/components/ChopsticksLogo";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Sparkles, Heart, Users, Upload, ArrowRight, Loader2, User, X } from "lucide-react";

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
  { id: "tea-ceremony", label: "Tea Ceremony" },
  { id: "calligraphy", label: "Calligraphy" },
];

const HOUSEHOLD_FEATURES = [
  { id: "has-pets", label: "We have pets" },
  { id: "has-stairs", label: "Stairs only (no elevator)" },
  { id: "kids-present", label: "Children in household" },
  { id: "elderly-present", label: "Elderly family members" },
  { id: "small-space", label: "Small space / apartment" },
  { id: "garden", label: "Garden or outdoor space" },
];

const REGISTRATION_STEPS = [
  { id: 1, title: "Cuisine & Dishes", description: "What you cook" },
  { id: 2, title: "Self Intro", description: "About you" },
  { id: 3, title: "Availability", description: "When available" },
  { id: 4, title: "Pricing & Notes", description: "Cost & details" },
  { id: 5, title: "Household Info", description: "House details" },
];

interface RegistrationData {
  // Initial entry
  name: string;
  district: string;
  email: string;
  // Step 1: Cuisine & Dishes
  cuisineStyle: string;
  menuDescription: string;
  foodPhotoUrls: string[];
  maxGuests: number;
  dietaryNote: string;
  // Step 2: Self Intro
  bio: string;
  profilePhotoUrl: string;
  activities: string[];
  // Step 3: Availability
  availability: Record<string, ("lunch" | "dinner")[]>;
  // Step 4: Pricing & Notes
  pricePerPerson: number;
  otherNotes: string;
  // Step 5: Household Info
  householdFeatures: string[];
  otherHouseholdInfo: string;
}

// Compress image to reduce file size
async function compressImage(file: File, maxWidth: number = 1200, maxHeight: number = 1200, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export default function HostRegister() {
  const [step, setStep] = useState<"initial" | "full">("initial");
  const [currentFullStep, setCurrentFullStep] = useState(1);
  const [data, setData] = useState<Partial<RegistrationData>>({
    foodPhotoUrls: [],
    activities: [],
    householdFeatures: [],
    availability: {} as Record<string, ("lunch" | "dinner")[]>,
    maxGuests: 4,
    pricePerPerson: 150,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const uploadImageMutation = trpc.upload.image.useMutation({
    onError: (error: any) => {
      toast.error(error.message || "Failed to upload image");
      setIsUploading(false);
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isProfilePhoto: boolean = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];
    const filesToUpload: { file: File; name: string }[] = [];

    try {
      // Compress all files first
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file size (10MB max before compression)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large (max 10MB)`);
          continue;
        }

        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        try {
          // Compress the image
          const compressedBlob = await compressImage(file);
          const compressedFile = new File([compressedBlob], file.name, { type: file.type });
          filesToUpload.push({ file: compressedFile, name: file.name });
          setUploadProgress(prev => ({ ...prev, [file.name]: 30 }));
        } catch (err) {
          toast.error(`Failed to compress ${file.name}`);
        }
      }

      // Upload all files in parallel (max 3 at a time)
      const uploadBatch = async (fileBatch: { file: File; name: string }[]) => {
        const promises = fileBatch.map(async ({ file, name }) => {
          try {
            setUploadProgress(prev => ({ ...prev, [name]: 50 }));
            
            // Read file as FormData
            const formData = new FormData();
            formData.append('file', file);
            
            // Upload directly via fetch to /api/upload
            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
              throw new Error(`Upload failed: ${response.statusText}`);
            }

            const result = await response.json();
            setUploadProgress(prev => ({ ...prev, [name]: 100 }));
            return result.url;
          } catch (err) {
            toast.error(`Failed to upload ${name}`);
            setUploadProgress(prev => ({ ...prev, [name]: 0 }));
            throw err;
          }
        });

        return Promise.all(promises);
      };

      // Process files in batches of 3
      for (let i = 0; i < filesToUpload.length; i += 3) {
        const batch = filesToUpload.slice(i, i + 3);
        const batchUrls = await uploadBatch(batch);
        uploadedUrls.push(...batchUrls.filter(url => url));
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
    } catch (error: any) {
      toast.error(error?.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
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
    setStep("full");
  };

  const handlePreviousStep = () => {
    if (currentFullStep > 1) {
      setCurrentFullStep(currentFullStep - 1);
    }
  };

  const handleNextStep = () => {
    if (currentFullStep === 1) {
      if (!data.cuisineStyle?.trim()) {
        toast.error("Please describe your cuisine style");
        return;
      }
      if (!data.menuDescription?.trim() || (data.menuDescription?.length || 0) < 20) {
        toast.error("Please describe your menu (at least 20 characters)");
        return;
      }
      if (!data.foodPhotoUrls || data.foodPhotoUrls.length < 3) {
        toast.error("Please upload at least 3 food photos");
        return;
      }
    } else if (currentFullStep === 2) {
      if (!data.bio?.trim() || (data.bio?.length || 0) < 20) {
        toast.error("Please write about yourself (at least 20 characters)");
        return;
      }
      if (!data.profilePhotoUrl?.trim()) {
        toast.error("Please upload a profile photo");
        return;
      }
    } else if (currentFullStep === 3) {
      if (!data.availability || Object.keys(data.availability).length === 0) {
        toast.error("Please select at least one day and meal time");
        return;
      }
    }
    if (currentFullStep < 5) {
      setCurrentFullStep(currentFullStep + 1);
    }
  };

  const handleSubmitProfile = async () => {
    if (!data.name || !data.email || !data.district) {
      toast.error("Please complete all required fields");
      return;
    }

    if (!data.profilePhotoUrl) {
      toast.error("Profile photo is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await trpc.host.submit.useMutation().mutateAsync({
        name: data.name.trim(),
        district: data.district,
        email: data.email.trim(),
        cuisineStyle: data.cuisineStyle?.trim() || "",
        menuDescription: data.menuDescription?.trim() || "",
        foodPhotoUrls: data.foodPhotoUrls || [],
        dietaryNote: data.dietaryNote || undefined,
        bio: data.bio?.trim() || "",
        profilePhotoUrl: data.profilePhotoUrl,
        activities: data.activities || [],
        availability: (data.availability || {}) as Record<string, ("lunch" | "dinner")[]>,
        maxGuests: data.maxGuests || 2,
        pricePerPerson: data.pricePerPerson || 100,
        otherNotes: data.otherNotes || undefined,
        householdFeatures: data.householdFeatures || [],
        otherHouseholdInfo: data.otherHouseholdInfo || undefined,
      });

      if (result.success) {
        toast.success("Profile submitted successfully!");
        // Reset form
        setStep("initial");
        setCurrentFullStep(1);
        setData({
          foodPhotoUrls: [],
          activities: [],
          householdFeatures: [],
          availability: {} as Record<string, ("lunch" | "dinner")[]>,
          maxGuests: 4,
          pricePerPerson: 150,
        });
      }
    } catch (error: any) {
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
                  <Label htmlFor="district" className="text-base font-semibold text-gray-700">District *</Label>
                  <Select value={data.district || ""} onValueChange={(value) => setData({ ...data, district: value })}>
                    <SelectTrigger id="district" className="mt-2 h-12">
                      <SelectValue placeholder="Select your district" />
                    </SelectTrigger>
                    <SelectContent>
                      {SHANGHAI_DISTRICTS.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
            <form className="space-y-6">
              {currentFullStep === 1 && (
                <>
                  <div>
                    <Label className="text-lg font-medium">Cuisine Style *</Label>
                    <Input
                      placeholder="e.g., Shanghainese, Sichuan, Fusion"
                      value={data.cuisineStyle || ""}
                      onChange={(e) => setData({ ...data, cuisineStyle: e.target.value })}
                      className="mt-2 h-12"
                    />
                  </div>

                  <div>
                    <Label className="text-lg font-medium">Menu Description *</Label>
                    <textarea
                      placeholder="Describe the dishes you typically cook..."
                      value={data.menuDescription || ""}
                      onChange={(e) => setData({ ...data, menuDescription: e.target.value })}
                      className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={4}
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
                      <div className="space-y-2">
                        {Object.entries(uploadProgress).map(([fileName, progress]) => (
                          <div key={fileName} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 truncate">{fileName}</span>
                              <span className="text-gray-500">{progress}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full transition-all"
                                style={{
                                  width: `${progress}%`,
                                  backgroundColor: "var(--warm-burgundy)",
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {data.foodPhotoUrls && data.foodPhotoUrls.length > 0 && (
                      <div className="grid grid-cols-3 gap-3 mt-4">
                        {data.foodPhotoUrls.map((url, idx) => (
                          <div key={idx} className="relative">
                            <img src={url} alt={`Food ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => setData({
                                ...data,
                                foodPhotoUrls: data.foodPhotoUrls?.filter((_, i) => i !== idx) || []
                              })}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-lg font-medium">Maximum Guests Allowed *</Label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={data.maxGuests || 4}
                      onChange={(e) => setData({ ...data, maxGuests: parseInt(e.target.value) })}
                      className="mt-2 h-12"
                    />
                  </div>

                  <div>
                    <Label className="text-lg font-medium">Dietary Restrictions & Allergies</Label>
                    <textarea
                      placeholder="Can accommodate vegetarian, vegan, gluten-free, etc."
                      value={data.dietaryNote || ""}
                      onChange={(e) => setData({ ...data, dietaryNote: e.target.value })}
                      className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {currentFullStep === 2 && (
                <>
                  <div>
                    <Label className="text-lg font-medium">Profile Photo *</Label>
                    <label className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center cursor-pointer hover:bg-primary/5 transition-colors block mt-2">
                      <Upload className="w-8 h-8 text-primary/40 mx-auto mb-3" />
                      <p className="text-muted-foreground">Click to upload your photo</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, true)}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                    {isUploading && <div className="mt-2 text-center text-sm text-gray-600">Uploading...</div>}
                    {data.profilePhotoUrl && (
                      <div className="mt-4 relative w-32 h-32 mx-auto">
                        <img src={data.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => setData({ ...data, profilePhotoUrl: "" })}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-lg font-medium">About You *</Label>
                    <textarea
                      placeholder="Tell us about yourself, your cooking background, and what makes your home special..."
                      value={data.bio || ""}
                      onChange={(e) => setData({ ...data, bio: e.target.value })}
                      className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label className="text-lg font-medium">Activities You Offer</Label>
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
                <div>
                  <Label className="text-lg font-medium mb-4 block">Availability *</Label>
                  <div className="space-y-6">
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={day} className="border rounded-lg p-4">
                        <div className="font-semibold text-sm mb-3 capitalize">{day}</div>
                        <div className="space-y-2">
                          {["lunch", "dinner"].map((meal) => (
                            <label key={`${day}-${meal}`} className="flex items-center gap-2 cursor-pointer">
                              <Checkbox
                                checked={(data.availability?.[day] || []).includes(meal as "lunch" | "dinner")}
                                onCheckedChange={(checked) => {
                                  const availability = { ...data.availability };
                                  if (checked) {
                                    availability[day] = [...(availability[day] || []), meal as "lunch" | "dinner"];
                                  } else {
                                    availability[day] = (availability[day] || []).filter(m => m !== (meal as "lunch" | "dinner"));
                                  }
                                  setData({ ...data, availability });
                                }}
                              />
                              <span className="text-sm capitalize">{meal}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentFullStep === 4 && (
                <>
                  <div>
                    <Label className="text-lg font-medium">Price Per Person (¥) *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={data.pricePerPerson || 150}
                      onChange={(e) => setData({ ...data, pricePerPerson: parseInt(e.target.value) })}
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
                      placeholder="Any other details about your home..."
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
