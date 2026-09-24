import { signupSchema, sendOtpSchema, loginSchema,
   requestPasswordResetSchema, resetPasswordSchema } from "./auth.validator.js";
import { signupUser, loginUser, verifySignupOtp, 
  sendOtp, getVerificationStatus, requestPasswordReset, resetPassword, logoutUser} from "./auth.service.js";

// POST /api/auth/signup
export const signup = async (req, res) => {
  try {
    const { error, value } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const result = await signupUser(value);

    return res.status(201).json({
      success: true,
      message: "Account created. Please verify your email and phone number.",
      data: result, // includes userId, emailCode, smsCode (for now, until real sending is wired up)
    }); 
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/auth/send-otp
export const sendOtpHandler = async (req, res) => {
  try {
    const { error, value } = sendOtpSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const result = await sendOtp(value);

    return res.status(200).json({
      success: true,
      message: `OTP sent via ${result.channel}`,
      data: result,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
  try {
    const { userId, code, channel } = req.body;

    if (!userId || !code || !channel) {
      return res.status(400).json({ success: false, message: "userId, code, and channel are required" });
    }

    const result = await verifySignupOtp({ userId, code, channel });

    return res.status(200).json({
      success: true,
      message: result.fullyVerified
        ? "Account fully verified!"
        : `${channel} verified. Please verify your remaining channel.`,
      data: result,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/auth/verification-status/:userId
export const verificationStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const status = await getVerificationStatus(userId);

    let message;
    if (status.fullyVerified) {
      message = "Account is fully verified.";
    } else if (status.emailVerified && !status.phoneVerified) {
      message = "Email already verified. Please verify your phone number.";
    } else if (!status.emailVerified && status.phoneVerified) {
      message = "Phone number already verified. Please verify your email.";
    } else {
      message = "Please verify your email and phone number.";
    }

    return res.status(200).json({ success: true, message, data: status });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const result = await loginUser(value);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message });
  }
};

// POST /api/auth/request-password-reset
export const requestPasswordResetHandler = async (req, res) => {
  try {
    const { error, value } = requestPasswordResetSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const result = await requestPasswordReset(value);
    return res.status(200).json({ success: true, message: `Reset OTP sent via ${result.channel}`, data: result });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/auth/reset-password
export const resetPasswordHandler = async (req, res) => {
  try {
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    await resetPassword(value);
    return res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};


// POST /api/auth/logout
export const logoutHandler = async (req, res) => {
  try {
    await logoutUser(req.token);
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};