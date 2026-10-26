import {
  getAllStates,
  getCommunitiesByState,
  searchCommunities,
  findCommunityById,
  findMembership,
  joinCommunity,
  leaveCommunity,
  getMyCommunities,
  getCommunityMembers,
  getCommunityGuidelines,
} from "./community.model.js";

// Format a timestamp into "5h ago" / "1 day ago" style text
const formatLastSeen = (lastActiveAt) => {
  if (!lastActiveAt) return "Never active";

  const diffMs = Date.now() - new Date(lastActiveAt).getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 5) return "Online now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
};

export const listStates = async () => {
  return getAllStates();
};

export const listCommunitiesByState = async (state) => {
  return getCommunitiesByState(state);
};

export const searchForCommunities = async (query) => {
  if (!query || query.trim().length < 2) {
    throw new Error("Search query must be at least 2 characters");
  }
  return searchCommunities(query.trim());
};

export const joinCommunityAction = async (corpsMemberId, communityId) => {
  const community = await findCommunityById(communityId);
  if (!community) throw new Error("Community not found");

  const alreadyMember = await findMembership(corpsMemberId, communityId);
  if (alreadyMember) throw new Error("You are already a member of this community");

  await joinCommunity(corpsMemberId, communityId);
  return { success: true, message: "Joined community" };
};

export const leaveCommunityAction = async (corpsMemberId, communityId) => {
  const membership = await findMembership(corpsMemberId, communityId);
  if (!membership) throw new Error("You are not a member of this community");

  await leaveCommunity(corpsMemberId, communityId);
  return { success: true, message: "Left community" };
};

export const listMyCommunities = async (corpsMemberId) => {
  return getMyCommunities(corpsMemberId);
};

export const listCommunityMembers = async (communityId) => {
  const members = await getCommunityMembers(communityId);
  return members.map((member) => ({
    ...member,
    lastSeen: formatLastSeen(member.lastActiveAt),
  }));
};

export const getGuidelines = async (communityId) => {
  const community = await getCommunityGuidelines(communityId);
  if (!community) throw new Error("Community not found");
  return community;
};