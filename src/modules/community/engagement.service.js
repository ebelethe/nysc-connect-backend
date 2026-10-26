
import { toggleLike, addComment, getCommentsByPost, toggleSavePost, getSavedPosts } from "./engagement.model.js";
import { findPostById } from "./post.model.js";
import { isCurrentlySuspended } from "../corpsMember/corpsMember.model.js";

export const toggleLikeAction = async (postId, corpsMemberId) => {
  const post = await findPostById(postId);
  if (!post) throw new Error("Post not found");

  return toggleLike(postId, corpsMemberId);
};

export const addCommentAction = async (postId, corpsMemberId, content) => {
  const suspended = await isCurrentlySuspended(corpsMemberId);
  if (suspended) {
    throw new Error("You are currently suspended from commenting in the community");
  }

  const post = await findPostById(postId);
  if (!post) throw new Error("Post not found");

  const commentId = await addComment(postId, corpsMemberId, content);
  return { success: true, message: "Comment added", data: { commentId } };
};

export const listComments = async (postId) => {
  const post = await findPostById(postId);
  if (!post) throw new Error("Post not found");

  return getCommentsByPost(postId);
};

export const toggleSaveAction = async (postId, corpsMemberId) => {
  const post = await findPostById(postId);
  if (!post) throw new Error("Post not found");

  return toggleSavePost(postId, corpsMemberId);
};

export const listSavedPosts = async (corpsMemberId) => {
  return getSavedPosts(corpsMemberId);
};