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
                We're excited for you to experience authentic Shanghai home cooking!
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
                © 2026 +1 Chopsticks | Authentic Shanghai Home Dining Experience
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
