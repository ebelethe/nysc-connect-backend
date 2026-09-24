import { findCorpsMemberByUserId, 
  updateCorpsMemberProfile, 
  updateCorpsMemberPhoto } from "./corpsMember.model.js";

export const setupProfile = async ({ userId, batch, stream, state, LGA, ppa, areasOfInterest  }) => {
  const corpsMember = await findCorpsMemberByUserId(userId);

  if (!corpsMember) {
    throw new Error("Corps member profile not found");
  }

  await updateCorpsMemberProfile(userId, { batch, stream, state, LGA, ppa, areasOfInterest });

  return { success: true, message: "Profile setup complete" };
};

export const getProfile = async (userId) => {
  const corpsMember = await findCorpsMemberByUserId(userId);

  if (!corpsMember) {
    throw new Error("Corps member profile not found");
  }

  return corpsMember;
};

export const uploadProfilePhoto = async ({ userId, profilePhotoUrl }) => {
  const corpsMember = await findCorpsMemberByUserId(userId);

  if (!corpsMember) {
    throw new Error("Corps member profile not found");
  }

  await updateCorpsMemberPhoto(userId, profilePhotoUrl);

  return { success: true, message: "Profile photo updated" };
};