import pool from "../../config/storage.js";

// Create a poll attached to a post
export const createPoll = async ({ postId, question, durationDays }) => {
  const [result] = await pool.query(
    `INSERT INTO polls (postId, question, durationDays, expiresAt)
     VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))`,
    [postId, question, durationDays, durationDays]
  );
  return result.insertId;
};

// Add options to a poll (bulk insert)
export const addPollOptions = async (pollId, options) => {
  const values = options.map((optionText) => [pollId, optionText]);
  await pool.query(
    `INSERT INTO poll_options (pollId, optionText) VALUES ?`,
    [values]
  );
};

// Find a poll by the post it belongs to
export const findPollByPostId = async (postId) => {
  const [rows] = await pool.query(`SELECT * FROM polls WHERE postId = ?`, [postId]);
  return rows[0];
};

// Find a poll by its own id
export const findPollById = async (pollId) => {
  const [rows] = await pool.query(`SELECT * FROM polls WHERE id = ?`, [pollId]);
  return rows[0];
};

// Check if a corps member has already voted on a poll
export const findExistingVote = async (pollId, corpsMemberId) => {
  const [rows] = await pool.query(
    `SELECT * FROM poll_votes WHERE pollId = ? AND corpsMemberId = ?`,
    [pollId, corpsMemberId]
  );
  return rows[0];
};

// Cast a new vote
export const castVote = async (pollId, optionId, corpsMemberId) => {
  await pool.query(
    `INSERT INTO poll_votes (pollId, optionId, corpsMemberId) VALUES (?, ?, ?)`,
    [pollId, optionId, corpsMemberId]
  );
};

// Change an existing vote to a different option
export const changeVote = async (pollId, optionId, corpsMemberId) => {
  await pool.query(
    `UPDATE poll_votes SET optionId = ? WHERE pollId = ? AND corpsMemberId = ?`,
    [optionId, pollId, corpsMemberId]
  );
};

// Get poll results: each option with its vote count, plus total votes
export const getPollResults = async (pollId) => {
  const [options] = await pool.query(
    `SELECT po.id AS optionId, po.optionText, COUNT(pv.id) AS voteCount
     FROM poll_options po
     LEFT JOIN poll_votes pv ON pv.optionId = po.id
     WHERE po.pollId = ?
     GROUP BY po.id`,
    [pollId]
  );

  const totalVotes = options.reduce((sum, o) => sum + o.voteCount, 0);

  return { options, totalVotes };
};