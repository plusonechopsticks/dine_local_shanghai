import React, { useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BookingCalendarProps {
  bookings: Array<{
    id: number;
    date: string;
    status: "pending" | "confirmed" | "cancelled";
    guestName: string;
    numberOfGuests: number;
  }>;
  availability?: Record<string, string[]>;
}

export default function BookingCalendar({ bookings, availability }: BookingCalendarProps) {
  const bookedDates = useMemo(() => {
    const dates = new Set<string>();
    bookings.forEach((booking) => {
      if (booking.status === "confirmed") {
        dates.add(new Date(booking.date).toDateString());
      }
    });
    return dates;
  }, [bookings]);

  const pendingDates = useMemo(() => {
    const dates = new Set<string>();
    bookings.forEach((booking) => {
      if (booking.status === "pending") {
        dates.add(new Date(booking.date).toDateString());
      }
    });
    return dates;
  }, [bookings]);

  const getDateTile = (date: Date) => {
    const dateStr = date.toDateString();
    const isBooked = bookedDates.has(dateStr);
    const isPending = pendingDates.has(dateStr);

    if (isBooked) {
      return {
        className: "bg-green-100 border-2 border-green-500",
        title: "Booked",
      };
    }

    if (isPending) {
      return {
        className: "bg-yellow-100 border-2 border-yellow-500",
        title: "Pending",
      };
    }

    return { className: "", title: "" };
  };

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return bookings.filter((b) => new Date(b.date).toDateString() === dateStr);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Calendar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="calendar-wrapper">
          <Calendar
            tileClassName={({ date }) => {
              const tile = getDateTile(date);
              return tile.className;
            }}
            tileContent={({ date }) => {
              const bookingsForDate = getBookingsForDate(date);
              if (bookingsForDate.length === 0) return null;
              return (
                <div className="text-xs mt-1">
                  {bookingsForDate.map((b) => (
                    <div key={b.id} className="text-center">
                      <Badge
                        variant={b.status === "confirmed" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {b.status === "confirmed" ? "✓" : "?"}
                      </Badge>
                    </div>
                  ))}
                </div>
              );
            }}
          />
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Legend</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded" />
              <span className="text-sm">Confirmed Bookings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-500 rounded" />
              <span className="text-sm">Pending Bookings</span>
            </div>
          </div>
        </div>

        {bookings.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Upcoming Bookings</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {bookings
                .filter((b) => new Date(b.date) >= new Date())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map((booking) => (
                  <div
                    key={booking.id}
                    className="p-2 border rounded-lg bg-gray-50 text-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{booking.guestName}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(booking.date).toLocaleDateString()} • {booking.numberOfGuests} guests
                        </p>
                      </div>
                      <Badge
                        variant={booking.status === "confirmed" ? "default" : "secondary"}
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
