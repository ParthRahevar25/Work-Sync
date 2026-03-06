import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  // 1. Ensure ref matches your User model name exactly for .populate() to work
  employeeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  
  // 2. FIX: Expanded Enums to handle both AI (lowercase) and Manual (Uppercase) inputs
  type: { 
    type: String, 
    enum: ["Casual", "Sick", "Paid", "casual", "sick", "paid"], 
    default: "casual" 
  },
  
  // 3. FIX: Standardized status to lowercase to avoid "Pending" vs "pending" errors
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected", "Approved", "Rejected"], 
    default: "pending" 
  },
  
  appliedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Leave", leaveSchema);