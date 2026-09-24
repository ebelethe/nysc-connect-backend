import pool from "../../config/storage.js";

// Create a new enquiry (corps member contacting a landlord about a listing)
export const createEnquiry = async ({ listingId, corpsMemberId, message }) => {
  const [result] = await pool.query(
    `INSERT INTO enquiries (listingId, corpsMemberId, message)
     VALUES (?, ?, ?)`,
    [listingId, corpsMemberId, message]
  );
  return result.insertId;
};

// Find a single enquiry by id
export const findEnquiryById = async (id) => {
  const [rows] = await pool.query(
    `SELECT * FROM enquiries WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

// Find all enquiries a corps member has sent (their own enquiry history)
export const findEnquiriesByCorpsMemberId = async (corpsMemberId) => {
  const [rows] = await pool.query(
    `SELECT * FROM enquiries WHERE corpsMemberId = ? ORDER BY createdAt DESC`,
    [corpsMemberId]
  );
  return rows;
};

// Find all enquiries sent about a specific listing (for the landlord to view/reply)
export const findEnquiriesByListingId = async (listingId) => {
  const [rows] = await pool.query(
    `SELECT * FROM enquiries WHERE listingId = ? ORDER BY createdAt DESC`,
    [listingId]
  );
  return rows;
};

// Check whether this corps member already sent an enquiry on this listing
// (used to enforce the 5-minute cooldown edge case in the service layer)
export const findExistingEnquiry = async ({ listingId, corpsMemberId }) => {
  const [rows] = await pool.query(
    `SELECT * FROM enquiries WHERE listingId = ? AND corpsMemberId = ? ORDER BY createdAt DESC LIMIT 1`,
    [listingId, corpsMemberId]
  );
  return rows[0] || null;
};

// Landlord replies to an enquiry (UPSERT behavior — one reply slot, overwritten if replied again)
export const replyToEnquiry = async (id, reply) => {
  await pool.query(
    `UPDATE enquiries SET reply = ?, repliedAt = NOW() WHERE id = ?`,
    [reply, id]
  );
};