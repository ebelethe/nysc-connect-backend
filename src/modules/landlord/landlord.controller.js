import { verifyLandlordIdentity, submitPersonalInfo } from "./landlord.service.js";
import { personalInfoSchema } from "./landlord.validator.js";

// POST /api/landlord/personal-info
export const personalInfo = async (req, res, next) => {
  try {
    const { error, value } = personalInfoSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Profile photo is required" });
    }

    const profilePhotoUrl = req.file.path;

    const result = await submitPersonalInfo({
      userId: req.user.userId,
      ...value,
      profilePhotoUrl,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

// POST /api/landlord/verify-identity
export const verifyIdentity = async (req, res, next) => {
  try {
    if (!req.files || !req.files.idDocument || !req.files.selfie) {
      return res.status(400).json({ success: false, message: "Both ID document and selfie are required" });
    }

    const idDocumentUrl = req.files.idDocument[0].path;
    const selfieUrl = req.files.selfie[0].path;

    const result = await verifyLandlordIdentity({
      userId: req.user.userId,
      idDocumentUrl,
      selfieUrl,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err); // passes to the global error handler
  }
};