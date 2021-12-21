import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const AdminSchema = new Schema({
	adminId: String,
	hashedPassword: String,
});


AdminSchema.methods.setPassword = async function (password) {
  const hash = await bcrypt.hash(password, 10);
	this.hashedPassword = hash;
	this.adminId = "iMUngHee";
};

AdminSchema.methods.checkPassword = async function (password) {
  const result = await bcrypt.compare(password, this.hashedPassword);
	return result; // true / false
};

AdminSchema.statics.findByAdmin = function (adminId) {
  return this.findOne({ adminId });
};

AdminSchema.methods.serialize = function () {
  const data = this.toJSON();
	delete data.hashedPassword;
	return data;
};

AdminSchema.methods.generateToken = function() {
  const token = jwt.sign(
    {
      _id: this.id,
      adminId: this.adminId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
    },
  );
  return token;
};

const Admin = mongoose.model('Admin', AdminSchema, 'admin');

export default Admin;
