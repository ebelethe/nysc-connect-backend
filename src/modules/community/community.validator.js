
import Joi from "joi";

// ============================
// Community (discover/search)
// ============================

export const searchCommunitySchema = Joi.object({
  q: Joi.string().min(2).required(),
});

// ============================
// Posts
// ============================

export const createPostSchema = Joi.object({
  title: Joi.string().min(2).max(255).required(),
  content: Joi.string().min(1).max(5000).required(),
  location: Joi.string().max(255).allow("").optional(),
  tags: Joi.array().items(Joi.string().max(50)).optional(),
  poll: Joi.object({
    question: Joi.string().min(2).max(500).required(),
    durationDays: Joi.number().integer().min(1).max(30).required(),
    options: Joi.array().items(Joi.string().max(255)).min(2).required(),
  }).optional(),
});

// ============================
// Engagement (comments, likes, saves)
// ============================

export const addCommentSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required(),
});

// ============================
// Polls
// ============================

export const voteSchema = Joi.object({
  optionId: Joi.number().integer().required(),
});

// ============================
// Member interaction (DMs, reports)
// ============================

export const sendDirectMessageSchema = Joi.object({
  message: Joi.string().min(1).max(1000).required(),
});

export const reportSchema = Joi.object({
  targetType: Joi.string().valid("post", "member").required(),
  targetId: Joi.number().integer().required(),
  reason: Joi.string().min(5).max(500).required(),
});