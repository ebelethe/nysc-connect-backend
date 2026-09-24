import { updateLandlordPersonalInfo,
     findLandlordByUserId, 
     submitLandlordVerification } from "./landlord.model.js";


export const submitPersonalInfo = async ({ userId, state, LGA, residentialAddress, profilePhotoUrl }) => {
  const landlord = await findLandlordByUserId(userId);

  if (!landlord) {
    throw new Error("Landlord profile not found");
  }
  await updateLandlordPersonalInfo(userId, { state, LGA, residentialAddress, profilePhotoUrl });

  return { success: true, message: "Personal information saved. Proceed to identity verification." };
};

export const verifyLandlordIdentity = async ({ userId, idDocumentUrl, selfieUrl }) => {
  const landlord = await findLandlordByUserId(userId);

  if (!landlord) {
    throw new Error("Landlord profile not found");
  }

  await submitLandlordVerification(userId, { idDocumentUrl, selfieUrl });

  return { success: true, message: "Documents submitted. Your account is under review." };
};