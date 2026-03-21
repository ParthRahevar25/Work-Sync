import { Request, Response } from "express";
import mongoose from "mongoose";
import Notification, { NotificationType } from "../models/Notification.model";

// ── Internal helper — called from leave_controllers, never a route ────────────
// Creates one Notification document per recipient in one DB call.
export const createNotification = async (
  userIds: mongoose.Types.ObjectId[],
  title:   string,
  message: string,
  type:    NotificationType
) => {
  if (!userIds.length) return;
  await Notification.insertMany(
    userIds.map(userId => ({ userId, title, message, type }))
  );
};

// ── GET /api/notifications/my ─────────────────────────────────────────────────
// Returns the 30 most-recent notifications for the logged-in user, newest first.
export const getMyNotifications = async (req: any, res: Response) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(notifications);
  } catch {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// ── PUT /api/notifications/:id/read ──────────────────────────────────────────
export const markOneRead = async (req: any, res: Response) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id }, // scoped to owner only
      { read: true }
    );
    res.json({ message: "Marked as read" });
  } catch {
    res.status(500).json({ error: "Failed to update notification" });
  }
};

// ── PUT /api/notifications/all/read ──────────────────────────────────────────
export const markAllRead = async (req: any, res: Response) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );
    res.json({ message: "All marked as read" });
  } catch {
    res.status(500).json({ error: "Failed to update notifications" });
  }
};