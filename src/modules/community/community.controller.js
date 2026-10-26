
import {
  listStates,
  listCommunitiesByState,
  searchForCommunities,
  joinCommunityAction,
  leaveCommunityAction,
  listMyCommunities,
  listCommunityMembers,
  getGuidelines,
} from "./community.service.js";
import { searchCommunitySchema } from "./community.validator.js";
import { findCorpsMemberByUserId } from "../corpsMember/corpsMember.model.js";

export const getStates = async (req, res, next) => {
  try {
    const states = await listStates();
    return res.status(200).json({ success: true, message: "States fetched", data: states });
  } catch (err) {
    next(err);
  }
};

export const getCommunitiesByStateController = async (req, res, next) => {
  try {
    const communities = await listCommunitiesByState(req.params.state);
    return res.status(200).json({ success: true, message: "Communities fetched", data: communities });
  } catch (err) {
    next(err);
  }
};

export const searchCommunitiesController = async (req, res, next) => {
  try {
    const { error, value } = searchCommunitySchema.validate(req.query);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const results = await searchForCommunities(value.q);
    return res.status(200).json({ success: true, message: "Search results", data: results });
  } catch (err) {
    next(err);
  }
};

export const joinCommunityController = async (req, res, next) => {
  try {
    const corpsMember = await findCorpsMemberByUserId(req.user.userId);
    const result = await joinCommunityAction(corpsMember.id, req.params.communityId);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const leaveCommunityController = async (req, res, next) => {
  try {
    const corpsMember = await findCorpsMemberByUserId(req.user.userId);
    const result = await leaveCommunityAction(corpsMember.id, req.params.communityId);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getMyCommunitiesController = async (req, res, next) => {
  try {
    const corpsMember = await findCorpsMemberByUserId(req.user.userId);
    const communities = await listMyCommunities(corpsMember.id);
    return res.status(200).json({ success: true, message: "Your communities", data: communities });
  } catch (err) {
    next(err);
  }
};

export const getCommunityMembersController = async (req, res, next) => {
  try {
    const members = await listCommunityMembers(req.params.communityId);
    return res.status(200).json({ success: true, message: "Members fetched", data: members });
  } catch (err) {
    next(err);
  }
};

export const getGuidelinesController = async (req, res, next) => {
  try {
    const guidelines = await getGuidelines(req.params.communityId);
    return res.status(200).json({ success: true, message: "Guidelines fetched", data: guidelines });
  } catch (err) {
    next(err);
  }
};