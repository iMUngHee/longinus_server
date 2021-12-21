import Post from '../../models/post';
import mongoose from 'mongoose';
import Joi from 'joi';

const { ObjectId } = mongoose.Types;

export const getPostById = async (ctx, next) => {
	const { id } = ctx.params;
	if (!ObjectId.isValid(id)) {
		ctx.status = 400; // Bad Request
		return;
	}
	try {
		const post = await Post.findById(id);
		if (!post) {
			ctx.status = 404; // Not Found
			return;
		}
		ctx.state.post = post;
		return next();
	} catch (e) {
		ctx.throw(500, e);
	}
	return next();
};

export const checkOwnPost = (ctx, next) => {
  const {admin, post} = ctx.state;
  if(post.admin._id.toString() !== admin._id) {
    ctx.status = 403;  // Forbidden
    return;
  }
  return next();
}

/**
 * POST /api/posts
 * {
 *   title: String,
 *   body: String,
 *   tags: [String]
 * }
 */
export const write = async (ctx) => {
	const schema = Joi.object().keys({
		title: Joi.string().required(),
		body: Joi.string().required(),
		tags: Joi.array().items(Joi.string()).required(),
	});
	const result = schema.validate(ctx.request.bdy);
	if (result.error) {
		ctx.status = 400; // Bad Request
		ctx.body = result.error;
		return;
	}
	const { title, body, tags } = ctx.request.body;
	const post = new Post({
		title,
		body,
		tags,
		admin: ctx.state.admin,
	});
	try {
		await post.save();
		ctx.body = post;
	} catch (e) {
		ctx.throw(500, e);
	}
};

/**
 * GET /api/posts?tag=&page=
 */
export const list = async (ctx) => {
	const page = parseInt(ctx.query.page || '1', 4);
	if (page < 1) {
		ctx.status = 400; // Bad Request
		return;
	}
  const {tag} = ctx.query;
  const query = {
    ...(tag ? {tags: tag} : {}),
  };
	try {
		const posts = await Post.find(query)
			.sort({ _id: -1 })
			.limit(4)
			.skip((page - 1) * 4)
			.exec();
		const postCount = await Post.countDocuments(query).exec();
		ctx.set('Last-Page', Math.ceil(postCount / 4));
		ctx.body = posts;
	} catch (e) {
		ctx.throw(500, e);
	}
};

/**
 * GET /api/posts/:id
 */
export const read = (ctx) => {
	ctx.body = ctx.state.post;
};

/**
 * DELETE /api/posts/:id
 */
export const remove = async (ctx) => {
	const { id } = ctx.params;
	try {
		await Post.findByIdAndRemove(id).exec();
		ctx.status = 204; // No Content
	} catch (e) {
		ctx.throw(500, e);
	}
};

/**
 * PATCH /api/posts/:id
 */
export const update = async (ctx) => {
	const { id } = ctx.params;
	const schema = Joi.object().keys({
		title: Joi.string(),
		body: Joi.string(),
		tags: Joi.array().items(Joi.string()),
	});
	const result = schema.validate(ctx.request.body);
	if (result.error) {
		ctx.status = 400; // Bad Request
		ctx.body = result.error;
		return;
	}
	try {
		const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
			new: true,
		}).exec();
		if (!post) {
			ctx.status = 404; // Not Found
			return;
		}
		ctx.body = post;
	} catch (e) {
		ctx.throw(500, e);
	}
};
