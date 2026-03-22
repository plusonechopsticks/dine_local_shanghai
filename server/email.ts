import { Resend } from "resend";
import {
  generateBookingConfirmationEmail,
  generatePaymentReminderEmail,
  generateHostNotificationEmail,
} from "./email-templates.ts";

// Initialize Resend client with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Get the email address to send from
const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";

export interface BookingEmailData {
  guestName: string;
  guestEmail: string;
  hostName: string;
  hostEmail: string;
  bookingDate: string;
  mealType: "lunch" | "dinner";
  numberOfGuests: number;
  cuisine: string;
  hostAddress?: string;
  specialRequests?: string;
}

/**
 * Send booking confirmation email to guest (after payment)
 */
export async function sendGuestConfirmationEmail(data: {
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
}) {
  const htmlContent = generateBookingConfirmationEmail(data);

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: data.guestEmail,
      subject: `🎉 Your Dining Experience is Confirmed! - +1 Chopsticks`,
      html: htmlContent,
    });
    console.log(`[Email] Guest confirmation sent to ${data.guestEmail}`, result);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send guest confirmation:", error);
    return false;
  }
}

/**
 * Send payment reminder email to guest
 */
export async function sendPaymentReminderEmail(data: {
  bookingId: number;
  guestName: string;
  guestEmail: string;
  hostName: string;
  requestedDate: string;
  mealType: "lunch" | "dinner";
  numberOfGuests: number;
  totalAmount: string;
  paymentLink: string;
}) {
  const htmlContent = generatePaymentReminderEmail(data);

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: data.guestEmail,
      subject: `⏳ Complete Your Booking Payment - +1 Chopsticks`,
      html: htmlContent,
    });
    console.log(`[Email] Payment reminder sent to ${data.guestEmail}`, result);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send payment reminder:", error);
    return false;
  }
}

/**
 * Send host notification email (when booking is confirmed)
 */
export async function sendHostConfirmationEmail(data: {
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
}) {
  const htmlContent = generateHostNotificationEmail(data);

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: data.hostEmail,
      subject: `🎉 New Confirmed Booking! - +1 Chopsticks`,
      html: htmlContent,
    });
    console.log(`[Email] Host confirmation sent to ${data.hostEmail}`, result);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send host confirmation:", error);
    return false;
  }
}



export async function sendGuestRejectionEmail(
  guestName: string,
  guestEmail: string,
  hostName: string,
  reason?: string
) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #8B3A3A;">Booking Update</h2>
      
      <p>Hi ${guestName},</p>
      
      <p>Unfortunately, ${hostName} is unable to accommodate your booking request at this time.</p>
      
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
      
      <p>We encourage you to:</p>
      <ul>
        <li>Browse other available hosts in your area</li>
        <li>Try booking for different dates</li>
        <li>Contact our support team if you have questions</li>
      </ul>
      
      <p>We hope to host you soon!</p>
      
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This is an automated email. Please do not reply to this address.
      </p>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: guestEmail,
      subject: `Booking Update from ${hostName}`,
      html: htmlContent,
    });
    console.log(`[Email] Rejection email sent to ${guestEmail}`, result);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send rejection email:", error);
    return false;
  }
}

/**
 * Generic email sending function
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  try {
    const result = await resend.emails.send({
      from: options.from || EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log(`[Email] Email sent to ${options.to}`, result);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send email:", error);
    throw error;
  }
}
