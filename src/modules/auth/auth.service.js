import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  createUser,
  findUserByEmail,
  findUserByPhone,
  findUserByEmailOrPhone,
  findUserById,
  createOtp,
  findValidOtp,
  markOtpUsed,
  markEmailVerified,
  markPhoneVerified,
  checkAndFinalizeVerification,
  deleteUnverifiedUser,
  invalidateOldOtps,
  updateUserPassword,
  blockToken
} from "./auth.model.js";
import { createCorpsMember, findCorpsMemberByCallUpNumber } from "../corpsMember/corpsMember.model.js";
import { createLandlord } from "../landlord/landlord.model.js";

// Generates a random 6-digit code, e.g. "483920"
const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ============================
// Signup
// ============================
export const signupUser = async ({ fullName, email, phoneNumber, password, role, callUpNumber}) => {

  if (role === "corps_member") {
    const existingCallUp = await findCorpsMemberByCallUpNumber(callUpNumber);
    if (existingCallUp) {
      throw new Error("Call-up number is already registered");
    }
  }
  // 1. Check email -only block if a verified account already own it
  const existingEmail = await findUserByEmail(email);
  if (existingEmail) {
    if (existingEmail.emailVerified) {
    throw new Error("Email is already registered");
  }
  if (existingEmail.phoneVerified) {
    throw new Error("This account already has a verified phone number.please verify your email to continue, instead of sigining up again.");
  }
  await deleteUnverifiedUser(existingEmail.id);
  }
  //check phone - same rule
  const existingPhone = await findUserByPhone(phoneNumber);
  if (existingPhone) {
    if (existingPhone.phoneVerified) {
    throw new Error("Phone number is already registered");
  }
  if (existingPhone.emailVerified) {
    throw new Error("TThis account already has a verified email. please verify your phone number to continue, instead of sigining up again");
  }
 await deleteUnverifiedUser(existingPhone.id); 
}

  // 2. Hash the password — never store plain text
  const hashedPassword = await bcrypt.hash(password, 10);
  // 3. Create the base user
  const userId = await createUser({ fullName, email, phoneNumber, password: hashedPassword, role });

  // 4. Create the role-specific profile
  if (role === "corps_member") {
    await createCorpsMember({ userId, callUpNumber });
  } else if (role === "landlord") {
    await createLandlord({ userId });
  }
  return { userId };
};

// ============================
// Send OTP (used both for first-time sending and resending)
// ============================
export const sendOtp = async ({ channel, email, phoneNumber }) => {
  const user = channel === "email"
    ? await findUserByEmail(email)
    : await findUserByPhone(phoneNumber);

  if (!user) {
    throw new Error(`No account found with this ${channel === "email" ? "email" : "phone number"}`);
  }

  if (channel === "email" && user.emailVerified) {
    throw new Error("Email is already verified");
  }
  if (channel === "sms" && user.phoneVerified) {
    throw new Error("Phone number is already verified");
  }

  await invalidateOldOtps({ userId: user.id, purpose: "signup_verification", channel });

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await createOtp({ userId: user.id, code, purpose: "signup_verification", channel, expiresAt });

  return { userId: user.id, channel, code };
};

// ============================
// Verify OTP (both otp verification— for email, also for phone)
// ============================
export const verifySignupOtp = async ({ userId, code, channel }) => {
  const otp = await findValidOtp({ userId, code, purpose: "signup_verification", channel });

  if (!otp) {
    throw new Error("Invalid or expired OTP");
  }

  await markOtpUsed(otp.id);

  // Mark the specific channel as verified
  if (channel === "email") {
    await markEmailVerified(userId);
  } else if (channel === "sms") {
    await markPhoneVerified(userId);
  }

  // Check if both channels are now done — if so, fully verify the account
  const fullyVerified = await checkAndFinalizeVerification(userId);

  return { verified: true, channel, fullyVerified };
};

// ============================
// Check verification status (for when a user returns later, partially verified)
// ============================
export const getVerificationStatus = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return {
    emailVerified: !!user.emailVerified,
    phoneVerified: !!user.phoneVerified,
    fullyVerified: !!user.isVerified,
  };
};

//====================
// Login 
//====================
import { findCorpsMemberByUserId } from "../corpsMember/corpsMember.model.js";

export const loginUser = async ({ identifier, password }) => {
  const user = await findUserByEmailOrPhone(identifier);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw new Error("Invalid credentials");
  }

  if (!user.isVerified) {
    throw new Error("Account not verified. Please complete email and phone verification.");
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  const responseUser = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phoneNumber:user.phoneNumber,
    role: user.role,
  };

  // Attach callUpNumber only for corps members
  if (user.role === "corps_member") {
    const corpsMember = await findCorpsMemberByUserId(user.id);
    responseUser.callUpNumber = corpsMember?.callUpNumber || null;
  }

  return { token, user: responseUser };
};
// ============================
// Password Reset
// ============================

// Step 1: request a reset OTP (sent to email or phone)
export const requestPasswordReset = async ({ channel, email, phoneNumber }) => {
  const user = channel === "email"
    ? await findUserByEmail(email)
    : await findUserByPhone(phoneNumber);

  if (!user) {
    throw new Error(`No account found with this ${channel === "email" ? "email" : "phone number"}`);
  }

  await invalidateOldOtps({ userId: user.id, purpose: "password_reset", channel });

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await createOtp({ userId: user.id, code, purpose: "password_reset", channel, expiresAt });

  return { userId: user.id, channel, code };
};

// Step 2: verify the reset OTP and set a new password
export const resetPassword = async ({ userId, code, channel, newPassword }) => {
  const otp = await findValidOtp({ userId, code, purpose: "password_reset", channel });

  if (!otp) {
    throw new Error("Invalid or expired OTP");
  }

  await markOtpUsed(otp.id);

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await updateUserPassword(userId, hashedPassword);

  return { success: true };
};

export const logoutUser = async (token) => {
  const decoded = jwt.decode(token);
  const expiresAt = new Date(decoded.exp * 1000); // JWT's exp is in seconds, JS Date needs ms

  await blockToken({ token, expiresAt });

  return { success: true };
};