import bcrypt from "bcrypt";
import { getHostAccountByEmail, getHostAccountByListingId, createHostAccount, updateHostAccountPassword, updateHostLastLogin, getHostListingById } from "./db";
import { sendEmail } from "./email";

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = "foodie@plus1chopsticks";

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Authenticate a host with email and password
 */
export async function authenticateHost(email: string, password: string) {
  const account = await getHostAccountByEmail(email);
  
  if (!account) {
    return { success: false, error: "Host account not found" };
  }

  const isPasswordValid = await verifyPassword(password, account.passwordHash);
  
  if (!isPasswordValid) {
    return { success: false, error: "Invalid password" };
  }

  // Update last login
  await updateHostLastLogin(account.hostListingId);

  // Get the host listing details
  const listing = await getHostListingById(account.hostListingId);
  
  return {
    success: true,
    hostId: account.hostListingId,
    email: account.email,
    listing,
  };
}

/**
 * Initialize a host account with default password
 * Called when a new host is created
 */
export async function initializeHostAccount(hostListingId: number, email: string) {
  const existingAccount = await getHostAccountByListingId(hostListingId);
  
  if (existingAccount) {
    return { success: false, error: "Host account already exists" };
  }

  const passwordHash = await hashPassword(DEFAULT_PASSWORD);
  
  const account = await createHostAccount({
    hostListingId,
    email,
    passwordHash,
  });

  if (!account) {
    return { success: false, error: "Failed to create host account" };
  }

  // Fetch host name for the welcome email
  const listing = await getHostListingById(hostListingId);
  const hostName = listing?.hostName ?? email;

  // Send welcome email (non-blocking — failure does not prevent account creation)
  try {
    await sendEmail({
      to: email,
      subject: "Your +1 Chopsticks Host Portal is ready 🥢",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #c0392b;">+1 Chopsticks — Host Portal</h2>

          <p>Hi ${hostName},</p>
          <p>Your host portal on +1 Chopsticks is now ready. You can log in to manage your availability and view your bookings.</p>
          <p><strong>Login here:</strong> <a href="https://plus1chopsticks.com/host/login">https://plus1chopsticks.com/host/login</a></p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> foodie@plus1chopsticks</p>
          <p>Please keep this password safe. We recommend changing it after your first login.</p>
          <p>If you have any questions, reach out to Steven on WeChat: <strong>Stevento-Kellogg</strong></p>

          <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />

          <p>您好 ${hostName}，</p>
          <p>您在 +1 Chopsticks 的房东后台已经开通，现在可以登录管理您的可用日期和查看预订情况。</p>
          <p><strong>登录地址：</strong><a href="https://plus1chopsticks.com/host/login">https://plus1chopsticks.com/host/login</a></p>
          <p><strong>邮箱：</strong>${email}</p>
          <p><strong>密码：</strong>foodie@plus1chopsticks</p>
          <p>请妥善保管密码，建议首次登录后及时修改。</p>
          <p>如有任何问题，请通过微信联系 Steven：<strong>Stevento-Kellogg</strong></p>
        </div>
      `,
    });
    console.log(`[HostAuth] Welcome email sent to ${email}`);
  } catch (err) {
    console.error(`[HostAuth] Failed to send welcome email to ${email}:`, err);
  }

  return { success: true, account };
}

/**
 * Change host password
 */
export async function changeHostPassword(hostListingId: number, oldPassword: string, newPassword: string) {
  const account = await getHostAccountByListingId(hostListingId);
  
  if (!account) {
    return { success: false, error: "Host account not found" };
  }

  const isPasswordValid = await verifyPassword(oldPassword, account.passwordHash);
  
  if (!isPasswordValid) {
    return { success: false, error: "Current password is incorrect" };
  }

  const newPasswordHash = await hashPassword(newPassword);
  const updated = await updateHostAccountPassword(hostListingId, newPasswordHash);

  if (!updated) {
    return { success: false, error: "Failed to update password" };
  }

  return { success: true };
}
