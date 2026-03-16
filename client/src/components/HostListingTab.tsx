import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";

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
    name: "名称",
    cuisine: "菜系",
    price: "每人价格",
    maxGuests: "最多客人数",
    district: "地区",
    bio: "简介",
    noListing: "还没有房源信息",
  },
  en: {
    listing: "Listing Information",
    description: "View and edit your listing information",
    edit: "Edit",
    name: "Name",
    cuisine: "Cuisine",
    price: "Price per Person",
    maxGuests: "Max Guests",
    district: "District",
    bio: "Bio",
    noListing: "No listing information yet",
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
          <Button>
            <Edit2 className="w-4 h-4 mr-2" />
            {t.edit}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>
    </div>
  );
}
