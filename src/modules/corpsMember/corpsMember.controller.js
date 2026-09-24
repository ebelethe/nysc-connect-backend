import { profileSetupSchema } from "./corpsMember.validator.js";
import { setupProfile, 
  getProfile, 
  uploadProfilePhoto } from "./corpsMember.service.js";

// POST /api/corps-member/profile-setup
export const profileSetup = async (req, res, next) => {
  try {
    const { error, value } = profileSetupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const result = await setupProfile({ userId: req.user.userId, ...value });

    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

// GET /api/corps-member/profile
export const profile = async (req, res, next) => {
  try {
    const result = await getProfile(req.user.userId);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// POST /api/corps-member/profile-photo
export const profilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Profile photo is required" });
    }

    const result = await uploadProfilePhoto({
      userId: req.user.userId,
      profilePhotoUrl: req.file.path,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};