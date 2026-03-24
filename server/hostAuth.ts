import bcrypt from "bcrypt";
import { getHostAccountByEmail, getHostAccountByListingId, createHostAccount, updateHostAccountPassword, updateHostLastLogin, getHostListingById } from "./db";

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = "food2connect";

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
