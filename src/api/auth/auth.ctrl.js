import Joi from 'joi';
import Admin from '../../models/admin';

/**
 *  POST /api/auth/register
 * {
 *   password: String,
 * }
 */
export const register = async (ctx) => {
	const schema = Joi.object().keys({
		password: Joi.string().required(),
	});
	const result = schema.validate(ctx.request.body);
	if (result.error) {
		ctx.status = 400; // Bad Request
		ctx.body = result.error;
		return;
	}
	const { password } = ctx.request.body;
	try {
		const admin = new Admin();
		await admin.setPassword(password);
		await admin.save();
		ctx.body = admin.serialize();
	} catch (e) {
		ctx.throw(500, e);
	}
};
/**
 *  POST /api/auth/login
 * {
 *   password: String,
 * }
 */
export const login = async (ctx) => {
	const { password } = ctx.request.body;
	if (!password) {
		ctx.status = 401; // Unauthorized
		return;
	}
	try {
		const admin = await Admin.findByAdmin("iMUngHee");
		if (!admin) {
			ctx.status = 401; // Unauthorized
			return;
		}
		const valid = await admin.checkPassword(password);
		if (!valid) {
			ctx.status = 401; // Unauthorized
			return;
		}
		ctx.body = admin.serialize();
    const token = admin.generateToken();
    ctx.cookies.set('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    })
	} catch (e) {
		ctx.throw(500, e);
	}
};

export const check = async (ctx) => {
  const {admin} = ctx.state;
  if(!admin) {
    ctx.status = 401;  // Unauthorized
    return;
  }
  ctx.body = admin;
};

export const logout = async (ctx) => {
  ctx.cookies.set('access_token');
  ctx.status = 204;  // No Content
};
