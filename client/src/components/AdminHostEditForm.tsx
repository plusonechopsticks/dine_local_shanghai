import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface HostListing {
  id: number;
  hostName: string;
  email: string;
  district: string;
  cuisineStyle: string;
  bio: string | null;
  menuDescription: string | null;
  profilePhotoUrl: string | null;
  foodPhotoUrls: string[];
  maxGuests: number;
  pricePerPerson: number;
  activities: string[];
  availability: Record<string, string[]>;
  otherNotes: string | null;
  dietaryNote: string | null;
}

interface AdminHostEditFormProps {
  listing: HostListing;
  onSave: () => void;
  onCancel: () => void;
}

const DISTRICTS = [
  "Huangpu", "Xuhui", "Changning", "Jing'an", "Putuo", "Hongkou", "Yangpu",
  "Minhang", "Pudong", "Songjiang", "Jiading", "Baoshan", "Jinshan", "Fengxian", "Chongming"
];

const ACTIVITIES = [
  { id: "cooking-class", label: "Cooking class" },
  { id: "market-visit", label: "Market visit" },
  { id: "park-visit", label: "Park visit" },
  { id: "cultural-tour", label: "Cultural tour" },
];

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export function AdminHostEditForm({ listing, onSave, onCancel }: AdminHostEditFormProps) {
  const [formData, setFormData] = useState({
    hostName: listing.hostName,
    email: listing.email,
    district: listing.district,
    cuisineStyle: listing.cuisineStyle,
    bio: listing.bio || "",
    menuDescription: listing.menuDescription || "",
    profilePhotoUrl: listing.profilePhotoUrl || "",
    foodPhotoUrls: listing.foodPhotoUrls || [],
    maxGuests: listing.maxGuests,
    pricePerPerson: listing.pricePerPerson,
    activities: listing.activities || [],
    otherNotes: listing.otherNotes || "",
    dietaryNote: listing.dietaryNote || "",
    availability: listing.availability || {},
  });

  const [isUploading, setIsUploading] = useState(false);

  const updateMutation = trpc.host.updateListing.useMutation({
    onSuccess: () => {
      toast.success("Host profile updated successfully");
      onSave();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update host profile");
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleActivityToggle = (activityId: string) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.includes(activityId)
        ? prev.activities.filter((a) => a !== activityId)
        : [...prev.activities, activityId],
    }));
  };

  const handleAvailabilityChange = (day: string, meal: string, isChecked: boolean) => {
    setFormData((prev) => {
      const dayMeals = prev.availability[day] || [];
      return {
        ...prev,
        availability: {
          ...prev.availability,
          [day]: isChecked
            ? [...dayMeals, meal]
            : dayMeals.filter((m) => m !== meal),
        },
      };
    });
  };

  async function handleImageUpload(files: FileList | null, field: "profilePhotoUrl" | "foodPhotoUrls") {
    if (!files) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = async (e) => {
            try {
              const base64 = e.target?.result as string;
              const response = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: base64, filename: file.name }),
              });

              if (!response.ok) throw new Error("Upload failed");
              const { url } = await response.json();
              resolve(url);
            } catch (error) {
              reject(error);
            }
          };

          reader.onerror = () => reject(new Error("File read failed"));
          reader.readAsDataURL(file);
        });
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      if (field === "profilePhotoUrl") {
        // For profile photo, use the last uploaded URL
        handleInputChange("profilePhotoUrl", uploadedUrls[uploadedUrls.length - 1]);
      } else {
        // For food photos, append all uploaded URLs
        handleInputChange("foodPhotoUrls", [...formData.foodPhotoUrls, ...uploadedUrls]);
      }
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  }

  const handleSubmit = () => {
    if (!formData.hostName || !formData.email || !formData.district) {
      toast.error("Please fill in required fields");
      return;
    }

    updateMutation.mutate({
      id: listing.id,
      ...formData,
    });
  };

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-4">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Host Name *</Label>
            <Input
              value={formData.hostName}
              onChange={(e) => handleInputChange("hostName", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Email *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>District *</Label>
              <select
                value={formData.district}
                onChange={(e) => handleInputChange("district", e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Cuisine Style *</Label>
              <Input
                value={formData.cuisineStyle}
                onChange={(e) => handleInputChange("cuisineStyle", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      <Card>
        <CardHeader>
          <CardTitle>Bio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Bio</Label>
            <Textarea
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Tell guests about yourself..."
              rows={4}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Menu & Dietary */}
      <Card>
        <CardHeader>
          <CardTitle>Menu & Dietary Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Menu Description *</Label>
            <Textarea
              value={formData.menuDescription}
              onChange={(e) => handleInputChange("menuDescription", e.target.value)}
              placeholder="Describe the dishes you prepare..."
              rows={4}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Dietary Accommodations</Label>
            <Input
              value={formData.dietaryNote}
              onChange={(e) => handleInputChange("dietaryNote", e.target.value)}
              placeholder="e.g., Can accommodate vegetarian, halal..."
              className="mt-1"
            />
          </div>

          <div>
            <Label>Other Notes</Label>
            <Textarea
              value={formData.otherNotes}
              onChange={(e) => handleInputChange("otherNotes", e.target.value)}
              placeholder="Any additional information..."
              rows={3}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Photos */}
      <Card>
        <CardHeader>
          <CardTitle>Photos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Profile Photo</Label>
            <div className="mt-2 flex flex-col gap-2">
              {formData.profilePhotoUrl && (
                <div className="relative w-32 h-32">
                  <img
                    src={formData.profilePhotoUrl}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleInputChange("profilePhotoUrl", "")}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400">
                <Upload className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Upload Profile Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files, "profilePhotoUrl")}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>

          <div>
            <Label>Food Photos</Label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {formData.foodPhotoUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-square">
                  <img src={url} alt={`Food ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                  <button
                    onClick={() =>
                      handleInputChange("foodPhotoUrls", formData.foodPhotoUrls.filter((_, i) => i !== idx))
                    }
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {formData.foodPhotoUrls.length < 6 && (
                <label className="border-2 border-dashed border-gray-300 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-gray-400">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-600 mt-1">Add Photo</span>
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
        </CardContent>
      </Card>

      {/* Pricing & Guests */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing & Capacity</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label>Max Guests</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={formData.maxGuests}
              onChange={(e) => handleInputChange("maxGuests", parseInt(e.target.value))}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Price Per Person (¥)</Label>
            <Input
              type="number"
              min={0}
              value={formData.pricePerPerson}
              onChange={(e) => handleInputChange("pricePerPerson", parseInt(e.target.value))}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Activities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ACTIVITIES.map((activity) => (
            <label key={activity.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.activities.includes(activity.id)}
                onChange={(e) => handleActivityToggle(activity.id)}
                className="w-4 h-4"
              />
              <span className="text-sm">{activity.label}</span>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {DAYS.map((day) => (
            <div key={day} className="flex items-center gap-4">
              <span className="capitalize font-medium w-20">{day}</span>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(formData.availability[day] || []).includes("lunch")}
                  onChange={(e) => handleAvailabilityChange(day, "lunch", e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Lunch</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(formData.availability[day] || []).includes("dinner")}
                  onChange={(e) => handleAvailabilityChange(day, "dinner", e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Dinner</span>
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2 sticky bottom-0 bg-white pt-4 border-t">
        <Button
          onClick={handleSubmit}
          disabled={updateMutation.isPending}
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
        <Button onClick={onCancel} variant="outline" className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
}
