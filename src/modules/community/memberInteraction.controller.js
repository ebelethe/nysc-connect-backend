
import {
  sendMessage,
  getConversationHistory,
  blockMember,
  unblockMember,
  reportTarget,
} from "./memberInteraction.service.js";
import { sendDirectMessageSchema, reportSchema } from "./community.validator.js";
import { findCorpsMemberByUserId } from "../corpsMember/corpsMember.model.js";

export const sendMessageController = async (req, res, next) => {
  try {
    const { error, value } = sendDirectMessageSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const corpsMember = await findCorpsMemberByUserId(req.user.userId);
    const result = await sendMessage({
      senderId: corpsMember.id,
      receiverId: req.params.receiverId,
      message: value.message,
    });
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const getConversationController = async (req, res, next) => {
  try {
    const corpsMember = await findCorpsMemberByUserId(req.user.userId);
    const conversation = await getConversationHistory(corpsMember.id, req.params.otherUserId);
    return res.status(200).json({ success: true, message: "Conversation fetched", data: conversation });
  } catch (err) {
    next(err);
  }
};

export const blockMemberController = async (req, res, next) => {
  try {
    const corpsMember = await findCorpsMemberByUserId(req.user.userId);
    const result = await blockMember({ blockerId: corpsMember.id, blockedId: req.params.memberId });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const unblockMemberController = async (req, res, next) => {
  try {
    const corpsMember = await findCorpsMemberByUserId(req.user.userId);
    const result = await unblockMember({ blockerId: corpsMember.id, blockedId: req.params.memberId });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const reportController = async (req, res, next) => {
  try {
    const { error, value } = reportSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const corpsMember = await findCorpsMemberByUserId(req.user.userId);
    const result = await reportTarget({
      reporterId: corpsMember.id,
      targetType: value.targetType,
      targetId: value.targetId,
      reason: value.reason,
    });
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};