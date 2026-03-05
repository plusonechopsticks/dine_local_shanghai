import React, { useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle } from "lucide-react";

interface AvailabilityCalendarProps {
  disabledDates: Set<string>;
  selectedDate: string;
  onDateSelect: (date: string) => void;
  availability?: Record<string, string[]>;
}

export default function AvailabilityCalendar({
  disabledDates,
  selectedDate,
  onDateSelect,
  availability,
}: AvailabilityCalendarProps) {
  const minDate = new Date();
  const maxDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 90);
    return date;
  }, []);

  const getDateTile = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const isDisabled = disabledDates.has(dateStr);
    const isSelected = dateStr === selectedDate;

    if (isDisabled) {
      return {
        className: "bg-red-50 border border-red-200 text-red-600 cursor-not-allowed",
        title: "Not available",
      };
    }

    if (isSelected) {
      return {
        className: "bg-burgundy-100 border-2 border-burgundy-600 font-semibold",
        title: "Selected",
      };
    }

    return {
      className: "bg-green-50 border border-green-200 text-green-700 cursor-pointer hover:bg-green-100",
      title: "Available",
    };
  };

  const getAvailableDaysText = () => {
    if (!availability || Object.keys(availability).length === 0) {
      return "No availability information";
    }
    return Object.keys(availability)
      .map((day) => day.charAt(0).toUpperCase() + day.slice(1))
      .join(", ");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Select a Date</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="calendar-wrapper overflow-x-auto">
          <Calendar
            minDate={minDate}
            maxDate={maxDate}
            tileClassName={({ date }) => {
              const tile = getDateTile(date);
              return tile.className;
            }}
            tileDisabled={({ date }) => {
              const dateStr = date.toISOString().split("T")[0];
              return disabledDates.has(dateStr);
            }}
            onClickDay={(date) => {
              const dateStr = date.toISOString().split("T")[0];
              if (!disabledDates.has(dateStr)) {
                onDateSelect(dateStr);
              }
            }}
            value={selectedDate ? new Date(selectedDate + "T00:00:00") : null}
          />
        </div>

        <div className="space-y-3 border-t pt-4">
          <h3 className="font-semibold text-sm">Legend</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-50 border border-green-200 rounded" />
              <span className="text-sm text-gray-700">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 border border-red-200 rounded" />
              <span className="text-sm text-gray-700">Not Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-burgundy-100 border-2 border-burgundy-600 rounded" />
              <span className="text-sm text-gray-700">Selected</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t pt-4">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700">Host Available On:</p>
              <p className="text-sm text-gray-600">{getAvailableDaysText()}</p>
            </div>
          </div>
        </div>

        {selectedDate && (
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-burgundy-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">Selected Date:</p>
                <p className="text-sm text-gray-600">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
