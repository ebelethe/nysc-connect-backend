import { findCommunityByStateLGA, createCommunity } from "../community/community.model.js";
import { getPendingLandlords, findLandlordById, updateVerificationStatus } from "../landlord/landlord.model.js";
import { getReports } from "./admin.model.js";


// Admin creates a new state/LGA community
export const createCommunityAction = async ({ state, LGA, name, rules }) => {
  const existing = await findCommunityByStateLGA(state, LGA);
  if (existing) {
    throw new Error("A community already exists for this state and LGA");
  }

  const communityId = await createCommunity({ state, LGA, name, rules });
  return { success: true, message: "Community created", data: { communityId } };
};

// landlord pending verifacation by admin
export const listPendingLandlords = async () => {
  return getPendingLandlords();
};

export const reviewLandlordVerification = async ({ landlordId, decision, rejectionReason }) => {
  const landlord = await findLandlordById(landlordId);
  if (!landlord) throw new Error("Landlord not found");

  await updateVerificationStatus(landlordId, decision, rejectionReason || null);
  return { success: true, message: `Landlord i verification ${decision}` };
};

export const listPendingReports = async (targetType) => {
  return getReports("pending", targetType);
};