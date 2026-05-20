import { useState, useEffect } from "react";
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

  // Local display state — mirrors listing prop but updates immediately on save
  const [display, setDisplay] = useState<Listing | undefined>(listing);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Partial<Listing>>({});

  // Keep display in sync when the prop changes (e.g. initial load)
  useEffect(() => {
    if (listing && !isEditing) {
      setDisplay(listing);
    }
  }, [listing, isEditing]);

  const updateMutation = trpc.host.updateListing.useMutation({
    onSuccess: () => {
      // Immediately apply form values to the display state so changes show at once
      setDisplay((prev) =>
        prev
          ? {
              ...prev,
              hostName: form.hostName ?? prev.hostName,
              cuisineStyle: form.cuisineStyle ?? prev.cuisineStyle,
              pricePerPerson:
                form.pricePerPerson !== undefined ? Number(form.pricePerPerson) : prev.pricePerPerson,
              maxGuests:
                form.maxGuests !== undefined ? Number(form.maxGuests) : prev.maxGuests,
              district: form.district ?? prev.district,
              bio: form.bio ?? prev.bio,
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
      pricePerPerson: display.pricePerPerson,
      maxGuests: display.maxGuests,
      district: display.district,
      bio: display.bio,
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setForm({});
  };

  const handleSave = () => {
    if (!display) return;
    updateMutation.mutate({
      id: display.id,
      hostName: form.hostName,
      cuisineStyle: form.cuisineStyle,
      pricePerPerson: form.pricePerPerson ? Number(form.pricePerPerson) : undefined,
      maxGuests: form.maxGuests ? Number(form.maxGuests) : undefined,
      district: form.district,
      bio: form.bio,
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
                {updateMutation.isPending ? "Saving..." : t.save}
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
                    value={form.hostName || ""}
                    onChange={(e) => setForm({ ...form, hostName: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>{t.cuisine}</Label>
                  <Input
                    value={form.cuisineStyle || ""}
                    onChange={(e) => setForm({ ...form, cuisineStyle: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>{t.price}</Label>
                  <Input
                    type="number"
                    value={form.pricePerPerson ?? ""}
                    onChange={(e) => setForm({ ...form, pricePerPerson: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>{t.maxGuests}</Label>
                  <Input
                    type="number"
                    value={form.maxGuests ?? ""}
                    onChange={(e) => setForm({ ...form, maxGuests: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>{t.district}</Label>
                  <Input
                    value={form.district || ""}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>{t.bio}</Label>
                <Textarea
                  rows={5}
                  value={form.bio || ""}
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
