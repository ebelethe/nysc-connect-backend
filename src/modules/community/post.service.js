import { createPost, 
     addPostImages,
     addPostTags, 
     findPostById, 
     getPostsByCommunity,
     getPostById, 
     deletePost } from "./post.model.js";
import { createPoll, addPollOptions } from "./poll.model.js";
import { findCommunityById, findMembership } from "./community.model.js";
import { isCurrentlySuspended } from "../corpsMember/corpsMember.model.js";

export const createPostAction = async ({
  corpsMemberId,
  communityId,
  title,
  content,
  location,
  tags,
  imageUrls,
  poll,
}) => {
  const suspended = await isCurrentlySuspended(corpsMemberId);
  if (suspended) {
    throw new Error("You are currently suspended from posting in the community");
  }

  const community = await findCommunityById(communityId);
  if (!community) throw new Error("Community not found");

  const membership = await findMembership(corpsMemberId, communityId);
  if (!membership) throw new Error("You must join this community before posting");

  const postId = await createPost({ communityId, corpsMemberId, title, content, location });

  if (imageUrls && imageUrls.length) {
    await addPostImages(postId, imageUrls);
  }

  if (tags && tags.length) {
    await addPostTags(postId, tags);
  }

  if (poll) {
    const pollId = await createPoll({
      postId,
      question: poll.question,
      durationDays: poll.durationDays,
    });
    await addPollOptions(pollId, poll.options);
  }

  const fullPost = await getPostById(postId, corpsMemberId);
  return { success: true, message: "Post created", data: fullPost };
};

export const getFeed = async (communityId, viewerCorpsMemberId, page, limit) => {
  const community = await findCommunityById(communityId);
  if (!community) throw new Error("Community not found");

  return getPostsByCommunity(communityId, viewerCorpsMemberId, page, limit);
};

export const getPostDetail = async (postId, viewerCorpsMemberId) => {
  const post = await getPostById(postId, viewerCorpsMemberId);
  if (!post) throw new Error("Post not found");
  return post;
};

export const deletePostAction = async (postId, corpsMemberId) => {
  const post = await findPostById(postId);
  if (!post) throw new Error("Post not found");

  if (post.corpsMemberId !== corpsMemberId) {
    throw new Error("You can only delete your own posts");
  }

  await deletePost(postId);
  return { success: true, message: "Post deleted" };
};