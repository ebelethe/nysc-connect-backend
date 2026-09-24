import pool from "../../../config/storage.js";

// ============================
// Communities
// ============================

// Find a community by state + LGA (used when a corps member selects their area)
export const findCommunityByStateLGA = async (state, LGA) => {
  const [rows] = await pool.query(
    `SELECT * FROM communities WHERE state = ? AND LGA = ?`,
    [state, LGA]
  );
  return rows[0] || null;
};

// Create a new community (only happens the first time someone picks a new state+LGA combo)
export const createCommunity = async ({ state, LGA, name, rules }) => {
  const [result] = await pool.query(
    `INSERT INTO communities (state, LGA, name, rules) VALUES (?, ?, ?, ?)`,
    [state, LGA, name, rules]
  );
  return result.insertId;
};

// Find a community by its id
export const findCommunityById = async (id) => {
  const [rows] = await pool.query(
    `SELECT * FROM communities WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

// ============================
// Community Members
// ============================

// Join a community
export const joinCommunity = async ({ communityId, corpsMemberId }) => {
  const [result] = await pool.query(
    `INSERT INTO community_members (communityId, corpsMemberId) VALUES (?, ?)`,
    [communityId, corpsMemberId]
  );
  return result.insertId;
};

// Check if a corps member has already joined a specific community
export const findMembership = async ({ communityId, corpsMemberId }) => {
  const [rows] = await pool.query(
    `SELECT * FROM community_members WHERE communityId = ? AND corpsMemberId = ?`,
    [communityId, corpsMemberId]
  );
  return rows[0] || null;
};

// List all members of a community (for "View Community Members")
export const getCommunityMembers = async (communityId) => {
  const [rows] = await pool.query(
    `SELECT * FROM community_members WHERE communityId = ?`,
    [communityId]
  );
  return rows;
};

// Leave a community
export const leaveCommunity = async ({ communityId, corpsMemberId }) => {
  await pool.query(
    `DELETE FROM community_members WHERE communityId = ? AND corpsMemberId = ?`,
    [communityId, corpsMemberId]
  );
};


// Send a message in a community's chatroom
export const sendCommunityMessage = async ({ communityId, corpsMemberId, message }) => {
  const [result] = await pool.query(
    `INSERT INTO community_messages (communityId, corpsMemberId, message) VALUES (?, ?, ?)`,
    [communityId, corpsMemberId, message]
  );
  return result.insertId;
};

// Get all messages in a community's chatroom (oldest first, for a normal chat feed)
export const getCommunityMessages = async (communityId) => {
  const [rows] = await pool.query(
    `SELECT * FROM community_messages WHERE communityId = ? ORDER BY createdAt ASC`,
    [communityId]
  );
  return rows;
};

// Get the last N messages sent by a specific member in a community
// (used to build the "last 5 messages" snapshot when someone is reported)
export const getLastMessagesByMember = async ({ communityId, corpsMemberId, limit = 5 }) => {
  const [rows] = await pool.query(
    `SELECT * FROM community_messages
     WHERE communityId = ? AND corpsMemberId = ?
     ORDER BY createdAt DESC LIMIT ?`,
    [communityId, corpsMemberId, limit]
  );
  return rows;
};

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