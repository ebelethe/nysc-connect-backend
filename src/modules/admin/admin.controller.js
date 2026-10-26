import { createCommunityAction, 
  listPendingLandlords, 
  reviewLandlordVerification,
  listPendingReports } from "./admin.service.js";
import { createCommunitySchema, 
  landlordReviewSchema } from "./admin.validator.js";


export const createCommunityController = async (req, res, next) => {
  try {
    const { error, value } = createCommunitySchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const result = await createCommunityAction(value);
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const getPendingLandlordsController = async (req, res, next) => {
  try {
    const landlords = await listPendingLandlords();
    return res.status(200).json({ success: true, message: "Pending landlords fetched", data: landlords });
  } catch (err) {
    next(err);
  }
};

export const reviewLandlord = async (req, res, next) => {
  try {
    const { error, value } = landlordReviewSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const result = await reviewLandlordVerification({
      landlordId: req.params.landlordId,
      decision: value.decision,
      rejectionReason: value.rejectionReason,
    });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getPendingReports = async (req, res, next) => {
  try {
    const { targetType } = req.query;

    if (targetType && !["post", "member"].includes(targetType)) {
      return res.status(400).json({ success: false, message: "targetType must be 'post' or 'member'" });
    }

    const reports = await listPendingReports(targetType);
    return res.status(200).json({ success: true, message: "Reports fetched", data: reports });
  } catch (err) {
    next(err);
  }
};