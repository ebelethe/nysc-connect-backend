import pool from "../../config/storage.js";

// Create a new post
export const createPost = async ({ communityId, corpsMemberId, title, content, location }) => {
  const [result] = await pool.query(
    `INSERT INTO posts (communityId, corpsMemberId, title, content, location)
     VALUES (?, ?, ?, ?, ?)`,
    [communityId, corpsMemberId, title, content, location || null]
  );
  return result.insertId;
};

// Attach multiple images to a post
export const addPostImages = async (postId, imageUrls) => {
  if (!imageUrls.length) return;
  const values = imageUrls.map((url) => [postId, url]);
  await pool.query(
    `INSERT INTO post_images (postId, imageUrl) VALUES ?`,
    [values]
  );
};

// Attach multiple tags to a post
export const addPostTags = async (postId, tags) => {
  if (!tags.length) return;
  const values = tags.map((tag) => [postId, tag]);
  await pool.query(
    `INSERT INTO post_tags (postId, tagName) VALUES ?`,
    [values]
  );
};

// Get a single post by id (basic row only, used for ownership checks)
export const findPostById = async (postId) => {
  const [rows] = await pool.query(`SELECT * FROM posts WHERE id = ?`, [postId]);
  return rows[0];
};

// Get paginated posts for a community feed, with images, tags, and per-viewer pending-review flag
export const getPostsByCommunity = async (communityId, viewerCorpsMemberId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const [posts] = await pool.query(
    `SELECT p.*,
       u.fullName AS authorName,
       EXISTS(
         SELECT 1 FROM reports r
         WHERE r.targetId = p.id AND r.targetType = 'post'
         AND r.reporterId = ? AND r.status = 'pending'
       ) AS isPendingReview
     FROM posts p
     JOIN corps_members cm ON cm.id = p.corpsMemberId
     JOIN users u ON u.id = cm.userId
     WHERE p.communityId = ?
     ORDER BY p.createdAt DESC
     LIMIT ? OFFSET ?`,
    [viewerCorpsMemberId, communityId, limit, offset]
  );

  if (!posts.length) return posts;

  const postIds = posts.map((p) => p.id);

  const [images] = await pool.query(
    `SELECT * FROM post_images WHERE postId IN (?)`,
    [postIds]
  );
  const [tags] = await pool.query(
    `SELECT * FROM post_tags WHERE postId IN (?)`,
    [postIds]
  );

  return posts.map((post) => ({
    ...post,
    images: images.filter((img) => img.postId === post.id).map((img) => img.imageUrl),
    tags: tags.filter((tag) => tag.postId === post.id).map((tag) => tag.tagName),
  }));
};

// Get a single post's full detail (images, tags, pending-review flag)
export const getPostById = async (postId, viewerCorpsMemberId) => {
  const [rows] = await pool.query(
    `SELECT p.*,
       u.fullName AS authorName,
       EXISTS(
         SELECT 1 FROM reports r
         WHERE r.targetId = p.id AND r.targetType = 'post'
         AND r.reporterId = ? AND r.status = 'pending'
       ) AS isPendingReview
     FROM posts p
     JOIN corps_members cm ON cm.id = p.corpsMemberId
     JOIN users u ON u.id = cm.userId
     WHERE p.id = ?`,
    [viewerCorpsMemberId, postId]
  );
  const post = rows[0];
  if (!post) return null;

  const [images] = await pool.query(`SELECT imageUrl FROM post_images WHERE postId = ?`, [postId]);
  const [tags] = await pool.query(`SELECT tagName FROM post_tags WHERE postId = ?`, [postId]);

  // fetch poll + options, if this post has one
  const [pollRows] = await pool.query(`SELECT * FROM polls WHERE postId = ?`, [postId]);
  let poll = null;
  if (pollRows.length) {
    const [options] = await pool.query(
      `SELECT id, optionText FROM poll_options WHERE pollId = ?`,
      [pollRows[0].id]
    );
    poll = { ...pollRows[0], options };
  }

  return {
    ...post,
    images: images.map((i) => i.imageUrl),
    tags: tags.map((t) => t.tagName),
    poll, // null if no poll, otherwise { id, question, expiresAt, options: [...] }
  };
};

// Delete a post (images/tags/likes/comments cascade via ON DELETE CASCADE)
export const deletePost = async (postId) => {
  await pool.query(`DELETE FROM posts WHERE id = ?`, [postId]);
};