import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit2, X, Save } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Language = "zh" | "en";

interface Listing {
  id: number;
  hostName: string;
  cuisineStyle: string;
  pricePerPerson: number;
  maxGuests: number;
  district: string;
  bio: string;
}

// Form state uses strings for numeric fields so the input can be empty without showing "0"
interface FormState {
  hostName: string;
  cuisineStyle: string;
  pricePerPerson: string;
  maxGuests: string;
  district: string;
  bio: string;
}

const translations = {
  zh: {
    listing: "房源信息",
    description: "查看和编辑您的房源信息",
    edit: "编辑",
    save: "保存",
    cancel: "取消",
    name: "名称",
    cuisine: "菜系",
    price: "每人价格（¥）",
    maxGuests: "最多客人数",
    district: "地区",
    bio: "简介",
    noListing: "还没有房源信息",
    saveSuccess: "房源信息已更新",
    saveError: "更新失败，请重试",
    saving: "保存中...",
  },
  en: {
    listing: "Listing Information",
    description: "View and edit your listing information",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    name: "Name",
    cuisine: "Cuisine Style",
    price: "Price per Person (¥)",
    maxGuests: "Max Guests",
    district: "District",
    bio: "Bio",
    noListing: "No listing information yet",
    saveSuccess: "Listing updated successfully",
    saveError: "Failed to update. Please try again.",
    saving: "Saving...",
  },
};

export default function HostListingTab({
  listing,
  language,
}: {
  listing?: Listing;
  language: Language;
}) {
  const t = translations[language];

  // Local display state — starts from listing prop, updated optimistically on save
  const [display, setDisplay] = useState<Listing | undefined>(listing);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormState>({
    hostName: "",
    cuisineStyle: "",
    pricePerPerson: "",
    maxGuests: "",
    district: "",
    bio: "",
  });

  // Track whether we've applied an optimistic update so useEffect doesn't overwrite it
  const optimisticApplied = useRef(false);

  // Sync display from prop only on initial load (not after optimistic updates)
  useEffect(() => {
    if (listing && !optimisticApplied.current) {
      setDisplay(listing);
    }
  }, [listing]);

  const updateMutation = trpc.host.updateListing.useMutation({
    onSuccess: (data, variables) => {
      if (!data.success) {
        toast.error(t.saveError);
        return;
      }
      // Mark that we've applied an optimistic update so useEffect won't overwrite it
      optimisticApplied.current = true;
      // Apply the submitted values directly from the mutation variables
      setDisplay((prev) =>
        prev
          ? {
              ...prev,
              hostName: variables.hostName ?? prev.hostName,
              cuisineStyle: variables.cuisineStyle ?? prev.cuisineStyle,
              pricePerPerson: variables.pricePerPerson !== undefined ? variables.pricePerPerson : prev.pricePerPerson,
              maxGuests: variables.maxGuests !== undefined ? variables.maxGuests : prev.maxGuests,
              district: variables.district ?? prev.district,
              bio: variables.bio ?? prev.bio,
            }
          : prev
      );
      toast.success(t.saveSuccess);
      setIsEditing(false);
    },
    onError: () => {
      toast.error(t.saveError);
    },
  });

  const handleEdit = () => {
    if (!display) return;
    setForm({
      hostName: display.hostName,
      cuisineStyle: display.cuisineStyle,
      pricePerPerson: String(display.pricePerPerson),
      maxGuests: String(display.maxGuests),
      district: display.district,
      bio: display.bio,
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!display) return;
    const priceNum = form.pricePerPerson !== "" ? Number(form.pricePerPerson) : undefined;
    const guestsNum = form.maxGuests !== "" ? Number(form.maxGuests) : undefined;
    updateMutation.mutate({
      id: display.id,
      hostName: form.hostName || undefined,
      cuisineStyle: form.cuisineStyle || undefined,
      pricePerPerson: priceNum,
      maxGuests: guestsNum,
      district: form.district || undefined,
      bio: form.bio || undefined,
    });
  };

  if (!display) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.listing}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t.noListing}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t.listing}</CardTitle>
            <CardDescription>{t.description}</CardDescription>
          </div>
          {!isEditing ? (
            <Button onClick={handleEdit} variant="outline">
              <Edit2 className="w-4 h-4 mr-2" />
              {t.edit}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={updateMutation.isPending} size="sm">
                <Save className="w-4 h-4 mr-2" />
                {updateMutation.isPending ? t.saving : t.save}
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm" disabled={updateMutation.isPending}>
                <X className="w-4 h-4 mr-2" />
                {t.cancel}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEditing ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">{t.name}</p>
                  <p className="font-semibold text-lg">{display.hostName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.cuisine}</p>
                  <p className="font-semibold text-lg">{display.cuisineStyle}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.price}</p>
                  <p className="font-semibold text-lg">¥{display.pricePerPerson}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.maxGuests}</p>
                  <p className="font-semibold text-lg">{display.maxGuests}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.district}</p>
                  <p className="font-semibold text-lg">{display.district}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.bio}</p>
                <p className="mt-2 text-base">{display.bio}</p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>{t.name}</Label>
                  <Input
                    value={form.hostName}
                    onChange={(e) => setForm({ ...form, hostName: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>{t.cuisine}</Label>
                  <Input
                    value={form.cuisineStyle}
                    onChange={(e) => setForm({ ...form, cuisineStyle: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>{t.price}</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="e.g. 280"
                    value={form.pricePerPerson}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      setForm({ ...form, pricePerPerson: val });
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label>{t.maxGuests}</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="e.g. 4"
                    value={form.maxGuests}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      setForm({ ...form, maxGuests: val });
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label>{t.district}</Label>
                  <Input
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>{t.bio}</Label>
                <Textarea
                  rows={5}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
