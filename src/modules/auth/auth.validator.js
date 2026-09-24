import Joi from "joi";

export const signupSchema = Joi.object({
  fullName: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().pattern(/^0[0-9]{10}$/).required().messages({
    "string.pattern.base": "Phone number must be in the format 0XXXXXXXXXX",
  }),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
  }),
  role: Joi.string().valid("corps_member", "landlord").required(),
  callUpNumber: Joi.string().when("role", {
    is: "corps_member",
    then: Joi.string().pattern(/^NYSC\/[A-Z]{3}\/\d{4}\/\d{6}$/).required().messages({
        "string.pattern.base": "call-up number must be in the format NYSC/XXX/YYYY/XXXXXX",
        "any.required": "Call-up number is required",
      }),
    otherwise: Joi.forbidden(),
  }),
});

export const sendOtpSchema = Joi.object({
  channel: Joi.string().valid("email", "sms").required(),
  email: Joi.string().email().when("channel", {
    is: "email",
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  phoneNumber: Joi.string().pattern(/^0[0-9]{10}$/).when("channel", {
    is: "sms",
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
});

export const loginSchema = Joi.object({
  identifier: Joi.string().required(), // accepts either email or phone number
  password: Joi.string().required(),
});

export const requestPasswordResetSchema = Joi.object({
  channel: Joi.string().valid("email", "sms").required(),
  email: Joi.string().email().when("channel", { is: "email", then: Joi.required(), otherwise: Joi.forbidden() }),
  phoneNumber: Joi.string().pattern(/^0[0-9]{10}$/).when("channel", { is: "sms", then: Joi.required(), otherwise: Joi.forbidden() }),
});

export const resetPasswordSchema = Joi.object({
  userId: Joi.number().required(),
  code: Joi.string().length(6).required(),
  channel: Joi.string().valid("email", "sms").required(),
  newPassword: Joi.string().min(8).required(),
  confirmNewPassword: Joi.string().valid(Joi.ref("newPassword")).required().messages({
    "any.only": "Passwords do not match",
  }),
});