import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Language = "zh" | "en";

const translations = {
  zh: {
    calendar: "日历与可用性",
    description: "管理您的可用性 - 阻止日期、工作日或特定用餐时间",
    blockDate: "阻止日期",
    blockWeekday: "阻止工作日",
    selectDate: "选择日期",
    selectDay: "选择日期",
    selectMealTime: "选择用餐时间",
    fullDay: "整天",
    lunch: "午餐",
    dinner: "晚餐",
    sunday: "周日",
    monday: "周一",
    tuesday: "周二",
    wednesday: "周三",
    thursday: "周四",
    friday: "周五",
    saturday: "周六",
    add: "添加",
    delete: "删除",
    blockedDates: "已阻止的日期",
    noBlockedDates: "没有已阻止的日期",
    addedSuccess: "已添加",
    deletedSuccess: "已删除",
    errorAdding: "添加失败，请重试",
    errorDeleting: "删除失败，请重试",
    loading: "加载中...",
  },
  en: {
    calendar: "Calendar & Availability",
    description: "Manage your availability — block dates, weekdays, or specific meal times",
    blockDate: "Block Date",
    blockWeekday: "Block Weekday",
    selectDate: "Select Date",
    selectDay: "Select Day",
    selectMealTime: "Select Meal Time",
    fullDay: "Full Day",
    lunch: "Lunch",
    dinner: "Dinner",
    sunday: "Sunday",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    add: "Add",
    delete: "Delete",
    blockedDates: "Blocked Dates",
    noBlockedDates: "No blocked dates",
    addedSuccess: "Block added",
    deletedSuccess: "Block removed",
    errorAdding: "Failed to add block, please try again",
    errorDeleting: "Failed to remove block, please try again",
    loading: "Loading...",
  },
};

export default function HostCalendarTab({ hostId, language }: { hostId: number; language: Language }) {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });
  const [selectedDateMealType, setSelectedDateMealType] = useState<"full_day" | "lunch" | "dinner">("full_day");
  const [selectedWeekday, setSelectedWeekday] = useState<number>(1);
  const [selectedWeekdayMealType, setSelectedWeekdayMealType] = useState<"full_day" | "lunch" | "dinner">("full_day");

  const t = translations[language];

  // Load existing blocks from DB
  const blocksQuery = trpc.host.getAvailabilityBlocks.useQuery(
    { hostId },
    { enabled: !!hostId }
  );

  // Add block mutation
  const addBlockMutation = trpc.host.addAvailabilityBlock.useMutation({
    onSuccess: () => {
      utils.host.getAvailabilityBlocks.invalidate({ hostId });
      toast.success(t.addedSuccess);
    },
    onError: () => {
      toast.error(t.errorAdding);
    },
  });

  // Remove block mutation
  const removeBlockMutation = trpc.host.removeAvailabilityBlock.useMutation({
    onSuccess: () => {
      utils.host.getAvailabilityBlocks.invalidate({ hostId });
      toast.success(t.deletedSuccess);
    },
    onError: () => {
      toast.error(t.errorDeleting);
    },
  });

  const handleAddBlockedDate = () => {
    addBlockMutation.mutate({
      hostListingId: hostId,
      blockType: "date",
      blockDate: selectedDate,
      mealType: selectedDateMealType === "full_day" ? "both" : selectedDateMealType,
    });
  };

  const handleAddBlockedWeekday = () => {
    addBlockMutation.mutate({
      hostListingId: hostId,
      blockType: "weekday",
      blockWeekday: selectedWeekday,
      mealType: selectedWeekdayMealType === "full_day" ? "both" : selectedWeekdayMealType,
    });
  };

  const handleDeleteBlock = (blockId: number) => {
    removeBlockMutation.mutate({ blockId });
  };

  const weekdayNames = [
    t.sunday,
    t.monday,
    t.tuesday,
    t.wednesday,
    t.thursday,
    t.friday,
    t.saturday,
  ];

  const mealTypeLabel = (mt: string) => {
    if (mt === "both") return t.fullDay;
    if (mt === "lunch") return t.lunch;
    if (mt === "dinner") return t.dinner;
    return mt;
  };

  const blocks = blocksQuery.data || [];
  const isAdding = addBlockMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Block Date Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t.blockDate}</CardTitle>
          <CardDescription>{t.selectDate}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">{t.selectDate}</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">{t.selectMealTime}</label>
              <select
                value={selectedDateMealType}
                onChange={(e) => setSelectedDateMealType(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="full_day">{t.fullDay}</option>
                <option value="lunch">{t.lunch}</option>
                <option value="dinner">{t.dinner}</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAddBlockedDate}
                className="w-full"
                disabled={isAdding || !selectedDate}
              >
                {isAdding ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {t.add}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Block Weekday Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t.blockWeekday}</CardTitle>
          <CardDescription>{t.selectDay}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">{t.selectDay}</label>
              <select
                value={selectedWeekday}
                onChange={(e) => setSelectedWeekday(parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-md"
              >
                {weekdayNames.map((day, idx) => (
                  <option key={idx} value={idx}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">{t.selectMealTime}</label>
              <select
                value={selectedWeekdayMealType}
                onChange={(e) => setSelectedWeekdayMealType(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="full_day">{t.fullDay}</option>
                <option value="lunch">{t.lunch}</option>
                <option value="dinner">{t.dinner}</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAddBlockedWeekday}
                className="w-full"
                disabled={isAdding}
              >
                {isAdding ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {t.add}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blocked Dates List */}
      <Card>
        <CardHeader>
          <CardTitle>{t.blockedDates}</CardTitle>
        </CardHeader>
        <CardContent>
          {blocksQuery.isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t.loading}</span>
            </div>
          ) : blocks.length === 0 ? (
            <p className="text-muted-foreground">{t.noBlockedDates}</p>
          ) : (
            <div className="space-y-2">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {block.blockType === "weekday" && block.blockWeekday != null
                        ? `${weekdayNames[block.blockWeekday]} — ${mealTypeLabel(block.mealType)}`
                        : `${block.blockDate ?? ""} — ${mealTypeLabel(block.mealType)}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteBlock(block.id)}
                    disabled={removeBlockMutation.isPending}
                  >
                    {removeBlockMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
