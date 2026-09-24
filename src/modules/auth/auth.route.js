import express from "express";
import { signup,
     verifyOtp, 
     verificationStatus, 
     login, 
     sendOtpHandler, 
    requestPasswordResetHandler, 
    resetPasswordHandler, 
    logoutHandler } from "./auth.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";


const router = express.Router();

router.post("/signup", signup);
router.post("/send-otp", sendOtpHandler);
router.post("/verify-otp", verifyOtp);
router.get("/verification-status/:userId", verificationStatus);
router.post("/login", login);
router.post("/request-password-reset", requestPasswordResetHandler);
router.post("/reset-password", resetPasswordHandler);
router.post("/logout", protect, logoutHandler);
export default router;