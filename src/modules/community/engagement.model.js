import pool from "../../config/storage.js";

// Toggle like on a post — likes if not liked, unlikes if already liked
export const toggleLike = async (postId, corpsMemberId) => {
  const [existing] = await pool.query(
    `SELECT * FROM post_likes WHERE postId = ? AND corpsMemberId = ?`,
    [postId, corpsMemberId]
  );

  if (existing.length) {
    await pool.query(
      `DELETE FROM post_likes WHERE postId = ? AND corpsMemberId = ?`,
      [postId, corpsMemberId]
    );
    await pool.query(
      `UPDATE posts SET likeCount = likeCount - 1 WHERE id = ?`,
      [postId]
    );
    return { liked: false };
  } else {
    await pool.query(
      `INSERT INTO post_likes (postId, corpsMemberId) VALUES (?, ?)`,
      [postId, corpsMemberId]
    );
    await pool.query(
      `UPDATE posts SET likeCount = likeCount + 1 WHERE id = ?`,
      [postId]
    );
    return { liked: true };
  }
};

// Add a comment to a post
export const addComment = async (postId, corpsMemberId, content) => {
  const [result] = await pool.query(
    `INSERT INTO post_comments (postId, corpsMemberId, content) VALUES (?, ?, ?)`,
    [postId, corpsMemberId, content]
  );
  return result.insertId;
};

// Get all comments on a post, with commenter name
export const getCommentsByPost = async (postId) => {
  const [rows] = await pool.query(
    `SELECT pc.*, u.fullName AS commenterName
     FROM post_comments pc
     JOIN corps_members cm ON cm.id = pc.corpsMemberId
     JOIN users u ON u.id = cm.userId
     WHERE pc.postId = ?
     ORDER BY pc.createdAt ASC`,
    [postId]
  );
  return rows;
};

// Toggle bookmark on a post — saves if not saved, unsaves if already saved
export const toggleSavePost = async (postId, corpsMemberId) => {
  const [existing] = await pool.query(
    `SELECT * FROM saved_posts WHERE postId = ? AND corpsMemberId = ?`,
    [postId, corpsMemberId]
  );

  if (existing.length) {
    await pool.query(
      `DELETE FROM saved_posts WHERE postId = ? AND corpsMemberId = ?`,
      [postId, corpsMemberId]
    );
    return { saved: false };
  } else {
    await pool.query(
      `INSERT INTO saved_posts (postId, corpsMemberId) VALUES (?, ?)`,
      [postId, corpsMemberId]
    );
    return { saved: true };
  }
};

// Get all posts a corps member has bookmarked
export const getSavedPosts = async (corpsMemberId) => {
  const [rows] = await pool.query(
    `SELECT p.*, u.fullName AS authorName, sp.createdAt AS savedAt
     FROM saved_posts sp
     JOIN posts p ON p.id = sp.postId
     JOIN corps_members cm ON cm.id = p.corpsMemberId
     JOIN users u ON u.id = cm.userId
     WHERE sp.corpsMemberId = ?
     ORDER BY sp.createdAt DESC`,
    [corpsMemberId]
  );
  return rows;
};