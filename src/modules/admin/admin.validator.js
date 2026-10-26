import Joi from "joi";

export const createCommunitySchema = Joi.object({
  state: Joi.string().required(),
  LGA: Joi.string().required(),
  name: Joi.string().min(2).max(255).required(),
  rules: Joi.string().allow("").optional(),
});

export const landlordReviewSchema = Joi.object({
  decision: Joi.string().valid("verified", "rejected").required(),
  rejectionReason: Joi.string().max(500).when("decision", {
    is: "rejected",
    then: Joi.optional(),
    otherwise: Joi.forbidden(),
  }),
});