
import { createPostAction, getFeed, getPostDetail, deletePostAction } from "./post.service.js";
import { createPostSchema } from "./community.validator.js";
import { findCorpsMemberByUserId } from "../corpsMember/corpsMember.model.js";

export const createPostController = async (req, res, next) => {
  try {
    const corpsMember = await findCorpsMemberByUserId(req.user.userId);

    // tags and poll arrive as JSON strings inside multipart/form-data
    const body = { ...req.body };
    if (body.tags) {
      try {
        body.tags = JSON.parse(body.tags);
      } catch {
        return res.status(400).json({ success: false, message: "Invalid tags format" });
      }
    }
    if (body.poll) {
      try {
        body.poll = JSON.parse(body.poll);
      } catch {
        return res.status(400).json({ success: false, message: "Invalid poll format" });
      }
    }

    const { error, value } = createPostSchema.validate(body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const imageUrls = (req.files || []).map((file) => file.path);

    const result = await createPostAction({
      corpsMemberId: corpsMember.id,
      communityId: req.params.communityId,
      title: value.title,
      content: value.content,
      location: value.location,
      tags: value.tags,
      imageUrls,
      poll: value.poll,
    });

    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const getFeedController = async (req, res, next) => {
  try {
    const corpsMember = await findCorpsMemberByUserId(req.user.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const posts = await getFeed(req.params.communityId, corpsMember.id, page, limit);
    return res.status(200).json({ success: true, message: "Feed fetched", data: posts });
  } catch (err) {
    next(err);
  }
};

export const getPostDetailController = async (req, res, next) => {
  try {
    const corpsMember = await findCorpsMemberByUserId(req.user.userId);
    const post = await getPostDetail(req.params.postId, corpsMember.id);
    return res.status(200).json({ success: true, message: "Post fetched", data: post });
  } catch (err) {
    next(err);
  }
};

export const deletePostController = async (req, res, next) => {
  try {
    const corpsMember = await findCorpsMemberByUserId(req.user.userId);
    const result = await deletePostAction(req.params.postId, corpsMember.id);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};