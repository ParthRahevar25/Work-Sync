import mongoose, { Schema, Document } from "mongoose";

export type NotificationType =
  | "leave_applied"
  | "leave_approved"
  | "leave_rejected"
  | "general";

export interface INotification extends Document {
  userId:    mongoose.Types.ObjectId;
  title:     string;
  message:   string;
  type:      NotificationType;
  read:      boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId:  { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    type:    {
      type:    String,
      enum:    ["leave_applied", "leave_approved", "leave_rejected", "general"],
      default: "general",
    },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>("Notification", notificationSchema);