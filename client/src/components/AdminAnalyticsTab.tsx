import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

interface PageViewData {
  date: string;
  home: number;
  browse_hosts: number;
  become_host: number;
}

interface HostTraffic {
  hostId: number;
  hostName: string;
  totalViews: number;
  views: Array<{ date: string; count: number }>;
}

export function AdminAnalyticsTab() {
  const [days, setDays] = useState(30);
  const [pageViewData, setPageViewData] = useState<PageViewData[]>([]);
  const [hostTraffic, setHostTraffic] = useState<HostTraffic[]>([]);

  const { data: analyticsData, isLoading } = trpc.analytics.getAnalytics.useQuery({ days });

  useEffect(() => {
    if (!analyticsData) return;

    // Aggregate data by date
    const dateMap: Record<string, Record<string, number>> = {};

    analyticsData.forEach((view) => {
      const dateStr = new Date(view.viewDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      if (!dateMap[dateStr]) {
        dateMap[dateStr] = {
          home: 0,
          browse_hosts: 0,
          become_host: 0,
        };
      }

      if (view.pageType === "host_detail" && view.hostListingId) {
        // Track host-specific traffic separately
      } else {
        dateMap[dateStr][view.pageType] = (dateMap[dateStr][view.pageType] || 0) + view.viewCount;
      }
    });

    // Convert to array format for chart
    const chartData = Object.entries(dateMap)
      .map(([date, data]) => ({
        date,
        home: data.home || 0,
        browse_hosts: data.browse_hosts || 0,
        become_host: data.become_host || 0,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setPageViewData(chartData);

    // Aggregate host-specific traffic
    const hostMap: Record<number, HostTraffic> = {};

    analyticsData.forEach((view) => {
      if (view.pageType === "host_detail" && view.hostListingId) {
        const hostId = view.hostListingId;
        if (!hostMap[hostId]) {
          hostMap[hostId] = {
            hostId,
            hostName: `Host ${hostId}`,
            totalViews: 0,
            views: [],
          };
        }
        hostMap[hostId].totalViews += view.viewCount;
        hostMap[hostId].views.push({
          date: new Date(view.viewDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          count: view.viewCount,
        });
      }
    });

    const hostArray = Object.values(hostMap).sort((a, b) => b.totalViews - a.totalViews);
    setHostTraffic(hostArray);
  }, [analyticsData]);

  const totalPageViews = pageViewData.reduce((sum, day) => {
    return sum + day.home + day.browse_hosts + day.become_host;
  }, 0);

  const totalHostViews = hostTraffic.reduce((sum, host) => sum + host.totalViews, 0);

  return (
    <div className="space-y-6">
      {/* Header with date range selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Traffic Analytics</h2>
          <p className="text-sm text-muted-foreground">Track daily traffic across your platform</p>
        </div>
        <Select value={days.toString()} onValueChange={(val) => setDays(parseInt(val))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPageViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">All pages combined</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Host Profile Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalHostViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">{hostTraffic.length} hosts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Avg Daily Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {pageViewData.length > 0 ? Math.round(totalPageViews / pageViewData.length) : 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Per day average</p>
              </CardContent>
            </Card>
          </div>

          {/* Page Traffic Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Traffic by Page Type</CardTitle>
              <CardDescription>Views for home, browse hosts, and become host pages</CardDescription>
            </CardHeader>
            <CardContent>
              {pageViewData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={pageViewData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="home" stroke="#8884d8" name="Home" strokeWidth={2} />
                    <Line type="monotone" dataKey="browse_hosts" stroke="#82ca9d" name="Browse Hosts" strokeWidth={2} />
                    <Line type="monotone" dataKey="become_host" stroke="#ffc658" name="Become Host" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No data available for the selected period
                </div>
              )}
            </CardContent>
          </Card>

          {/* Host Profile Traffic */}
          <Card>
            <CardHeader>
              <CardTitle>Host Profile Traffic</CardTitle>
              <CardDescription>Views for individual host profiles</CardDescription>
            </CardHeader>
            <CardContent>
              {hostTraffic.length > 0 ? (
                <div className="space-y-4">
                  {hostTraffic.slice(0, 10).map((host) => (
                    <div key={host.hostId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Host {host.hostId}</span>
                        <span className="text-sm text-muted-foreground">{host.totalViews} views</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(host.totalViews / (hostTraffic[0]?.totalViews || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {hostTraffic.length > 10 && (
                    <p className="text-sm text-muted-foreground pt-2">
                      +{hostTraffic.length - 10} more hosts
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No host profile views yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Traffic Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle>Traffic Summary</CardTitle>
              <CardDescription>Daily breakdown of all page types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-semibold">Date</th>
                      <th className="text-right py-2 px-2 font-semibold">Home</th>
                      <th className="text-right py-2 px-2 font-semibold">Browse</th>
                      <th className="text-right py-2 px-2 font-semibold">Become Host</th>
                      <th className="text-right py-2 px-2 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageViewData.map((day, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-2">{day.date}</td>
                      <td className="text-right py-2 px-2">{day.home}</td>
                      <td className="text-right py-2 px-2">{day.browse_hosts}</td>
                      <td className="text-right py-2 px-2">{day.become_host}</td>
                      <td className="text-right py-2 px-2 font-semibold">
                          {day.home + day.browse_hosts + day.become_host}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
