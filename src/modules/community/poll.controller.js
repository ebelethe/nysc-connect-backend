
import { voteOnPoll, getResults } from "./poll.service.js";
import { voteSchema } from "./community.validator.js";
import { findCorpsMemberByUserId } from "../corpsMember/corpsMember.model.js";

export const voteController = async (req, res, next) => {
  try {
    const { error, value } = voteSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const corpsMember = await findCorpsMemberByUserId(req.user.userId);
    const result = await voteOnPoll(req.params.pollId, value.optionId, corpsMember.id);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getResultsController = async (req, res, next) => {
  try {
    const results = await getResults(req.params.pollId);
    return res.status(200).json({ success: true, message: "Poll results fetched", data: results });
  } catch (err) {
    next(err);
  }
};