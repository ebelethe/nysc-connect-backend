import pool from "../../config/storage.js";

// ============================
// Listings
// ============================

// Create a new listing (as draft or pending_review, depending on landlord's choice)
export const createListing = async ({ landlordId, price, LGA, address, roomType, description, amenities, status }) => {
  const [result] = await pool.query(
    `INSERT INTO listings (landlordId, price, LGA, address, roomType, description, amenities, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [landlordId, price, LGA, address, roomType, description, amenities, status]
  );
  return result.insertId;
};

// Find a single listing by id (used for Property Details screen)
export const findListingById = async (id) => {
  const [rows] = await pool.query(
    `SELECT * FROM listings WHERE id = ? AND deletedAt IS NULL`,
    [id]
  );
  return rows[0] || null;
};

// Find all listings belonging to a landlord (used for "My Listings")
export const findListingsByLandlordId = async (landlordId) => {
  const [rows] = await pool.query(
    `SELECT * FROM listings WHERE landlordId = ? AND deletedAt IS NULL`,
    [landlordId]
  );
  return rows;
};

// Search active listings (used for Accommodation Search screen)
export const searchListings = async ({ LGA, minPrice, maxPrice, roomType }) => {
  let query = `SELECT * FROM listings WHERE status = 'active' AND deletedAt IS NULL`;
  const params = [];

  if (LGA) {
    query += ` AND LGA = ?`;
    params.push(LGA);
  }
  if (minPrice) {
    query += ` AND price >= ?`;
    params.push(minPrice);
  }
  if (maxPrice) {
    query += ` AND price <= ?`;
    params.push(maxPrice);
  }
  if (roomType) {
    query += ` AND roomType = ?`;
    params.push(roomType);
  }

  const [rows] = await pool.query(query, params);
  return rows;
};

// Update a listing's own details (landlord editing their property)
export const updateListing = async (id, { price, LGA, address, roomType, description, amenities }) => {
  await pool.query(
    `UPDATE listings
     SET price = ?, LGA = ?, address = ?, roomType = ?, description = ?, amenities = ?
     WHERE id = ?`,
    [price, LGA, address, roomType, description, amenities, id]
  );
};

// Update just the status (draft -> pending_review -> active, or rented/suspended/rejected)
export const updateListingStatus = async (id, status) => {
  await pool.query(
    `UPDATE listings SET status = ? WHERE id = ?`,
    [status, id]
  );
};

// Soft-delete a listing
export const softDeleteListing = async (id) => {
  await pool.query(
    `UPDATE listings SET deletedAt = NOW() WHERE id = ?`,
    [id]
  );
};

// ============================
// Listing Photos
// ============================

// Add a photo to a listing
export const addListingPhoto = async (listingId, photoUrl) => {
  const [result] = await pool.query(
    `INSERT INTO listing_photos (listingId, photoUrl) VALUES (?, ?)`,
    [listingId, photoUrl]
  );
  return result.insertId;
};

// Get all photos for a listing
export const getListingPhotos = async (listingId) => {
  const [rows] = await pool.query(
    `SELECT * FROM listing_photos WHERE listingId = ?`,
    [listingId]
  );
  return rows;
};

// Count how many photos a listing currently has (to enforce the max-5 edge case)
export const countListingPhotos = async (listingId) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count FROM listing_photos WHERE listingId = ?`,
    [listingId]
  );
  return rows[0].count;
};

// Delete a single photo (must keep at least 1, per edge case — enforced in the service layer)
export const deleteListingPhoto = async (photoId) => {
  await pool.query(
    `DELETE FROM listing_photos WHERE id = ?`,
    [photoId]
  );
};