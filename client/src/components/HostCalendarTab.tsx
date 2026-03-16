import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";

type Language = "zh" | "en";

interface BlockedDate {
  id: string;
  date: string;
  type: "full_day" | "lunch" | "dinner";
  weekday?: number;
}

const translations = {
  zh: {
    calendar: "日历与可用性",
    description: "管理您的可用性 - 阻止日期、工作日或特定用餐时间",
    blockDate: "阻止日期",
    blockWeekday: "阻止工作日",
    blockMealTime: "阻止用餐时间",
    selectDate: "选择日期",
    selectDay: "选择日期",
    selectMealTime: "选择用餐时间",
    fullDay: "整天",
    lunch: "午餐",
    dinner: "晚餐",
    monday: "周一",
    tuesday: "周二",
    wednesday: "周三",
    thursday: "周四",
    friday: "周五",
    saturday: "周六",
    sunday: "周日",
    add: "添加",
    delete: "删除",
    blockedDates: "已阻止的日期",
    noBlockedDates: "没有已阻止的日期",
    save: "保存",
  },
  en: {
    calendar: "Calendar & Availability",
    description: "Manage your availability - block dates, weekdays, or specific meal times",
    blockDate: "Block Date",
    blockWeekday: "Block Weekday",
    blockMealTime: "Block Meal Time",
    selectDate: "Select Date",
    selectDay: "Select Day",
    selectMealTime: "Select Meal Time",
    fullDay: "Full Day",
    lunch: "Lunch",
    dinner: "Dinner",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
    add: "Add",
    delete: "Delete",
    blockedDates: "Blocked Dates",
    noBlockedDates: "No blocked dates",
    save: "Save",
  },
};

const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export default function HostCalendarTab({ hostId, language }: { hostId: number; language: Language }) {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [selectedMealType, setSelectedMealType] = useState<"full_day" | "lunch" | "dinner">("full_day");
  const [selectedWeekday, setSelectedWeekday] = useState<number>(1); // 1 = Monday

  const t = translations[language];

  const handleAddBlockedDate = () => {
    const newBlock: BlockedDate = {
      id: `${Date.now()}`,
      date: selectedDate,
      type: selectedMealType,
    };
    setBlockedDates([...blockedDates, newBlock]);
  };

  const handleAddBlockedWeekday = () => {
    const newBlock: BlockedDate = {
      id: `${Date.now()}`,
      date: "",
      type: selectedMealType,
      weekday: selectedWeekday,
    };
    setBlockedDates([...blockedDates, newBlock]);
  };

  const handleDeleteBlock = (id: string) => {
    setBlockedDates(blockedDates.filter((b) => b.id !== id));
  };

  const handleSave = async () => {
    // TODO: Save to backend
    alert("Availability saved!");
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
                value={selectedMealType}
                onChange={(e) => setSelectedMealType(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="full_day">{t.fullDay}</option>
                <option value="lunch">{t.lunch}</option>
                <option value="dinner">{t.dinner}</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddBlockedDate} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
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
                value={selectedMealType}
                onChange={(e) => setSelectedMealType(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="full_day">{t.fullDay}</option>
                <option value="lunch">{t.lunch}</option>
                <option value="dinner">{t.dinner}</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddBlockedWeekday} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
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
          {blockedDates.length === 0 ? (
            <p className="text-muted-foreground">{t.noBlockedDates}</p>
          ) : (
            <div className="space-y-2">
              {blockedDates.map((block) => (
                <div
                  key={block.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {block.weekday !== undefined
                        ? `${weekdayNames[block.weekday]} - ${
                            block.type === "full_day"
                              ? t.fullDay
                              : block.type === "lunch"
                              ? t.lunch
                              : t.dinner
                          }`
                        : `${block.date} - ${
                            block.type === "full_day"
                              ? t.fullDay
                              : block.type === "lunch"
                              ? t.lunch
                              : t.dinner
                          }`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteBlock(block.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} className="w-full" size="lg">
        {t.save}
      </Button>
    </div>
  );
}
