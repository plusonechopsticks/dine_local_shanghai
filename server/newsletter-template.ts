/**
 * Newsletter Email Template - Morning Brew Style
 * Uses table-based layout for maximum email client compatibility
 * All styles inline for forwarding support
 */

interface NewsletterContent {
  founderNote: string;
  funFact: string;
  featuredHost: {
    name: string;
    title: string;
    cuisineStyle: string;
    district: string;
    pricePerPerson: number;
    profilePhotoUrl?: string;
    foodPhotoUrls: string[];
    bio: string;
    hostId: number;
  };
}

export function generateNewsletterHtml(content: NewsletterContent): string {
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const baseUrl = process.env.VITE_WEBSITE_URL || 'https://plus1chopsticks.manus.space';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>+1 Chopsticks Newsletter</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  
  <!-- Wrapper table for email client compatibility -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 20px 0;">
        
        <!-- Main container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; max-width: 600px;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 24px 32px; background-color: #ffffff; border-bottom: 1px solid #e5e5e5;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: left; vertical-align: middle;">
                    <span style="font-size: 14px; color: #666666;">${today}</span>
                  </td>
                  <td style="text-align: right; vertical-align: middle;">
                    <a href="${baseUrl}" style="font-size: 13px; color: #666666; text-decoration: none; margin: 0 8px;">View Online</a>
                    <span style="color: #e5e5e5;">|</span>
                    <a href="${baseUrl}" style="font-size: 13px; color: #666666; text-decoration: none; margin: 0 8px;">Sign Up</a>
                    <span style="color: #e5e5e5;">|</span>
                    <a href="${baseUrl}/hosts" style="font-size: 13px; color: #666666; text-decoration: none; margin: 0 8px;">Browse Hosts</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Logo & Tagline -->
          <tr>
            <td style="padding: 40px 32px 32px; text-align: center;">
              <h1 style="margin: 0 0 8px 0; font-size: 36px; font-weight: 700; color: #1a1a1a;">+1 Chopsticks</h1>
              <p style="margin: 0; font-size: 15px; color: #666666;">Authentic home dining experiences in Shanghai</p>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <p style="margin: 0; font-size: 16px; color: #1a1a1a; line-height: 1.5;"><strong>Good morning.</strong></p>
            </td>
          </tr>
          
          <!-- FOUNDER'S NOTE Section -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border: 1px solid #e5e5e5; border-radius: 8px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px 0; font-size: 12px; font-weight: 700; color: #2563eb; letter-spacing: 0.5px; text-transform: uppercase;">FOUNDER'S NOTE</p>
                    <div style="font-size: 15px; color: #1a1a1a; line-height: 1.6;">
                      ${content.founderNote.split('\n\n').map(para => `<p style="margin: 0 0 12px 0;">${para}</p>`).join('')}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- CULTURE Section -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border: 1px solid #e5e5e5; border-radius: 8px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px 0; font-size: 12px; font-weight: 700; color: #2563eb; letter-spacing: 0.5px; text-transform: uppercase;">CULTURE</p>
                    <div style="font-size: 15px; color: #1a1a1a; line-height: 1.6;">
                      ${content.funFact.split('\n\n').map(para => `<p style="margin: 0 0 12px 0;">${para}</p>`).join('')}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- FEATURED HOST Section -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border: 1px solid #e5e5e5; border-radius: 8px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px 0; font-size: 12px; font-weight: 700; color: #2563eb; letter-spacing: 0.5px; text-transform: uppercase;">FEATURED HOST</p>
                    
                    <!-- Host Photo -->
                    ${content.featuredHost.foodPhotoUrls[0] ? `
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 16px;">
                      <tr>
                        <td>
                          <img src="${content.featuredHost.foodPhotoUrls[0]}" alt="${content.featuredHost.name}'s food" style="width: 100%; height: auto; border-radius: 8px; display: block;" />
                        </td>
                      </tr>
                    </table>
                    ` : ''}
                    
                    <!-- Host Info -->
                    <h3 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #1a1a1a;">${content.featuredHost.title}</h3>
                    <p style="margin: 0 0 12px 0; font-size: 14px; color: #666666;">
                      <strong>${content.featuredHost.name}</strong> · ${content.featuredHost.district} · ¥${content.featuredHost.pricePerPerson}/person
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 13px; color: #2563eb; font-weight: 600;">${content.featuredHost.cuisineStyle}</p>
                    <p style="margin: 0 0 16px 0; font-size: 15px; color: #1a1a1a; line-height: 1.6;">${content.featuredHost.bio.substring(0, 200)}...</p>
                    
                    <!-- CTA Button -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="border-radius: 6px; background-color: #1a1a1a;">
                          <a href="${baseUrl}/hosts/${content.featuredHost.hostId}" style="display: inline-block; padding: 12px 24px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none;">View Profile</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- HELP US GROW Section -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #eff6ff; border-radius: 8px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px 0; font-size: 12px; font-weight: 700; color: #2563eb; letter-spacing: 0.5px; text-transform: uppercase;">HELP US GROW</p>
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #1a1a1a; line-height: 1.6;">
                      Know someone who'd love authentic home dining in Shanghai? Forward this email to them!
                    </p>
                    <p style="margin: 0; font-size: 15px; color: #1a1a1a; line-height: 1.6;">
                      Or if you're a local who loves cooking and hosting, <a href="${baseUrl}/host-register" style="color: #2563eb; text-decoration: underline;">become a host</a>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px; background-color: #f9f9f9; border-top: 1px solid #e5e5e5; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #666666;">
                <a href="${baseUrl}" style="color: #666666; text-decoration: none; margin: 0 8px;">Home</a> ·
                <a href="${baseUrl}/hosts" style="color: #666666; text-decoration: none; margin: 0 8px;">Browse Hosts</a> ·
                <a href="${baseUrl}/host-register" style="color: #666666; text-decoration: none; margin: 0 8px;">Become a Host</a>
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #999999;">
                <a href="${baseUrl}/unsubscribe" style="color: #999999; text-decoration: underline;">Unsubscribe</a>
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
