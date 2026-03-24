# +1 Chopsticks Email System Documentation

## Overview
The email system uses **Resend HTTP API** for sending all transactional emails. All templates are professional, branded, and include complete information for guests and hosts.

**Email Provider:** Resend  
**API Key:** re_85unqJW4_EeKwhgU9Fa2wj4ukb1Ty9Wzp  
**Sender Email:** foodie@plus1chopsticks.com  
**Verified Domain:** plus1chopsticks.com  

---

## Auto-Triggered Emails (4 Types)

### 1. Guest Confirmation Email
**Trigger:** When a booking is confirmed and payment is received  
**Recipient:** Guest  
**Template File:** `server/email-templates.ts` → `generateBookingConfirmationEmail()`

**Content Includes:**
- Booking confirmation number
- Host name, date, meal type, number of guests
- Total amount paid and payment confirmation
- Transaction ID (Stripe session ID)
- What happens next (host will contact within 24-48 hours)
- Important information boxes (Confirmed status, Free cancellation up to 7 days)
- Cancellation policy details
- Contact information for support

**Function:** `sendGuestConfirmationEmail(data)`  
**Parameters:**
```typescript
{
  bookingId: number;
  guestName: string;
  guestEmail: string;
  hostName: string;
  requestedDate: string;
  mealType: "lunch" | "dinner";
  numberOfGuests: number;
  totalAmount: string;
  paymentDate: Date;
  stripeSessionId: string;
}
```

---

### 2. Payment Reminder Email
**Trigger:** When a booking request is pending payment (optional, can be scheduled)  
**Recipient:** Guest  
**Template File:** `server/email-templates.ts` → `generatePaymentReminderEmail()`

**Content Includes:**
- Booking details (host, date, meal type, guests)
- Booking amount
- Payment button linking to Stripe checkout
- Benefits reminder (authentic experience, free cancellation)
- What happens after payment
- Contact information

**Function:** `sendPaymentReminderEmail(data)`  
**Parameters:**
```typescript
{
  bookingId: number;
  guestName: string;
  guestEmail: string;
  hostName: string;
  requestedDate: string;
  mealType: "lunch" | "dinner";
  numberOfGuests: number;
  totalAmount: string;
  paymentLink: string;
}
```

---

### 3. Host Confirmation Email
**Trigger:** When a booking is confirmed and payment is received  
**Recipient:** Host  
**Template File:** `server/email-templates.ts` → `generateHostNotificationEmail()`

**Content Includes:**
- Celebration banner ("New Confirmed Booking!")
- Guest information (name, email, phone)
- Booking details (date, meal type, number of guests, amount paid)
- **Dietary restrictions section** (highlighted in red box - important!)
- Next steps checklist (review restrictions, contact guest, confirm details)
- **Suggested email template** to send to guest (copy-paste ready)
- Payment information (70% earnings, payout timeline 7-14 days)
- Important reminders (payment confirmed, cancellation deadline, response deadline)
- Support contact information

**Function:** `sendHostConfirmationEmail(data)`  
**Parameters:**
```typescript
{
  bookingId: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  requestedDate: string;
  mealType: "lunch" | "dinner";
  numberOfGuests: number;
  totalAmount: number;
  dietaryRestrictions: string | null;
  hostName: string;
  hostEmail: string;
  hostEarnings: number;
}
```

---

### 4. Guest Reminder Email
**Trigger:** Automatically 48 hours before the dining experience  
**Recipient:** Guest  
**Template File:** `server/guest-reminder-email.ts` → `generateGuestReminderEmail()`  
**Scheduler:** `server/reminder-scheduler.ts`

**Content Includes:**
- Personalized greeting with guest name
- Full experience details (host name, date, time, cuisine, party size)
- **Three cheat sheet images** (in order):
  1. Getting There & Arriving, At the Table, The "Eat More" Culture
  2. Chopsticks Basics & Holding, Do's & Don'ts
  3. Useful Mandarin Expressions
- "What to Expect" section
- Pro tip about saving images to phone
- Cancellation policy
- Support contact information

**Image URLs:**
- Image 1: https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/QrLQJrSWYhOYageb.png
- Image 2: https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/uojRVtrekQZvMhtq.png
- Image 3: https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/bJPmiSkMPWodOhTx.png

**Function:** `generateGuestReminderEmail(data)` (returns HTML string)  
**Parameters:**
```typescript
{
  guestName: string;
  hostName: string;
  hostEmail: string;
  experienceDate: string;
  mealType: "lunch" | "dinner";
  numberOfGuests: number;
  cuisine: string;
}
```

**Scheduling:**
- Reminders are scheduled automatically when a booking is confirmed
- Stored in database with scheduled time (48 hours before experience)
- Scheduler runs on startup and processes pending reminders
- Status tracked as "pending" or "sent"

---

## File Structure

```
server/
  ├── email.ts                    # Main email functions (sendGuestConfirmationEmail, etc.)
  ├── email-templates.ts          # Professional HTML templates
  ├── guest-reminder-email.ts     # Guest reminder template with cheat sheets
  ├── reminder-scheduler.ts       # Scheduler for 48-hour reminders
  └── email.ts.test              # Email function tests
```

---

## Key Features

### Professional Branding
- +1 Chopsticks header with Chinese characters (加一雙筷子)
- Consistent color scheme (#7c2d12 brown, #fef3c7 yellow accents)
- Professional typography and spacing
- Responsive design for mobile and desktop

### Information Completeness
- All booking details included
- Clear next steps for both guests and hosts
- Dietary restrictions prominently displayed for hosts
- Payment information transparent
- Cancellation policies clearly stated

### User Experience
- Suggested email template for hosts (copy-paste ready)
- Cheat sheet images for guests (downloadable)
- Clear CTAs (buttons, links)
- Support contact information on every email
- Professional footer with copyright

---

## Resend API Integration

### Configuration
- **API Key:** Environment variable `RESEND_API_KEY`
- **Sender Email:** Environment variable `EMAIL_FROM`
- **Domain:** Verified on Resend dashboard

### Rate Limits
- 5 emails per second
- Daily and monthly quotas tracked

### Error Handling
- Try-catch blocks on all email sends
- Errors logged to console
- Returns boolean (true/false) for success/failure

---

## Testing

### Send All Sample Emails
```bash
pnpm tsx send-all-sample-emails.ts
```

This sends one sample of each email type to `plusonechopsticks@gmail.com`.

### Individual Email Tests
```bash
pnpm test server/email.ts
```

---

## Future Enhancements

1. **Email Unsubscribe Links** - Add footer unsubscribe option (CAN-SPAM compliance)
2. **Email Analytics** - Track open rates, click rates, engagement
3. **A/B Testing** - Test different subject lines or content variations
4. **Localization** - Support for multiple languages (Chinese, English, etc.)
5. **Custom Branding** - Allow hosts to customize email templates
6. **Webhook Events** - Track email delivery, bounces, complaints

---

## Important Notes

- **Never store sensitive data** - Don't store payment details, full card numbers, or API keys
- **Always use environment variables** - API keys should never be hardcoded
- **Test before production** - Always test email templates with sample data
- **Monitor deliverability** - Check Resend dashboard for bounce rates and complaints
- **Keep templates updated** - Update templates when business rules change (e.g., cancellation policy)

---

## User Information

**Owner Email:** plusonechopsticks@gmail.com  
**Support Email:** foodie@plus1chopsticks.com  
**Domain:** plus1chopsticks.com  

---

Last Updated: March 22, 2026
