interface BookingConfirmationData {
  guestName: string;
  bookingId: number;
  hostName: string;
  requestedDate: string;
  mealType: string;
  numberOfGuests: number;
  totalAmount: string;
  paymentDate: Date;
  stripeSessionId: string;
}

export function generateBookingConfirmationEmail(data: BookingConfirmationData): string {
  const formattedDate = new Date(data.requestedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedPaymentDate = data.paymentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - +1 Chopsticks</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #7c2d12; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">+1 Chopsticks</h1>
              <p style="margin: 8px 0 0 0; color: #fef3c7; font-size: 18px;">加一雙筷子</p>
            </td>
          </tr>

          <!-- Success Icon -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <div style="width: 64px; height: 64px; margin: 0 auto; background-color: #dcfce7; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px; color: #16a34a;">✓</span>
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px; font-weight: 600; text-align: center;">Your Dining Experience is Confirmed! 🥢</h2>
              <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6; text-align: center;">
                Great news! Your payment has been successfully processed and your home dining experience is now confirmed.
              </p>
            </td>
          </tr>

          <!-- Booking Details -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <div style="background-color: #fef3c7; border-left: 4px solid #7c2d12; padding: 20px; border-radius: 4px;">
                <h3 style="margin: 0 0 16px 0; color: #7c2d12; font-size: 18px; font-weight: 600;">Booking Confirmation #${data.bookingId}</h3>
                
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #78716c; font-size: 14px; font-weight: 600; width: 40%;">Host:</td>
                    <td style="color: #1f2937; font-size: 14px;">${data.hostName}</td>
                  </tr>
                  <tr>
                    <td style="color: #78716c; font-size: 14px; font-weight: 600;">Date:</td>
                    <td style="color: #1f2937; font-size: 14px;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="color: #78716c; font-size: 14px; font-weight: 600;">Meal:</td>
                    <td style="color: #1f2937; font-size: 14px;">${data.mealType}</td>
                  </tr>
                  <tr>
                    <td style="color: #78716c; font-size: 14px; font-weight: 600;">Guests:</td>
                    <td style="color: #1f2937; font-size: 14px;">${data.numberOfGuests} ${data.numberOfGuests === 1 ? 'guest' : 'guests'}</td>
                  </tr>
                  <tr>
                    <td style="color: #78716c; font-size: 14px; font-weight: 600;">Total Paid:</td>
                    <td style="color: #7c2d12; font-size: 16px; font-weight: 600;">¥${data.totalAmount}</td>
                  </tr>
                </table>

                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #d6d3d1;">
                  <p style="margin: 0; color: #78716c; font-size: 12px;">Payment Date: ${formattedPaymentDate}</p>
                  <p style="margin: 4px 0 0 0; color: #78716c; font-size: 12px;">Transaction ID: ${data.stripeSessionId}</p>
                </div>
              </div>
            </td>
          </tr>

          <!-- What Happens Next -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">What Happens Next?</h3>
              <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Your host will contact you within 24-48 hours to:
              </p>
              <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.8;">
                <li>Confirm the exact time for your meal</li>
                <li>Share their home address and directions</li>
                <li>Discuss any dietary preferences or restrictions</li>
                <li>Answer any questions you may have</li>
              </ul>
            </td>
          </tr>

          <!-- Important Information -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding-right: 8px;">
                    <div style="background-color: #f0fdf4; padding: 16px; border-radius: 4px; text-align: center;">
                      <p style="margin: 0; color: #16a34a; font-size: 20px;">✅</p>
                      <p style="margin: 8px 0 0 0; color: #166534; font-size: 14px; font-weight: 600;">Confirmed</p>
                      <p style="margin: 4px 0 0 0; color: #15803d; font-size: 12px;">Your spot is secured</p>
                    </div>
                  </td>
                  <td width="50%" style="padding-left: 8px;">
                    <div style="background-color: #eff6ff; padding: 16px; border-radius: 4px; text-align: center;">
                      <p style="margin: 0; color: #2563eb; font-size: 20px;">📅</p>
                      <p style="margin: 8px 0 0 0; color: #1e40af; font-size: 14px; font-weight: 600;">Free Cancellation</p>
                      <p style="margin: 4px 0 0 0; color: #1d4ed8; font-size: 12px;">Up to 7 days before</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Cancellation Policy -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 4px;">
                <h3 style="margin: 0 0 12px 0; color: #991b1b; font-size: 16px; font-weight: 600;">Cancellation Policy</h3>
                <p style="margin: 0 0 12px 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                  You can cancel your booking free of charge up to 7 days before your scheduled dining date. Cancellations made within 7 days of the dining date are non-refundable.
                </p>
                <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                  To cancel your booking, please contact <strong>plusonechopsticks@gmail.com</strong> with your cancellation reason and we will process it right away.
                </p>
              </div>
            </td>
          </tr>

          <!-- Closing -->
          <tr>
            <td style="padding: 0 40px 40px 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                We're excited for you to experience authentic Chinese home cooking!
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Warm regards,<br>
                The +1 Chopsticks Team
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2026 +1 Chopsticks | Authentic Chinese Home Dining Experience
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

interface PaymentReminderData {
  guestName: string;
  bookingId: number;
  hostName: string;
  requestedDate: string;
  mealType: string;
  numberOfGuests: number;
  totalAmount: string;
  paymentLink: string;
}

export function generatePaymentReminderEmail(data: PaymentReminderData): string {
  const formattedDate = new Date(data.requestedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete Your Booking - +1 Chopsticks</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #7c2d12; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">+1 Chopsticks</h1>
              <p style="margin: 8px 0 0 0; color: #fef3c7; font-size: 18px;">加一雙筷子</p>
            </td>
          </tr>

          <!-- Pending Icon -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <div style="width: 64px; height: 64px; margin: 0 auto; background-color: #fef3c7; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px; color: #ca8a04;">⏳</span>
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px; font-weight: 600; text-align: center;">Complete Your Booking Payment</h2>
              <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6; text-align: center;">
                Hi ${data.guestName}, you're almost there! Your booking request has been submitted, but we haven't received your payment yet.
              </p>
            </td>
          </tr>

          <!-- Important Note -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <div style="background-color: #eff6ff; border-left: 4px solid: #2563eb; padding: 16px; border-radius: 4px;">
                <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                  <strong>Note:</strong> If you've already completed your payment and received a confirmation email, please disregard this message. This is an automated reminder for pending bookings.
                </p>
              </div>
            </td>
          </tr>

          <!-- Booking Details -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <div style="background-color: #fef3c7; border-left: 4px solid #7c2d12; padding: 20px; border-radius: 4px;">
                <h3 style="margin: 0 0 16px 0; color: #7c2d12; font-size: 18px; font-weight: 600;">Your Booking Details #${data.bookingId}</h3>
                
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #78716c; font-size: 14px; font-weight: 600; width: 40%;">Host:</td>
                    <td style="color: #1f2937; font-size: 14px;">${data.hostName}</td>
                  </tr>
                  <tr>
                    <td style="color: #78716c; font-size: 14px; font-weight: 600;">Date:</td>
                    <td style="color: #1f2937; font-size: 14px;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="color: #78716c; font-size: 14px; font-weight: 600;">Meal:</td>
                    <td style="color: #1f2937; font-size: 14px;">${data.mealType}</td>
                  </tr>
                  <tr>
                    <td style="color: #78716c; font-size: 14px; font-weight: 600;">Guests:</td>
                    <td style="color: #1f2937; font-size: 14px;">${data.numberOfGuests} ${data.numberOfGuests === 1 ? 'guest' : 'guests'}</td>
                  </tr>
                  <tr>
                    <td style="color: #78716c; font-size: 14px; font-weight: 600;">Total Amount:</td>
                    <td style="color: #7c2d12; font-size: 16px; font-weight: 600;">¥${data.totalAmount}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Payment Button -->
          <tr>
            <td style="padding: 0 40px 30px 40px; text-align: center;">
              <a href="${data.paymentLink}" style="display: inline-block; background-color: #7c2d12; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 6px; font-size: 16px; font-weight: 600; margin-bottom: 16px;">
                Complete Payment Now
              </a>
              <p style="margin: 16px 0 0 0; color: #6b7280; font-size: 14px;">
                Click the button above to securely complete your payment via Stripe
              </p>
            </td>
          </tr>

          <!-- Benefits Reminder -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding-right: 8px;">
                    <div style="background-color: #f0fdf4; padding: 16px; border-radius: 4px; text-align: center;">
                      <p style="margin: 0; color: #16a34a; font-size: 20px;">🏠</p>
                      <p style="margin: 8px 0 0 0; color: #166534; font-size: 14px; font-weight: 600;">Authentic Experience</p>
                      <p style="margin: 4px 0 0 0; color: #15803d; font-size: 12px;">Real Chinese home cooking</p>
                    </div>
                  </td>
                  <td width="50%" style="padding-left: 8px;">
                    <div style="background-color: #eff6ff; padding: 16px; border-radius: 4px; text-align: center;">
                      <p style="margin: 0; color: #2563eb; font-size: 20px;">📅</p>
                      <p style="margin: 8px 0 0 0; color: #1e40af; font-size: 14px; font-weight: 600;">Free Cancellation</p>
                      <p style="margin: 4px 0 0 0; color: #1d4ed8; font-size: 12px;">Up to 7 days before</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What Happens After Payment -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">After You Complete Payment:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.8;">
                <li>You'll receive an immediate confirmation email with all booking details</li>
                <li>Your host will contact you within 24-48 hours to finalize arrangements</li>
                <li>Your spot at the table will be secured</li>
              </ul>
            </td>
          </tr>

          <!-- Closing -->
          <tr>
            <td style="padding: 0 40px 40px 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                We're excited to welcome you to an authentic Chinese dining experience!
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Warm regards,<br>
                The +1 Chopsticks Team
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 12px;">
                Questions? Contact us at <a href="mailto:plusonechopsticks@gmail.com" style="color: #7c2d12; text-decoration: none;">plusonechopsticks@gmail.com</a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2026 +1 Chopsticks | Authentic Chinese Home Dining Experience
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}


interface HostNotificationData {
  bookingId: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  requestedDate: string;
  mealType: string;
  numberOfGuests: number;
  totalAmount: number;
  dietaryRestrictions: string | null;
  hostName: string;
  hostEarnings: number;
}

export function generateHostNotificationEmail(data: HostNotificationData): string {
  const formattedDate = new Date(data.requestedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const mealDate = new Date(data.requestedDate);
  const payoutStartDate = new Date(mealDate);
  payoutStartDate.setDate(payoutStartDate.getDate() + 7);
  const payoutEndDate = new Date(mealDate);
  payoutEndDate.setDate(payoutEndDate.getDate() + 14);
  
  const formattedPayoutRange = `${payoutStartDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}-${payoutEndDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  
  const cancelDeadline = new Date(mealDate);
  cancelDeadline.setDate(cancelDeadline.getDate() - 7);
  const formattedCancelDeadline = cancelDeadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  
  const dietaryInfo = data.dietaryRestrictions || "No special dietary restrictions";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Confirmed Booking - +1 Chopsticks</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #7c2d12; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">+1 Chopsticks</h1>
              <p style="margin: 8px 0 0 0; color: #fef3c7; font-size: 18px;">加一雙筷子</p>
            </td>
          </tr>

          <!-- Celebration Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 24px 40px; text-align: center;">
              <p style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">🎉 New Confirmed Booking!</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 40px 20px 40px;">
              <p style="margin: 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                Dear ${data.hostName},
              </p>
              <p style="margin: 16px 0 0 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                Congratulations! You have a new confirmed booking. Payment has been received and the guest is excited to experience your authentic Chinese home dining!
              </p>
            </td>
          </tr>

          <!-- Booking Details -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <div style="background-color: #fef3c7; border-left: 4px solid #7c2d12; padding: 20px; border-radius: 4px;">
                <h3 style="margin: 0 0 16px 0; color: #7c2d12; font-size: 18px; font-weight: 600;">Booking Details #${data.bookingId}</h3>
                
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #78716c; font-size: 14px; font-weight: 600; width: 40%;">Guest Name:</td>
                    <td style="color: #1f2937; font-size: 14px;">${data.guestName}</td>
                  </tr>
                  <tr>
                    <td style="color: #78716c; font-size: 14px; font-weight: 600;">Guest Email:</td>
                    <td style="color: #1f2937; font-size: 14px;"><a href="mailto:${data.guestEmail}" style="color: #7c2d12; text-decoration: none;">${data.guestEmail}</a></td>
                  </tr>
                  ${data.guestPhone ? `
                  <tr>
                    <td style="color: #78716c; font-size: 14px; font-weight: 600;">Guest Phone:</td>
                    <td style="color: #1f2937; font-size: 14px;">${data.guestPhone}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="color: #78716c; font-size: 14px; font-weight: 600;">Date:</td>
                    <td style="color: #1f2937; font-size: 14px;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="color: #78716c; font-size: 14px; font-weight: 600;">Meal Type:</td>
                    <td style="color: #1f2937; font-size: 14px; text-transform: capitalize;">${data.mealType}</td>
                  </tr>
                  <tr>
                    <td style="color: #78716c; font-size: 14px; font-weight: 600;">Number of Guests:</td>
                    <td style="color: #1f2937; font-size: 14px;">${data.numberOfGuests} ${data.numberOfGuests === 1 ? 'person' : 'people'}</td>
                  </tr>
                  <tr>
                    <td style="color: #78716c; font-size: 14px; font-weight: 600;">Total Amount Paid:</td>
                    <td style="color: #7c2d12; font-size: 16px; font-weight: 600;">¥${data.totalAmount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="color: #78716c; font-size: 14px; font-weight: 600;">Payment Status:</td>
                    <td style="color: #16a34a; font-size: 14px; font-weight: 600;">✅ Confirmed</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Dietary Restrictions -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; border-radius: 4px;">
                <h3 style="margin: 0 0 12px 0; color: #dc2626; font-size: 18px; font-weight: 600;">⚠️ Dietary Restrictions & Special Requests</h3>
                <p style="margin: 0 0 12px 0; color: #991b1b; font-size: 14px; font-weight: 600;">Important - Please read carefully:</p>
                <div style="background-color: #ffffff; padding: 16px; border-radius: 4px; margin-top: 12px;">
                  <p style="margin: 0; color: #1f2937; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${dietaryInfo}</p>
                </div>
                <p style="margin: 16px 0 0 0; color: #991b1b; font-size: 13px; font-style: italic;">
                  Please ensure your menu accommodates these requirements. If you have concerns, contact us immediately at <a href="mailto:plusonechopsticks@gmail.com" style="color: #7c2d12; text-decoration: none;">plusonechopsticks@gmail.com</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Next Steps -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">Next Steps - Please Complete Within 24-48 Hours</h3>
              <ol style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.8;">
                <li>Review the dietary restrictions above and confirm you can accommodate them</li>
                <li>Contact the guest using the email template below to:
                  <ul style="margin-top: 8px;">
                    <li>Introduce yourself</li>
                    <li>Provide your exact address and meeting instructions</li>
                    <li>Confirm the dietary restrictions</li>
                    <li>Ask if they have additional questions or requests</li>
                  </ul>
                </li>
              </ol>
            </td>
          </tr>

          <!-- Guest Email Template -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <div style="background-color: #eff6ff; border: 2px dashed #2563eb; padding: 20px; border-radius: 4px;">
                <h3 style="margin: 0 0 16px 0; color: #1e40af; font-size: 16px; font-weight: 600;">📧 Suggested Email Template to Send to Your Guest</h3>
                <p style="margin: 0 0 12px 0; color: #1e40af; font-size: 13px; font-style: italic;">Copy and customize this template:</p>
                <div style="background-color: #ffffff; padding: 16px; border-radius: 4px; font-family: monospace; font-size: 13px; line-height: 1.6; color: #1f2937;">
                  <p style="margin: 0;"><strong>Subject:</strong> Welcome to My Home! Details for Your ${formattedDate} ${data.mealType.charAt(0).toUpperCase() + data.mealType.slice(1)}</p>
                  <p style="margin: 16px 0 0 0;">Dear ${data.guestName},</p>
                  <p style="margin: 12px 0 0 0;">I'm ${data.hostName}, and I'm thrilled to welcome you to my home for an authentic Chinese ${data.mealType} experience on <strong>${formattedDate}</strong>!</p>
                  <p style="margin: 12px 0 0 0;"><strong>Meeting Details:</strong></p>
                  <ul style="margin: 8px 0 0 0; padding-left: 20px;">
                    <li><strong>Address:</strong> [Please provide your full address here]</li>
                    <li><strong>Arrival Time:</strong> [Suggest arrival time]</li>
                    <li><strong>How to Find Me:</strong> [Building number, floor, landmarks, etc.]</li>
                    <li><strong>My Contact:</strong> [Your phone/WeChat]</li>
                  </ul>
                  <p style="margin: 12px 0 0 0;"><strong>About Your Dietary Restrictions:</strong></p>
                  <p style="margin: 8px 0 0 0;">I've carefully noted your dietary requirements and I'm planning a delicious menu that accommodates them!</p>
                  <p style="margin: 12px 0 0 0;"><strong>Questions for You:</strong></p>
                  <ol style="margin: 8px 0 0 0; padding-left: 20px;">
                    <li>Are there any other foods or ingredients you'd like me to avoid?</li>
                    <li>Do you have any allergies I should know about?</li>
                    <li>Is there anything specific you'd like to experience about Chinese cuisine?</li>
                    <li>Would you like to participate in any cooking activities?</li>
                  </ol>
                  <p style="margin: 12px 0 0 0;">Please feel free to reach out if you have any questions. I'm looking forward to sharing my family's recipes and stories with you!</p>
                  <p style="margin: 12px 0 0 0;">Warm regards,<br>${data.hostName}<br>[Your phone/WeChat]</p>
                </div>
              </div>
            </td>
          </tr>

          <!-- Payment Information -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; border-radius: 4px;">
                <h3 style="margin: 0 0 16px 0; color: #166534; font-size: 18px; font-weight: 600;">💰 Payment Information</h3>
                <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.6;">
                  <strong>Your Earnings:</strong> You will receive <strong>70% of the payment (¥${data.hostEarnings.toFixed(2)})</strong> from this booking.
                </p>
                <p style="margin: 12px 0 0 0; color: #166534; font-size: 14px; line-height: 1.6;">
                  <strong>Payment Release:</strong> Funds will be released to you <strong>7-14 days after the home dining experience is complete</strong> (expected payout: ${formattedPayoutRange}).
                </p>
              </div>
            </td>
          </tr>

          <!-- Important Reminders -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">Important Reminders</h3>
              <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.8;">
                <li>✅ Payment has been confirmed - no need to collect payment from the guest</li>
                <li>📅 The guest can cancel free of charge up to 7 days before the meal (${formattedCancelDeadline})</li>
                <li>💬 Please respond to the guest within 24-48 hours</li>
                <li>❓ If you have any questions or concerns, contact us at <a href="mailto:plusonechopsticks@gmail.com" style="color: #7c2d12; text-decoration: none;">plusonechopsticks@gmail.com</a></li>
              </ul>
            </td>
          </tr>

          <!-- Closing -->
          <tr>
            <td style="padding: 0 40px 40px 40px; text-align: center;">
              <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                Thank you for being part of the +1 Chopsticks community and sharing your culture with travelers!
              </p>
              <p style="margin: 12px 0 0 0; color: #6b7280; font-size: 14px;">
                Warm regards,<br>
                The +1 Chopsticks Team
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 12px;">
                Questions? Contact us at <a href="mailto:plusonechopsticks@gmail.com" style="color: #7c2d12; text-decoration: none;">plusonechopsticks@gmail.com</a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2026 +1 Chopsticks | Authentic Chinese Home Dining Experience
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
