import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    attachments: [{
      type: { type: String, enum: ['image', 'file', 'document'] },
      url: { type: String },
      name: { type: String },
      filename: { type: String },
      originalName: { type: String },
      mimetype: { type: String },
      size: { type: Number }
    }],
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
