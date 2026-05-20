import { useState } from "react";
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
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Partial<Listing>>({});

  const updateMutation = trpc.host.updateListing.useMutation({
    onSuccess: () => {
      toast.success(t.saveSuccess);
      setIsEditing(false);
    },
    onError: () => {
      toast.error(t.saveError);
    },
  });

  const handleEdit = () => {
    if (!listing) return;
    setForm({
      hostName: listing.hostName,
      cuisineStyle: listing.cuisineStyle,
      pricePerPerson: listing.pricePerPerson,
      maxGuests: listing.maxGuests,
      district: listing.district,
      bio: listing.bio,
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setForm({});
  };

  const handleSave = () => {
    if (!listing) return;
    updateMutation.mutate({
      id: listing.id,
      hostName: form.hostName,
      cuisineStyle: form.cuisineStyle,
      pricePerPerson: form.pricePerPerson ? Number(form.pricePerPerson) : undefined,
      maxGuests: form.maxGuests ? Number(form.maxGuests) : undefined,
      district: form.district,
      bio: form.bio,
    });
  };

  if (!listing) {
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
                {t.save}
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
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
                  <p className="font-semibold text-lg">{listing.hostName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.cuisine}</p>
                  <p className="font-semibold text-lg">{listing.cuisineStyle}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.price}</p>
                  <p className="font-semibold text-lg">¥{listing.pricePerPerson}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.maxGuests}</p>
                  <p className="font-semibold text-lg">{listing.maxGuests}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.district}</p>
                  <p className="font-semibold text-lg">{listing.district}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.bio}</p>
                <p className="mt-2 text-base">{listing.bio}</p>
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
