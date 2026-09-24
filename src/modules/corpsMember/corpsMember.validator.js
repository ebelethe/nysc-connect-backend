import Joi from "joi";

export const profileSetupSchema = Joi.object({
  batch: Joi.string().required(),
  stream: Joi.string().required(),
  state: Joi.string().required(),
  LGA: Joi.string().required(),
  ppa: Joi.string().required(),
  areasOfInterest: Joi.string().optional(),
    
});