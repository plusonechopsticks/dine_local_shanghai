import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Language = "zh" | "en";

interface Booking {
  id: number;
  guestName: string;
  guestEmail: string;
  requestedDate: string;
  numberOfGuests: number;
  mealType: string;
  bookingStatus: string;
  totalAmount?: number | string | null;
}

const translations = {
  zh: {
    bookings: "预订",
    description: "查看您的所有预订和收入",
    noBookings: "还没有预订",
    date: "日期",
    guests: "客人数",
    mealType: "用餐类型",
    grossEarnings: "总收入",
    netEarnings: "净收入（扣除30%平台费）",
    status: "状态",
  },
  en: {
    bookings: "Bookings",
    description: "View all your bookings and earnings",
    noBookings: "No bookings yet",
    date: "Date",
    guests: "Guests",
    mealType: "Meal Type",
    grossEarnings: "Gross Earnings",
    netEarnings: "Net Earnings (after 30% platform fee)",
    status: "Status",
  },
};

const statusColors: Record<string, string> = {
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function HostBookingsTab({
  bookings,
  language,
}: {
  bookings: Booking[];
  language: Language;
}) {
  const t = translations[language];

  const calculateEarnings = (booking: Booking) => {
    const gross = Number(booking.totalAmount) || 0;
    const net = gross * 0.7; // After 30% platform fee
    return { gross, net };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.bookings}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-muted-foreground">{t.noBookings}</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const { gross, net } = calculateEarnings(booking);
                const statusClass = statusColors[booking.bookingStatus] || "bg-gray-100 text-gray-800";
                return (
                  <div
                    key={booking.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-lg">{booking.guestName}</p>
                        <p className="text-sm text-muted-foreground">{booking.guestEmail}</p>
                      </div>
                      <Badge className={statusClass}>{booking.bookingStatus}</Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">{t.date}</p>
                        <p className="font-medium">
                          {new Date(booking.requestedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t.guests}</p>
                        <p className="font-medium">{booking.numberOfGuests}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t.mealType}</p>
                        <p className="font-medium capitalize">{booking.mealType}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t.grossEarnings}</p>
                        <p className="font-medium">¥{gross.toFixed(0)}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">{t.netEarnings}</p>
                      <p className="text-lg font-semibold text-green-600">¥{net.toFixed(0)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
