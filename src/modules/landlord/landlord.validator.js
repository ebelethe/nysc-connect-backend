import Joi from "joi";

export const personalInfoSchema = Joi.object({
  state: Joi.string().required(),
  LGA: Joi.string().required(),
  residentialAddress: Joi.string().required(),
});

export const verifyIdentitySchema = Joi.object({
  // files themselves are handled by multer, not Joi — this just validates nothing extra sneaks in
});