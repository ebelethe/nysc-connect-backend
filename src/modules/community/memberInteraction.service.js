
import { sendDirectMessage, getConversation, getLastDirectMessages, createBlock, isBlocked, removeBlock } from "./memberInteraction.model.js";
import { createReport } from "../admin/admin.model.js";

export const sendMessage = async ({ senderId, receiverId, message }) => {
  const blocked = await isBlocked({ blockerId: receiverId, blockedId: senderId });
  if (blocked) throw new Error("You cannot message this user");

  const messageId = await sendDirectMessage({ senderId, receiverId, message });
  return { success: true, message: "Message sent", data: { messageId } };
};

export const getConversationHistory = async (userAId, userBId) => {
  return getConversation(userAId, userBId);
};

export const blockMember = async ({ blockerId, blockedId }) => {
  const alreadyBlocked = await isBlocked({ blockerId, blockedId });
  if (alreadyBlocked) throw new Error("You have already blocked this user");

  await createBlock({ blockerId, blockedId });
  return { success: true, message: "User blocked" };
};

export const unblockMember = async ({ blockerId, blockedId }) => {
  await removeBlock({ blockerId, blockedId });
  return { success: true, message: "User unblocked" };
};

export const reportTarget = async ({ reporterId, targetType, targetId, reason }) => {
  let messageSnapshot = null;

  if (targetType === "member") {
    const lastMessages = await getLastDirectMessages({ senderId: targetId, receiverId: reporterId, limit: 5 });
    messageSnapshot = JSON.stringify(lastMessages);
  }

  await createReport({ reporterId, targetType, targetId, reason, messageSnapshot });
  return { success: true, message: "Your report has been received and is being reviewed" };
};