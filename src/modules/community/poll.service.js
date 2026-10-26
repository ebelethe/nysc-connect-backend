
import { findPollById, findExistingVote, castVote, changeVote, getPollResults } from "./poll.model.js";

export const voteOnPoll = async (pollId, optionId, corpsMemberId) => {
  const poll = await findPollById(pollId);
  if (!poll) throw new Error("Poll not found");

  if (new Date(poll.expiresAt) < new Date()) {
    throw new Error("This poll has closed and no longer accepts votes");
  }

  const existingVote = await findExistingVote(pollId, corpsMemberId);

  if (existingVote) {
    await changeVote(pollId, optionId, corpsMemberId);
    return { success: true, message: "Vote updated" };
  } else {
    await castVote(pollId, optionId, corpsMemberId);
    return { success: true, message: "Vote recorded" };
  }
};

export const getResults = async (pollId) => {
  const poll = await findPollById(pollId);
  if (!poll) throw new Error("Poll not found");

  const results = await getPollResults(pollId);
  return { ...results, expiresAt: poll.expiresAt, question: poll.question };
};