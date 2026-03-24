import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DateGridCalendarProps {
  disabledDates: Set<string>;
  selectedDate: string;
  onDateSelect: (date: string) => void;
  availability?: Record<string, string[]>;
}

export default function DateGridCalendar({
  disabledDates,
  selectedDate,
  onDateSelect,
  availability,
}: DateGridCalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const calendarDays = useMemo(() => {
    const days = [];
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [firstDay, daysInMonth]);

  const getDateString = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date.toISOString().split("T")[0];
  };

  const isDateDisabled = (day: number) => {
    const dateStr = getDateString(day);
    return disabledDates.has(dateStr);
  };

  const isDateSelected = (day: number) => {
    const dateStr = getDateString(day);
    return dateStr === selectedDate;
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const getAvailableDaysText = () => {
    if (!availability || Object.keys(availability).length === 0) {
      return "No availability information";
    }
    return Object.keys(availability)
      .map((day) => day.charAt(0).toUpperCase() + day.slice(1))
      .join(", ");
  };

  const weekDays = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
      {/* Month/Year Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="text-lg font-semibold text-center flex-1">{monthYear}</h3>
        <button
          onClick={handleNextMonth}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const isDisabled = isDateDisabled(day);
          const isSelected = isDateSelected(day);
          const dateStr = getDateString(day);

          return (
            <button
              key={day}
              onClick={() => {
                if (!isDisabled) {
                  onDateSelect(dateStr);
                }
              }}
              disabled={isDisabled}
              className={`
                aspect-square rounded flex items-center justify-center text-sm font-medium
                transition-colors
                ${
                  isSelected
                    ? "bg-burgundy-600 text-white font-bold"
                    : isDisabled
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-200 text-gray-900 hover:bg-green-50 cursor-pointer"
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="space-y-2 border-t pt-4">
        <h4 className="text-xs font-semibold text-gray-700 uppercase">Legend</h4>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-black" />
            <span className="text-xs text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <span className="text-xs text-gray-600">Unavailable</span>
          </div>
        </div>
      </div>

      {/* Host Availability Info */}
      <div className="border-t pt-4">
        <p className="text-xs font-semibold text-gray-700 uppercase mb-1">
          Host Available On:
        </p>
        <p className="text-sm text-gray-600">{getAvailableDaysText()}</p>
      </div>
    </div>
  );
}
