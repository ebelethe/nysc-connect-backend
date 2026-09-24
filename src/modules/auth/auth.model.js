import pool from "../../config/storage.js";

// ============================
// Users
// ============================

// Create a new user (corps member or landlord)
export const createUser = async ({ fullName, email, phoneNumber, password, role }) => {
  const [result] = await pool.query(
    `INSERT INTO users (fullName, email, phoneNumber, password, role)
     VALUES (?, ?, ?, ?, ?)`,
    [fullName, email, phoneNumber, password, role]
  );
  return result.insertId;
};

// Find a user by email (used during login and signup duplicate checks)
export const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    `SELECT * FROM users WHERE email = ?`,
    [email]
  );
  return rows[0] || null;
};

// Find a user by phone number (used for duplicate checks)
export const findUserByPhone = async (phoneNumber) => {
  const [rows] = await pool.query(
    `SELECT * FROM users WHERE phoneNumber = ?`,
    [phoneNumber]
  );
  return rows[0] || null;
};

// Find a user by either email or phone number (used for login)
export const findUserByEmailOrPhone = async (identifier) => {
  const [rows] = await pool.query(
    `SELECT * FROM users WHERE email = ? OR phoneNumber = ?`,
    [identifier, identifier]
  );
  return rows[0] || null;
};

// Find a user by id (used once logged in, via JWT)
export const findUserById = async (id) => {
  const [rows] = await pool.query(
    `SELECT * FROM users WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

// Mark a user as verified after OTP success
export const markUserVerified = async (userId) => {
  await pool.query(
    `UPDATE users SET isVerified = TRUE WHERE id = ?`,
    [userId]
  );
};

// Update a user's password (used in password reset)
export const updateUserPassword = async (userId, hashedPassword) => {
  await pool.query(
    `UPDATE users SET password = ? WHERE id = ?`,
    [hashedPassword, userId]
  );
};

// ============================
// OTPs (signup verification + password reset)
// ============================

//// Create a new OTP record
export const createOtp = async ({ userId, code, purpose, channel, expiresAt }) => {
  const [result] = await pool.query(
    `INSERT INTO otps (userId, code, purpose, channel, expiresAt)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, code, purpose, channel, expiresAt]
  );
  return result.insertId;
};

// Find a valid (unused, not expired) OTP for a user + purpose + channel
export const findValidOtp = async ({ userId, code, purpose, channel }) => {
  const [rows] = await pool.query(
    `SELECT * FROM otps
     WHERE userId = ? AND code = ? AND purpose = ? AND channel = ?
       AND isUsed = FALSE AND expiresAt > NOW()`,
    [userId, code, purpose, channel]
  );
  return rows[0] || null;
};

// Mark an OTP as used, so it can't be reused
export const markOtpUsed = async (otpId) => {
  await pool.query(
    `UPDATE otps SET isUsed = TRUE WHERE id = ?`,
    [otpId]
  );
};

// Mark email as verified
export const markEmailVerified = async (userId) => {
  await pool.query(
    `UPDATE users SET emailVerified = TRUE WHERE id = ?`,
    [userId]
  );
};

// Mark phone as verified
export const markPhoneVerified = async (userId) => {
  await pool.query(
    `UPDATE users SET phoneVerified = TRUE WHERE id = ?`,
    [userId]
  );
};

// Check if both are verified, and if so, mark the account fully verified
export const checkAndFinalizeVerification = async (userId) => {
  const user = await findUserById(userId);
  if (user.emailVerified && user.phoneVerified) {
    await markUserVerified(userId);
    return true;
  }
  return false;
};

// Delete a user record only if it was never verified (used to free up email/phone for re-signup)
export const deleteUnverifiedUser = async (userId) => {
  await pool.query(
    `DELETE FROM users WHERE id = ? AND emailVerified = FALSE AND phoneVerified = FALSE`,
    [userId]
  );
};

// Invalidate any old, still-valid OTPs for a user+purpose+channel before issuing a new one
export const invalidateOldOtps = async ({ userId, purpose, channel }) => {
  await pool.query(
    `UPDATE otps SET isUsed = TRUE WHERE userId = ? AND purpose = ? AND channel = ? AND isUsed = FALSE`,
    [userId, purpose, channel]
  );
};

export const blockToken = async ({ token, expiresAt }) => {
  await pool.query(
    `INSERT INTO blocked_tokens (token, expiresAt) VALUES (?, ?)`,
    [token, expiresAt]
  );
};

export const isTokenBlocked = async (token) => {
  const [rows] = await pool.query(
    `SELECT * FROM blocked_tokens WHERE token = ?`,
    [token]
  );
  return rows.length > 0;
};