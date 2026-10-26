import pool from "../../config/storage.js";

// ============================
// Direct Messages
// ============================

// Send a DM
export const sendDirectMessage = async ({ senderId, receiverId, message }) => {
  const [result] = await pool.query(
    `INSERT INTO direct_messages (senderId, receiverId, message) VALUES (?, ?, ?)`,
    [senderId, receiverId, message]
  );
  return result.insertId;
};

// Get the full conversation between two corps members (both directions, oldest first)
export const getConversation = async (userAId, userBId) => {
  const [rows] = await pool.query(
    `SELECT * FROM direct_messages
     WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)
     ORDER BY createdAt ASC`,
    [userAId, userBId, userBId, userAId]
  );
  return rows;
};

// Get the last N DMs a specific sender sent to a specific receiver
// (used for the "last 5 messages" report snapshot in a DM context)
export const getLastDirectMessages = async ({ senderId, receiverId, limit = 5 }) => {
  const [rows] = await pool.query(
    `SELECT * FROM direct_messages
     WHERE senderId = ? AND receiverId = ?
     ORDER BY createdAt DESC LIMIT ?`,
    [senderId, receiverId, limit]
  );
  return rows;
};

// ============================
// Blocks
// ============================

// Block a member
export const createBlock = async ({ blockerId, blockedId }) => {
  const [result] = await pool.query(
    `INSERT INTO blocks (blockerId, blockedId) VALUES (?, ?)`,
    [blockerId, blockedId]
  );
  return result.insertId;
};

// Check if blockerId has blocked blockedId
export const isBlocked = async ({ blockerId, blockedId }) => {
  const [rows] = await pool.query(
    `SELECT * FROM blocks WHERE blockerId = ? AND blockedId = ?`,
    [blockerId, blockedId]
  );
  return rows.length > 0;
};

// Unblock a member
export const removeBlock = async ({ blockerId, blockedId }) => {
  await pool.query(
    `DELETE FROM blocks WHERE blockerId = ? AND blockedId = ?`,
    [blockerId, blockedId]
  );
};