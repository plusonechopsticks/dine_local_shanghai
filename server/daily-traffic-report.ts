import { eq, and, sql, gte, lt, desc, isNull, ne } from "drizzle-orm";
import { getDb } from "./db";
import { pageViews, hostListings, blogPosts, bookings } from "../drizzle/schema";
import { sendEmail } from "./email";

/**
 * Get yesterday's date range in Asia/Shanghai timezone
 * Returns { dateStr: "YYYY-MM-DD", label: "Monday, April 25, 2026" }
 */
function getYesterdayShanghai(daysAgo = 1): { dateStr: string; label: string } {
  const now = new Date();
  // Get current time in Shanghai (UTC+8)
  const shanghaiOffset = 8 * 60; // minutes
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const shanghaiMs = utcMs + shanghaiOffset * 60000;
  const shanghaiNow = new Date(shanghaiMs);
  
  // Subtract daysAgo days
  const target = new Date(shanghaiNow);
  target.setDate(target.getDate() - daysAgo);
  
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  
  const label = target.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  return { dateStr, label };
}

function getLastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n; i >= 1; i--) {
    days.push(getYesterdayShanghai(i).dateStr);
  }
  return days;
}

interface TrafficReportData {
  dateLabel: string;
  dateStr: string;
  // Summary
  totalViewsYesterday: number;
  totalViewsPrevDay: number;
  uniquePagesYesterday: number;
  newBookingsYesterday: number;
  daysSinceLastBooking: number;
  upcomingConfirmedBookings: number;
  pendingUnpaidBookings: number;
  // Page breakdown
  pageBreakdown: {
    pageType: string;
    label: string;
    emoji: string;
    viewsYesterday: number;
    avg7day: number;
  }[];
  // Top hosts
  topHosts: {
    rank: number;
    hostName: string;
    cuisineStyle: string;
    district: string;
    viewsYesterday: number;
    maxViews: number;
  }[];
  // Top blog posts
  topBlogPosts: {
    title: string;
    viewsYesterday: number;
  }[];
  // 7-day sparkline values
  sparkline7day: number[];
}

