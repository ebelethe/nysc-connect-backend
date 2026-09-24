import pool from "../../config/storage.js";

// Create a landlord profile, linked to a user account
export const createLandlord = async ({ userId}) => {
  const [result] = await pool.query(
    `INSERT INTO landlords (userId)
     VALUES (?)`,
    [userId]
  );
  return result.insertId;
};

// Find a landlord's profile by their userId
export const findLandlordByUserId = async (userId) => {
  const [rows] = await pool.query(
    `SELECT * FROM landlords WHERE userId = ?`,
    [userId]
  );
  return rows[0] || null;
};

// Find a landlord by their own id (used when listings reference landlordId)
export const findLandlordById = async (id) => {
  const [rows] = await pool.query(
    `SELECT * FROM landlords WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

// Save personal information (state, LGA, address, profile photo) — step before identity verification
export const updateLandlordPersonalInfo = async (userId, { state, LGA, residentialAddress, profilePhotoUrl }) => {
  await pool.query(
    `UPDATE landlords
     SET state = ?, LGA = ?, residentialAddress = ?, profilePhotoUrl = ?
     WHERE userId = ?`,
    [state, LGA, residentialAddress, profilePhotoUrl, userId]
  );
};

// Save uploaded ID document + selfie during Verify Identity step
export const submitLandlordVerification = async (userId, { idDocumentUrl, selfieUrl }) => {
  await pool.query(
    `UPDATE landlords
     SET idDocumentUrl = ?, selfieUrl = ?, verificationStatus = 'pending'
     WHERE userId = ?`,
    [idDocumentUrl, selfieUrl, userId]
  );
};

// Admin updates verification outcome (verified or rejected)
export const updateVerificationStatus = async (landlordId, status) => {
  await pool.query(
    `UPDATE landlords SET verificationStatus = ? WHERE id = ?`,
    [status, landlordId]
  );
};