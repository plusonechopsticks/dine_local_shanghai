/**
 * Knowledge base for AI chat support
 * Contains information about +1 Chopsticks platform
 */

export const CHAT_KNOWLEDGE_BASE = `
# +1 Chopsticks Platform Information

## About +1 Chopsticks (加一雙筷子)
+1 Chopsticks is a platform connecting travelers with local families in China for authentic home dining experiences. The name means "add a pair of chopsticks" - representing the Chinese tradition of welcoming guests to family meals.

## How It Works

### For Travelers:
1. Browse approved host families on the Find Hosts page
2. Select a host based on cuisine style, location, availability, and price
3. Submit a booking request with your preferred date, meal type, and number of guests
4. Complete payment via Stripe (secure online payment)
5. Receive booking confirmation and host contact details via email
6. Enjoy an authentic home-cooked meal with a local Chinese family

### For Hosts:
1. Apply to become a host through the "Become a Host" page
2. Provide information about your cooking style, availability, and household
3. Wait for admin approval (typically 3-5 business days)
4. Once approved, your profile appears on the Find Hosts page
5. Receive booking notifications and guest details via email
6. Host travelers for lunch or dinner at your home
7. Receive 70% of the booking payment, released 7-14 days after the dining experience

## Booking Details

### Pricing:
- Prices vary by host, typically ranging from 80-150 RMB per person
- Some hosts offer discounts for their first few bookings
- Total amount = price per person × number of guests
- Payment is processed securely through Stripe

### Cancellation Policy:
- Free cancellation up to 7 days before the scheduled dining date
- To cancel, email: plusonechopsticks@gmail.com
- Refunds processed within 5-7 business days

### Booking Requirements:
- Minimum 3 days advance booking required
- Guests must provide dietary restrictions or allergies when booking
- Maximum guest count varies by host (typically 2-6 people)

### Payment Process:
1. Submit booking request (no payment required yet)
2. Receive payment link via email
3. Complete payment through Stripe checkout
4. Receive confirmation email with host details

## Host Information

### What to Expect:
- Home-cooked authentic Chinese cuisine
- 2-3 hour dining experience
- Cultural exchange and conversation
- Family-style atmosphere
- Dietary accommodations available (vegetarian, vegan, gluten-free, etc.)

### Host Locations:
- Hosts located across various cities in China
- Exact address provided after booking confirmation
- Most hosts accessible by metro

### Languages:
- Most hosts speak Mandarin Chinese
- Many hosts also speak English
- Language abilities listed on each host profile

## Safety & Quality

### Host Approval:
- All hosts are vetted and approved by our team
- Background checks and home visits conducted
- Only approved hosts appear on the platform

### Guest Safety:
- Hosts provide emergency contact information
- Platform support available via email
- Booking records maintained for all reservations

## Contact Information

### Questions or Support:
- Email: plusonechopsticks@gmail.com
- Response time: Within 24 hours

### Booking Changes:
- Contact us at plusonechopsticks@gmail.com
- Include your booking reference number

## Current Status
- Pilot program launching in China (2026)
- Limited number of host families available
- Actively recruiting new hosts

## Frequently Asked Questions

**Q: How far in advance should I book?**
A: We recommend booking at least 3 days in advance. Popular hosts may require more advance notice.

**Q: Can I bring children?**
A: Many hosts are kid-friendly. Check the host profile for "Kids Friendly" badge.

**Q: What if I have food allergies?**
A: Specify all dietary restrictions when booking. Hosts will accommodate most dietary needs.

**Q: What should I bring?**
A: Just yourself and an open mind! Some guests bring small gifts (fruit, tea, flowers) but it's not required.

**Q: How long is the meal?**
A: Typically 2-3 hours, including cooking demonstration and conversation.

**Q: What if I need to cancel?**
A: Free cancellation up to 7 days before. Email plusonechopsticks@gmail.com to cancel.

**Q: Is transportation included?**
A: No, guests arrange their own transportation. Host address provided after booking confirmation.

**Q: Can I request specific dishes?**
A: Hosts prepare their signature dishes. You can mention preferences, but menu is at host's discretion.

**Q: What payment methods are accepted?**
A: We accept all major credit cards through Stripe (Visa, Mastercard, Amex, etc.).

**Q: When do hosts receive payment?**
A: Hosts receive 70% of the booking amount, released 7-14 days after the dining experience.

**Q: Can I book for a group?**
A: Yes! Check each host's maximum guest capacity. Most hosts accommodate 2-6 guests.

**Q: What if the host cancels?**
A: Full refund issued immediately. We'll help you find an alternative host if desired.
`;

export const SYSTEM_PROMPT = `You are a helpful customer support assistant for +1 Chopsticks (加一雙筷子), a platform connecting travelers with local Chinese families for authentic home dining experiences.

Your role:
- Answer visitor questions about the platform, booking process, hosts, and policies
- Be friendly, warm, and professional
- Use the knowledge base provided to answer questions accurately
- If you don't know something or the question requires human judgment, say: "Let me connect you with our team for a personalized answer. An admin will respond shortly."
- Keep responses concise but informative (2-3 sentences for simple questions, longer for complex ones)
- Use a conversational tone that matches the warm, cultural exchange spirit of the platform

When you cannot answer:
- Questions about specific booking status or changes (requires admin access)
- Questions about host availability not shown on the website
- Complaints or issues requiring human judgment
- Requests for refunds or payment issues
- Questions about becoming a host that require detailed guidance

For these cases, acknowledge the question and let them know an admin will help shortly.`;
