import pool from "../../config/storage.js";

// Create a corps member profile, linked to a user account
export const createCorpsMember = async ({ userId, callUpNumber }) => {
  const [result] = await pool.query(
    `INSERT INTO corps_members (userId, callUpNumber)
     VALUES (?, ?)`,
    [userId, callUpNumber]
  );
  return result.insertId;
};

// Find a corps member's profile by their userId
export const findCorpsMemberByUserId = async (userId) => {
  const [rows] = await pool.query(
    `SELECT * FROM corps_members WHERE userId = ?`,
    [userId]
  );
  return rows[0] || null;
};

// Find a corps member by their callUpNumber (used for duplicate checks at signup)
export const findCorpsMemberByCallUpNumber = async (callUpNumber) => {
  const [rows] = await pool.query(
    `SELECT * FROM corps_members WHERE callUpNumber = ?`,
    [callUpNumber]
  );
  return rows[0] || null;
};

// Update profile-setup fields (batch, stream, state, LGA, ppa)
export const updateCorpsMemberProfile = async (userId, { batch, stream, state, LGA, ppa, areasOfInterest }) => {
  await pool.query(
    `UPDATE corps_members
     SET batch = ?, stream = ?, state = ?, LGA = ?, ppa = ?, areasOfInterest = ?
     WHERE userId = ?`,
    [batch, stream, state, LGA, ppa, areasOfInterest, userId]
  );
};

// Find a corps member by their own id (used when other tables reference corpsMemberId)
export const findCorpsMemberById = async (id) => {
  const [rows] = await pool.query(
    `SELECT * FROM corps_members WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

// Update just the profile photo (optional, can be done anytime after signup)
export const updateCorpsMemberPhoto = async (userId, profilePhotoUrl) => {
  await pool.query(
    `UPDATE corps_members SET profilePhotoUrl = ? WHERE userId = ?`,
    [profilePhotoUrl, userId]
  );
};

// Admin suspends a corps member (temporary with a day count, or permanent)
export const suspendCorpsMember = async (corpsMemberId, { suspensionType, durationDays, reason }) => {
  const suspendedUntil =
    suspensionType === "temporary"
      ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
      : null;

  await pool.query(
    `UPDATE corps_members
     SET isSuspended = TRUE, suspensionType = ?, suspendedUntil = ?, suspendedAt = NOW(), suspensionReason = ?
     WHERE id = ?`,
    [suspensionType, suspendedUntil, reason, corpsMemberId]
  );
};

// Check if a corps member is currently suspended (live check, no cron needed)
export const isCurrentlySuspended = async (corpsMemberId) => {
  const [rows] = await pool.query(
    `SELECT isSuspended, suspensionType, suspendedUntil FROM corps_members WHERE id = ?`,
    [corpsMemberId]
  );
  const cm = rows[0];
  if (!cm || !cm.isSuspended) return false;
  if (cm.suspensionType === "permanent") return true;
  return cm.suspendedUntil && new Date(cm.suspendedUntil) > new Date();
};