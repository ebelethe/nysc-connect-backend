import pool from "../../config/storage.js";

// Create a new report (against a post/community message context, listing, or member)
export const createReport = async ({ reporterId, targetType, targetId, reason, messageSnapshot }) => {
  const [result] = await pool.query(
    `INSERT INTO reports (reporterId, targetType, targetId, reason, messageSnapshot)
     VALUES (?, ?, ?, ?, ?)`,
     [reporterId, targetType, targetId, reason, messageSnapshot]
  );
  return result.insertId;
};

// Get reports (default: pending ones, for the admin queue), optionally filtered by targetType
export const getReports = async (status = "pending", targetType = null) => {
  if (targetType) {
    const [rows] = await pool.query(
      `SELECT * FROM reports WHERE status = ? AND targetType = ? ORDER BY createdAt DESC`,
      [status, targetType]
    );
    return rows;
  }

  const [rows] = await pool.query(
    `SELECT * FROM reports WHERE status = ? ORDER BY createdAt DESC`,
    [status]
  );
  return rows;
};

// Find a single report by id
export const findReportById = async (id) => {
  const [rows] = await pool.query(
    `SELECT * FROM reports WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

// Admin marks a report as resolved
export const resolveReport = async (id) => {
  await pool.query(
    `UPDATE reports SET status = 'resolved' WHERE id = ?`,
    [id]
  );
};