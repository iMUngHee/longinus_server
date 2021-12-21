import mongoose from "mongoose";

const { Schema } = mongoose;

const PostSchema = new Schema({
  title: String,
  body: String,
  tags: [String],
  publishedDate: {
    type: Date,
    default: Date.now,
  },
  admin: {
    _id: mongoose.Types.ObjectId,
    adminId: String,
  }
});

const Post = mongoose.model('Post', PostSchema);

export default Post;
