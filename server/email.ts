import nodemailer from "nodemailer";

// Create a transporter using Gmail or another service
// For production, use environment variables for credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "noreply@dineatlocal.com",
    pass: process.env.EMAIL_PASSWORD || "test-password",
  },
});

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
 * Send booking confirmation email to guest
 */
export async function sendGuestConfirmationEmail(data: BookingEmailData) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #8B3A3A;">Booking Confirmed! 🎉</h2>
      
      <p>Hi ${data.guestName},</p>
      
      <p>Great news! Your dinner request with <strong>${data.hostName}</strong> has been approved!</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Booking Details</h3>
        <p><strong>Host:</strong> ${data.hostName}</p>
        <p><strong>Date:</strong> ${new Date(data.bookingDate).toLocaleDateString()}</p>
        <p><strong>Meal Type:</strong> ${data.mealType.charAt(0).toUpperCase() + data.mealType.slice(1)}</p>
        <p><strong>Number of Guests:</strong> ${data.numberOfGuests}</p>
        <p><strong>Cuisine:</strong> ${data.cuisine}</p>
        ${data.hostAddress ? `<p><strong>Location:</strong> ${data.hostAddress}</p>` : ""}
        ${data.specialRequests ? `<p><strong>Your Special Requests:</strong> ${data.specialRequests}</p>` : ""}
      </div>
      
      <p><strong>Next Steps:</strong></p>
      <ul>
        <li>Check your email for ${data.hostName}'s contact information</li>
        <li>Reach out to confirm any final details about dietary restrictions or preferences</li>
        <li>Arrive on time and enjoy an authentic family dinner experience!</li>
      </ul>
      
      <p>If you have any questions, feel free to contact the host directly or reach out to our support team.</p>
      
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This is an automated email. Please do not reply to this address.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || "noreply@dineatlocal.com",
      to: data.guestEmail,
      subject: `Booking Confirmed with ${data.hostName}!`,
      html: htmlContent,
    });
    console.log(`[Email] Guest confirmation sent to ${data.guestEmail}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send guest confirmation:", error);
    return false;
  }
}

/**
 * Send booking confirmation email to host
 */
export async function sendHostConfirmationEmail(data: BookingEmailData) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #8B3A3A;">New Booking Confirmed! 👨‍🍳</h2>
      
      <p>Hi ${data.hostName},</p>
      
      <p>You have a confirmed booking! Here are the details:</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Guest Information</h3>
        <p><strong>Guest Name:</strong> ${data.guestName}</p>
        <p><strong>Email:</strong> <a href="mailto:${data.guestEmail}">${data.guestEmail}</a></p>
        <p><strong>Number of Guests:</strong> ${data.numberOfGuests}</p>
        <p><strong>Meal Type:</strong> ${data.mealType.charAt(0).toUpperCase() + data.mealType.slice(1)}</p>
        <p><strong>Date:</strong> ${new Date(data.bookingDate).toLocaleDateString()}</p>
        ${data.specialRequests ? `<p><strong>Special Requests/Allergies:</strong> ${data.specialRequests}</p>` : ""}
      </div>
      
      <p><strong>Recommended Next Steps:</strong></p>
      <ul>
        <li>Contact ${data.guestName} to confirm final details</li>
        <li>Discuss any dietary restrictions or food preferences</li>
        <li>Confirm the exact time and location</li>
        <li>Share any house rules or what guests should bring</li>
      </ul>
      
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This is an automated email. Please do not reply to this address.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || "noreply@dineatlocal.com",
      to: data.hostEmail,
      subject: `New Booking: ${data.guestName} - ${new Date(data.bookingDate).toLocaleDateString()}`,
      html: htmlContent,
    });
    console.log(`[Email] Host confirmation sent to ${data.hostEmail}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send host confirmation:", error);
    return false;
  }
}

/**
 * Send host profile approval email
 */
export async function sendHostApprovalEmail(
  hostName: string,
  hostEmail: string,
  district: string,
  cuisineStyle: string
) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #8B3A3A;">🎉 Your Profile Has Been Approved!</h2>
      
      <p>Hi ${hostName},</p>
      
      <p>Congratulations! Your host profile has been approved and is now live on our platform.</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Your Profile Details</h3>
        <p><strong>District:</strong> ${district}</p>
        <p><strong>Cuisine Style:</strong> ${cuisineStyle}</p>
        <p><strong>Status:</strong> <span style="color: #22c55e; font-weight: bold;">APPROVED</span></p>
      </div>
      
      <p><strong>What Happens Next:</strong></p>
      <ul>
        <li>Your profile is now visible to guests searching for dinner experiences</li>
        <li>You can log in to your dashboard to manage bookings and availability</li>
        <li>Guests will start sending booking requests based on your availability</li>
        <li>You'll receive notifications when guests request to dine with you</li>
      </ul>
      
      <p><strong>Quick Links:</strong></p>
      <ul>
        <li><a href="https://dineatlocal.com/host-dashboard" style="color: #8B3A3A; text-decoration: none;">Go to Host Dashboard</a></li>
        <li><a href="https://dineatlocal.com/help" style="color: #8B3A3A; text-decoration: none;">View Help Center</a></li>
      </ul>
      
      <p>We're excited to have you as part of our community! If you have any questions, please don't hesitate to reach out.</p>
      
      <p>Happy hosting!<br>The +1 Chopsticks Team</p>
      
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This is an automated email. Please do not reply to this address.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || "noreply@dineatlocal.com",
      to: hostEmail,
      subject: "🎉 Your Host Profile Has Been Approved!",
      html: htmlContent,
    });
    console.log(`[Email] Host approval email sent to ${hostEmail}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send host approval email:", error);
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
    await transporter.sendMail({
      from: process.env.EMAIL_USER || "noreply@dineatlocal.com",
      to: guestEmail,
      subject: `Booking Update from ${hostName}`,
      html: htmlContent,
    });
    console.log(`[Email] Rejection email sent to ${guestEmail}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send rejection email:", error);
    return false;
  }
}
