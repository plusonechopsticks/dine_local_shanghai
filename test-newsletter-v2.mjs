import nodemailer from 'nodemailer';
const { createTransport } = nodemailer;
import 'dotenv/config';

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

// Morning Brew-style HTML email template
const emailHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>+1 Chopsticks Newsletter</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
      line-height: 1.6;
    }
    .email-container {
      max-width: 680px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      padding: 20px 30px;
      border-bottom: 1px solid #e5e7eb;
      background-color: #ffffff;
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      font-size: 13px;
      color: #6b7280;
    }
    .header-date {
      font-weight: 500;
    }
    .header-links a {
      color: #6b7280;
      text-decoration: none;
      margin-left: 12px;
    }
    .header-title {
      font-size: 32px;
      font-weight: 800;
      color: #1f2937;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .header-subtitle {
      font-size: 14px;
      color: #6b7280;
      margin: 4px 0 0 0;
    }
    .content {
      padding: 30px;
    }
    .card {
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
    }
    .section-label {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #2563eb;
      margin: 0 0 12px 0;
    }
    .section-title {
      font-size: 24px;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 16px 0;
      line-height: 1.3;
    }
    .section-content {
      font-size: 16px;
      line-height: 1.7;
      color: #374151;
    }
    .section-content p {
      margin: 0 0 16px 0;
    }
    .section-content p:last-child {
      margin-bottom: 0;
    }
    .section-content strong {
      color: #1f2937;
      font-weight: 600;
    }
    .greeting {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
    }
    .host-image {
      width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 16px 0;
    }
    .host-meta {
      display: flex;
      gap: 16px;
      margin: 16px 0;
      font-size: 14px;
      color: #6b7280;
      flex-wrap: wrap;
    }
    .cta-button {
      display: inline-block;
      background-color: #1f2937;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 15px;
      margin-top: 16px;
    }
    .cta-button:hover {
      background-color: #374151;
    }
    .help-box {
      background-color: #eff6ff;
      border-left: 3px solid #2563eb;
      padding: 20px;
      border-radius: 4px;
      margin-top: 16px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      font-size: 13px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .footer a {
      color: #2563eb;
      text-decoration: none;
    }
    .footer-links {
      margin: 16px 0;
    }
    .footer-links a {
      margin: 0 8px;
    }
    @media only screen and (max-width: 600px) {
      .header-top {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      .header-links {
        margin-top: 8px;
      }
      .header-links a {
        margin-left: 0;
        margin-right: 12px;
      }
      .host-meta {
        flex-direction: column;
        gap: 8px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <div class="header-top">
        <span class="header-date">February 15, 2026</span>
        <span class="header-links">
          <a href="https://dinelocalsh-mkw6exse.manus.space">View Online</a>
          <a href="https://dinelocalsh-mkw6exse.manus.space">Sign Up</a>
          <a href="https://dinelocalsh-mkw6exse.manus.space/hosts">Browse Hosts</a>
        </span>
      </div>
      <h1 class="header-title">+1 Chopsticks</h1>
      <p class="header-subtitle">Authentic home dining experiences in Shanghai</p>
    </div>

    <!-- Main Content -->
    <div class="content">
      <!-- Section 1: Founder's Letter -->
      <div class="card">
        <p class="section-label">FOUNDER'S NOTE</p>
        <div class="section-content">
          <p><span class="greeting">Good morning.</span> As I sit here in my Shanghai apartment, I'm reminded of a dinner I had in a small village in Peru five years ago. A local family invited me in, and over plates of homemade ceviche, we shared stories that transcended language barriers. That night changed how I travel forever.</p>
          <p>That's exactly what we're building here with +1 Chopsticks. We're not just connecting travelers with meals—we're creating bridges between cultures, one dinner table at a time.</p>
          <p>This month, we've welcomed <strong>47 travelers</strong> into Shanghai homes. Each meal is a story, each conversation a connection that lasts far beyond the last bite of dumplings.</p>
          <p>Thank you for being part of this journey.</p>
          <p><strong>—Sarah Chen</strong>, Founder</p>
        </div>
      </div>

      <!-- Section 2: Fun Fact -->
      <div class="card">
        <p class="section-label">CULTURE</p>
        <h2 class="section-title">The Chinese way of saying "I love you"</h2>
        <div class="section-content">
          <p><strong>Did you know that Chinese families rarely say "I love you" out loud?</strong></p>
          <p>Instead, love is expressed through actions—especially through food. When a Chinese parent asks <strong>"你吃了吗？" (Have you eaten?)</strong>, they're really saying "I care about you."</p>
          <p>This is why sharing a home-cooked meal in China is so meaningful. It's not just about the food—it's about being welcomed into someone's circle of care. When a host adds an extra pair of chopsticks to their table for you, they're saying: "You matter to us."</p>
          <p>Next time you're at a Chinese dinner table, notice how the host keeps serving you food. That's their way of showing love. ❤️</p>
        </div>
      </div>

      <!-- Section 3: Featured Host -->
      <div class="card">
        <p class="section-label">FEATURED HOST</p>
        <h2 class="section-title">Meet Norika and Steven</h2>
        <div class="section-content">
          <img src="https://res.cloudinary.com/drxfcfayd/image/upload/v1769882356/host-images/ifdaljpfkzdovtrq3pbj.jpg" alt="Norika and Steven's home dining experience" class="host-image">
          
          <p><strong>The Family Table: Authentic Home-Style Cooking (家常味道)</strong></p>
          
          <div class="host-meta">
            <span>📍 Songjiang District</span>
            <span>🍜 Home Style Cooking</span>
            <span>💰 ¥250/person</span>
          </div>

          <p>Welcome to our table! This menu features <em>Jiā Cháng Cài</em> (Home-style Cooking)—the heart and soul of Chinese dining. Unlike restaurant food, these dishes are designed for comfort and balance. We bring together a mix of Northern heartiness and Southern delicacy, featuring savory stir-fries, tender braises, and classic family favorites.</p>

          <p><strong>Menu highlights:</strong></p>
          <p>
            • Flash-Fried Lamb with Scallions (葱爆羊肉)<br>
            • Honey Glazed Cumin Chicken Wings<br>
            • Handmade Dumplings (饺子)<br>
            • Braised Tofu with Scallions
          </p>

          <a href="https://dinelocalsh-mkw6exse.manus.space/hosts/90001" class="cta-button">Book Norika & Steven's Experience →</a>
        </div>
      </div>

      <!-- Section 4: Help Needed -->
      <div class="card">
        <p class="section-label">HELP US GROW</p>
        <h2 class="section-title">Know a passionate home cook?</h2>
        <div class="section-content">
          <p>We're always looking for Shanghai families who love cooking and meeting new people. If you know someone who might be interested (or if you are!), we'd love to hear from them.</p>
          
          <div class="help-box">
            <p style="margin: 0 0 12px 0;"><strong>Why become a host?</strong></p>
            <p style="margin: 0;">
              ✓ Earn ¥200-400 per dinner<br>
              ✓ Meet travelers from around the world<br>
              ✓ Share your culture and cooking<br>
              ✓ Flexible schedule—host when you want
            </p>
          </div>

          <a href="https://dinelocalsh-mkw6exse.manus.space/become-host" class="cta-button">Become a Host →</a>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>+1 Chopsticks</strong></p>
      <p>Authentic home dining experiences in Shanghai</p>
      <div class="footer-links">
        <a href="https://dinelocalsh-mkw6exse.manus.space">Website</a> | 
        <a href="https://dinelocalsh-mkw6exse.manus.space/hosts">Browse Hosts</a> | 
        <a href="mailto:hello@1chopsticks.com">Contact</a>
      </div>
      <p style="margin-top: 20px; font-size: 12px;">
        You're receiving this because you subscribed to updates from +1 Chopsticks.<br>
        <a href="#">Unsubscribe</a> | <a href="#">Update preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

async function sendTestNewsletter() {
  try {
    // Create transporter
    const transporter = createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"+1 Chopsticks" <${EMAIL_USER}>`,
      to: 'shugenbaba@gmail.com',
      subject: '🥢 Your monthly dose of Shanghai home dining stories',
      html: emailHTML,
    });

    console.log('✅ Newsletter sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Failed to send newsletter:', error);
  }
}

sendTestNewsletter();
