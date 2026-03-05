import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import HostCalendarTab from "@/components/HostCalendarTab";
import HostBookingsTab from "@/components/HostBookingsTab";
import HostListingTab from "@/components/HostListingTab";
import HostAccountTab from "@/components/HostAccountTab";

type TabType = "calendar" | "bookings" | "listing" | "account";
type Language = "zh" | "en";

const translations = {
  zh: {
    dashboard: "主机仪表板",
    logout: "退出登录",
    calendar: "日历",
    bookings: "预订",
    listing: "房源",
    account: "账户",
    loading: "加载中...",
  },
  en: {
    dashboard: "Host Dashboard",
    logout: "Logout",
    calendar: "Calendar",
    bookings: "Bookings",
    listing: "Listing",
    account: "Account",
    loading: "Loading...",
  },
};

export default function HostPortal() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>("calendar");
  const [hostId, setHostId] = useState<number | null>(null);
  const [hostEmail, setHostEmail] = useState<string>("");
  const [language, setLanguage] = useState<Language>("zh");

  useEffect(() => {
    // Get host ID from localStorage
    const storedHostId = localStorage.getItem("hostId");
    const storedEmail = localStorage.getItem("hostEmail");
    const storedLang = (localStorage.getItem("hostLanguage") as Language) || "zh";
    
    if (!storedHostId) {
      // Redirect to login if not authenticated
      setLocation("/host/login");
      return;
    }
    
    setHostId(parseInt(storedHostId));
    setHostEmail(storedEmail || "");
    setLanguage(storedLang);
  }, [setLocation]);

  const dashboardQuery = trpc.hostAuth.getDashboard.useQuery(
    { hostId: hostId || 0 },
    { enabled: !!hostId }
  );

  const handleLogout = () => {
    localStorage.removeItem("hostId");
    localStorage.removeItem("hostEmail");
    setLocation("/host/login");
  };

  const toggleLanguage = () => {
    const newLang = language === "zh" ? "en" : "zh";
    setLanguage(newLang);
    localStorage.setItem("hostLanguage", newLang);
  };

  const t = translations[language];

  if (!hostId) {
    return <div className="flex items-center justify-center min-h-screen">{t.loading}</div>;
  }

  const listing = dashboardQuery.data?.listing;
  const bookings = (dashboardQuery.data?.bookings || []).map((b: any) => ({
    ...b,
    requestedDate: b.requestedDate instanceof Date ? b.requestedDate.toISOString() : b.requestedDate,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b sticky top-0 z-50 bg-background">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{t.dashboard}</h1>
            <p className="text-sm text-muted-foreground">{hostEmail}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleLanguage}
            >
              {language === "zh" ? "English" : "中文"}
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              {t.logout}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="calendar">{t.calendar}</TabsTrigger>
            <TabsTrigger value="bookings">{t.bookings}</TabsTrigger>
            <TabsTrigger value="listing">{t.listing}</TabsTrigger>
            <TabsTrigger value="account">{t.account}</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <HostCalendarTab hostId={hostId} language={language} />
          </TabsContent>

          <TabsContent value="bookings">
            <HostBookingsTab bookings={bookings} language={language} />
          </TabsContent>

          <TabsContent value="listing">
            <HostListingTab listing={listing} language={language} />
          </TabsContent>

          <TabsContent value="account">
            <HostAccountTab hostEmail={hostEmail} language={language} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
