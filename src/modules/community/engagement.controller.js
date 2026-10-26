
import { toggleLikeAction, addCommentAction, listComments, toggleSaveAction, listSavedPosts } from "./engagement.service.js";
import { addCommentSchema } from "./community.validator.js";
import { findCorpsMemberByUserId } from "../corpsMember/corpsMember.model.js";

export const toggleLikeController = async (req, res, next) => {
  try {
    const corpsMember = await findCorpsMemberByUserId(req.user.userId);
    const result = await toggleLikeAction(req.params.postId, corpsMember.id);
    return res.status(200).json({ success: true, message: "Like updated", data: result });
  } catch (err) {
    next(err);
  }
};

export const addCommentController = async (req, res, next) => {
  try {
    const { error, value } = addCommentSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const corpsMember = await findCorpsMemberByUserId(req.user.userId);
    const result = await addCommentAction(req.params.postId, corpsMember.id, value.content);
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const getCommentsController = async (req, res, next) => {
  try {
    const comments = await listComments(req.params.postId);
    return res.status(200).json({ success: true, message: "Comments fetched", data: comments });
  } catch (err) {
    next(err);
  }
};

export const toggleSaveController = async (req, res, next) => {
  try {
    const corpsMember = await findCorpsMemberByUserId(req.user.userId);
    const result = await toggleSaveAction(req.params.postId, corpsMember.id);
    return res.status(200).json({ success: true, message: "Save updated", data: result });
  } catch (err) {
    next(err);
  }
};

export const getSavedPostsController = async (req, res, next) => {
  try {
    const corpsMember = await findCorpsMemberByUserId(req.user.userId);
    const posts = await listSavedPosts(corpsMember.id);
    return res.status(200).json({ success: true, message: "Saved posts fetched", data: posts });
  } catch (err) {
    next(err);
  }
};