async function gatherTrafficData(targetDateStr?: string): Promise<TrafficReportData> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const yesterday = targetDateStr 
    ? { dateStr: targetDateStr, label: new Date(targetDateStr + 'T12:00:00+08:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }
    : getYesterdayShanghai(1);
  
  const prevDay = getYesterdayShanghai(2);
  const last7Days = getLastNDays(7);

  // --- Page views for yesterday ---
  const yesterdayViews = await db
    .select()
    .from(pageViews)
    .where(eq(pageViews.viewDate, yesterday.dateStr as any));

  const prevDayViews = await db
    .select()
    .from(pageViews)
    .where(eq(pageViews.viewDate, prevDay.dateStr as any));

  // --- 7-day sparkline (total per day) ---
  const sparklineRows = await db
    .select({
      viewDate: pageViews.viewDate,
      total: sql<number>`SUM(${pageViews.viewCount})`,
    })
    .from(pageViews)
    .where(sql`${pageViews.viewDate} IN (${sql.join(last7Days.map(d => sql`${d}`), sql`, `)})`)
    .groupBy(pageViews.viewDate);

  const sparklineMap: Record<string, number> = {};
  for (const row of sparklineRows) {
    sparklineMap[String(row.viewDate)] = Number(row.total);
  }
  const sparkline7day = last7Days.map(d => sparklineMap[d] || 0);

  // --- 7-day averages per page type ---
  const avg7dayRows = await db
    .select({
      pageType: pageViews.pageType,
      avg: sql<number>`AVG(${pageViews.viewCount})`,
    })
    .from(pageViews)
    .where(sql`${pageViews.viewDate} IN (${sql.join(last7Days.map(d => sql`${d}`), sql`, `)})`)
    .groupBy(pageViews.pageType);

  const avg7dayMap: Record<string, number> = {};
  for (const row of avg7dayRows) {
    avg7dayMap[row.pageType] = Math.round(Number(row.avg));
  }

  // --- Page breakdown ---
  const pageConfig = [
    { pageType: 'home', label: 'Homepage', emoji: '🏠' },
    { pageType: 'browse_hosts', label: 'Browse Hosts', emoji: '🔍' },
    { pageType: 'host_detail', label: 'Host Detail Pages', emoji: '🍽' },
    { pageType: 'become_host', label: 'Become a Host', emoji: '🏡' },
  ];

  // Sum up yesterday's views by pageType (non-host-detail rows)
  const pageTypeMap: Record<string, number> = {};
  let hostDetailTotal = 0;
  for (const row of yesterdayViews) {
    if (row.pageType === 'host_detail') {
      hostDetailTotal += row.viewCount;
    } else {
      pageTypeMap[row.pageType] = (pageTypeMap[row.pageType] || 0) + row.viewCount;
    }
  }
  pageTypeMap['host_detail'] = hostDetailTotal;

  const pageBreakdown = pageConfig.map(p => ({
    ...p,
    viewsYesterday: pageTypeMap[p.pageType] || 0,
    avg7day: avg7dayMap[p.pageType] || 0,
  }));

  // Also count blog views from blogPosts.viewCount delta (approximate: use current total)
  // We'll add a blog row using the sum of all blog post viewCounts as a proxy
  // (since blog_posts.viewCount is cumulative, not daily — we'll skip daily blog breakdown for now)

  const totalViewsYesterday = yesterdayViews.reduce((sum, r) => sum + r.viewCount, 0);
  const totalViewsPrevDay = prevDayViews.reduce((sum, r) => sum + r.viewCount, 0);
  const uniquePagesYesterday = new Set(yesterdayViews.map(r => r.pageType + (r.hostListingId || ''))).size;

  // --- Top host profiles ---
  const hostDetailRows = yesterdayViews.filter(r => r.pageType === 'host_detail' && r.hostListingId);
  const hostViewMap: Record<number, number> = {};
  for (const row of hostDetailRows) {
    if (row.hostListingId) {
      hostViewMap[row.hostListingId] = (hostViewMap[row.hostListingId] || 0) + row.viewCount;
    }
  }

  const hostIds = Object.keys(hostViewMap).map(Number);
  let topHosts: TrafficReportData['topHosts'] = [];
  if (hostIds.length > 0) {
    const hostRows = await db
      .select({ id: hostListings.id, hostName: hostListings.hostName, cuisineStyle: hostListings.cuisineStyle, district: hostListings.district })
      .from(hostListings)
      .where(sql`${hostListings.id} IN (${sql.join(hostIds.map(id => sql`${id}`), sql`, `)})`);

    const hostInfoMap: Record<number, typeof hostRows[0]> = {};
    for (const h of hostRows) hostInfoMap[h.id] = h;

    const sorted = Object.entries(hostViewMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    const maxViews = sorted[0]?.[1] || 1;

    topHosts = sorted.map(([id, views], idx) => ({
      rank: idx + 1,
      hostName: hostInfoMap[Number(id)]?.hostName || `Host #${id}`,
      cuisineStyle: hostInfoMap[Number(id)]?.cuisineStyle || '',
      district: hostInfoMap[Number(id)]?.district || '',
      viewsYesterday: views,
      maxViews,
    }));
  }

  // --- Top blog posts (by cumulative viewCount, top 4) ---
  const topBlogRows = await db
    .select({ title: blogPosts.title, viewCount: blogPosts.viewCount })
    .from(blogPosts)
    .where(eq(blogPosts.published, true))
    .orderBy(desc(blogPosts.viewCount))
    .limit(4);

  const topBlogPosts = topBlogRows.map(r => ({
    title: r.title,
    viewsYesterday: r.viewCount, // cumulative, labeled as "total views"
  }));

  // --- Bookings ---
  const todayShanghai = getYesterdayShanghai(0);
  const newBookingsYesterday = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(bookings)
    .where(
      and(
        sql`DATE(CONVERT_TZ(${bookings.createdAt}, '+00:00', '+08:00')) = ${yesterday.dateStr}`,
        eq(bookings.hidden, false)
      )
    );

  // Days since last booking (any confirmed or paid booking)
  const lastBooking = await db
    .select({ createdAt: bookings.createdAt })
    .from(bookings)
    .where(
      and(
        eq(bookings.hidden, false),
        sql`${bookings.bookingStatus} IN ('confirmed', 'pending') AND ${bookings.paymentStatus} = 'paid'`
      )
    )
    .orderBy(desc(bookings.createdAt))
    .limit(1);

  let daysSinceLastBooking = 0;
  if (lastBooking.length > 0) {
    const lastDate = new Date(lastBooking[0].createdAt);
    const nowMs = Date.now();
    daysSinceLastBooking = Math.floor((nowMs - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  } else {
    daysSinceLastBooking = 99;
  }

  // Upcoming confirmed bookings (future dates)
  const upcomingResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(bookings)
    .where(
      and(
        eq(bookings.hidden, false),
        sql`${bookings.requestedDate} >= CURDATE()`,
        sql`${bookings.bookingStatus} IN ('confirmed', 'pending')`
      )
    );

  // Pending unpaid bookings
  const pendingResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(bookings)
    .where(
      and(
        eq(bookings.hidden, false),
        eq(bookings.paymentStatus, 'pending'),
        sql`${bookings.bookingStatus} NOT IN ('cancelled', 'rejected')`
      )
    );

  return {
    dateLabel: yesterday.label,
    dateStr: yesterday.dateStr,
    totalViewsYesterday,
    totalViewsPrevDay,
    uniquePagesYesterday,
    newBookingsYesterday: Number(newBookingsYesterday[0]?.count || 0),
    daysSinceLastBooking,
    upcomingConfirmedBookings: Number(upcomingResult[0]?.count || 0),
    pendingUnpaidBookings: Number(pendingResult[0]?.count || 0),
    pageBreakdown,
    topHosts,
    topBlogPosts,
    sparkline7day,
  };
}

function generateTrafficReportEmail(data: TrafficReportData): string {
  const maxPageViews = Math.max(...data.pageBreakdown.map(p => p.viewsYesterday), 1);
  const maxSparkline = Math.max(...data.sparkline7day, 1);

  const deltaText = () => {
    const diff = data.totalViewsYesterday - data.totalViewsPrevDay;
    if (data.totalViewsPrevDay === 0) return '<span style="color:#888;">— no prev data</span>';
    const pct = Math.round((diff / data.totalViewsPrevDay) * 100);
    if (diff > 0) return `<span style="color:#4ade80;">▲ ${pct}% vs prev day</span>`;
    if (diff < 0) return `<span style="color:#f87171;">▼ ${Math.abs(pct)}% vs prev day</span>`;
    return '<span style="color:#888;">— same as prev</span>';
  };

  const daysSinceAlert = data.daysSinceLastBooking >= 7
    ? `<span style="color:#f87171;">⚠ ${data.daysSinceLastBooking} days dry</span>`
    : `<span style="color:#4ade80;">${data.daysSinceLastBooking} days ago</span>`;

  const sparklineBars = data.sparkline7day.map((v, i) => {
    const heightPct = Math.round((v / maxSparkline) * 100);
    const isToday = i === data.sparkline7day.length - 1;
    const color = isToday ? '#C9A84C' : '#2a2a2a';
    return `<div style="flex:1;background:${color};border-radius:2px;height:${Math.max(heightPct, 4)}%;"></div>`;
  }).join('');

  const pageRows = data.pageBreakdown.map(p => {
    const barWidth = Math.round((p.viewsYesterday / maxPageViews) * 100);
    return `
      <tr>
        <td style="padding:9px 0;border-top:1px solid #1e1e1e;color:#eee;font-size:13px;font-weight:500;">${p.emoji} ${p.label}</td>
        <td style="padding:9px 0;border-top:1px solid #1e1e1e;color:#C9A84C;font-size:15px;font-weight:700;text-align:right;width:50px;">${p.viewsYesterday}</td>
        <td style="padding:9px 12px;border-top:1px solid #1e1e1e;width:120px;">
          <div style="background:#1e1e1e;border-radius:4px;height:6px;overflow:hidden;">
            <div style="background:#C9A84C;height:6px;border-radius:4px;width:${barWidth}%;"></div>
          </div>
        </td>
        <td style="padding:9px 0;border-top:1px solid #1e1e1e;color:#888;font-size:13px;text-align:right;width:60px;">${p.avg7day}</td>
      </tr>`;
  }).join('');

  const hostRows = data.topHosts.length === 0
    ? '<p style="color:#666;font-size:13px;padding:8px 0;">No host profile views tracked yesterday.</p>'
    : data.topHosts.map(h => {
        const barWidth = Math.round((h.viewsYesterday / h.maxViews) * 100);
        return `
          <tr>
            <td style="padding:10px 0;border-top:1px solid #1e1e1e;color:#555;font-size:11px;width:20px;text-align:center;">${h.rank}</td>
            <td style="padding:10px 8px;border-top:1px solid #1e1e1e;">
              <div style="color:#eee;font-size:13px;font-weight:600;">${h.hostName}</div>
              <div style="color:#666;font-size:11px;margin-top:2px;">${h.cuisineStyle} · ${h.district}</div>
            </td>
            <td style="padding:10px 8px;border-top:1px solid #1e1e1e;width:90px;">
              <div style="background:#1e1e1e;border-radius:4px;height:6px;overflow:hidden;">
                <div style="background:#C9A84C;height:6px;border-radius:4px;width:${barWidth}%;"></div>
              </div>
            </td>
            <td style="padding:10px 0;border-top:1px solid #1e1e1e;text-align:right;width:50px;">
              <div style="color:#C9A84C;font-size:16px;font-weight:800;">${h.viewsYesterday}</div>
              <div style="color:#555;font-size:10px;">views</div>
            </td>
          </tr>`;
      }).join('');

  const blogRows = data.topBlogPosts.length === 0
    ? '<p style="color:#666;font-size:13px;padding:8px 0;">No blog posts tracked yet.</p>'
    : data.topBlogPosts.map(b => `
        <tr>
          <td style="padding:9px 0;border-top:1px solid #1e1e1e;color:#ccc;font-size:12px;">${b.title}</td>
          <td style="padding:9px 0;border-top:1px solid #1e1e1e;color:#C9A84C;font-size:14px;font-weight:700;text-align:right;width:50px;">${b.viewsYesterday}</td>
        </tr>`).join('');

  const blogNote = data.topBlogPosts.length > 0
    ? '<p style="color:#555;font-size:10px;margin-top:6px;">* Blog view counts are cumulative totals, not daily.</p>'
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>+1 Chopsticks Daily Traffic Report</title>
</head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0d0d0d;border-radius:12px;overflow:hidden;border:1px solid #1e1e1e;">

  <!-- Header -->
  <tr>
    <td style="background:#C9A84C;padding:28px 32px;text-align:center;">
      <div style="font-size:22px;font-weight:800;color:#0d0d0d;letter-spacing:-0.5px;">+1 Chopsticks &nbsp;·&nbsp; 加一雙筷子</div>
      <div style="font-size:11px;color:rgba(0,0,0,0.55);letter-spacing:3px;text-transform:uppercase;margin-top:4px;">Daily Traffic Report</div>
      <div style="margin-top:16px;font-size:18px;font-weight:700;color:#0d0d0d;">📊 ${data.dateLabel}</div>
      <div style="font-size:13px;color:rgba(0,0,0,0.6);margin-top:4px;">Sent every morning at 8:00 AM CST</div>
    </td>
  </tr>

  <!-- Body -->
  <tr><td style="padding:28px 32px;">

    <!-- Summary cards -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td width="33%" style="padding-right:6px;">
          <div style="background:#1a1a1a;border-radius:8px;padding:16px;text-align:center;border:1px solid #2a2a2a;">
            <div style="font-size:28px;font-weight:800;color:#C9A84C;line-height:1;">${data.totalViewsYesterday}</div>
            <div style="font-size:11px;color:#888;margin-top:6px;text-transform:uppercase;letter-spacing:1px;">Total Views</div>
            <div style="font-size:12px;margin-top:4px;">${deltaText()}</div>
          </div>
        </td>
        <td width="33%" style="padding:0 3px;">
          <div style="background:#1a1a1a;border-radius:8px;padding:16px;text-align:center;border:1px solid #2a2a2a;">
            <div style="font-size:28px;font-weight:800;color:#C9A84C;line-height:1;">${data.uniquePagesYesterday}</div>
            <div style="font-size:11px;color:#888;margin-top:6px;text-transform:uppercase;letter-spacing:1px;">Unique Pages</div>
            <div style="font-size:12px;margin-top:4px;color:#888;">tracked</div>
          </div>
        </td>
        <td width="33%" style="padding-left:6px;">
          <div style="background:#1a1a1a;border-radius:8px;padding:16px;text-align:center;border:1px solid #2a2a2a;">
            <div style="font-size:28px;font-weight:800;color:#C9A84C;line-height:1;">${data.newBookingsYesterday}</div>
            <div style="font-size:11px;color:#888;margin-top:6px;text-transform:uppercase;letter-spacing:1px;">New Bookings</div>
            <div style="font-size:12px;margin-top:4px;">${daysSinceAlert}</div>
          </div>
        </td>
      </tr>
    </table>

    <!-- 7-day sparkline -->
    <div style="font-size:11px;font-weight:700;color:#C9A84C;text-transform:uppercase;letter-spacing:2px;border-bottom:1px solid #2a2a2a;padding-bottom:8px;margin-bottom:14px;">7-Day Trend</div>
    <div style="display:flex;align-items:flex-end;gap:4px;height:40px;margin-bottom:28px;">
      ${sparklineBars}
    </div>

    <!-- Page views table -->
    <div style="font-size:11px;font-weight:700;color:#C9A84C;text-transform:uppercase;letter-spacing:2px;border-bottom:1px solid #2a2a2a;padding-bottom:8px;margin-bottom:14px;">Page Views by Section</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <thead>
        <tr>
          <th style="font-size:10px;color:#666;text-transform:uppercase;letter-spacing:1px;text-align:left;padding-bottom:8px;font-weight:600;">Page</th>
          <th style="font-size:10px;color:#666;text-transform:uppercase;letter-spacing:1px;text-align:right;padding-bottom:8px;font-weight:600;width:50px;">Views</th>
          <th style="font-size:10px;color:#666;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;font-weight:600;width:120px;"></th>
          <th style="font-size:10px;color:#666;text-transform:uppercase;letter-spacing:1px;text-align:right;padding-bottom:8px;font-weight:600;width:60px;">7d avg</th>
        </tr>
      </thead>
      <tbody>
        ${pageRows}
      </tbody>
    </table>

    <!-- Top host profiles -->
    <div style="font-size:11px;font-weight:700;color:#C9A84C;text-transform:uppercase;letter-spacing:2px;border-bottom:1px solid #2a2a2a;padding-bottom:8px;margin-bottom:14px;">Top Host Profiles Viewed</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tbody>${hostRows}</tbody>
    </table>

    <!-- Top blog posts -->
    <div style="font-size:11px;font-weight:700;color:#C9A84C;text-transform:uppercase;letter-spacing:2px;border-bottom:1px solid #2a2a2a;padding-bottom:8px;margin-bottom:14px;">Top Blog Posts</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:4px;">
      <tbody>${blogRows}</tbody>
    </table>
    ${blogNote}

    <!-- Booking funnel signals -->
    <div style="font-size:11px;font-weight:700;color:#C9A84C;text-transform:uppercase;letter-spacing:2px;border-bottom:1px solid #2a2a2a;padding-bottom:8px;margin-bottom:14px;margin-top:28px;">Booking Signals</div>
    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:16px;margin-bottom:28px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:12px;color:#888;padding:6px 0;">Days since last paid booking</td>
          <td style="font-size:13px;font-weight:600;text-align:right;padding:6px 0;color:${data.daysSinceLastBooking >= 7 ? '#f87171' : '#4ade80'};">${data.daysSinceLastBooking >= 7 ? '⚠ ' : ''}${data.daysSinceLastBooking} days</td>
        </tr>
        <tr>
          <td style="font-size:12px;color:#888;padding:6px 0;border-top:1px solid #1e1e1e;">Upcoming confirmed bookings</td>
          <td style="font-size:13px;font-weight:600;text-align:right;padding:6px 0;border-top:1px solid #1e1e1e;color:#4ade80;">${data.upcomingConfirmedBookings} booking${data.upcomingConfirmedBookings !== 1 ? 's' : ''}</td>
        </tr>
        <tr>
          <td style="font-size:12px;color:#888;padding:6px 0;border-top:1px solid #1e1e1e;">Pending (unpaid) bookings</td>
          <td style="font-size:13px;font-weight:600;text-align:right;padding:6px 0;border-top:1px solid #1e1e1e;color:#eee;">${data.pendingUnpaidBookings} pending</td>
        </tr>
      </table>
    </div>

  </td></tr>

  <!-- Footer -->
  <tr>
    <td style="background:#111;padding:20px 32px;text-align:center;border-top:1px solid #1e1e1e;">
      <p style="font-size:11px;color:#444;line-height:1.6;margin:0;">
        +1 Chopsticks &nbsp;·&nbsp; <a href="https://plus1chopsticks.com" style="color:#C9A84C;text-decoration:none;">plus1chopsticks.com</a><br>
        Sent daily at 8:00 AM China Standard Time<br>
        <a href="https://plus1chopsticks.com/admin" style="color:#C9A84C;text-decoration:none;">View Admin Dashboard →</a>
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

/**
 * Send the daily traffic report email for a given date (defaults to yesterday Shanghai time)
 */
export async function sendDailyTrafficReport(targetDateStr?: string): Promise<void> {
  const data = await gatherTrafficData(targetDateStr);
  const html = generateTrafficReportEmail(data);
  
  await sendEmail({
    to: "plusonechopsticks@gmail.com",
    subject: `📊 +1 Chopsticks Traffic Report — ${data.dateLabel}`,
    html,
  });
  
  console.log(`[TrafficReport] Daily traffic report sent for ${data.dateStr}`);
}
