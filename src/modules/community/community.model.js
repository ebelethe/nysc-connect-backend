import pool from "../../config/storage.js";

// Get all distinct states that have communities
export const getAllStates = async () => {
  const [rows] = await pool.query(
    `SELECT DISTINCT state FROM communities ORDER BY state ASC`
  );
  return rows;
};

// Get all communities (LGAs) under a given state, with member counts
export const getCommunitiesByState = async (state) => {
  const [rows] = await pool.query(
    `SELECT c.*, COUNT(cm.id) AS memberCount
     FROM communities c
     LEFT JOIN community_members cm ON cm.communityId = c.id
     WHERE c.state = ?
     GROUP BY c.id
     ORDER BY c.LGA ASC`,
    [state]
  );
  return rows;
};

// Search communities by state or LGA keyword
export const searchCommunities = async (query) => {
  const likeQuery = `%${query}%`;
  const [rows] = await pool.query(
    `SELECT c.*, COUNT(cm.id) AS memberCount
     FROM communities c
     LEFT JOIN community_members cm ON cm.communityId = c.id
     WHERE c.state LIKE ? OR c.LGA LIKE ?
     GROUP BY c.id
     ORDER BY c.state ASC, c.LGA ASC`,
    [likeQuery, likeQuery]
  );
  return rows;
};

// Find a single community by id
export const findCommunityById = async (communityId) => {
  const [rows] = await pool.query(
    `SELECT * FROM communities WHERE id = ?`,
    [communityId]
  );
  return rows[0];
};

// Check if a corps member is already in a community
export const findMembership = async (corpsMemberId, communityId) => {
  const [rows] = await pool.query(
    `SELECT * FROM community_members WHERE corpsMemberId = ? AND communityId = ?`,
    [corpsMemberId, communityId]
  );
  return rows[0];
};

// Join a community
export const joinCommunity = async (corpsMemberId, communityId) => {
  await pool.query(
    `INSERT INTO community_members (communityId, corpsMemberId, joinedAt)
     VALUES (?, ?, NOW())`,
    [communityId, corpsMemberId]
  );
};

// Leave a community
export const leaveCommunity = async (corpsMemberId, communityId) => {
  await pool.query(
    `DELETE FROM community_members WHERE corpsMemberId = ? AND communityId = ?`,
    [corpsMemberId, communityId]
  );
};

// Get all communities a corps member has joined
export const getMyCommunities = async (corpsMemberId) => {
  const [rows] = await pool.query(
    `SELECT c.*, cm.joinedAt
     FROM communities c
     JOIN community_members cm ON cm.communityId = c.id
     WHERE cm.corpsMemberId = ?
     ORDER BY cm.joinedAt DESC`,
    [corpsMemberId]
  );
  return rows;
};

// Get all members of a community, with last-seen info for "online members"
export const getCommunityMembers = async (communityId) => {
  const [rows] = await pool.query(
    `SELECT cm2.id AS corpsMemberId, u.fullName, cm2.profilePhotoUrl, cm2.lastActiveAt
     FROM community_members cm
     JOIN corps_members cm2 ON cm2.id = cm.corpsMemberId
     JOIN users u ON u.id = cm2.userId
     WHERE cm.communityId = ?
     ORDER BY cm2.lastActiveAt DESC`,
    [communityId]
  );
  return rows;
};

// Get a community's guidelines (rules field)
export const getCommunityGuidelines = async (communityId) => {
  const [rows] = await pool.query(
    `SELECT rules FROM communities WHERE id = ?`,
    [communityId]
  );
  return rows[0];
};

// Check if a community already exists for this state + LGA (prevents duplicates)
export const findCommunityByStateLGA = async (state, LGA) => {
  const [rows] = await pool.query(
    `SELECT * FROM communities WHERE state = ? AND LGA = ?`,
    [state, LGA]
  );
  return rows[0];
};

// Create a new community (admin-only action)
export const createCommunity = async ({ state, LGA, name, rules }) => {
  const [result] = await pool.query(
    `INSERT INTO communities (state, LGA, name, rules) VALUES (?, ?, ?, ?)`,
    [state, LGA, name, rules]
  );
  return result.insertId;
};